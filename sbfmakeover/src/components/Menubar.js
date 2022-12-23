import React, { useState, useRef, useEffect } from 'react';
import '../App.css';
import Bundlr, { WebBundlr } from '@bundlr-network/client';
import { ethers, utils, providers } from 'ethers';
import fs from 'fs';
import BundlrTransaction from '@bundlr-network/client/build/common/transaction';

function Menubar({
  handleColorChange,
  handleDownload,
  dataUrl,
  handleLineWidth,
  undoCount,
  undo,
  currentImage,
}) {
  const targetNetworkId = 80001;
  const bundlrEndpoint = 'https://devnet.bundlr.network';
  //testnet1
  let provider;

  const [currency, setCurrency] = useState('matic');
  const [bundlrInstance, setBundlrInstance] = useState();
  const [bundlrBalance, setbundlrBalance] = useState();
  const [balance, setBalance] = useState(0);
  const [account, setAccount] = useState();
  const [network, setNetwork] = useState();
  const [data, setData] = useState(null);
  const bundlrRef = useRef();
  const providerRef = useRef();

  const [file, setFile] = useState();
  const [isLoading, setIsLoading] = useState();
  const [fileUploaded, setFileUploaded] = useState(false);
  const [mintCost, setMintCost] = useState(0);
  const [URI, setURI] = useState();
  const mintCostRef = useRef(0);

  useEffect(() => {
    fetch('/bundlr')
      .then((res) => res.json())
      .then((data) => setData(data.message));
  }, []);

  const initWallet = async () => {
    if (!window.ethereum) return;
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    const networkOk = await checkNetwork();
    if (!networkOk) return;
    provider = new providers.Web3Provider(window.ethereum);
    providerRef.current = provider;
    await provider._ready();
    console.log(`Provider Ready! > ${provider}`);

    const bundlr = new WebBundlr(bundlrEndpoint, currency, provider, {
      providerUrl: `https://polygon-mumbai.g.alchemy.com/v2/SBCRHHsDrSM2OzTJurw_Fs0arSA1Xpo2`,
      address: '0x474E7A206bd6186B0C51ad9b1D406c12c4fed9c1',
    });
    //
    //Goerli
    //   providerUrl: `https://goerli.infura.io/v3/97dc288a798e4597a6ec79d4fcbbf383`,
    //   address: '0x853758425e953739F5438fd6fd0Efe04A477b039',
    //Main
    // providerUrl: `https://mainnet.infura.io/v3/97dc288a798e4597a6ec79d4fcbbf383`,
    //   address: '0x474E7A206bd6186B0C51ad9b1D406c12c4fed9c1',
    //Matic
    // providerUrl: `https://polygon-mumbai.g.alchemy.com/v2/SBCRHHsDrSM2OzTJurw_Fs0arSA1Xpo2`,
    //   address: '0x474E7A206bd6186B0C51ad9b1D406c12c4fed9c1',

    //
    await bundlr.ready();
    console.log('Bundlr provider ready');
    setBundlrInstance(bundlr);
    bundlrRef.current = bundlr;
    //
    await fetchBalance();
    //
  };

  async function checkNetwork() {
    let hex_chainId = ethers.utils.hexValue(targetNetworkId);
    console.log(`Target network is ${hex_chainId}`);
    if (window.ethereum) {
      const currentChainId = await window.ethereum.request({
        method: 'eth_chainId',
      });
      console.log('Current network  :>> ', currentChainId);

      if (currentChainId != targetNetworkId) {
        // prompt to swith network
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: targetNetworkId }],
          });
        } catch (error) {
          alert('Wrong network!');
          return false;
        }
      }
      return true;
    }
  }

  //-----
  //**GET BUNDLR & ETHER BALANCES PRE-MINT*/
  //-----

  const fetchBalance = async () => {
    const bal = await bundlrRef.current.getLoadedBalance();
    const balConvert = bundlrRef.current.utils.unitConverter(bal);
    console.log(`Bundlr balance: ${balConvert.toFixed()}`);
    setbundlrBalance(utils.formatEther(bal.toString()));
    const maticAccount = bundlrRef.current.address;
    const maticBalance = await providerRef.current.getBalance(maticAccount);
    const maticBalConvert = utils.formatEther(maticBalance);
    console.log(`${currency} balance: ${maticBalConvert}`);
    setBalance(utils.formatEther(maticBalance.toString()));
  };

  //-----
  //**UPDATE MINT PRICE & CONSOLE*/
  //-----

  useEffect(() => {
    const getCost = async () => {
      if (bundlrInstance) {
        const cost = await bundlrInstance.getPrice(
          currentImage[currentImage.length - 1].length
        );
        mintCostRef.current = bundlrInstance.utils.unitConverter(cost);
        setMintCost(mintCostRef.current);
        console.log(`Minimum ${currency} required: ${mintCostRef.current}`);
      }
    };
    getCost();
  }, [currentImage, bundlrInstance, currency]);

  //-----
  //**MINT TOKEN CALL */
  //-----

  const handleUpload = async () => {
    let f = handleDownload();
    setFile(f);
    upload(f);
  };

  async function upload(f) {
    setFileUploaded(false);
    setIsLoading('Funding Bundlr Account...');
    const nftURI = {
      name: 'SBFmakeover',
      image: f,
    };
    const nftJSON = JSON.stringify(nftURI);
    const tokenURI = new BundlrTransaction(nftJSON, bundlrInstance);
    // console.log(buf);
    // // Get the cost for upload
    const price = await bundlrInstance.getPrice(tokenURI.size);
    const priceConvert = bundlrInstance.utils.unitConverter(price);
    // Get your current balance
    const balance = await bundlrInstance.getLoadedBalance();
    const balanceConvert = bundlrInstance.utils
      .unitConverter(balance)
      .toFixed();
    console.log(
      `current fund balance is: ${balanceConvert}; current upload price: ${priceConvert}; needed: ${
        priceConvert - balanceConvert
      }`
    );

    // If you don't have enough balance for the upload
    if (balance.isLessThan(price)) {
      let funding = price.minus(balance);
      try {
        // Fund your account with the difference
        // We multiply by 1.1 to make sure we don't run out of funds
        funding = await bundlrInstance.fund(funding, 3);
        console.log({ ...funding });
      } catch (error) {
        console.error(error);
        if (error.code === -32603) {
          funding = await bundlrInstance.fund(funding, 3);
          console.log({ ...funding });
        }
      }
    }

    // Create, sign and upload the transaction
    setIsLoading('Bundling makeover for Arweave upload...');
    const tags = [{ name: 'Content-Type', value: 'application/json' }];
    const tx = bundlrInstance.createTransaction(nftJSON, { tags });
    await tx.sign();
    setIsLoading('uploading...');
    await uploadTransaction(tx);
    setIsLoading();
    setFileUploaded(true);
  }

  const uploadTransaction = async (tx) => {
    let count = 0;
    let maxAttempts = 10;
    while (count < maxAttempts) {
      try {
        let receipt = await tx.upload(true);
        setFile(receipt.id);
        return;
      } catch (error) {
        console.log('retrying upload');
        let receipt = await tx.upload(true);
        setFile(receipt.id);
        count = count++;
      }
    }
  };

  useEffect(() => {
    console.log(`image can be viewed at: https://www.arweave.net/${file}`);
  }, [file]);

  return (
    <section>
      {' '}
      <div className="console">
        <p>{!mintCost ? null : `Minimum MATIC needed: ${mintCost}`}</p>

        <button className="btn" onClick={fetchBalance}>
          Get bundlr balance
        </button>
        <button className="btn" onClick={handleUpload} href={dataUrl}>
          Mint
        </button>
        <button className="btn" onClick={initWallet}>
          Connect
        </button>
      </div>
      <div className="Menu">
        <p>{!data ? 'Loading...' : data}</p>

        <label>Brush Color </label>
        <input
          type="color"
          onChange={(e) => handleColorChange(e.target.value)}
        />

        <label>Brush Width </label>
        <input
          type="range"
          min="3"
          max="50"
          defaultValue="10"
          onChange={(e) => handleLineWidth(e.target.value)}
        />
        <button disabled={undoCount === 1} className="btn" onClick={undo}>
          Undo
        </button>
      </div>
    </section>
  );
}

export default Menubar;
