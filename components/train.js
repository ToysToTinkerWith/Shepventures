import React, { useState } from "react"

import { Grid, Typography, Button, CircularProgress } from "@mui/material"


import { useWallet } from '@txnlab/use-wallet'

import algosdk from "algosdk"
import DisplayShep from "./displayShep"

export default function Train(props) { 

  const { activeAccount, signTransactions, sendTransactions } = useWallet()

  const [ round, setRound] = useState(0)

  const [ assets, setAssets] = useState([])
  const [ cashAssets, setCashAssets] = useState([])

  const [ confirm, setConfirm] = useState("")

  const [ contract ] = useState(2254344958)

  const [progress, setProgress] = useState(0)


  

  const [ message, setMessage] = useState("Searching for Sheps")

  console.log(activeAccount)


    React.useEffect(() => {

        const fetchData = async () => {
            if (activeAccount) {

              try {

              const client = new algosdk.Algodv2('', 'https://mainnet-api.algonode.cloud', 443)

              let status = await client.status().do();

              setRound(status["last-round"])

              setCashAssets([])

              setAssets([])
              setConfirm("")
              setProgress(0)

              let sheps = []

              let accountAssets = []

              let response = await fetch('/api/getAssets', {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    address: activeAccount.address

                    
                }),
                
                  
              });
      
              let session = await response.json()

              session.assets.forEach((asset) => {
                
                if (asset.amount == 1) {
                  accountAssets.push(asset["asset-id"])
                }
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
                    address: activeAccount.address,
                    nextToken: nextToken
                    
                    
                }),
                
                  
              });  

              session = await response.json()

              session.assets.forEach((asset) => {
                if (asset.amount == 1) {
                  accountAssets.push(asset["asset-id"])
                }
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

                res1.assets.forEach((asset) => {
                  if (accountAssets.includes(asset.index)) {
                  sheps.push({asset: asset})
                  }
              })

              setProgress(100)


              if(sheps.length > 0) {
                setAssets(sheps)
              }
              else {
                setMessage("No sheps Found")
              }
            }
            catch(error) {
              props.sendDiscordMessage(error, "Train Fetch", activeAccount.address)
            }
          }
        }
          fetchData();
        
      }, [activeAccount])

      console.log(activeAccount)


  let cashOut = async () => {


    setConfirm("Sign Transaction...")
      
      try {


        const client = new algosdk.Algodv2('', 'https://mainnet-api.algonode.cloud', 443)
      
        let params = await client.getTransactionParams().do()

        let txns = []
        let encodedTxns = []

        

      cashAssets.forEach(async (asset) => {

          const appArgs = []

          if (asset.option == "claim") {
            appArgs.push(
              new Uint8Array(Buffer.from("roll"))
            )
          }
          else if (asset.option == "stake") {
            appArgs.push(
              new Uint8Array(Buffer.from("addAsset")),
              new Uint8Array(Buffer.from("train")),
            )
          }
          else if (asset.option == "unstake") {
            appArgs.push(
              new Uint8Array(Buffer.from("removeAsset"))
            )
          }


          
                  
            const accounts = []
            const foreignApps = []
              
            const foreignAssets = [asset.assetId]

            let assetBox = algosdk.encodeUint64(foreignAssets[0])

            let accountBoxPlace = new Uint8Array([...assetBox, ...new Uint8Array(Buffer.from("place"))])
            let accountBoxTime = new Uint8Array([...assetBox, ...new Uint8Array(Buffer.from("time"))])
            let accountBoxXp = new Uint8Array([...assetBox, ...new Uint8Array(Buffer.from("xp"))])
            let accountBoxShep = new Uint8Array([...assetBox, ...new Uint8Array(Buffer.from("stats"))])



          
            const boxes = [{appIndex: 0, name: accountBoxPlace}, {appIndex: 0, name: accountBoxTime}, {appIndex: 0, name: accountBoxXp}, {appIndex: 0, name: accountBoxShep}]
      
            let dtxn = algosdk.makeApplicationNoOpTxn(activeAccount.address, params, contract, appArgs, accounts, foreignApps, foreignAssets, undefined, undefined, undefined, boxes);
      
            txns.unshift(dtxn)
            

      })
      if (txns.length > 1) {
        let txgroup = algosdk.assignGroupID(txns)
  
      }

      txns.forEach((txn) => {
        let encoded = algosdk.encodeUnsignedTransaction(txn)
        encodedTxns.push(encoded)

      })

      const signedTransactions = await signTransactions(encodedTxns)
      setConfirm("Sending Transaction...")
          
      const { id } = await sendTransactions(signedTransactions)
      
      let confirmedTxn = await algosdk.waitForConfirmation(client, id, 4);

      setConfirm("Transaction Confirmed")

      let status = await client.status().do();

      setRound(status["last-round"])

      setCashAssets([])
      setConfirm("")

      setAssets([])

      let sheps = []

      let accountAssets = []

      let response = await fetch('/api/getAssets', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            address: activeAccount.address

            
        }),
        
          
      });

      let session = await response.json()

      session.assets.forEach((asset) => {
        
        if (asset.amount == 1) {
          accountAssets.push(asset["asset-id"])
        }
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
            address: activeAccount.address,
            nextToken: nextToken
            
            
        }),
        
          
      });  

      session = await response.json()

      session.assets.forEach((asset) => {
        if (asset.amount == 1) {
          accountAssets.push(asset["asset-id"])
        }
      })

      numAssets = session.assets.length
      nextToken = session["next-token"]

  }

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

        res1.assets.forEach((asset) => {
          if (accountAssets.includes(asset.index)) {
          sheps.push({asset: asset})
          }
      })


      if(sheps.length > 0) {
        setAssets(sheps)
      }
      
    }
    catch (error) {
      setConfirm(String(error))
      props.sendDiscordMessage(error, "Train Claim")
    }

  }

        let totalClaim = 0
        let totalStake = 0
        let totalUnstake = 0

        cashAssets.forEach((asset) => {
          if (asset.option == "stake") {
            totalStake++
          }
          else if (asset.option == "unstake") {
            totalUnstake++
          }
          else if (asset.option == "claim") {
            totalClaim++
          }
        })

        return (
          
            <div style={{backgroundColor: props.mode == "light" ? "#E9D8A6" : "#33363F", height: "100vh"}}>

              {cashAssets.length > 0 ?
              
              <Button variant="contained" color="secondary" style={{position: "fixed", display: "grid", zIndex: 1, bottom: 20, right: 20, backgroundColor: "#A1FF9F", margin: 20, padding: 20}} onClick={() => cashOut()} >
                <img src={"./Train.svg"} style={{width: 50, minWidth: 50}} />
                {totalClaim > 0 ?
                <Typography color="primary"  align="center" variant="h6" style={{fontFamily: "LondrinaSolid"}}> Claim: {totalClaim} </Typography>
                :
                null
                }

              {totalStake > 0 ?
              <Typography color="primary" align="left" variant="h6" style={{fontFamily: "LondrinaSolid"}}> Stake: {totalStake} </Typography>
              :
              null
              }
              {totalUnstake > 0 ?
              <Typography color="primary" align="left" variant="h6" style={{fontFamily: "LondrinaSolid"}}> Unstake: {totalUnstake} </Typography>
              :
              null
              }

            <Typography color="primary"  align="center" variant="caption" style={{display: "grid"}}> {confirm} </Typography>

              

              </Button>
              :
              null
              }
              
        
              <Grid container>
              {assets.length > 0 ? assets.map((asset, index) => {
                return (
                  <Grid key={index} item xs={6} sm={4} md={4} lg={3} style={{padding: 20}}>
                  <DisplayShep mode={props.mode} nftId={asset.asset.index} reward={asset.reward} round={round} cashAssets={cashAssets} setCashAssets={setCashAssets} place={"train"} sendDiscordMessage={props.sendDiscordMessage}/>
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