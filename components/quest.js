import React, { useState } from "react"

import { Grid, Typography, Button, CircularProgress } from "@mui/material"

import { useWallet } from '@txnlab/use-wallet'

import algosdk from "algosdk"
import DisplayShep from "./displayShep"

export default function Quest(props) { 

  const { activeAccount, signTransactions, sendTransactions } = useWallet()

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



    React.useEffect(() => {

        const fetchData = async () => {
            if (activeAccount) {

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
                    address: activeAccount.address

                    
                }),
                
                  
              });
      
              let session = await response.json()

              session.assets.forEach((asset) => {
                
                if (asset.amount >= 1) {
                  accountAssets.push(asset["asset-id"])
                }
                accountOptedAssets.push(asset["asset-id"])
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

                res1.assets.forEach((asset) => {
                  if (accountAssets.includes(asset.index)) {
                  sheps.push({asset: asset})
                  }
              })

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
                    if (asset.index >= 2164870486 && asset.index <= 2164941846 || asset.index == 2164961027) {
                      weapons.push(asset.index)
                    }
                    if (asset.index >= 2164941848 && asset.index <= 2164941877 || asset.index == 2164961029) {
                      armours.push(asset.index)
                    }
                    if (asset.index >= 2164941879 && asset.index <= 2164941904 || asset.index == 2164961032 || asset.index == 2164961034 || asset.index == 2164961036) {
                      extras.push(asset.index)
                    }
                    if (asset.index >= 2164941907 && asset.index <= 2164941923) {
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
              props.sendDiscordMessage(error, "Quest Fetch", activeAccount.address)
            }
          }
        }
          fetchData();
        
      }, [activeAccount])

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

      const fetchItems = async () => {

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
                    address: activeAccount.address

                    
                }),
                
                  
              });
      
              let session = await response.json()

              session.assets.forEach((asset) => {
                
                if (asset.amount >= 1) {
                  accountAssets.push(asset["asset-id"])
                }
                accountOptedAssets.push(asset["asset-id"])
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

                

                res1.assets.forEach((asset) => {
                  if (accountAssets.includes(asset.index)) {
                  sheps.push({asset: asset})
                  }
              })

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
                    if (asset.index >= 2164870486 && asset.index <= 2164941846 || asset.index == 2164961027) {
                      weapons.push(asset.index)
                    }
                    if (asset.index >= 2164941848 && asset.index <= 2164941877 || asset.index == 2164961029) {
                      armours.push(asset.index)
                    }
                    if (asset.index >= 2164941879 && asset.index <= 2164941904 || asset.index == 2164961032 || asset.index == 2164961034 || asset.index == 2164961036) {
                      extras.push(asset.index)
                    }
                    if (asset.index >= 2164941907 && asset.index <= 2164941923) {
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

        let shepXp = new Uint8Array([...shepBytes, ...new Uint8Array(Buffer.from("xp"))])


        let boxes = [{appIndex: 0, name: shepBox}, {appIndex: 0, name: shepTime}, {appIndex: 0, name: shepXp}]

        let txn = algosdk.makeApplicationNoOpTxn(activeAccount.address, params, 2254344958, appArgs, accounts, foreignApps, foreignAssets, undefined, undefined, undefined, boxes);

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

        let shepXp = new Uint8Array([...shepBytes, ...new Uint8Array(Buffer.from("xp"))])
        let shepStats = new Uint8Array([...shepBytes, ...new Uint8Array(Buffer.from("stats"))])

        let shepResult = new Uint8Array([...shepBytes, ...new Uint8Array(Buffer.from("result"))])

        let boxes = [{appIndex: 0, name: shepBox}, {appIndex: 0, name: shepTime}, {appIndex: 0, name: shepXp}, {appIndex: 0, name: shepStats}, {appIndex: 0, name: shepResult}]

        let txn = algosdk.makeApplicationNoOpTxn(activeAccount.address, params, 2254344958, appArgs, accounts, foreignApps, foreignAssets, undefined, undefined, undefined, boxes);

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

      const reward = async (shep) => {

        const client = new algosdk.Algodv2('', 'https://mainnet-api.algonode.cloud', 443)
        
        let params = await client.getTransactionParams().do()

        let txns = []

        let appArgs = []
        appArgs.push(
            new Uint8Array(Buffer.from("rewardShep"))

        )

        const accounts = []
        const foreignApps = []
            
        const foreignAssets = [shep]

        let commons = new Uint8Array(Buffer.from("commons"))
        let uncommons = new Uint8Array(Buffer.from("uncommons"))
        let rares = new Uint8Array(Buffer.from("rares"))
        let legendarys = new Uint8Array(Buffer.from("legendarys"))

        let shepBytes = longToByteArray(shep)

        let shepBox = new Uint8Array([...shepBytes, ...new Uint8Array(Buffer.from("place"))])
        let shepResult = new Uint8Array([...shepBytes, ...new Uint8Array(Buffer.from("result"))])
        let shepReward = new Uint8Array([...shepBytes, ...new Uint8Array(Buffer.from("reward"))])



        let boxes = [{appIndex: 0, name: shepBox}, {appIndex: 0, name: shepReward}, {appIndex: 0, name: shepResult}, {appIndex: 0, name: commons}, {appIndex: 0, name: uncommons}, {appIndex: 0, name: rares}, {appIndex: 0, name: legendarys}]


        let rtxn = algosdk.makeApplicationNoOpTxn(activeAccount.address, params, 2254344958, appArgs, accounts, foreignApps, foreignAssets, undefined, undefined, undefined, boxes);

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
            if(account.address == activeAccount.address) {
            optedin = true
            }
        })

        if (!optedin) {

            let txn = algosdk.makeAssetTransferTxnWithSuggestedParams(
                activeAccount.address, 
                activeAccount.address, 
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


        let rtxn = algosdk.makeApplicationNoOpTxn(activeAccount.address, params, 2254344958, appArgs, accounts, foreignApps, foreignAssets, undefined, undefined, undefined, boxes);

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
        let accountBoxXp = new Uint8Array([...assetBox, ...new Uint8Array(Buffer.from("xp"))])


      
        const boxes = [{appIndex: 0, name: accountBoxPlace}, {appIndex: 0, name: accountBoxTime}, {appIndex: 0, name: accountBoxXp}]

        let txn = algosdk.makeApplicationNoOpTxn(activeAccount.address, params, 2254344958, appArgs, accounts, foreignApps, foreignAssets, undefined, undefined, undefined, boxes);

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

      if (selShep) {

        return (
          
          <div style={{backgroundColor: props.mode == "light" ? "#E9D8A6" : "#33363F", height: "100%", minHeight: "100vh"}}>
            <DisplayShep unstake={unstake} startQuest={startQuest} roll={roll} reward={reward} claimReward={claimReward} setSelShep={setSelShep} selShep={selShep} assets={optedAssets} weapons={weapons} armours={armours} boots={boots} extras={extras} fetchItems={fetchItems} mode={props.mode} nftId={selShep} round={round} place={"quest"} sendDiscordMessage={props.sendDiscordMessage}/>
          </div>
        )

      }

      else {
        console.log(activeAccount)

        if (activeAccount) {
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