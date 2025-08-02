import React, { useState } from "react"

import { Grid, Typography, Button, CircularProgress } from "@mui/material"

import { useWallet } from '@txnlab/use-wallet-react'

import algosdk, { makeApplicationNoOpTxnFromObject } from "algosdk"
import DisplayShep from "./displayShep"

export default function Quest(props) { 

  const { 
      wallets,             // List of available wallets
      activeWallet,        // Currently active wallet
      activeAddress,       // Address of active account
      isReady,             // Whether all wallet providers have finished initialization
      signTransactions,    // Function to sign transactions
      transactionSigner,   // Typed signer for ATC and Algokit Utils
      algodClient          // Algod client for active network
    } = useWallet()

  const [ round, setRound] = useState(0)

  const [ assets, setAssets] = useState([])

  const [ optedAssets, setOptedAssets] = useState([])


  const [ weapons, setWeapons] = useState([])
  const [ armours, setArmours] = useState([])
  const [ boots, setBoots] = useState([])
  const [ extras, setExtras] = useState([])

  const [ selShep, setSelShep] = useState(null)

  const [ confirm, setConfirm] = useState("")

  const [ contract ] = useState(2254344958)

  const [progress, setProgress] = useState(0)


  

  const [ message, setMessage] = useState("Searching for Sheps")

    const fetchData = async () => {
        if (activeAddress) {

          try {

          const client = new algosdk.Algodv2('', 'https://mainnet-api.algonode.cloud', 443)

          let status = await client.status().do();

          setRound(status["last-round"])

          setAssets([])
          setOptedAssets([])
          setWeapons([])
          setArmours([])
          setBoots([])
          setExtras([])
          setConfirm("")
          setProgress(0)

          let sheps = []

          let accountAssets = []
          let accountOptedAssets = []

          let response = await fetch('/api/getAssets', {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
                address: activeAddress

                
            }),
            
              
          });
  
          let session = await response.json()

          console.log(session)

          session.assets.forEach((asset) => {
            
            if (asset.amount >= 1) {
              accountAssets.push(asset.assetId)
            }
            accountOptedAssets.push(asset.assetId)
        })

          let numAssets = session.assets.length
          let nextToken = session["next-token"]

        while (numAssets == 1000) {

          response = await fetch('/api/getAssets', {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
                address: activeAddress,
                nextToken: nextToken
                
                
            }),
            
              
          });  

          session = await response.json()

          session.assets.forEach((asset) => {
            if (asset.amount >= 1) {
              accountAssets.push(asset["asset-id"])
            }
            accountOptedAssets.push(asset["asset-id"])
          })

          numAssets = session.assets.length
          nextToken = session["next-token"]

      }

      setProgress(50)


          let addr1 = await fetch('/api/getCreatedAssets', {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
                address: "SHEPWD4POJMJ65XPSGUCJ4GI2SGDJNDX2C2IXI24EK5KXTOV5T237ULUCU"

                
            }),
            
              
            });

            const res1 = await addr1.json()

            console.log(res1)
            console.log(accountAssets)

            res1.assets.forEach((asset) => {
              if (accountAssets.includes(asset.index)) {
              sheps.push({asset: asset})
              }
          })

          console.log(sheps)

          let weapons = []
          let armours = []
          let boots = []
          let extras = []

          let equipmentAddr = await fetch('/api/getCreatedAssets', {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
                address: "3G4PM64BTRW2X452WVYXKRZSD76Z4HR5E7YLGBIC7PWI67HNXMZKCAG2EM"

                
            }),
            
              
            });

            const equipmentRes = await equipmentAddr.json()

            equipmentRes.assets.forEach((asset) => {
              if (accountAssets.includes(asset.index)) {
                if ((asset.index >= 2164870486 && asset.index <= 2164941846) || asset.index == 2164961027 || asset.index == 2534864660 || asset.index == 2534864644 || (asset.index >= 2874981862 && asset.index <= 2874981938)) {
                  weapons.push(asset.index)
                }
                if ((asset.index >= 2164941848 && asset.index <= 2164941877) || asset.index == 2164961029 || asset.index == 2534864662 || asset.index == 2534864633 || (asset.index >= 2874981817 && asset.index <= 2874981860)) {
                  armours.push(asset.index)
                }
                if ((asset.index >= 2164941879 && asset.index <= 2164941904) || asset.index == 2164961032 || asset.index == 2164961034 || asset.index == 2164961036 || asset.index == 2534864668 || asset.index == 2534864648 || (asset.index >= 2874981940 && asset.index <= 2874981985)) {
                  extras.push(asset.index)
                }
                if ((asset.index >= 2164941907 && asset.index <= 2164941923) || asset.index == 2534864657 || asset.index == 2534864646 || (asset.index >= 2874981987 && asset.index <= 2874982018)) {
                  boots.push(asset.index)
                }
              }
              
            })

            setWeapons(weapons)
            setArmours(armours)
            setBoots(boots)
            setExtras(extras)

            setOptedAssets(accountOptedAssets)

          setProgress(100)


          if(sheps.length > 0) {
            setAssets(sheps)
          }
          else {
            setMessage("No sheps Found")
          }
        }
        catch(error) {
          props.sendDiscordMessage(error, "Quest Fetch", activeAddress)
        }
      }
    }

    React.useEffect(() => {

          fetchData();
        
      }, [activeAddress])

      const longToByteArray = (long) => {
        // we want to represent the input as a 8-bytes array
        var byteArray = [0, 0, 0, 0, 0, 0, 0, 0];
      
        for ( var index = byteArray.length - 1; index > 0; index -- ) {
            var byte = long & 0xff;
            byteArray [ index ] = byte;
            long = (long - byte) / 256 ;
        }
      
        return byteArray;
      };

      const startQuest = async (shep, quest) => {

        const client = new algosdk.Algodv2('', 'https://mainnet-api.algonode.cloud', 443)

        let params = await client.getTransactionParams().do()

        let txns = []

        const appArgs = []
        appArgs.push(
            new Uint8Array(Buffer.from("addAsset")),
            new Uint8Array(Buffer.from(quest))

        )

        const accounts = []
        const foreignApps = []
            
        const foreignAssets = [shep]

        let shepBytes = longToByteArray(shep)

        let shepBox = new Uint8Array([...shepBytes, ...new Uint8Array(Buffer.from("place"))])
        let shepTime = new Uint8Array([...shepBytes, ...new Uint8Array(Buffer.from("time"))])



        let boxes = [{appIndex: 0, name: shepBox}, {appIndex: 0, name: shepTime}]

        let txn = algosdk.makeApplicationNoOpTxn(activeAddress, params, 2254344958, appArgs, accounts, foreignApps, foreignAssets, undefined, undefined, undefined, boxes);

        txns.push(txn)

        let encodedTxns = []

        txns.forEach((txn) => {
            let encoded = algosdk.encodeUnsignedTransaction(txn)
            encodedTxns.push(encoded)
        })

        const signedTransactions = await signTransactions(encodedTxns)
            
        const { id } = await sendTransactions(signedTransactions)
        
        let confirmedTxn = await algosdk.waitForConfirmation(client, id, 4);

        console.log(confirmedTxn)

        fetchItems()

        setSelShep(null)


      }

      const roll = async (shep) => {

        const client = new algosdk.Algodv2('', 'https://mainnet-api.algonode.cloud', 443)
        
        let params = await client.getTransactionParams().do()

        let txns = []

        const appArgs = []
        appArgs.push(
            new Uint8Array(Buffer.from("roll"))
        )

        const accounts = []
        const foreignApps = []
            
        const foreignAssets = [shep]

        let shepBytes = longToByteArray(shep)

        let shepBox = new Uint8Array([...shepBytes, ...new Uint8Array(Buffer.from("place"))])
        let shepTime = new Uint8Array([...shepBytes, ...new Uint8Array(Buffer.from("time"))])

        let shepXp = new Uint8Array([...shepBytes, ...new Uint8Array(Buffer.from("xpS2"))])
        let shepStats = new Uint8Array([...shepBytes, ...new Uint8Array(Buffer.from("stats"))])

        let shepResult = new Uint8Array([...shepBytes, ...new Uint8Array(Buffer.from("result"))])

        let boxes = [{appIndex: 0, name: shepBox}, {appIndex: 0, name: shepTime}, {appIndex: 0, name: shepXp}, {appIndex: 0, name: shepStats}, {appIndex: 0, name: shepResult}]

        let txn = algosdk.makeApplicationNoOpTxn(activeAddress, params, 2254344958, appArgs, accounts, foreignApps, foreignAssets, undefined, undefined, undefined, boxes);

        txns.push(txn)

        let encodedTxns = []

        txns.forEach((txn) => {
            let encoded = algosdk.encodeUnsignedTransaction(txn)
            encodedTxns.push(encoded)
        })

        const signedTransactions = await signTransactions(encodedTxns)
            
        const { id } = await sendTransactions(signedTransactions)
        
        let confirmedTxn = await algosdk.waitForConfirmation(client, id, 4);

        console.log(confirmedTxn)

        fetchItems()


      }

      const reward = async (shep, place) => {

        const client = new algosdk.Algodv2('', 'https://mainnet-api.algonode.cloud', 443)
        
        let params = await client.getTransactionParams().do()

        let txns = []

        let appArgs = []
        appArgs.push(
            new Uint8Array(Buffer.from("rewardShep"))

        )

        const accounts = []
        const foreignApps = []
            
        let foreignAssets = [shep]

        if (place == "jump") {
          foreignAssets.push(2582590415)
        }

        let commons = new Uint8Array(Buffer.from("commonsS2"))
        let uncommons = new Uint8Array(Buffer.from("uncommonsS2"))
        let rares = new Uint8Array(Buffer.from("raresS2"))
        let legendarys = new Uint8Array(Buffer.from("legendarysS2"))

        let shepBytes = longToByteArray(shep)

        let shepBox = new Uint8Array([...shepBytes, ...new Uint8Array(Buffer.from("place"))])
        let shepResult = new Uint8Array([...shepBytes, ...new Uint8Array(Buffer.from("result"))])
        let shepReward = new Uint8Array([...shepBytes, ...new Uint8Array(Buffer.from("reward"))])

        let boxes = [{appIndex: 0, name: shepBox}, {appIndex: 0, name: shepReward}, {appIndex: 0, name: shepResult}, {appIndex: 0, name: commons}, {appIndex: 0, name: uncommons}, {appIndex: 0, name: rares}, {appIndex: 0, name: legendarys}]

        if (place == "jump") {
          boxes = [{appIndex: 0, name: shepBox}, {appIndex: 0, name: shepReward}, {appIndex: 0, name: shepResult}]
        }

        let rtxn = algosdk.makeApplicationNoOpTxn(activeAddress, params, 2254344958, appArgs, accounts, foreignApps, foreignAssets, undefined, undefined, undefined, boxes);

        console.log(rtxn)

        txns.push(rtxn)

        let encodedTxns = []

        txns.forEach((txn) => {
            let encoded = algosdk.encodeUnsignedTransaction(txn)
            encodedTxns.push(encoded)
        })

        const signedTransactions = await signTransactions(encodedTxns)
            
        const { id } = await sendTransactions(signedTransactions)
        
        let confirmedTxn = await algosdk.waitForConfirmation(client, id, 4);

        console.log(confirmedTxn)

        fetchItems()


      }

      const claimReward = async (shep, item) => {

        const client = new algosdk.Algodv2('', 'https://mainnet-api.algonode.cloud', 443)

        const indexerClient = new algosdk.Indexer('', 'https://mainnet-idx.algonode.cloud', 443)
        
        let params = await client.getTransactionParams().do()

        let txns = []

        let optedin = false

        let opted = await indexerClient.lookupAssetBalances(item).do();

        console.log(opted)

        opted.balances.forEach((account) => {
            if(account.address == activeAddress) {
            optedin = true
            }
        })

        if (!optedin) {

            let txn = algosdk.makeAssetTransferTxnWithSuggestedParams(
                activeAddress, 
                activeAddress, 
                undefined, 
                undefined,
                0,  
                undefined, 
                item, 
                params
            );

            txns.push(txn)
            
        }

        let appArgs = []
        appArgs.push(
            new Uint8Array(Buffer.from("claimReward"))
        )

        const accounts = []
        const foreignApps = []
            
        const foreignAssets = [shep, item]


        let shepBytes = longToByteArray(shep)

        let shepReward = new Uint8Array([...shepBytes, ...new Uint8Array(Buffer.from("reward"))])

        let boxes = [{appIndex: 0, name: shepReward}]


        let rtxn = algosdk.makeApplicationNoOpTxn(activeAddress, params, 2254344958, appArgs, accounts, foreignApps, foreignAssets, undefined, undefined, undefined, boxes);

        txns.push(rtxn)

        if (txns.length > 1) {
          let txgroup = algosdk.assignGroupID(txns)
        }


        let encodedTxns = []

        txns.forEach((txn) => {
            let encoded = algosdk.encodeUnsignedTransaction(txn)
            encodedTxns.push(encoded)
        })

        const signedTransactions = await signTransactions(encodedTxns)
            
        const { id } = await sendTransactions(signedTransactions)
        
        let confirmedTxn = await algosdk.waitForConfirmation(client, id, 4);

        console.log(confirmedTxn)

        fetchItems()


      }

      const unstake = async (shep) => {

        const client = new algosdk.Algodv2('', 'https://mainnet-api.algonode.cloud', 443)

        let params = await client.getTransactionParams().do()

        let txns = []

        const appArgs = []
        appArgs.push(
            new Uint8Array(Buffer.from("removeAsset"))

        )

        const accounts = []
        const foreignApps = []
            
        const foreignAssets = [shep]

        let assetBox = algosdk.encodeUint64(foreignAssets[0])

        let accountBoxPlace = new Uint8Array([...assetBox, ...new Uint8Array(Buffer.from("place"))])
        let accountBoxTime = new Uint8Array([...assetBox, ...new Uint8Array(Buffer.from("time"))])
        let accountBoxXp = new Uint8Array([...assetBox, ...new Uint8Array(Buffer.from("xpS2"))])
      
        const boxes = [{appIndex: 0, name: accountBoxPlace}, {appIndex: 0, name: accountBoxTime}, {appIndex: 0, name: accountBoxXp}]

        const txn = makeApplicationNoOpTxnFromObject({
          sender: activeAddress,
          suggestedParams: params,
          appIndex: 2254344958,
          appArgs: appArgs, // must be Uint8Array[]
          accounts: accounts, // optional
          foreignApps: foreignApps, // optional
          foreignAssets: foreignAssets, // optional
          note: undefined,
          lease: undefined,
          rekeyTo: undefined,
          boxes: boxes // must be array of { appIndex, name: Uint8Array }
        })

        txns.push(txn)

        let encodedTxns = []

        txns.forEach((txn) => {
            let encoded = algosdk.encodeUnsignedTransaction(txn)
            encodedTxns.push(encoded)
        })

        const signedTransactions = await signTransactions(encodedTxns)

        console.log(signedTransactions)
            
        const { txid } = await client.sendRawTransaction(signedTransactions).do()

        console.log(txid)
        
        let confirmedTxn = await algosdk.waitForConfirmation(client, txid, 4);

        console.log(confirmedTxn)

        fetchItems()


      }

      if (selShep) {

        return (
          
          <div style={{backgroundColor: props.mode == "light" ? "#E9D8A6" : "#33363F", height: "100%", minHeight: "100vh"}}>
            <DisplayShep unstake={unstake} startQuest={startQuest} roll={roll} reward={reward} claimReward={claimReward} setSelShep={setSelShep} selShep={selShep} assets={optedAssets} weapons={weapons} armours={armours} boots={boots} extras={extras} fetchItems={fetchItems} mode={props.mode} nftId={selShep} round={round} place={"quest"} sendDiscordMessage={props.sendDiscordMessage}/>
          </div>
        )

      }

      else {
        console.log(activeAddress)

        if (activeAddress) {
          return (
          
            <div style={{backgroundColor: props.mode == "light" ? "#E9D8A6" : "#33363F", height: "100%", minHeight: "100vh"}}>
  
                <Grid container>
                {assets.length > 0 ? assets.map((asset, index) => {
                    
                  
                    return (
                      <Grid key={index} item xs={12} sm={6} md={4} lg={3} style={{padding: 20}}>
                      <DisplayShep unstake={unstake} startQuest={startQuest} roll={roll} reward={reward} claimReward={claimReward} setSelShep={setSelShep} selShep={selShep} assets={optedAssets} weapons={weapons} armours={armours} boots={boots} extras={extras} fetchItems={fetchItems} mode={props.mode} nftId={asset.asset.index} round={round} place={"quest"} sendDiscordMessage={props.sendDiscordMessage}/>
                      </Grid>
                    )
                  
                   
                })
                :
                <div style={{display: "flex", marginTop: 20}}>
                  <Typography style={{margin: 30, fontFamily: "LondrinaSolid"}}> {message} </Typography>
                  <CircularProgress variant="determinate" value={progress} />
    
                </div>
                }
               
                  
               </Grid>
            
              
               
                
  
            </div>
          )
        }
        else {
          return (
            <div></div>
          )
        }
        
      }


  
        
    
}