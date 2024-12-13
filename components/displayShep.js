import React from "react"

import algosdk, { seedFromMnemonic } from "algosdk"

import { Typography, Button, TextField, Grid, LinearProgress, linearProgressClasses, styled  } from "@mui/material"

import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import DisplayItem from "./displayItem";


const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
    },
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 5,
      backgroundColor: theme.palette.mode === 'light' ? '#1a90ff' : '#308fe8',
    },
  }));

  const byteArrayToLong = (byteArray) => {
    var value = 0;
    for ( var i = 0; i < byteArray.length; i++) {
        value = (value * 256) + byteArray[i];
    }

    return value;
};

export default class DisplayShep extends React.Component { 

    constructor(props) {
        super(props);
        this.state = {
            display: false,
            nft: null,
            nftUrl: null,
            message: "",
            contract: 2254344958,
            place: "",
            round: 0,
            time: 0,
            xp: 0,

            survival: 0,
            power: 0,
            XP: 0,
            speed: 0,

            weapon: 0,
            armour: 0,
            boots: 0,
            extra: 0,

            reward: 0,
            result: null,

            viewRewards: false,

            commons: [],
            uncommons: [],
            rares: [],
            legendarys: [],

            adjustments: {survival: 100, power: 100, speed: 100, XP: 100, hover: false},

            cat: ""


            
        };
        this.removeElement = this.removeElement.bind(this)
        this.fetchData = this.fetchData.bind(this)

    }

    async componentDidMount() {

        
        try {

        if (this.props.nftId) {
            let response = await fetch('/api/getNft', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nftId: this.props.nftId
                  }),
                
                    
                });
            
            let session = await response.json()
    
            this.setState({
                nft: session.assets[0].params,
                nftUrl: "https://ipfs.algonode.xyz/ipfs/" + session.assets[0].params.url.slice(7),
            })
        
            const indexerClient = new algosdk.Indexer('', 'https://mainnet-idx.algonode.cloud', 443)

            const client = new algosdk.Algodv2('', 'https://mainnet-api.algonode.cloud', 443)

            let status = await client.status().do();

            this.setState({
                round: status["last-round"]
            })

            let assetBox = algosdk.encodeUint64(this.props.nftId)

            try {
                let accountBoxPlace = await client.getApplicationBoxByName(this.state.contract, new Uint8Array([...assetBox, ...new Uint8Array(Buffer.from("place"))])).do();
        
                let string = new TextDecoder().decode(accountBoxPlace.value);
        
        
                this.setState({
                    place: string
                })

                let accountBoxTime = await client.getApplicationBoxByName(this.state.contract, new Uint8Array([...assetBox, ...new Uint8Array(Buffer.from("time"))])).do();
                var length = accountBoxTime.value.length;
        
                let buffer = Buffer.from(accountBoxTime.value);
                var result = buffer.readUIntBE(0, length);
        
        
                this.setState({
                    time: result
                })
                }
                catch {

                }
                try {
                    let accountBoxXp = await client.getApplicationBoxByName(this.state.contract, new Uint8Array([...assetBox, ...new Uint8Array(Buffer.from("xp"))])).do();
                    var length = accountBoxXp.value.length;
            
                    let xpbuffer = Buffer.from(accountBoxXp.value);
                    let xpresult = xpbuffer.readUIntBE(0, length);
    
            
            
                    this.setState({
                        xp: xpresult
                    })
    
                }
                catch (error) {

                }

               
                try {
                    let accountStats = await client.getApplicationBoxByName(this.state.contract, new Uint8Array([...assetBox, ...new Uint8Array(Buffer.from("stats"))])).do();
            
                    let survival = byteArrayToLong(accountStats.value.slice(0,8))
                    let power = byteArrayToLong(accountStats.value.slice(8,16))
                    let XP = byteArrayToLong(accountStats.value.slice(16,24))
                    let speed = byteArrayToLong(accountStats.value.slice(24,32))
            
                  
    
                    let accountItems = await client.getApplicationBoxByName(this.state.contract, new Uint8Array([...assetBox, ...new Uint8Array(Buffer.from("items"))])).do();
                   
                    let weapon = byteArrayToLong(accountItems.value.slice(0,8))
                    let armour = byteArrayToLong(accountItems.value.slice(8,16))
                    let boots = byteArrayToLong(accountItems.value.slice(16,24))
                    let extra = byteArrayToLong(accountItems.value.slice(24,32))

                    let commonsBox = await client.getApplicationBoxByName(this.state.contract, new Uint8Array(Buffer.from("commons"))).do();
                    let uncommonsBox = await client.getApplicationBoxByName(this.state.contract, new Uint8Array(Buffer.from("uncommons"))).do();
                    let raresBox = await client.getApplicationBoxByName(this.state.contract, new Uint8Array(Buffer.from("rares"))).do();
                    let legendarysBox = await client.getApplicationBoxByName(this.state.contract, new Uint8Array(Buffer.from("legendarys"))).do();



                    let commons = []
                    let uncommons = []
                    let rares = []
                    let legendarys = []

                    for (let i = 0; i <= commonsBox.value.length; i = i+16) {
                        let assetId = byteArrayToLong(commonsBox.value.slice(i,i+8))
                        let assetAmount = byteArrayToLong(commonsBox.value.slice(i+8,i+16))
                        commons.push({assetId: assetId, assetAmount: assetAmount})
                    }

                    for (let i = 0; i <= uncommonsBox.value.length; i = i+16) {
                        let assetId = byteArrayToLong(uncommonsBox.value.slice(i,i+8))
                        let assetAmount = byteArrayToLong(uncommonsBox.value.slice(i+8,i+16))
                        uncommons.push({assetId: assetId, assetAmount: assetAmount})
                    }
                    
                    for (let i = 0; i <= raresBox.value.length; i = i+16) {
                        let assetId = byteArrayToLong(raresBox.value.slice(i,i+8))
                        let assetAmount = byteArrayToLong(raresBox.value.slice(i+8,i+16))
                        rares.push({assetId: assetId, assetAmount: assetAmount})
                    }

                    for (let i = 0; i <= legendarysBox.value.length; i = i+16) {
                        let assetId = byteArrayToLong(legendarysBox.value.slice(i,i+8))
                        let assetAmount = byteArrayToLong(legendarysBox.value.slice(i+8,i+16))
                        legendarys.push({assetId: assetId, assetAmount: assetAmount})
                    }

                    this.setState({
                        survival: survival - 400,
                        power: power - 400,
                        XP: XP - 400,
                        speed: speed - 400,

                        weapon: weapon,
                        armour: armour,
                        boots: boots,
                        extra: extra,

                        commons: commons,
                        uncommons: uncommons,
                        rares: rares,
                        legendarys: legendarys
                    })
                   
                    }
                    catch(error) {
                        console.log(error)
                    }
    
                
                    try {
                        let accountResult = await client.getApplicationBoxByName(this.state.contract, new Uint8Array([...assetBox, ...new Uint8Array(Buffer.from("result"))])).do();
        
                
                        let survivalRoll = byteArrayToLong(accountResult.value.slice(0,8))
                        let powerRoll = byteArrayToLong(accountResult.value.slice(8,16))
                        let surThresh = byteArrayToLong(accountResult.value.slice(16,24))
                        let powerThresh = byteArrayToLong(accountResult.value.slice(24,32))

                        this.setState({
                            result: {
                                survivalRoll: survivalRoll,
                                powerRoll: powerRoll,
                                surThresh: surThresh,
                                powerThresh: powerThresh
                            }
                        })
                    
                        
        
                   
                        }
                        catch(error) {
                            //console.log(error)
                        }

