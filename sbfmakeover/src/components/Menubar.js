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
  undoStrokeArray,
}) {
  const targetNetworkId = 5;
  const bundlrEndpoint = 'https://devnet.bundlr.network';
  //testnet1
  let provider;

  const [curreny, setCurrancy] = useState('ethereum');
  const [bundlrInstance, setBundlrInstance] = useState();
  const [bundlrBalance, setbundlrBalance] = useState(0);
  const [balance, setBalance] = useState(0);
  const [account, setAccount] = useState();
  const [network, setNetwork] = useState();
  const [data, setData] = useState(null);
  const bundlrRef = useRef();
  const providerRef = useRef();

  const [file, setFile] = useState();
  const [fileCost, setFileCost] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [URI, setURI] = useState();

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

    const bundlr = new WebBundlr(bundlrEndpoint, curreny, provider, {
      providerUrl: `https://goerli.infura.io/v3/97dc288a798e4597a6ec79d4fcbbf383`,
      address: '0x853758425e953739F5438fd6fd0Efe04A477b039',
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

  const test = true;

  //-----
  //**GET BUNDLR & ETHER BALANCES PRE-MINT*/
  //-----

  const fetchBalance = async () => {
    const bal = await bundlrRef.current.getLoadedBalance();
    console.log(`Bundlr balance: ${utils.formatEther(bal.toString())}`);
    setbundlrBalance(utils.formatEther(bal.toString()));
    const ethbal = bundlrRef.current.address;
    const balance = await providerRef.current.getBalance(ethbal);
    setBalance(utils.formatEther(balance.toString()));
    console.log(`${curreny} balance: ${utils.formatEther(balance.toString())}`);
  };

  //-----
  /*CHECK UPLOAD COST TO BUNDLR */
  //-----
  const checkUploadCost = async (f) => {
    const bytes = f.length;
    console.log(`image is : ${bytes} bytes`);
    const cost = await bundlrInstance.getPrice(f.length);
    console.log(`cost is: ${utils.formatEther(cost.toString())}`);
    setFileCost(utils.formatEther(cost.toString()));
    if (cost > bundlrBalance) {
      console.log(`not enough balance`);
    } else {
      console.log(`enough balance`);
    }
  };

  const fundBundlr = async (f) => {
    await checkUploadCost(f);
    try {
      const price = await bundlrInstance.getPrice(f.length * 2);
      console.log(`funding bundlr with: ${price} & ${price}`);
      const res = await bundlrInstance.fund(price);
      console.log(`fund response ${res}`);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    console.log(`image can be viewed at: http://www.areweave.net/${URI}}`);
  }, [URI]);

  //-----
  //**MINT TOKEN CALL */
  //-----

  const handleUpload = async () => {
    let f = handleDownload();
    upload(f);
  };

  async function upload(f) {
    const nftURI = {
      name: 'SBFmakeover',
      image: f,
    };
    const nftJSON = JSON.stringify(nftURI);
    const tokenURI = new BundlrTransaction(nftJSON, bundlrInstance);
    // console.log(buf);
    // // Get the cost for upload
    const price = await bundlrInstance.getPrice(tokenURI.size);
    // Get your current balance
    const balance = await bundlrInstance.getLoadedBalance();
    console.log(
      `current fund balance is: ${balance}; current upload price: ${price}; needed: ${
        price - balance
      }`
    );

    // If you don't have enough balance for the upload
    if (balance.isLessThan(price)) {
      // Fund your account with the difference
      // We multiply by 1.1 to make sure we don't run out of funds
      const funding = await bundlrInstance.fund(price, 1.2);
      console.log({ ...funding });
    }

    // Create, sign and upload the transaction
    const tags = [{ name: 'Content-Type', value: 'application/json' }];
    const tx = bundlrInstance.createTransaction(nftJSON, { tags });
    await tx.sign();
    try {
      await tx.upload();
      const id = tx.id;
      console.log(id);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="Menu">
      <p>{!data ? 'Loading...' : data}</p>

      <label>Brush Color </label>
      <input type="color" onChange={(e) => handleColorChange(e.target.value)} />

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
      <button className="btn" onClick={fetchBalance}>
        Get bundlr balance
      </button>
      <a
        className="btn"
        download="image.png"
        onClick={handleUpload}
        href={dataUrl}
      >
        Mint
      </a>
      <button className="btn" onClick={initWallet}>
        Connect
      </button>
    </div>
  );
}

export default Menubar;
