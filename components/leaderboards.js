import React, { useState } from "react"

import { Grid, Typography, Button, CircularProgress } from "@mui/material"

import algosdk from "algosdk"
import DisplayShep from "./displayShep"

import { db } from "../Firebase/FirebaseInit"
import { getDocs, collection } from "firebase/firestore"

export default function Leaderboards(props) { 

  const [ round, setRound] = useState(0)

  const [ leaderboardXp, setLeaderboardXp] = useState([])
  const [ leaderboardItems, setLeaderboardsItems] = useState([])

  const [ cashAssets, setCashAssets] = useState([])

  const [ confirm, setConfirm] = useState("")

  const [ contract ] = useState(2254344958)

  const [progress, setProgress] = useState(0)

  const [isXpHovered, setXpHovered] = useState(false)
  const [isItemsHovered, setItemsHovered] = useState(false)

  const [page, setPage] = useState("xp")



  const [ message, setMessage] = useState("Searching for Sheps")

    React.useEffect(() => {

        const fetchData = async () => {

            try {

                const queryxpSnapshot = await getDocs(collection(db, "LeaderboardXP"));
    
                // Optionally, gather all documents into an array
                const dataxpArray = [];
                
                queryxpSnapshot.forEach((doc) => {
                // Push to an array if needed
                dataxpArray.push({ id: doc.id, ...doc.data() });
                });


                dataxpArray.sort((a, b) => b.shepXp - a.shepXp)

                console.log(dataxpArray)

                setLeaderboardXp(dataxpArray)

                const querySnapshot = await getDocs(collection(db, "LeaderboardItems"));
    
                // Optionally, gather all documents into an array
                const dataitemsArray = [];
                
                querySnapshot.forEach((doc) => {
                // Push to an array if needed
                dataitemsArray.push({ id: doc.id, ...doc.data() });
                });


                dataitemsArray.sort((a, b) => b.itemScore - a.itemScore)

                console.log(dataitemsArray)

                setLeaderboardsItems(dataitemsArray)
            
            }
            catch(error) {
                console.log(error)
            }
          
        }
          fetchData();
        
    }, [])

        return (
          
            <div style={{backgroundColor: props.mode == "light" ? "#E9D8A6" : "#33363F", height: "100%"}}>

              <Grid container align="center" style={{position: "relative", backgroundColor: props.mode == "light" ? "#E9D8A6" : "#33363F"}} >
                <Grid item xs={6} sm={6} style={{paddingTop: "10vh"}}>
                    <Button style={{backgroundColor: "#EE9B00", boxShadow: "rgba(0, 0, 0, 0.15) 3.95px 3.95px 2.6px"}} 
                    onMouseEnter={() => setXpHovered(true)}
                    onMouseLeave={() => setXpHovered(false)} 
                    onClick={() => setPage("xp")}>
                        {page == "xp" ? 
                            <Typography color="primary"  align="center" variant="h1" style={{fontFamily: "LondrinaSolid", color: "#000000", padding: 15}}> XP </Typography>
                        :
                            <Typography color="primary"  align="center" variant="h2" style={{fontFamily: "LondrinaSolid", color: "#000000", padding: 15}}> XP </Typography>
                        }
        
                    </Button>
                    
                  </Grid>
                  <Grid item xs={6} sm={6} style={{paddingTop: "10vh"}}>
                      <Button style={{backgroundColor: "#EE9B00", boxShadow: "rgba(0, 0, 0, 0.15) 3.95px 3.95px 2.6px"}} 
                      onMouseEnter={() => setItemsHovered(true)}
                      onMouseLeave={() => setItemsHovered(false)} 
                      onClick={() => setPage("items")}>
                          {page == "items" ? 
                              <Typography color="primary"  align="center" variant="h1" style={{fontFamily: "LondrinaSolid", color: "#000000", padding: 15}}> Items </Typography>
                          :
                              <Typography color="primary"  align="center" variant="h2" style={{fontFamily: "LondrinaSolid", color: "#000000", padding: 15}}> Items </Typography>
                          }
          
                      </Button>
                      
                    </Grid>
                      
                          
                          
                      </Grid>

              {page == "xp" ?
                <Grid container>
                {leaderboardXp.length > 0 ? leaderboardXp.map((shep, index) => {
                  return (
                    <Grid key={index} item xs={6} sm={4} md={4} lg={3} style={{padding: 20}}>
                    <DisplayShep index={index} mode={props.mode} nftId={shep.shepId} shepXp={shep.shepXp} place={"leaderboardXp"} sendDiscordMessage={props.sendDiscordMessage}/>
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
              :
              null
              }

              {page == "items" ?
                <Grid container>
                {leaderboardItems.length > 0 ? leaderboardItems.map((shep, index) => {
                  return (
                    <Grid key={index} item xs={6} sm={4} md={4} lg={3} style={{padding: 20}}>
                    <DisplayShep index={index} mode={props.mode} itemScore={shep.itemScore} nftId={shep.shepId} place={"leaderboardItems"} sendDiscordMessage={props.sendDiscordMessage}/>
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
              :
              null
              }
        
              
               
                

            </div>
        )
    
}