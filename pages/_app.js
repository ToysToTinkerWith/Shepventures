
import React, { useEffect, useState } from "react";

import { useRouter } from 'next/router'

import PropTypes from "prop-types";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../theme";

import "../style.css"

import { Button, Typography, Grid, CircularProgress } from "@mui/material"

import { WalletProvider, PROVIDER_ID, useInitializeProviders  } from '@txnlab/use-wallet'

import { PeraWalletConnect } from "@perawallet/connect";
import { DeflyWalletConnect } from "@blockshake/defly-connect";

import { useWallet } from '@txnlab/use-wallet'

import CancelIcon from '@mui/icons-material/Cancel';


export default function MyApp(props) {

  const providers = useInitializeProviders({
    providers: [
      { id: PROVIDER_ID.PERA, clientStatic: PeraWalletConnect },
      { id: PROVIDER_ID.DEFLY, clientStatic: DeflyWalletConnect }
 
    ]
  })

  const { Component, pageProps } = props;

  const { activeAccount, signTransactions, sendTransactions } = useWallet()

  const [ message, setMessage ] = useState("")
  const [ progress, setProgress ] = useState(0)

  const [ wallet, setWallet ] = useState([])

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
  }, [router.events, activeAccount])

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
      
     
     <WalletProvider value={providers}>

      <ThemeProvider theme={theme}>
      <CssBaseline />
      
        <Component {...pageProps} setMessage={setMessage} setProgress={setProgress} contracts={contracts} sendDiscordMessage={sendDiscordMessage} wallet={wallet} />
      </ThemeProvider>
      </WalletProvider>
    </React.Fragment>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};
