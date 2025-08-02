
import React, { useEffect, useState } from "react";

import { useRouter } from 'next/router'

import PropTypes from "prop-types";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../theme";

import "../style.css"

import { Button, Typography, Grid, CircularProgress } from "@mui/material"

import { WalletManager, WalletId, NetworkId, WalletProvider } from '@txnlab/use-wallet-react'


import CancelIcon from '@mui/icons-material/Cancel';




export default function MyApp(props) {

  const manager = new WalletManager({
    wallets: [WalletId.PERA, WalletId.DEFLY],
    defaultNetwork: NetworkId.MAINNET // or just 'mainnet'
  })

  const { Component, pageProps } = props;

  const [ message, setMessage ] = useState("")
  const [ progress, setProgress ] = useState(0)

  let contracts = {}


  const router = useRouter()

  useEffect(() => {

    
    const handleRouteChange = (url) => {
      gtag.pageview(url)
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  useEffect(() => {
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  const sendDiscordMessage = async (error, location, address) => {

    console.log(error)
       
    const response = await fetch(process.env.discordErrorWebhook, {
      method: "POST",
      body: JSON.stringify({ 
        embeds: [{
          title: String(address) + " " + String(location),
          description: String(error)
        }]
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

  }


  return (
    
    
    <React.Fragment>

      {message ?
      <div style={{border: "1px solid white", position: "fixed", zIndex: 10, top: 15, left: 15, borderRadius: 5, backgroundColor: "#000000"}}>
        <Button onClick={() => setMessage("")}>
        <CancelIcon style={{color: "white", marginRight: 20}} />
        </Button>
      <Typography style={{color: "#FFFFFF", padding: 20, paddingTop: 10}}> {message} </Typography>
      {progress ? 
      <div>
        <CircularProgress variant="determinate" value={progress} style={{display: "flex", margin: "auto", color: "white"}} />
        <br />
      </div>
      :
      null
      }
      </div>
      :
      null
      }
      
     
     <WalletProvider manager={manager}>

      <ThemeProvider theme={theme}>
      <CssBaseline />
      
        <Component {...pageProps} setMessage={setMessage} setProgress={setProgress} contracts={contracts} sendDiscordMessage={sendDiscordMessage} />
      </ThemeProvider>
      </WalletProvider>
    </React.Fragment>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};
