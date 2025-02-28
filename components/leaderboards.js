import React, { useState } from "react"

import { Grid, Typography, Button, CircularProgress } from "@mui/material"

import algosdk from "algosdk"
import DisplayShep from "./displayShep"

import { db } from "../Firebase/FirebaseInit"
import { getDocs, collection } from "firebase/firestore"

export default function Leaderboards(props) { 

  const [ round, setRound] = useState(0)

  const [ leaderboardXp, setLeaderboardXp] = useState([])
  const [ cashAssets, setCashAssets] = useState([])

  const [ confirm, setConfirm] = useState("")

  const [ contract ] = useState(2254344958)

  const [progress, setProgress] = useState(0)


  const [ message, setMessage] = useState("Searching for Sheps")

    React.useEffect(() => {

        const fetchData = async () => {

            try {

                const querySnapshot = await getDocs(collection(db, "LeaderboardXP"));
    
                // Optionally, gather all documents into an array
                const dataArray = [];
                
                querySnapshot.forEach((doc) => {
                console.log(doc.id, " => ", doc.data());
                // Push to an array if needed
                dataArray.push({ id: doc.id, ...doc.data() });
                });


                dataArray.sort((a, b) => b.shepXp - a.shepXp)

                console.log(dataArray)

                setLeaderboardXp(dataArray)
            
            }
            catch(error) {
                console.log(error)
            }
          
        }
          fetchData();
        
    }, [])

        return (
          
            <div style={{backgroundColor: props.mode == "light" ? "#E9D8A6" : "#33363F", height: "100%"}}>
        
              <Grid container>
              {leaderboardXp.length > 0 ? leaderboardXp.map((shep, index) => {
                return (
                  <Grid key={index} item xs={6} sm={4} md={4} lg={3} style={{padding: 20}}>
                  <DisplayShep mode={props.mode} nftId={shep.shepId} place={"leaderboardXp"} sendDiscordMessage={props.sendDiscordMessage}/>
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