import React, {useState} from "react"

import { Typography, Button, Grid } from "@mui/material"

import { useWallet } from '@txnlab/use-wallet'

import algosdk from "algosdk"

const byteArrayToLong = (byteArray) => {
    var value = 0;
    for ( var i = 0; i < byteArray.length; i++) {
        value = (value * 256) + byteArray[i];
    }

    return value;
};


export default function DisplayItem(props) {

    const { activeAccount, signTransactions, sendTransactions } = useWallet()

    const [ nft, setNft] = useState(null)
    const [ nftUrl, setNftUrl] = useState(null)

    const [ survival, setSurvival] = useState(100)
    const [ power, setPower] = useState(100)
    const [ speed, setSpeed] = useState(100)
    const [ XP, setXP] = useState(100)

    const [ equippedSurvival, setEquippedSurvival] = useState(100)
    const [ equippedPower, setEquippedPower] = useState(100)
    const [ equippedSpeed, setEquippedSpeed] = useState(100)
    const [ equippedXP, setEquippedXP] = useState(100)

    React.useEffect(() => {

        const fetchData = async () => {
            if (activeAccount && props.nftId != 0) {

                try {

                    let response = await fetch('/api/getNft', {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            nftId: props.nftId
                        }),
                        
                            
                        });
                    
                    let session = await response.json()


                    setNft(session.assets[0].params)
                    setNftUrl("https://ipfs.algonode.xyz/ipfs/" + session.assets[0].params.url.slice(7))

                    let assetBox = algosdk.encodeUint64(props.nftId)

                    const client = new algosdk.Algodv2('', 'https://mainnet-api.algonode.cloud', 443)


                    let itemStats = await client.getApplicationBoxByName(2254344958, new Uint8Array([...assetBox, ...new Uint8Array(Buffer.from(props.cat))])).do();


                    let survival = byteArrayToLong(itemStats.value.slice(0,8))
                    let power = byteArrayToLong(itemStats.value.slice(8,16))
                    let XP = byteArrayToLong(itemStats.value.slice(16,24))
                    let speed = byteArrayToLong(itemStats.value.slice(24,32))


                    setSurvival(survival)
                    setPower(power)
                    setSpeed(speed)
                    setXP(XP)

                    // if (props.equipped) {
                        
                    //     let equippedBox = algosdk.encodeUint64(props.equipped)

                    //     let equippedStats = await client.getApplicationBoxByName(2254344958, new Uint8Array([...equippedBox, ...new Uint8Array(Buffer.from(props.cat))])).do();


                    //     let survival = byteArrayToLong(equippedStats.value.slice(0,8))
                    //     let power = byteArrayToLong(equippedStats.value.slice(8,16))
                    //     let XP = byteArrayToLong(equippedStats.value.slice(16,24))
                    //     let speed = byteArrayToLong(equippedStats.value.slice(24,32))

                    //     console.log(survival, power, speed, XP)

                    //     setEquippedSurvival(survival)
                    //     setEquippedPower(power)
                    //     setEquippedSpeed(speed)
                    //     setEquippedXP(XP)

                    // }

                    
                
                    
                
                }
                catch (error) {
                    props.sendDiscordMessage(error, "Item Fetch")
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

    const equipItem = async () => {


        

        const client = new algosdk.Algodv2('', 'https://mainnet-api.algonode.cloud', 443)

        let params = await client.getTransactionParams().do()

        let txns = []

        if (props.type == "equipped") { //item equipped

            if (!props.assets.includes(props.nftId)) {

            let otxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
                activeAccount.address, 
                activeAccount.address, 
                undefined, 
                undefined,
                0,  
                undefined, 
                Number(props.nftId), 
                params
              );
    
              txns.push(otxn)

            }

            const appArgs = []
            appArgs.push(
                new Uint8Array(Buffer.from("unequipItem")),
                new Uint8Array(Buffer.from(props.cat))

            )

            const accounts = []
            const foreignApps = []
                
            const foreignAssets = [props.nftId, props.shep]

            let shepBytes = longToByteArray(props.shep)

            let shepStats = new Uint8Array([...shepBytes, ...new Uint8Array(Buffer.from("stats"))])
            let shepItems = new Uint8Array([...shepBytes, ...new Uint8Array(Buffer.from("items"))])

            let itemBytes = longToByteArray(props.nftId)


            let boxes = [{appIndex: 0, name: shepStats}, {appIndex: 0, name: shepItems}, {appIndex: 0, name: new Uint8Array([...itemBytes, ...new Uint8Array(Buffer.from(props.cat))])}]

            let txn = algosdk.makeApplicationNoOpTxn(activeAccount.address, params, 2254344958, appArgs, accounts, foreignApps, foreignAssets, undefined, undefined, undefined, boxes);

            txns.push(txn)

        }

        else {

            if (props.equipped != 0) {

                if (!props.assets.includes(props.equipped)) {

                    let otxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
                        activeAccount.address, 
                        activeAccount.address, 
                        undefined, 
                        undefined,
                        0,  
                        undefined, 
                        Number(props.equipped), 
                        params
                      );
            
                      txns.push(otxn)
        
                    }

                const appArgs = []
                appArgs.push(
                    new Uint8Array(Buffer.from("unequipItem")),
                    new Uint8Array(Buffer.from(props.cat))

                )

                const accounts = []
                const foreignApps = []
                    
                const foreignAssets = [props.equipped, props.shep]

                let shepBytes = longToByteArray(props.shep)

                let shepStats = new Uint8Array([...shepBytes, ...new Uint8Array(Buffer.from("stats"))])
                let shepItems = new Uint8Array([...shepBytes, ...new Uint8Array(Buffer.from("items"))])

                let itemBytes = longToByteArray(props.equipped)


                let boxes = [{appIndex: 0, name: shepStats}, {appIndex: 0, name: shepItems}, {appIndex: 0, name: new Uint8Array([...itemBytes, ...new Uint8Array(Buffer.from(props.cat))])}]

                let txn = algosdk.makeApplicationNoOpTxn(activeAccount.address, params, 2254344958, appArgs, accounts, foreignApps, foreignAssets, undefined, undefined, undefined, boxes);

                txns.push(txn)

            }

        let stxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
            activeAccount.address, 
            "NA4ARVXN5LZIDIBVF4KHWMOLEKN6FENRCMAHZMFXXXVUDO5TL4OOQEM24I", 
            undefined, 
            undefined,
            1,  
            undefined, 
            Number(props.nftId), 
            params
          );

          txns.push(stxn)

        const appArgs = []
        appArgs.push(
            new Uint8Array(Buffer.from("equipItem")),
            new Uint8Array(Buffer.from(props.cat))

        )

        const accounts = []
        const foreignApps = []
            
        const foreignAssets = [props.nftId, props.shep]

        let shepBytes = longToByteArray(props.shep)

        let shepStats = new Uint8Array([...shepBytes, ...new Uint8Array(Buffer.from("stats"))])
        let shepItems = new Uint8Array([...shepBytes, ...new Uint8Array(Buffer.from("items"))])

        let itemBytes = longToByteArray(props.nftId)


        let boxes = [{appIndex: 0, name: shepStats}, {appIndex: 0, name: shepItems}, {appIndex: 0, name: new Uint8Array([...itemBytes, ...new Uint8Array(Buffer.from(props.cat))])}]

        let txn = algosdk.makeApplicationNoOpTxn(activeAccount.address, params, 2254344958, appArgs, accounts, foreignApps, foreignAssets, undefined, undefined, undefined, boxes);

        txns.push(txn)

        }

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

        await props.fetchItems()

        setNft(null)

        await props.fetchData()

        props.setCat("")

    }



    if (props.nftId == 0) {
        if (props.cat == "weapon") {
            return (
                <img style={{width: "40%", display: "flex", margin: "auto"}} src={"./icons/Weapon.svg"} />
            )
        }
        if (props.cat == "armour") {
            return (
                <img style={{width: "40%", display: "flex", margin: "auto"}} src={"./icons/Armour.svg"} />
            )
        }
        if (props.cat == "boots") {
            return (
                <img style={{width: "40%", display: "flex", margin: "auto"}} src={"./icons/Boots.svg"} />
            )
        }
        if (props.cat == "extra") {
            return (
                <img style={{width: "40%", display: "flex", margin: "auto"}} src={"./icons/Extra.svg"} />
            )
        }
        
    }

    if (nft) {

        if (props.type == "img") {
            return (
                <img style={{width: "50%", borderRadius: 10}} src={nftUrl} /> 
            )
        }

        if (props.type == "display") {
            return (
                <img onMouseOver={() => props.setAdjust(survival, power, speed, XP, true)} onMouseLeave={() => props.setAdjust(100, 100, 100, 100, false)} style={{width: "100%", borderRadius: 10}} src={nftUrl} /> 
            )
        }

        if (props.type == "rewardPool") {
            return (
                <Grid item xs={4} sm={3} md={2} lg={1} >
                    <img style={{display: "flex", margin: "auto", width: "100%"}} src={nftUrl} />
                    <Typography color="primary" align="center" variant="caption"> {nft.name} ({props.assetAmount}) </Typography>
                         

                </Grid>
            )
        }

        return (
            <Button onMouseOver={() => props.setAdjust(survival, power, speed, XP, true)} onMouseLeave={() => props.setAdjust(100, 100, 100, 100, false)} style={{display: "grid", margin: "auto", borderRadius: 15}} onClick={() => equipItem()}>
                <img style={{width: "40%", display: "flex", margin: "auto", borderRadius: 10}} src={nftUrl} /> 
                <Typography color="primary" align="center" variant="caption"> {nft.name} </Typography>     
            </Button>
        )
    }

    else {
        return (
            <div>

            </div>
        )
    }
        
    
}