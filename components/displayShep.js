import React from "react"

import algosdk, { seedFromMnemonic } from "algosdk"

import { Typography, Button, TextField, Grid, LinearProgress, linearProgressClasses, styled  } from "@mui/material"

import MyAlgo from '@randlabs/myalgo-connect';
import next from "next";

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

export default class DisplayShep extends React.Component { 

    constructor(props) {
        super(props);
        this.state = {
            nft: null,
            nftUrl: null,
            message: "",
            contract: 1371810703,
            place: "",
            round: 0,
            cashRound: 0,
            xp: 0
            
        };
        this.removeElement = this.removeElement.bind(this)

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
                nftUrl: "https://ipfs.io/ipfs/" + session.assets[0].params.url.slice(7),
            })
        
      
            const client = new algosdk.Algodv2('', 'https://mainnet-api.algonode.cloud', 443)

            let status = await client.status().do();

            this.setState({
                round: status["last-round"]
            })

            let assetBox = algosdk.encodeUint64(this.props.nftId)


            try {
                let accountBoxPlace = await client.getApplicationBoxByName(this.state.contract, new Uint8Array([...assetBox, ...new Uint8Array(Buffer.from("place"))])).do();
                console.log(accountBoxPlace)
        
                let string = new TextDecoder().decode(accountBoxPlace.value);
        
                console.log(string)
        
                this.setState({
                    place: string
                })

                let accountBoxTime = await client.getApplicationBoxByName(this.state.contract, new Uint8Array([...assetBox, ...new Uint8Array(Buffer.from("time"))])).do();
                console.log(accountBoxTime)
                var length = accountBoxTime.value.length;
        
                let buffer = Buffer.from(accountBoxTime.value);
                var result = buffer.readUIntBE(0, length);
        
                console.log(result)
        
                this.setState({
                    cashRound: result
                })
                }
                catch {

                }

                let accountBoxXp = await client.getApplicationBoxByName(this.state.contract, new Uint8Array([...assetBox, ...new Uint8Array(Buffer.from("xp"))])).do();
                console.log(accountBoxXp)
                var length = accountBoxXp.value.length;
        
                let xpbuffer = Buffer.from(accountBoxXp.value);
                let xpresult = xpbuffer.readUIntBE(0, length);

                console.log(xpresult)
        
        
                this.setState({
                    xp: xpresult
                })

            
    
      
    
           
    
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
      


    render() {

        console.log(this.state)

        let level = 1
        let nextLvl = 100
        let prevLvl = 0

        while (this.state.xp > nextLvl) {
            prevLvl = nextLvl
            nextLvl = nextLvl + (200 * level) + 100
            level++
        }
        
       

        let sel = false

        this.props.cashAssets.forEach((asset) => {
            if(asset.assetId == this.props.nftId) {
                sel = asset
            }
        })

    
        if (this.state.nft) {

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
                        <Typography align="center" variant="h6" style={{fontFamily: "LondrinaSolid", display: "grid", color: this.props.mode == "light" ? "#000000" : "#FFFFFF"}}> {Math.floor((this.state.round - this.state.cashRound) / 1000)} xp earned</Typography>

                    </div>
                    :
                    null
                    }
                    

                       

                        <Grid container align="center" spacing={0} style={{padding: 20}} >
                            
                            <Grid item xs={12} sm={12} md={6}>
                                {this.props.round && this.state.cashRound && (this.state.round - this.state.cashRound) / 1000 >= 1 ?
                                <Button variant="contained" color="secondary" 
                                style={{backgroundColor: this.props.mode == "light" ? "#EE9B00" : "#9B2226", border: sel && sel.option == "claim" ? "3px solid white" : null, borderRadius: 25, marginBottom: 10}}
                                onClick={() => sel ? 
                                    this.removeElement()
                                    :
                                    this.props.setCashAssets([...this.props.cashAssets, {assetId: this.props.nftId, reward: Math.floor(((this.props.round - this.state.cashRound) / 159000)) * this.props.reward, option: "claim"}])}
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
                                {this.props.round && this.state.cashRound ?
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
                <div>                   
                </div>
    
            )
        }
       
        
    }
    
}