                        try {
                            let accountReward = await client.getApplicationBoxByName(this.state.contract, new Uint8Array([...assetBox, ...new Uint8Array(Buffer.from("reward"))])).do();
                                
                            let reward = byteArrayToLong(accountReward.value)
                            
    
                            this.setState({
                                reward: reward
                            })
                        
                            
            
                       
                            }
                            catch(error) {
                                //console.log(error)
                            }

                            this.setState({display: true})
    
           
    
        }
        }
        catch (error) {
            this.props.sendDiscordMessage(error, "Shep Fetch")
            this.setState({display: true})
          }

          
      }

      async fetchData() {

        try {

            if (this.props.nftId) {
                let response = await fetch('/api/getNft', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        nftId: this.props.nftId
                      }),
                    
                        
                    });
                
                let session = await response.json()
        
                this.setState({
                    nft: session.assets[0].params,
                    nftUrl: "https://ipfs.algonode.xyz/ipfs/" + session.assets[0].params.url.slice(7),
                })
            
                const indexerClient = new algosdk.Indexer('', 'https://mainnet-idx.algonode.cloud', 443)
    
                const client = new algosdk.Algodv2('', 'https://mainnet-api.algonode.cloud', 443)
    
                let status = await client.status().do();
    
                this.setState({
                    round: status["last-round"]
                })
    
                let assetBox = algosdk.encodeUint64(this.props.nftId)
    
    
                try {
                    let accountBoxPlace = await client.getApplicationBoxByName(this.state.contract, new Uint8Array([...assetBox, ...new Uint8Array(Buffer.from("place"))])).do();
            
                    let string = new TextDecoder().decode(accountBoxPlace.value);
            
            
                    this.setState({
                        place: string
                    })
    
                    let accountBoxTime = await client.getApplicationBoxByName(this.state.contract, new Uint8Array([...assetBox, ...new Uint8Array(Buffer.from("time"))])).do();
                    var length = accountBoxTime.value.length;
            
                    let buffer = Buffer.from(accountBoxTime.value);
                    var result = buffer.readUIntBE(0, length);
            
            
                    this.setState({
                        time: result
                    })
                    }
                    catch {
    
                    }
    
                    let accountBoxXp = await client.getApplicationBoxByName(this.state.contract, new Uint8Array([...assetBox, ...new Uint8Array(Buffer.from("xp"))])).do();
                    var length = accountBoxXp.value.length;
            
                    let xpbuffer = Buffer.from(accountBoxXp.value);
                    let xpresult = xpbuffer.readUIntBE(0, length);
    
            
            
                    this.setState({
                        xp: xpresult
                    })
    
                    try {
                        let accountStats = await client.getApplicationBoxByName(this.state.contract, new Uint8Array([...assetBox, ...new Uint8Array(Buffer.from("stats"))])).do();
                
                        let survival = byteArrayToLong(accountStats.value.slice(0,8))
                        let power = byteArrayToLong(accountStats.value.slice(8,16))
                        let XP = byteArrayToLong(accountStats.value.slice(16,24))

                        let speed = byteArrayToLong(accountStats.value.slice(24,32))
                
                      
        
                        let accountItems = await client.getApplicationBoxByName(this.state.contract, new Uint8Array([...assetBox, ...new Uint8Array(Buffer.from("items"))])).do();
                       
                        let weapon = byteArrayToLong(accountItems.value.slice(0,8))
                        let armour = byteArrayToLong(accountItems.value.slice(8,16))
                        let boots = byteArrayToLong(accountItems.value.slice(16,24))
                        let extra = byteArrayToLong(accountItems.value.slice(24,32))
    
                        let commonsBox = await client.getApplicationBoxByName(this.state.contract, new Uint8Array(Buffer.from("commons"))).do();
                        let uncommonsBox = await client.getApplicationBoxByName(this.state.contract, new Uint8Array(Buffer.from("uncommons"))).do();
    
    
                        let commons = []
                        let uncommons = []
                        let rares = []
                        let legendarys = []
    
                        for (let i = 0; i <= commonsBox.value.length; i = i+16) {
                            let assetId = byteArrayToLong(commonsBox.value.slice(i,i+8))
                            let assetAmount = byteArrayToLong(commonsBox.value.slice(i+8,i+16))
                            commons.push({assetId: assetId, assetAmount: assetAmount})
                        }
    
                        for (let i = 0; i <= uncommonsBox.value.length; i = i+16) {
                            let assetId = byteArrayToLong(uncommonsBox.value.slice(i,i+8))
                            let assetAmount = byteArrayToLong(uncommonsBox.value.slice(i+8,i+16))
                            uncommons.push({assetId: assetId, assetAmount: assetAmount})
                        }
    
                        this.setState({
                            survival: survival - 400,
                            power: power - 400,
                            XP: XP - 400,
                            speed: speed - 400,
    
                            weapon: weapon,
                            armour: armour,
                            boots: boots,
                            extra: extra,
    
                            commons: commons,
                            uncommons: uncommons
                        })
                       
                        }
                        catch(error) {
                            //console.log(error)
                        }
        
                    
                        try {
                            let accountResult = await client.getApplicationBoxByName(this.state.contract, new Uint8Array([...assetBox, ...new Uint8Array(Buffer.from("result"))])).do();
            
                    
                            let survivalRoll = byteArrayToLong(accountResult.value.slice(0,8))
                            let powerRoll = byteArrayToLong(accountResult.value.slice(8,16))
                            let surThresh = byteArrayToLong(accountResult.value.slice(16,24))
                            let powerThresh = byteArrayToLong(accountResult.value.slice(24,32))
    
                            this.setState({
                                result: {
                                    survivalRoll: survivalRoll,
                                    powerRoll: powerRoll,
                                    surThresh: surThresh,
                                    powerThresh: powerThresh
                                }
                            })
                        
                            
            
                       
                            }
                            catch(error) {
                                //console.log(error)
                            }
    
                            try {
                                let accountReward = await client.getApplicationBoxByName(this.state.contract, new Uint8Array([...assetBox, ...new Uint8Array(Buffer.from("reward"))])).do();
                                        
                                let reward = byteArrayToLong(accountReward.value)
                                
        
                                this.setState({
                                    reward: reward
                                })
                            
                                
                
                           
                                }
                                catch(error) {
                                    //console.log(error)
                                }
    
                                this.setState({display: true})
        
               
        
            }
            }
            catch (error) {
                this.props.sendDiscordMessage(error, "Shep Fetch")
              }
      }

      


      removeElement() {

        let newAssets = []
        this.props.cashAssets.forEach((asset) => {
            if (asset.assetId != this.props.nftId) {
                newAssets.push(asset)
            }
        })

        this.props.setCashAssets(newAssets)

      }

      async fetchData () {
        const client = new algosdk.Algodv2('', 'https://mainnet-api.algonode.cloud', 443)

            let status = await client.status().do();

            this.setState({
                round: status["last-round"]
            })

            let assetBox = algosdk.encodeUint64(this.props.nftId)

            

            try {
                let accountBoxPlace = await client.getApplicationBoxByName(this.state.contract, new Uint8Array([...assetBox, ...new Uint8Array(Buffer.from("place"))])).do();
        
                let string = new TextDecoder().decode(accountBoxPlace.value);
        
        
                this.setState({
                    place: string
                })

                let accountBoxTime = await client.getApplicationBoxByName(this.state.contract, new Uint8Array([...assetBox, ...new Uint8Array(Buffer.from("time"))])).do();
                var length = accountBoxTime.value.length;
        
                let buffer = Buffer.from(accountBoxTime.value);
                var result = buffer.readUIntBE(0, length);
        
        
                this.setState({
                    time: result
                })
                }
                catch {

                }

                let accountBoxXp = await client.getApplicationBoxByName(this.state.contract, new Uint8Array([...assetBox, ...new Uint8Array(Buffer.from("xp"))])).do();
                var length = accountBoxXp.value.length;
        
                let xpbuffer = Buffer.from(accountBoxXp.value);
                let xpresult = xpbuffer.readUIntBE(0, length);

        
        
                this.setState({
                    xp: xpresult
                })

                try {
                    let accountStats = await client.getApplicationBoxByName(this.state.contract, new Uint8Array([...assetBox, ...new Uint8Array(Buffer.from("stats"))])).do();
            
                    let survival = byteArrayToLong(accountStats.value.slice(0,8))
                    let power = byteArrayToLong(accountStats.value.slice(8,16))
                    let XP = byteArrayToLong(accountStats.value.slice(16,24))
                    let speed = byteArrayToLong(accountStats.value.slice(24,32))
            
                  
    
                    let accountItems = await client.getApplicationBoxByName(this.state.contract, new Uint8Array([...assetBox, ...new Uint8Array(Buffer.from("items"))])).do();

                   
                    let weapon = byteArrayToLong(accountItems.value.slice(0,8))
                    let armour = byteArrayToLong(accountItems.value.slice(8,16))
                    let boots = byteArrayToLong(accountItems.value.slice(16,24))
                    let extra = byteArrayToLong(accountItems.value.slice(24,32))

                    this.setState({
                        survival: survival - 400,
                        power: power - 400,
                        XP: XP - 400,
                        speed: speed - 400,

                        weapon: weapon,
                        armour: armour,
                        boots: boots,
                        extra: extra,
                    })
                   
                    }
                    catch {
    
                    }

                    
      }
      


    render() {

        function secondsToDhms(seconds) {
            seconds = Number(seconds)
            var d = Math.floor(seconds / (3600 * 24))
            var h = Math.floor((seconds % (3600 * 24)) / 3600)
            var m = Math.floor((seconds % 3600) / 60)
            var s = Math.floor(seconds % 60)
        var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : ""
            var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : ""
            var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : ""
            var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : ""
            return dDisplay + hDisplay + mDisplay + sDisplay
          }


        let level = 1
        let nextLvl = 100
        let prevLvl = 0

        while (this.state.xp > nextLvl) {
            prevLvl = nextLvl
            nextLvl = nextLvl + (200 * level) + 100
            level++
        }
        
        let sel = false
        if (this.props.place == "train") {
            

            this.props.cashAssets.forEach((asset) => {
                if(asset.assetId == this.props.nftId) {
                    sel = asset
                }
            })
        }
        

        let survival = 0
        let power = 0
        let xp = 0
        let speed = 0

        
        survival = survival + Math.floor(((level - 1) / 5) + 1)
        power = power + Math.floor(((level - 2) / 5) + 1)
        xp = xp + Math.floor(((level - 3) / 5) + 1)
        speed = speed + Math.floor(((level - 4) / 5) + 1)


        survival = survival + Math.floor(level / 5)
        survival = survival + Math.floor(level / 10)
        power = power + Math.floor(level / 5)
        power = power + Math.floor(level / 10)
        xp = xp + Math.floor(level / 5)
        xp = xp + Math.floor(level / 10)
        speed = speed + Math.floor(level / 5)
        speed = speed + Math.floor(level / 10)

        console.log(this.state.result)
        

        if (this.state.nft && this.state.display) {

            if (this.props.display == "collection") {
                return (
                    <div style={{position: "relative"}}>
                    
                    <div style={{display: "grid", borderRadius: 15}} >
                        <img style={{width: "100%", borderRadius: 50, padding: 20, paddingBottom: 10}} src={this.state.nftUrl} /> 
                        <Typography color="primary" align="center" variant="caption"> {this.state.nft.name} </Typography>     
                    </div>
        
                    </div>
        
                )
            }

            else if (this.props.place == "train") {
                return (
                    <div style={{position: "relative", backgroundColor: this.props.mode == "light" ? "#94D2BD" : "#005F73", borderRadius: 25, height: "100%"}}>
                    
                        <div style={{display: "grid", borderRadius: 15}}  >
                            <img style={{width: "100%", borderRadius: 25, padding: 10, paddingBottom: 10}} src={this.state.nftUrl} /> 
                            <Typography align="center" variant="h6" style={{fontFamily: "LondrinaSolid", padding: 5, color: this.props.mode == "light" ? "#000000" : "#FFFFFF"}}> {this.state.nft.name} </Typography>     
                        </div>
                    
                    <div>

                    <BorderLinearProgress variant="determinate" style={{marginRight: 10, marginLeft: 10}} value={((this.state.xp - prevLvl) / (nextLvl - prevLvl)) * 100} />
                    <Typography align="center" variant="caption" style={{fontFamily: "LondrinaSolid", display: "grid", color: this.props.mode == "light" ? "#000000" : "#FFFFFF"}}> {this.state.xp} / {nextLvl} </Typography>

                    <Typography align="center" variant="h6" style={{fontFamily: "LondrinaSolid", display: "grid", margin: 10, color: this.props.mode == "light" ? "#000000" : "#FFFFFF"}}> Level {level} </Typography>
              
                    


                    {this.state.place == "train" ? 
                    <div>
                        <Typography align="center" variant="caption" style={{fontFamily: "LondrinaSolid", display: "grid", color: this.props.mode == "light" ? "#000000" : "#FFFFFF"}}> Training </Typography>
                        <Typography align="center" variant="h6" style={{fontFamily: "LondrinaSolid", display: "grid", color: this.props.mode == "light" ? "#000000" : "#FFFFFF"}}> {Math.floor((this.state.round - this.state.time) / 1000)} xp earned</Typography>

                    </div>
                    :
                    null
                    }
                    

                       

                        <Grid container align="center" spacing={0} style={{padding: 20}} >
                            
                            <Grid item xs={12} sm={12} md={6}>
                                {this.state.place == "train" && this.props.round && this.state.time && (this.state.round - this.state.time) / 1000 >= 1 ?
                                <Button variant="contained" color="secondary" 
                                style={{backgroundColor: this.props.mode == "light" ? "#EE9B00" : "#9B2226", border: sel && sel.option == "claim" ? "3px solid white" : null, borderRadius: 25, marginBottom: 10}}
                                onClick={() => sel ? 
                                    this.removeElement()
                                    :
                                    this.props.setCashAssets([...this.props.cashAssets, {assetId: this.props.nftId, reward: Math.floor(((this.props.round - this.state.time) / 159000)) * this.props.reward, option: "claim"}])}
                                >
                                <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid"}}> Claim </Typography>     

                                </Button>
                                :
                                <Button variant="contained" disabled color="secondary" 
                                style={{borderRadius: 25, marginBottom: 10}}
                                >
                                <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid"}}> Claim </Typography>     

                                </Button> 
                                }
                            </Grid>
                            <Grid item xs={12} sm={12} md={6}>
                                {this.props.round && this.state.time ?
                                <Button variant="contained" color="secondary" 
                                style={{backgroundColor: this.props.mode == "light" ? "#EE9B00" : "#9B2226", border: sel && sel.option == "unstake" ? "3px solid white" : null, borderRadius: 25}}
                                onClick={() => sel ?
                                    this.removeElement()
                                    :
                                    this.props.setCashAssets([...this.props.cashAssets, {assetId: this.props.nftId, reward: 0, option: "unstake"}])}
                                >
                                <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid"}}> Unstake </Typography>     


                                </Button>
                                :
                                <Button variant="contained" color="secondary" 
                                style={{backgroundColor: this.props.mode == "light" ? "#EE9B00" : "#9B2226", borderRadius: 25, border: sel && sel.option == "stake" ? "3px solid white" : null}}
                                onClick={() => sel ?
                                    this.removeElement()
                                    :
                                    this.props.setCashAssets([...this.props.cashAssets, {assetId: this.props.nftId, reward: 0, option: "stake"}])}
                                >
                                <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid"}}> Stake </Typography>     


                                </Button>
                                }   
                            </Grid>
                           
                        </Grid>

                        
                        

                        
                    </div>
                   

                    
                    </div>
        
                )
            }

            else {
                
                
                return (
                    <div style={{position: "relative", backgroundColor: this.props.mode == "light" ? "#94D2BD" : "#005F73", borderRadius: 25, height: "100%"}}>
                    
                    {this.props.selShep ?
                    <Button style={{margin: 20}} onClick={() => this.props.setSelShep(null)}>
                        <ArrowBackIcon />
                    </Button>
                    :
                    null
                    }
                    
                    <div>

                    <Grid container alignItems="center" justifyContent="center">
                        <Grid item xs={this.props.selShep ? 5 : 12} style={{position: "relative"}}>
                            <img style={{width: this.props.selShep ? "50%" : "100%", borderRadius: 25, padding: 10, paddingBottom: 10}} src={this.state.nftUrl} /> 

                            {this.state.place == "train" ?
                            <img style={{position: "absolute", width: 50, top: 20, right: 20}} src={"Train.svg"} /> 
                            :
                            null
                            }

                            {this.state.place == "ocean" ?
                            <img style={{position: "absolute", width: 50, top: 20, right: 20}} src={"Quest.svg"} /> 
                            :
                            null
                            }
                            

                                
                            <Typography align="center" variant="h6" style={{fontFamily: "LondrinaSolid", padding: 5, color: this.props.mode == "light" ? "#000000" : "#FFFFFF"}}> {this.state.nft.name} </Typography>     
                        </Grid>
                        <Grid item xs={5} >
                            <Typography color="secondary" align="right" variant="subtitle1" style={{fontFamily: "LondrinaSolid", paddingLeft: 10, color: this.props.mode == "light" ? "#000000" : "#FFFFFF"}}> Survival: {survival + this.state.survival} {this.state.adjustments.hover ? <Typography style={{fontFamily: "LondrinaSolid", display: "inline", color: this.state.adjustments.survival - 100 < 0 ? "#FA4E4E" : this.state.adjustments.survival - 100 > 0 ? "#208108" : "#FFFFFF"}}> ({this.state.adjustments.survival - 100}) </Typography> : null} </Typography>     
                            <Typography color="secondary" align="right" variant="subtitle1" style={{fontFamily: "LondrinaSolid", paddingLeft: 10, color: this.props.mode == "light" ? "#000000" : "#FFFFFF"}}> Power: {power + this.state.power} {this.state.adjustments.hover ? <Typography style={{fontFamily: "LondrinaSolid", display: "inline", color: this.state.adjustments.power - 100 < 0 ? "#FA4E4E" : this.state.adjustments.power - 100 > 0 ? "#208108" : "#FFFFFF"}}> ({this.state.adjustments.power - 100}) </Typography> : null}</Typography>     
                            <Typography color="secondary" align="right" variant="subtitle1" style={{fontFamily: "LondrinaSolid", paddingLeft: 10, color: this.props.mode == "light" ? "#000000" : "#FFFFFF"}}> XP: {xp + this.state.XP} {this.state.adjustments.hover ? <Typography style={{fontFamily: "LondrinaSolid", display: "inline", color: this.state.adjustments.XP - 100 < 0 ? "#FA4E4E" : this.state.adjustments.XP - 100 > 0 ? "#208108" : "#FFFFFF"}}> ({this.state.adjustments.XP - 100}) </Typography> : null} </Typography>     
                            <Typography color="secondary" align="right" variant="subtitle1" style={{fontFamily: "LondrinaSolid", paddingLeft: 10, color: this.props.mode == "light" ? "#000000" : "#FFFFFF"}}> Speed: {speed + this.state.speed} {this.state.adjustments.hover ? <Typography style={{fontFamily: "LondrinaSolid", display: "inline", color: this.state.adjustments.speed - 100 < 0 ? "#FA4E4E" : this.state.adjustments.speed - 100 > 0 ? "#208108" : "#FFFFFF"}}> ({this.state.adjustments.speed - 100}) </Typography> : null} </Typography>   
                        </Grid>
                        <Grid item xs={7} style={{display: "grid", margin: "auto"}}>
                        <BorderLinearProgress variant="determinate" style={{marginRight: 10, marginLeft: 10}} value={((this.state.xp - prevLvl) / (nextLvl - prevLvl)) * 100} />
                        <Typography align="center" variant="caption" style={{fontFamily: "LondrinaSolid", display: "grid", color: this.props.mode == "light" ? "#000000" : "#FFFFFF"}}> {this.state.xp} / {nextLvl} </Typography>

                        <Typography onMouseOver={() => this.setState({adjustments: {survival: survival + 100, power: power + 100, speed: speed + 100, XP: xp + 100, hover: true}})} onMouseLeave={() => this.setState({adjustments: {survival: 100, power: 100, speed: 100, XP: 100, hover: false}})} align="center" variant="h6" style={{fontFamily: "LondrinaSolid", display: "grid", color: this.props.mode == "light" ? "#000000" : "#FFFFFF"}}> Level {level} </Typography>
                        </Grid>
                      

                    </Grid>

                    {this.state.cat == "weapon" ?
                          <div style={{position: "relative", backgroundColor: this.props.mode == "light" ? "#94D2BD" : "#005F73", borderRadius: 25, height: "100%", width: "100%"}}>
                            <Button style={{margin: 20}} onClick={() => this.setState({cat: ""})}>
                              <ArrowBackIcon />
                            </Button>
                            
                           
                            <Grid container>
                                <Grid item xs={12} sm={12} md={12}>
                                    <DisplayItem assets={this.props.assets} setAdjust={(survival, power, speed, XP, hover) => this.setState({adjustments: {survival: survival, power: power, speed: speed, XP: XP, hover: hover}})} nftId={this.state.weapon} type={"equipped"} cat={this.state.cat} setCat={(cat) => this.setState({cat: cat})} fetchData={this.fetchData} fetchItems={this.props.fetchItems} equipped={this.state.weapon} shep={this.props.nftId} contract={this.state.contract} sendDiscordMessage={this.props.sendDiscordMessage} />
                                    <br />
                                    <br />
                                </Grid>
                                {this.props.weapons.length > 0 ? this.props.weapons.map((weapon, index) => {
                                    return (
                                        <Grid key={index} item xs={4} sm={3} md={2}>
                                            <DisplayItem assets={this.props.assets} setAdjust={(survival, power, speed, XP, hover) => this.setState({adjustments: {survival: survival, power: power, speed: speed, XP: XP, hover: hover}})} nftId={weapon} type={"unequipped"} equipped={this.state.weapon} cat={this.state.cat} setCat={(cat) => this.setState({cat: cat})} fetchData={this.fetchData} fetchItems={this.props.fetchItems} shep={this.props.nftId} contract={this.state.contract} sendDiscordMessage={this.props.sendDiscordMessage}/>
                                        </Grid>
                                    )
                                })
                                :
                                null
                                }
                                
                            </Grid>
                          </div>
                          :
                          this.state.cat == "armour" ?
                          <div style={{position: "relative", backgroundColor: this.props.mode == "light" ? "#94D2BD" : "#005F73", borderRadius: 25, height: "100%", width: "100%"}}>
                            <Button style={{margin: 20}} onClick={() => this.setState({cat: ""})}>
                              <ArrowBackIcon />
                            </Button>
                            
                           
                            <Grid container>
                                <Grid item xs={12} sm={12} md={12}>
                                    <DisplayItem assets={this.props.assets} setAdjust={(survival, power, speed, XP, hover) => this.setState({adjustments: {survival: survival, power: power, speed: speed, XP: XP, hover: hover}})} nftId={this.state.armour} type={"equipped"} cat={this.state.cat} setCat={(cat) => this.setState({cat: cat})} fetchData={this.fetchData} fetchItems={this.props.fetchItems} equipped={this.state.weapon} shep={this.props.nftId} contract={this.state.contract} sendDiscordMessage={this.props.sendDiscordMessage} />
                                    <br />
                                    <br />
                                </Grid>
                                {this.props.armours.length > 0 ? this.props.armours.map((armour, index) => {
                                    return (
                                        <Grid key={index} item xs={4} sm={3} md={2}>
                                            <DisplayItem assets={this.props.assets} setAdjust={(survival, power, speed, XP, hover) => this.setState({adjustments: {survival: survival, power: power, speed: speed, XP: XP, hover: hover}})} nftId={armour} type={"unequipped"} equipped={this.state.armour} cat={this.state.cat} setCat={(cat) => this.setState({cat: cat})} fetchData={this.fetchData} fetchItems={this.props.fetchItems} shep={this.props.nftId} contract={this.state.contract} sendDiscordMessage={this.props.sendDiscordMessage}/>
                                        </Grid>
                                    )
                                })
                                :
                                null
                                }
                                
                            </Grid>
                          </div>
                          :
                          this.state.cat == "boots" ?
                          <div style={{position: "relative", backgroundColor: this.props.mode == "light" ? "#94D2BD" : "#005F73", borderRadius: 25, height: "100%", width: "100%"}}>
                            <Button style={{margin: 20}} onClick={() => this.setState({cat: ""})}>
                              <ArrowBackIcon />
                            </Button>
                            
                           
                            <Grid container>
                                <Grid item xs={12} sm={12} md={12}>
                                    <DisplayItem assets={this.props.assets} setAdjust={(survival, power, speed, XP, hover) => this.setState({adjustments: {survival: survival, power: power, speed: speed, XP: XP, hover: hover}})} nftId={this.state.boots} type={"equipped"} cat={this.state.cat} setCat={(cat) => this.setState({cat: cat})} fetchData={this.fetchData} fetchItems={this.props.fetchItems} equipped={this.state.weapon} shep={this.props.nftId} contract={this.state.contract} sendDiscordMessage={this.props.sendDiscordMessage} />
                                    <br />
                                    <br />
                                </Grid>
                                {this.props.boots.length > 0 ? this.props.boots.map((boot, index) => {
                                    return (
                                        <Grid key={index} item xs={4} sm={3} md={2}>
                                            <DisplayItem assets={this.props.assets} setAdjust={(survival, power, speed, XP, hover) => this.setState({adjustments: {survival: survival, power: power, speed: speed, XP: XP, hover: hover}})} nftId={boot} type={"unequipped"} equipped={this.state.boots} cat={this.state.cat} setCat={(cat) => this.setState({cat: cat})} fetchData={this.fetchData} fetchItems={this.props.fetchItems} shep={this.props.nftId} contract={this.state.contract} sendDiscordMessage={this.props.sendDiscordMessage}/>
                                        </Grid>
                                    )
                                })
                                :
                                null
                                }
                                
                            </Grid>
                          </div>
                          :
                          this.state.cat == "extra" ?
                          <div style={{position: "relative", backgroundColor: this.props.mode == "light" ? "#94D2BD" : "#005F73", borderRadius: 25, height: "100%", width: "100%"}}>
                            <Button style={{margin: 20}} onClick={() => this.setState({cat: ""})}>
                              <ArrowBackIcon />
                            </Button>
                            
                           
                            <Grid container>
                                <Grid item xs={12} sm={12} md={12}>
                                    <DisplayItem assets={this.props.assets} setAdjust={(survival, power, speed, XP, hover) => this.setState({adjustments: {survival: survival, power: power, speed: speed, XP: XP, hover: hover}})} nftId={this.state.extra} type={"equipped"} cat={this.state.cat} setCat={(cat) => this.setState({cat: cat})} fetchData={this.fetchData} fetchItems={this.props.fetchItems} equipped={this.state.weapon} shep={this.props.nftId} contract={this.state.contract} sendDiscordMessage={this.props.sendDiscordMessage} />
                                    <br />
                                    <br />
                                </Grid>
                                {this.props.extras.length > 0 ? this.props.extras.map((extra, index) => {
                                    return (
                                        <Grid key={index} item xs={4} sm={3} md={2}>
                                            <DisplayItem assets={this.props.assets} setAdjust={(survival, power, speed, XP, hover) => this.setState({adjustments: {survival: survival, power: power, speed: speed, XP: XP, hover: hover}})} nftId={extra} type={"unequipped"} equipped={this.state.extra} cat={this.state.cat} setCat={(cat) => this.setState({cat: cat})} fetchData={this.fetchData} fetchItems={this.props.fetchItems} shep={this.props.nftId} contract={this.state.contract} sendDiscordMessage={this.props.sendDiscordMessage}/>
                                        </Grid>
                                    )
                                })
                                :
                                null
                                }
                                
                            </Grid>
                          </div>
                          :
                          this.props.selShep ?
                          <div style={{}}>
                          <Button style={{display: "block"}} onClick={() => this.setState({viewRewards: !this.state.viewRewards})}>
                            <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", color: this.props.mode == "light" ? "#000000" : "#FFFFFF"}}> Rewards Pool </Typography>     
                          </Button>
                          {this.state.viewRewards ? 
                          <Grid container align="center">
                            {this.state.commons.map((common) => {
                                return (
                                    <DisplayItem nftId={common.assetId} assetAmount={common.assetAmount} type={"rewardPool"} sendDiscordMessage={this.props.sendDiscordMessage}/>
                                )

                            })}
                            {this.state.uncommons.map((uncommon) => {
                                return (
                                    <DisplayItem nftId={uncommon.assetId} assetAmount={uncommon.assetAmount} type={"rewardPool"} sendDiscordMessage={this.props.sendDiscordMessage}/>
                                )

                            })}
                            {this.state.rares.map((rare) => {
                                return (
                                    <DisplayItem nftId={rare.assetId} assetAmount={rare.assetAmount} type={"rewardPool"} sendDiscordMessage={this.props.sendDiscordMessage}/>
                                )

                            })}
                            {this.state.legendarys.map((legendary) => {
                                return (
                                    <DisplayItem nftId={legendary.assetId} assetAmount={legendary.assetAmount} type={"rewardPool"} sendDiscordMessage={this.props.sendDiscordMessage}/>
                                )

                            })}
                          </Grid>
                          :
                          null}
                            <Grid container>
                                <Grid item xs={12} sm={6}>
                                    <Button style={{position: "relative"}} onClick={() => this.props.startQuest(this.props.nftId, "ocean")}>
                                        <div style={{backgroundColor:  this.props.mode == "light" ? "#EE9B00" : "#9B2226", padding: 10, position: "absolute", top: 20, right: 20, borderRadius: 15}}>
                                        <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", color: this.props.mode == "light" ? "#000000" : "#FFFFFF", borderBottom: this.props.mode == "light" ? "1px solid black" : "1px solid white"}}> Ocean </Typography>
                                        <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", color: this.props.mode == "light" ? "#000000" : "#FFFFFF"}}> {(90 + ((this.state.survival + survival) * 2)) > 100 ? "100" : String(90 + ((this.state.survival + survival) * 2))}% Survival </Typography>
                                        <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", backgroundColor: "#6EC137", color: this.props.mode == "light" ? "#000000" : "#FFFFFF", borderRadius: 15, margin: 5}}> {(75 - ((this.state.power + power) * 2)) < 0 ? "0%" : String(75 - ((this.state.power + power) * 2))}% </Typography>     
                                        <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", backgroundColor: "#6BB5D9", color: this.props.mode == "light" ? "#000000" : "#FFFFFF", borderRadius: 15, margin: 5}}> {(75 - ((this.state.power + power) * 2)) < 0 ? "100%" : String(25 + ((this.state.power + power) * 2))}% </Typography>     
                                        <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", color: this.props.mode == "light" ? "#000000" : "#FFFFFF"}}> {String(200 + ((this.state.XP + xp) * 4))} xp </Typography>
                                        <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", color: this.props.mode == "light" ? "#000000" : "#FFFFFF"}}> {String((2 - (2 * ((this.state.speed + speed) / 100))).toFixed(2))} days </Typography>


    
    
                                        </div>
                                        <img src={"quests/Ocean.jpg"} style={{width: "100%", borderRadius: 15}} />
                                    </Button>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                <Button style={{position: "relative"}} onClick={() => this.props.startQuest(this.props.nftId, "temple")}>
                                    <div style={{backgroundColor:  this.props.mode == "light" ? "#EE9B00" : "#9B2226", padding: 10, position: "absolute", top: 20, right: 20, borderRadius: 15}}>
                                    <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", color: this.props.mode == "light" ? "#000000" : "#FFFFFF", borderBottom: this.props.mode == "light" ? "1px solid black" : "1px solid white"}}> Temple </Typography>
                                    <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", color: this.props.mode == "light" ? "#000000" : "#FFFFFF"}}> {(40 + ((this.state.survival + survival) * 2)) > 100 ? "100" : String(40 + ((this.state.survival + survival) * 2))}% Survival </Typography>
                                    <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", backgroundColor: "#6EC137", color: this.props.mode == "light" ? "#000000" : "#FFFFFF", borderRadius: 15, margin: 5}}> {(50 - ((this.state.power + power) * 1.5)) < 0 ? "0%" : String(50 - ((this.state.power + power) * 1.5))}% </Typography>     
                                    <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", backgroundColor: "#6BB5D9", color: this.props.mode == "light" ? "#000000" : "#FFFFFF", borderRadius: 15, margin: 5}}> {(40 + ((this.state.power + power) * 0.5)) < 0 ? "100%" : String(40 + ((this.state.power + power) * 0.5))}% </Typography>
                                    <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", backgroundColor: "#EC5FFF", color: this.props.mode == "light" ? "#000000" : "#FFFFFF", borderRadius: 15, margin: 5}}> {(10 + ((this.state.power + power) * 0.5)) < 0 ? "100%" : String(10 + ((this.state.power + power) * 0.5))}% </Typography>     
                                    <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", backgroundColor: "#FF6A00", color: this.props.mode == "light" ? "#000000" : "#FFFFFF", borderRadius: 15, margin: 5}}> {(0 + ((this.state.power + power) * 0.5)) < 0 ? "100%" : String(0 + ((this.state.power + power) * 0.5))}% </Typography>          
                                    <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", color: this.props.mode == "light" ? "#000000" : "#FFFFFF"}}> {String(Math.floor(525 + ((this.state.XP + xp) * 10.5)))} xp </Typography>
                                    <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", color: this.props.mode == "light" ? "#000000" : "#FFFFFF"}}> {String((5 - (5 * ((this.state.speed + speed) / 100))).toFixed(2))} days </Typography>




                                    </div>
                                    <img src={"quests/Temple.png"} style={{width: "100%", borderRadius: 15}} />
                                </Button>
                            </Grid>
                        
                                
                                
                            </Grid>


                            </div>
                          :
                            <div style={{display: "grid", borderRadius: 15, margin: 20, marginRight: 30}}>

                                <Grid container justifyContent="space-between" spacing={2}>
                                <Grid item xs={3} style={{margin: 10, width: "100%", margin: "auto"}}>
                                    <Button onClick={() => this.setState({cat: "weapon"})} style={{height: "25%", width: "100%", marginBottom: 10, marginTop: 10}}>
                                    {this.state.weapon ? 
                                    <DisplayItem cat={"weapon"} setAdjust={(survival, power, speed, XP, hover) => this.setState({adjustments: {survival: survival, power: power, speed: speed, XP: XP, hover: hover}})} nftId={this.state.weapon} type={"display"} shep={this.props.nftId} contract={this.state.weaponContract} sendDiscordMessage={this.props.sendDiscordMessage}/>
                                    :
                                    <img style={{width: "70%"}} src={"./icons/Weapon.svg"} /> 
                                    }
                                    
                                    </Button>
                                    </Grid>
                                    <Grid item xs={3} style={{margin: 10, width: "100%", margin: "auto"}}>

                                    <Button onClick={() => this.setState({cat: "armour"})} style={{height: "25%", width: "100%", marginBottom: 10, marginTop: 10}}>
                                    {this.state.armour ? 
                                    <DisplayItem cat={"armour"} setAdjust={(survival, power, speed, XP, hover) => this.setState({adjustments: {survival: survival, power: power, speed: speed, XP: XP, hover: hover}})} nftId={this.state.armour} type={"display"} shep={this.props.nftId} contract={this.state.weaponContract} sendDiscordMessage={this.props.sendDiscordMessage}/>
                                    :
                                    <img style={{width: "70%"}} src={"./icons/Armour.svg"} /> 
                                    }
                                    </Button>
                                    </Grid>
                                    <Grid item xs={3} style={{margin: 10, width: "100%", margin: "auto"}}>

                                    <Button onClick={() => this.setState({cat: "boots"})} style={{height: "25%", width: "100%", marginBottom: 10, marginTop: 10}}>
                                    {this.state.boots ? 
                                    <DisplayItem cat={"boots"} setAdjust={(survival, power, speed, XP, hover) => this.setState({adjustments: {survival: survival, power: power, speed: speed, XP: XP, hover: hover}})} nftId={this.state.boots} type={"display"} shep={this.props.nftId} contract={this.state.weaponContract} sendDiscordMessage={this.props.sendDiscordMessage}/>
                                    :
                                    <img style={{width: "70%"}} src={"./icons/Boots.svg"} /> 
                                    }
                                    </Button>
                                    </Grid>
                                    <Grid item xs={3} style={{margin: 10, width: "100%", margin: "auto"}}>

                                    <Button onClick={() => this.setState({cat: "extra"})} style={{height: "25%", width: "100%", marginBottom: 10, marginTop: 10}}>
                                    {this.state.extra ? 
                                    <DisplayItem cat={"extra"} setAdjust={(survival, power, speed, XP, hover) => this.setState({adjustments: {survival: survival, power: power, speed: speed, XP: XP, hover: hover}})} nftId={this.state.extra} type={"display"} shep={this.props.nftId} contract={this.state.weaponContract} sendDiscordMessage={this.props.sendDiscordMessage}/>
                                    :
                                    <img style={{width: "70%"}} src={"./icons/Extra.svg"} /> 
                                    }
                                    </Button>
                                    </Grid>
                                </Grid>
                               
                            

                                        <Grid container align="center" spacing={0} style={{padding: 20}} >
                            
                          
                                        <Grid item xs={12} sm={12} md={12}>

                                        {!this.state.result && !this.state.reward ? 
                                        <div>
                                            <Button variant="contained"  disabled={!this.state.place}
                                            style={{backgroundColor: !this.state.place == "" ? this.props.mode == "light" ? "#EE9B00" : "#9B2226" : "", borderRadius: 25, margin: 10}}
                                            onClick={async () => await this.props.unstake(this.props.nftId).then(this.fetchData())}
                                            >
                                            <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid"}}> Unstake </Typography>     


                                            </Button>
                                            <Button variant="contained" disabled={this.state.place}
                                            style={{backgroundColor: this.state.place == "" ? this.props.mode == "light" ? "#EE9B00" : "#9B2226" : "", borderRadius: 25, margin: 10}}
                                            onClick={() => this.props.setSelShep(this.props.nftId)}
                                            >
                                            <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid"}}> Quest </Typography>     


                                            </Button>
                                        </div>
                                        :
                                        null
                                        }
                                        
                                            


                                            {!this.state.result && this.state.place == "ocean" && ((this.state.round - this.state.time) / (60000 - (60000 * ((this.state.speed + speed) / 100)))) < 1 ?
                                                <div style={{margin: 20}}>
                                                    <img src={"runshep.gif"} style={{width: 100, borderRadius: 15}}/>
                                                    <Typography color="secondary" align="right" variant="subtitle1" style={{fontFamily: "LondrinaSolid", paddingLeft: 10, color: this.props.mode == "light" ? "#000000" : "#FFFFFF"}}> Ocean </Typography>   
                                                    <BorderLinearProgress variant="determinate" style={{marginRight: 10, marginLeft: 10}} value={((this.state.round - this.state.time) / (60000 - (60000 * ((this.state.speed + speed) / 100)))) * 100} />
                                                    <Typography color="secondary" align="right" variant="subtitle1" style={{fontFamily: "LondrinaSolid", paddingLeft: 10, color: this.props.mode == "light" ? "#000000" : "#FFFFFF"}}> Time left: {secondsToDhms(((2 - (2 * ((this.state.speed + speed) / 100))) - (((this.state.round - this.state.time) / (60000 - (60000 * ((this.state.speed + speed) / 100)))) * (2 - (2 * ((this.state.speed + speed) / 100))))) * 24 * 60 * 60)} </Typography>   
                                                </div>
                                                :
                                                !this.state.result && this.state.place == "ocean" ?
                                                <Button variant="contained" disabled={this.state.place == ""}
                                                style={{backgroundColor: this.state.place == "" ? this.props.mode == "light" ? "#EE9B00" : "#9B2226" : "", borderRadius: 25, margin: 10}}
                                                onClick={() => this.props.roll(this.props.nftId)}
                                                >
                                                <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid"}}> Roll </Typography>     
                                                </Button>
                                                :
                                                null
                                            }

                                            {!this.state.result && this.state.place == "temple" && ((this.state.round - this.state.time) / (150000 - (150000 * ((this.state.speed + speed) / 100)))) < 1 ?
                                                <div style={{margin: 20}}>
                                                    <img src={"runshep.gif"} style={{width: 100, borderRadius: 15}}/>
                                                    <Typography color="secondary" align="right" variant="subtitle1" style={{fontFamily: "LondrinaSolid", paddingLeft: 10, color: this.props.mode == "light" ? "#000000" : "#FFFFFF"}}> Temple </Typography>   
                                                    <BorderLinearProgress variant="determinate" style={{marginRight: 10, marginLeft: 10}} value={((this.state.round - this.state.time) / (150000 - (150000 * ((this.state.speed + speed) / 100)))) * 100} />
                                                    <Typography color="secondary" align="right" variant="subtitle1" style={{fontFamily: "LondrinaSolid", paddingLeft: 10, color: this.props.mode == "light" ? "#000000" : "#FFFFFF"}}> Time left: {secondsToDhms(((5 - (5 * ((this.state.speed + speed) / 100))) - (((this.state.round - this.state.time) / (150000 - (150000 * ((this.state.speed + speed) / 100)))) * (5 - (5 * ((this.state.speed + speed) / 100))))) * 24 * 60 * 60)} </Typography>   
                                                </div>
                                                :
                                                !this.state.result && this.state.place == "temple" ?
                                                <Button variant="contained" disabled={this.state.place == ""}
                                                style={{backgroundColor: this.state.place == "" ? this.props.mode == "light" ? "#EE9B00" : "#9B2226" : "", borderRadius: 25, margin: 10}}
                                                onClick={() => this.props.roll(this.props.nftId)}
                                                >
                                                <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid"}}> Roll </Typography>     
                                                </Button>
                                                :
                                                null
                                            }

                                            {this.state.result ?
                                            <div>
                                                {this.state.place == "ocean" ?
                                                <div>
                                                    <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", color: this.props.mode == "light" ? "#000000" : "#FFFFFF"}}> Survive? (Roll d200) </Typography>
                                                    {(200 - this.state.result.survivalRoll) >= (200 - this.state.result.surThresh) ?
                                                    <div>
                                                        <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", color: "green"}}> {String(200 - this.state.result.survivalRoll) + " >= " + String(200 - this.state.result.surThresh)}</Typography>
                                                        <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", color: "green"}}> Survived </Typography>     

                                                        {(200 - this.state.result.survivalRoll) >= (200 - this.state.result.surThresh) ?
                                                        <div>
                                                            <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", color: this.props.mode == "light" ? "#000000" : "#FFFFFF"}}> Reward? (Roll d100)</Typography>
                                                            {(100 - this.state.result.powerRoll) >= (100 - this.state.result.powerThresh) ?
                                                            <div>
                                                                <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", color: "blue"}}> {String(100 - this.state.result.powerRoll) + " >= " + String(100 - this.state.result.powerThresh)}</Typography>
                                                                <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", color: "blue"}}> Uncommon</Typography>
                                                                    
                                                            </div>
                                                            :
                                                            <div>
                                                                <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", color: "green"}}> {String(100 - this.state.result.powerRoll) + " < " + String(100 - this.state.result.powerThresh)}</Typography>     
                                                                <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", color: "green"}}> Common</Typography>     

                                                            </div>
                                                            }
                                                        </div>
                                                        :
                                                        <div>
                                                            <img src={"death.gif"} style={{width: "100%", borderRadius: 15}}/>
                                                        </div>
                                                        }  
                                                    </div>
                                                    :
                                                    <div>
                                                        <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", color: "red"}}> {String(200 - this.state.result.survivalRoll) + " < " + String(200 - this.state.result.surThresh)}</Typography>     
                                                    </div>
                                                    }    
                                                </div>
                                                :
                                                null
                                                }
                                                {this.state.place == "temple" ?
                                                <div>
                                                    <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", color: this.props.mode == "light" ? "#000000" : "#FFFFFF"}}> Survive? (Roll d200) </Typography>
                                                    {(200 - this.state.result.survivalRoll) >= (200 - this.state.result.surThresh) ?
                                                    <div>
                                                        <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", color: "green"}}> {String(200 - this.state.result.survivalRoll) + " >= " + String(200 - this.state.result.surThresh)}</Typography>
                                                        <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", color: "green"}}> Survived </Typography>     

                                                        {(200 - this.state.result.survivalRoll) >= (200 - this.state.result.surThresh) ?
                                                        <div>
                                                            <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", color: this.props.mode == "light" ? "#000000" : "#FFFFFF"}}> Reward? (Roll d1000)</Typography>
                                                            <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", color: "#FF6A00"}}> {"1000 - " + String(2000 - this.state.result.powerThresh + 1)}</Typography>
                                                            <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", color: "#EC5FFF"}}> {String(2000 - this.state.result.powerThresh) + " - " + String(1900 - this.state.result.powerThresh - (this.state.result.powerThresh - 1000) + 1)}</Typography>
                                                            <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", color: "blue"}}> {String(1900 - this.state.result.powerThresh - (this.state.result.powerThresh - 1000)) + " - " + String(1500 - this.state.result.powerThresh - (2 * this.state.result.powerThresh - 2000) + 1)}</Typography>
                                                            <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", color: "green"}}> {String(1500 - this.state.result.powerThresh - (2 * this.state.result.powerThresh - 2000)) + " - 1"}</Typography>

                                                            {(1000 - this.state.result.powerRoll) >= (2000 - this.state.result.powerThresh + 1)  ?
                                                            <div>
                                                                <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", color: "#FF6A00"}}> {String(1000 - this.state.result.powerRoll)}</Typography>
                                                                <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", color: "#FF6A00"}}> Legendary</Typography>
                                                                    
                                                            </div>
                                                            :
                                                            null
                                                            }

                                                            {(1000 - this.state.result.powerRoll) <= (2000 - this.state.result.powerThresh) && (1000 - this.state.result.powerRoll) >= (1900 - this.state.result.powerThresh - (this.state.result.powerThresh - 1000) + 1) ?
                                                            <div>
                                                                <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", color: "#EC5FFF"}}> {String(1000 - this.state.result.powerRoll)}</Typography>
                                                                <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", color: "#EC5FFF"}}> Rare</Typography>
                                                                    
                                                            </div>
                                                            :
                                                            null
                                                            }

                                                            {(1000 - this.state.result.powerRoll) <= (1900 - this.state.result.powerThresh - (this.state.result.powerThresh - 1000)) && (1000 - this.state.result.powerRoll) >= (1500 - this.state.result.powerThresh - (2 * this.state.result.powerThresh - 2000) + 1) ?
                                                            <div>
                                                                <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", color: "blue"}}> {String(1000 - this.state.result.powerRoll)}</Typography>
                                                                <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", color: "blue"}}> Uncommon</Typography>
                                                                    
                                                            </div>
                                                            :
                                                            null
                                                            }

                                                            {(1000 - this.state.result.powerRoll) <= (1500 - this.state.result.powerThresh - (2 * this.state.result.powerThresh - 2000)) && (1000 - this.state.result.powerRoll) >= 1 ?
                                                            <div>
                                                                <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", color: "green"}}> {String(1000 - this.state.result.powerRoll)}</Typography>
                                                                <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", color: "green"}}> Common</Typography>
                                                                    
                                                            </div>
                                                            :
                                                            null
                                                            }

                                                        </div>
                                                        :
                                                        <div>
                                                            <img src={"death.gif"} style={{width: "100%", borderRadius: 15}}/>
                                                        </div>
                                                        }  
                                                    </div>
                                                    :
                                                    <div>
                                                        <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid", color: "red"}}> {String(200 - this.state.result.survivalRoll) + " < " + String(200 - this.state.result.surThresh)}</Typography>     
                                                    </div>
                                                    }    
                                                </div>
                                                :
                                                null
                                                }
                                            </div>
                                            :
                                            null
                                            }

                                            
                                            {this.state.result && !this.state.reward && this.state.place == "ocean" ?
                                            <div>
                                                {(200 - this.state.result.survivalRoll) >= (200 - this.state.result.surThresh) ?
                                                <Grid container>
                                                    <Grid item xs={6}>
                                                        {(100 - this.state.result.powerRoll) >= (100 - this.state.result.powerThresh) ?
                                                        <div>
                                                            <img src={"T2 Treasure.gif"} style={{width: "100%", borderRadius: 15}}/>
                                                        </div>
                                                        :
                                                        <div>
                                                            <img src={"T1 Treasure.gif"} style={{width: "100%", borderRadius: 15}}/>
                                                        </div>
                                                        }
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Button variant="contained" disabled={this.state.place == ""}
                                                        style={{backgroundColor: this.state.place == "" ? this.props.mode == "light" ? "#EE9B00" : "#9B2226" : "", borderRadius: 25, margin: 10}}
                                                        onClick={() => this.props.reward(this.props.nftId)}
                                                        >
                                                        <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid"}}> Open </Typography>     
                                                        </Button>
                                                    </Grid>
                                                </Grid>
                                                :
                                                <Grid container>
                                                    <Grid item xs={6}>
                                                        <img src={"death.gif"} style={{width: "100%", borderRadius: 15}}/>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Button variant="contained" disabled={this.state.place == ""}
                                                        style={{backgroundColor: this.state.place == "" ? this.props.mode == "light" ? "#EE9B00" : "#9B2226" : "", borderRadius: 25, margin: 10}}
                                                        onClick={() => this.props.reward(this.props.nftId)}
                                                        >
                                                        <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid"}}> Return </Typography>     
                                                        </Button>
                                                    </Grid>
                                                    
                                                </Grid>
                                                }
                                            </div>
                                                :
                                                null
                                            }

                                            {this.state.result && !this.state.reward && this.state.place == "temple" ?
                                            <div>
                                                {(200 - this.state.result.survivalRoll) >= (200 - this.state.result.surThresh) ?
                                                <Grid container>
                                                    <Grid item xs={6}>
                                                        {(1000 - this.state.result.powerRoll) >= (2000 - this.state.result.powerThresh + 1)  ?
                                                        <div>
                                                            <img src={"T4 Treasure.gif"} style={{width: "100%", borderRadius: 15}}/>
                                                        </div>
                                                        :
                                                        null
                                                        }

                                                        {(1000 - this.state.result.powerRoll) <= (2000 - this.state.result.powerThresh) && (1000 - this.state.result.powerRoll) >= (1900 - this.state.result.powerThresh - (this.state.result.powerThresh - 1000) + 1) ?
                                                        <div>
                                                            <img src={"T3 Treasure.gif"} style={{width: "100%", borderRadius: 15}}/>
                                                        </div>
                                                        :
                                                        null
                                                        }

                                                        {(1000 - this.state.result.powerRoll) <= (1900 - this.state.result.powerThresh - (this.state.result.powerThresh - 1000)) && (1000 - this.state.result.powerRoll) >= (1500 - this.state.result.powerThresh - (2 * this.state.result.powerThresh - 2000) + 1) ?
                                                        <div>
                                                            <img src={"T2 Treasure.gif"} style={{width: "100%", borderRadius: 15}}/>
                                                        </div>
                                                        :
                                                        null
                                                        }

                                                        {(1000 - this.state.result.powerRoll) <= (1500 - this.state.result.powerThresh - (2 * this.state.result.powerThresh - 2000)) && (1000 - this.state.result.powerRoll) >= 1 ?
                                                        <div>
                                                            <img src={"T1 Treasure.gif"} style={{width: "100%", borderRadius: 15}}/>
                                                        </div>
                                                        :
                                                        null
                                                        }
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Button variant="contained" disabled={this.state.place == ""}
                                                        style={{backgroundColor: this.state.place == "" ? this.props.mode == "light" ? "#EE9B00" : "#9B2226" : "", borderRadius: 25, margin: 10}}
                                                        onClick={() => this.props.reward(this.props.nftId)}
                                                        >
                                                        <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid"}}> Open </Typography>     
                                                        </Button>
                                                    </Grid>
                                                </Grid>
                                                :
                                                <Grid container>
                                                    <Grid item xs={6}>
                                                        <img src={"death.gif"} style={{width: "100%", borderRadius: 15}}/>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Button variant="contained" disabled={this.state.place == ""}
                                                        style={{backgroundColor: this.state.place == "" ? this.props.mode == "light" ? "#EE9B00" : "#9B2226" : "", borderRadius: 25, margin: 10}}
                                                        onClick={() => this.props.reward(this.props.nftId)}
                                                        >
                                                        <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid"}}> Return </Typography>     
                                                        </Button>
                                                    </Grid>
                                                    
                                                </Grid>
                                                }
                                            </div>
                                                :
                                                null
                                            }
                                            


                                        {this.state.reward ?
                                            <Grid container>
                                                <Grid item xs={12}>
                                                    <DisplayItem nftId={this.state.reward} type={"img"} shep={this.props.nftId} sendDiscordMessage={this.props.sendDiscordMessage}/>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Button variant="contained" 
                                                    style={{backgroundColor: this.state.place == "" ? this.props.mode == "light" ? "#EE9B00" : "#9B2226" : "", borderRadius: 25, margin: 10}}
                                                    onClick={() => this.props.claimReward(this.props.nftId, this.state.reward)}
                                                    >
                                                    <Typography color="secondary" align="center" variant="h6" style={{fontFamily: "LondrinaSolid"}}> Claim </Typography>     
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                            :
                                            null
                                        }
                                            
                                            
                                        </Grid>

                                      
                                    
                                    </Grid>

                                        </div>
                                }
                                    

                        

                        
                        

                        
                    </div>
                   

                    
                    </div>
        
                )
            }
            
        }

        else {
            return (
                <div>                   
                </div>
    
            )
        }
       
        
    }
    
}