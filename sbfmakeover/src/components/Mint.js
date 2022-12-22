import React, { useState } from 'react';

function Mint() {
  //initialize wallet

  const [curency, setCurrency] = useState('ethereum');
  !window.ethereum
    ? console.log('metamask not installed')
    : console.log('metamask installed');

  return <div>Mint</div>;
}

export default Mint;
