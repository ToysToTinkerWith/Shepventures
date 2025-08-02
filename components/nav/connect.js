import React, { useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'

import { Button, Typography, Modal } from '@mui/material';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';


export default function Connect(props) {

  const { 
    wallets,             // List of available wallets
    activeWallet,        // Currently active wallet
    activeAddress,       // Address of active account
    isReady,             // Whether all wallet providers have finished initialization
    signTransactions,    // Function to sign transactions
    transactionSigner,   // Typed signer for ATC and Algokit Utils
    algodClient          // Algod client for active network
  } = useWallet()

  const [open, setOpen] = useState(false)

  React.useEffect(() => {
    if (props.open) {
      setOpen(true);
    }
    
})

console.log(props)

  // Map through the providers.
  // Render account information and "connect", "set active", and "disconnect" buttons.
  // Finally, map through the `accounts` property to render a dropdown for each connected account.
  return (
    <div>
    {activeAddress ?
      <Button
      variant="text"
      style={{display: "grid"}}
      onClick={() => [setOpen(!open), props.setPage("SHEPVENTURES")]} 
      >
        <img src={"Wallet.svg"} style={{width: "50px"}} />
    </Button>
      :
      <Button
        variant="text"
        style={{display: "grid"}}
        onClick={() => [setOpen(!open), props.setPage("SHEPVENTURES")]}
        >
        <img src={"Wallet.svg"} style={{width: "50px"}} />
      </Button>
      }
    <Modal
    open={open}
    onClose={() => [setOpen(false), props.setPage("SHEPVENTURES")]}
    onClick={() => setOpen(false)}
    style={{position: "absolute", top: "0", right: "0"}}
    >
      
      
  <div style={{position: "absolute", zIndex: 6, backgroundColor: "white", right: 0, border: "1px solid black", borderRadius: 15}}>
  {wallets?.map((provider) => (
    <div key={'provider-' + provider.id} style={{margin: 30}}>
      <Typography >
        <img width={30} height={30} style={{margin: 10, color: "#FAFAFA", borderRadius: 15}} alt="" src={provider.metadata.icon} />
        {provider.metadata.name} {provider.isActive && '[active]'}
      </Typography>
      <div style={{padding: 20}}>
        <hr />
        <Button  variant="outlined" style={{borderRadius: 15, margin: 10}} onClick={provider.connect} disabled={provider.isConnected}>
          Connect
        </Button>
        <Button style={{margin: 10}} onClick={provider.disconnect} disabled={!provider.isConnected}>
          Disconnect
        </Button>
        <Button
        style={{margin: 10}}
          onClick={provider.setActiveAccount}
          disabled={!provider.isConnected || provider.isActive}
        >
          Set Active
        </Button>
        
      </div>
    </div>
  ))}
</div>

   
  </Modal>
  </div>
    
  )
}