import React, { useState } from 'react'

import { Typography, Button, Grid } from "@mui/material"


export default function Home(props) {

    const [isTrainHovered, setTrainHovered] = useState(false)
    const [isQuestHovered, setQuestHovered] = useState(false)
    const [isCraftHovered, setCraftHovered] = useState(false)
    const [isLeaderboardHovered, setLeaderboardHovered] = useState(false)


console.log(props.activeAccount)

if (props.activeAccount) {
    return (
        <div style={{backgroundColor: props.mode == "light" ? "#E9D8A6" : "#33363F", height: "100vh"}}>
        <Grid container align="center" style={{position: "relative", backgroundColor: props.mode == "light" ? "#E9D8A6" : "#33363F"}} >
        <Grid item xs={12} sm={6} style={{paddingTop: "10vh"}}>
            <Button style={{backgroundColor: "#EE9B00", boxShadow: "rgba(0, 0, 0, 0.15) 3.95px 3.95px 2.6px"}} 
            onMouseEnter={() => setQuestHovered(true)}
            onMouseLeave={() => setQuestHovered(false)} 
            onClick={() => props.activeAccount ? props.setPage("QUEST") : props.setPage("connect")}>
                {isQuestHovered ? 
                    <Typography color="primary"  align="center" variant="h1" style={{fontFamily: "LondrinaSolid", color: "#000000", padding: 15}}> Quest </Typography>
                :
                    <Typography color="primary"  align="center" variant="h2" style={{fontFamily: "LondrinaSolid", color: "#000000", padding: 15}}> Quest </Typography>
                }
                <img src={"Quest.svg"} style={{width: "50px"}} />

            </Button>
            
            </Grid>
        
            <Grid item xs={12} sm={6} style={{paddingTop: "10vh"}}>
            <Button style={{backgroundColor: "#EE9B00", boxShadow: "rgba(0, 0, 0, 0.15) 3.95px 3.95px 2.6px"}} 
            onMouseEnter={() => setTrainHovered(true)}
            onMouseLeave={() => setTrainHovered(false)} 
            onClick={() => props.activeAccount ? props.setPage("TRAIN") : props.setPage("connect")}>
                {isTrainHovered ? 
                    <Typography color="primary"  align="center" variant="h1" style={{fontFamily: "LondrinaSolid", color: "#000000", padding: 15}}> Train </Typography>
                :
                    <Typography color="primary"  align="center" variant="h2" style={{fontFamily: "LondrinaSolid", color: "#000000", padding: 15}}> Train </Typography>
                }
                <img src={"Train.svg"} style={{width: "50px"}} />

            </Button>
            
            </Grid>
            <Grid item xs={12} sm={12} style={{paddingTop: "10vh"}}>
            <Button style={{backgroundColor: "#EE9B00", boxShadow: "rgba(0, 0, 0, 0.15) 3.95px 3.95px 2.6px"}} 
            onMouseEnter={() => setCraftHovered(true)}
            onMouseLeave={() => setCraftHovered(false)} 
            onClick={() => props.activeAccount ? props.setPage("CRAFT") : props.setPage("connect")}>
                {isCraftHovered ? 
                    <Typography color="primary"  align="center" variant="h1" style={{fontFamily: "LondrinaSolid", color: "#000000", padding: 15}}> Craft </Typography>
                :
                    <Typography color="primary"  align="center" variant="h2" style={{fontFamily: "LondrinaSolid", color: "#000000", padding: 15}}> Craft </Typography>
                }
                <img src={"craft.png"} style={{width: "50px", padding: 8}} />

            </Button>
            
            </Grid>
            <Grid item xs={12} sm={12} style={{paddingTop: "10vh"}}>
            <Button style={{backgroundColor: "#EE9B00", boxShadow: "rgba(0, 0, 0, 0.15) 3.95px 3.95px 2.6px"}} 
            onMouseEnter={() => setLeaderboardHovered(true)}
            onMouseLeave={() => setLeaderboardHovered(false)} 
            onClick={() => props.activeAccount ? props.setPage("LEADERBOARDS") : props.setPage("connect")}>
                {isLeaderboardHovered ? 
                    <img src={"Leaderboards.svg"} style={{width: "100px", padding: 8}} />

                :
                    <img src={"Leaderboards.svg"} style={{width: "70px", padding: 8}} />

                }

            </Button>
            
            </Grid>
            
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