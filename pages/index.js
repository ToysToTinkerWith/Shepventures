import React, { useState } from "react"

import Head from "next/head"

import Nav from "../components/nav/nav"

import Home from "../components/home"
import Train from "../components/train"
import Quest from "../components/quest"
import Craft from "../components/craft"
import Leaderboards from "../components/leaderboards"


import { useWallet } from '@txnlab/use-wallet-react'

export default function Index(props) { 

    const { 
        wallets,             // List of available wallets
        activeWallet,        // Currently active wallet
        activeAddress,       // Address of active account
        isReady,             // Whether all wallet providers have finished initialization
        signTransactions,    // Function to sign transactions
        transactionSigner,   // Typed signer for ATC and Algokit Utils
        algodClient          // Algod client for active network
    } = useWallet()
    
    const [page, setPage] = useState("SHEPVENTURES")

    const [mode, setMode] = useState("light")
   

        return (
            <div style={{height: "100%"}}>
                <Head>
                <title>Shepventures</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="description" content="Let's go on a Shepventure -- an RPG adventure on the Algorand Blockchain" />
                <meta name="keywords" content="Shepventures, Idle Game, NFT, Algorand" />

                
                </Head>

               <Nav activeAddress={activeAddress} page={page} setPage={setPage} mode={mode} setMode={setMode} />

               {page == "SHEPVENTURES" || page == "connect" ? 
               <Home setPage={setPage} activeAddress={activeAddress} mode={mode} />
               :
               null
               }

               {page == "TRAIN" ? 
               <Train sendDiscordMessage={props.sendDiscordMessage} mode={mode} />
                :
                null
                }

                {page == "QUEST" ? 
               <Quest sendDiscordMessage={props.sendDiscordMessage} mode={mode} />
                :
                null
                }

                {page == "CRAFT" ? 
               <Craft sendDiscordMessage={props.sendDiscordMessage} mode={mode} />
                :
                null
                }

                {page == "LEADERBOARDS" ? 
               <Leaderboards sendDiscordMessage={props.sendDiscordMessage} mode={mode} />
                :
                null
                }

             


            </div>
        )
    
}