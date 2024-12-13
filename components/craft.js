import React, { useState } from "react"

import { Grid, Typography, Button, CircularProgress } from "@mui/material"

import { useWallet } from '@txnlab/use-wallet'

import algosdk from "algosdk"
import DisplayShep from "./displayShep"

import DisplayItem from "./displayItem"

export default function Craft(props) { 

  const { activeAccount, signTransactions, sendTransactions } = useWallet()

  const [ round, setRound] = useState(0)

  const [ assets, setAssets] = useState([])

  const [ optedAssets, setOptedAssets] = useState([])


  const [ items, setItems] = useState([])
  const [ craftables, setCraftables] = useState([])

  const [ craftAssets, setCraftAssets] = useState([])

  const [ confirm, setConfirm] = useState("")

  const [ contract ] = useState(2254344958)
  const [ craftContract ] = useState(2575065768)

  const [progress, setProgress] = useState(0)

  const [commons, setCommons] = useState([2164870486, 2164870489, 2164870498, 2164870500, 2164870507, 2164870510, 2164941848, 2164941852, 2164941855, 2164941879, 2164941881, 2164941907])

  const [uncommons, setUncommons] = useState([2164941792, 2164941794, 2164941797, 2164941807, 2164941815, 2164941818, 2164941858, 2164941860, 2164941862, 2164941894, 2164941910, 2164961032])

  const [rares, setRares] = useState([2164941820, 2164941822, 2164941824, 2164941826, 2164941829, 2164941831, 2164941865, 2164941868, 2164941870, 2164941897, 2164941921, 2164961034])

  const [legendarys, setLegendarys] = useState([2164941833, 2164941835, 2164941837, 2164941841, 2164941846, 2164941872, 2164941877, 2164941904, 2164941923, 2164961027, 2164961029, 2164961036])

  const [ message, setMessage] = useState("Searching for Sheps")

  const byteArrayToLong = (byteArray) => {
    var value = 0;
    for ( var i = 0; i < byteArray.length; i++) {
        value = (value * 256) + byteArray[i];
    }

    return value;
  };

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

  React.useEffect(() => {

    const fetchData = async () => {
        if (activeAccount) {

          try {

          const client = new algosdk.Algodv2('', 'https://mainnet-api.algonode.cloud', 443)

          let status = await client.status().do();

          setRound(status["last-round"])

          setAssets([])
          setOptedAssets([])
          setItems([])
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
              accountAssets.push({assetId: asset["asset-id"], assetAmount: asset.amount})
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
              accountAssets.push({assetId: asset["asset-id"], assetAmount: asset.amount})
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

          let items = []
          let craftables = []

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

            console.log(equipmentRes.assets)

            equipmentRes.assets.forEach((asset) => {
              let index = accountAssets.findIndex(accAsset => accAsset.assetId === asset.index)
              console.log(index)
              if (index != -1) {

                let rarity = ""

                if (commons.includes(asset.index)) {
                  rarity = "common"
                }
                if (uncommons.includes(asset.index)) {
                  rarity = "uncommon"
                }
                if (rares.includes(asset.index)) {
                  rarity = "rare"
                }
                if (legendarys.includes(asset.index)) {
                  rarity = "legendary"
                }

                if (asset.index >= 2164870486 && asset.index <= 2164941846 || asset.index == 2164961027) {
                  console.log(accountAssets[index])
                  for (let i = 0; i < accountAssets[index].assetAmount; i++) {
                    items.push({assetId: asset.index, type: "weapon", rarity: rarity})
                  }
                }
                if (asset.index >= 2164941848 && asset.index <= 2164941877 || asset.index == 2164961029) {
                  for (let i = 0; i < accountAssets[index].assetAmount; i++) {
                    items.push({assetId: asset.index, type: "armour", rarity: rarity})
                  }
                }
                if (asset.index >= 2164941879 && asset.index <= 2164941904 || asset.index == 2164961032 || asset.index == 2164961034 || asset.index == 2164961036) {
                  for (let i = 0; i < accountAssets[index].assetAmount; i++) {
                    items.push({assetId: asset.index, type: "extra", rarity: rarity})
                  }
                }
                if (asset.index >= 2164941907 && asset.index <= 2164941923) {
                  for (let i = 0; i < accountAssets[index].assetAmount; i++) {
                    items.push({assetId: asset.index, type: "boots", rarity: rarity})
                  }
                }
                
              }
              if (asset.index >= 2534864633) {
                console.log(asset)
                if (asset.params.total == 100) {
                  craftables.push({assetId: asset.index, rarity: "T1"})
                }
              }
              
            })

            setItems(items)
            setCraftables(craftables)

            console.log(items)

            setOptedAssets(accountOptedAssets)

          setProgress(100)


         
        }
        catch(error) {
          props.sendDiscordMessage(error, "Quest Fetch", activeAccount.address)
        }
      }
    }
      fetchData();
    
  }, [activeAccount])

     

  const fetchData = async () => {
      try {

      const client = new algosdk.Algodv2('', 'https://mainnet-api.algonode.cloud', 443)

      let status = await client.status().do();

      setRound(status["last-round"])

      setAssets([])
      setOptedAssets([])
      setItems([])
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
          accountAssets.push({assetId: asset["asset-id"], assetAmount: asset.amount})
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
          accountAssets.push({assetId: asset["asset-id"], assetAmount: asset.amount})
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

      let items = []

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
          let index = accountAssets.findIndex(accAsset => accAsset.assetId === asset.index)
          console.log(index)
          if (index != -1) {

            let rarity = ""

            if (commons.includes(asset.index)) {
              rarity = "common"
            }
            if (uncommons.includes(asset.index)) {
              rarity = "uncommon"
            }
            if (rares.includes(asset.index)) {
              rarity = "rare"
            }
            if (legendarys.includes(asset.index)) {
              rarity = "legendary"
            }

            if (asset.index >= 2164870486 && asset.index <= 2164941846 || asset.index == 2164961027) {
              console.log(accountAssets[index])
              for (let i = 0; i < accountAssets[index].assetAmount; i++) {
                items.push({assetId: asset.index, type: "weapon", rarity: rarity})
              }
              
            }
            if (asset.index >= 2164941848 && asset.index <= 2164941877 || asset.index == 2164961029) {
              items.push({assetId: asset.index, type: "armour", rarity: rarity})
            }
            if (asset.index >= 2164941879 && asset.index <= 2164941904 || asset.index == 2164961032 || asset.index == 2164961034 || asset.index == 2164961036) {
              items.push({assetId: asset.index, type: "extra", rarity: rarity})
            }
            if (asset.index >= 2164941907 && asset.index <= 2164941923) {
              items.push({assetId: asset.index, type: "boots", rarity: rarity})
            }
          }
          
        })

        setItems(items)
        setCraftables(craftables)

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

    const dust = async () => {

      setConfirm("Sign Transaction...")
      
      try {


        const client = new algosdk.Algodv2('', 'https://mainnet-api.algonode.cloud', 443)

        const indexerClient = new algosdk.Indexer('', 'https://mainnet-idx.algonode.cloud', 443)
      
        let params = await client.getTransactionParams().do()

        let txns = []
        let encodedTxns = []
        console.log(craftAssets)
        console.log(commons)


        let optedInCommon = false

        let optedCommon = await indexerClient.lookupAssetBalances(2557493157).do();

        optedCommon.balances.forEach((account) => {
            if(account.address == activeAccount.address) {
            optedInCommon = true
            }
        })

        if (!optedInCommon) {

            let octxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
                activeAccount.address, 
                activeAccount.address, 
                undefined, 
                undefined,
                0,  
                undefined, 
                2557493157, 
                params
            );

            txns.push(octxn)
            
        }

      let rareMaterial = false

      craftAssets.forEach(async (asset) => {

        if (asset.rarity == "rare" || asset.rarity == "legendary") {
          rareMaterial = true
        }

      })

      if (rareMaterial) {
        let optedInRare = false

        let optedRare = await indexerClient.lookupAssetBalances(2534921654).do();

        optedRare.balances.forEach((account) => {
            if(account.address == activeAccount.address) {
              optedInRare = true
            }
        })

        if (!optedInRare) {

            let ortxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
                activeAccount.address, 
                activeAccount.address, 
                undefined, 
                undefined,
                0,  
                undefined, 
                2534921654, 
                params
            );

            txns.push(ortxn)
            
        }
      }

        
      craftAssets.forEach(async (asset) => {

        let atxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
          activeAccount.address, 
          "4E7OY45TM5DY264HBPF7UYHLTGYUXTCSDKHGG6VB346XZNORURU2BAETBA", 
          undefined, 
          undefined,
          1,  
          undefined, 
          asset.assetId, 
          params
        );

        txns.push(atxn)

        const appArgs = [
          new Uint8Array(Buffer.from("dust"))
        ]
                
        const accounts = []
        const foreignApps = []
          
        const foreignAssets = [asset.assetId, 2557493157, 2534921654]
      
        const boxes = []
  
        let dtxn = algosdk.makeApplicationNoOpTxn(activeAccount.address, params, craftContract, appArgs, accounts, foreignApps, foreignAssets, undefined, undefined, undefined, boxes);
  
        txns.push(dtxn)

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

      setCraftAssets([])

      fetchData()

    }
    catch (error) {

    }

      
    }

    let craftRewards = {common: 0, rare: 0}

      console.log(craftables)

    return (
       
        <Grid container style={{backgroundColor: props.mode == "light" ? "#E9D8A6" : "#33363F", height: "100%"}}>
          {craftables.map((item, index) => {
            console.log(item)
              return(
                <Grid key={index} item xs={6} sm={4} md={3}>
                  <DisplayItem index={index} nftId={item.assetId} sendDiscordMessage={props.sendDiscordMessage} type={"craft"} mode={props.mode}/>
                </Grid>
              )
            })}
            {items.map((item, index) => {
              return(
                <Grid key={index} item xs={6} sm={4} md={3}>
                  <DisplayItem index={index} nftId={item.assetId} rarity={item.rarity} sendDiscordMessage={props.sendDiscordMessage} type={"dust"} mode={props.mode} craftAssets={craftAssets} setCraftAssets={setCraftAssets}/>
                </Grid>
              )
            })}
            {craftAssets.length > 0 ?
              
              <Button variant="contained" color="secondary" style={{position: "fixed", display: "grid", zIndex: 1, bottom: 20, right: 20, backgroundColor: "#A1FF9F", margin: 20, padding: 20}} onClick={() => dust()} >
                <img src={"./Train.svg"} style={{width: 50, minWidth: 50}} />
                
                <Typography color="primary"  align="center" variant="h6" style={{fontFamily: "LondrinaSolid"}}> Dust: {craftAssets.length} </Typography>
               


            <Typography color="primary"  align="center" variant="caption" style={{display: "grid"}}> {confirm} </Typography>

              

              </Button>
              :
              null
            }
        </Grid>
     
    )

}