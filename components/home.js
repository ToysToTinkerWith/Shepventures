import React, { useState } from 'react'

import { Typography, Button, Grid } from "@mui/material"



export default function Home(props) {

    const [isCampHovered, setCampHovered] = useState(false)

    return (
        <Grid container align="center" style={{position: "relative", backgroundColor: props.mode == "light" ? "#E9D8A6" : "#33363F", height: "100vh", paddingTop: "20vh"}} >
            <Grid item xs={12} sm={12}>
            <Button style={{backgroundColor: "#EE9B00", boxShadow: "rgba(0, 0, 0, 0.15) 3.95px 3.95px 2.6px"}} 
            onMouseEnter={() => setCampHovered(true)}
            onMouseLeave={() => setCampHovered(false)} 
            onClick={() => props.activeAccount ? props.setPage("TRAIN") : props.setPage("connect")}>
                {isCampHovered ? 
                    <Typography color="primary"  align="center" variant="h1" style={{fontFamily: "LondrinaSolid", color: "#000000", padding: 15}}> Train </Typography>
                :
                    <Typography color="primary"  align="center" variant="h2" style={{fontFamily: "LondrinaSolid", color: "#000000", padding: 15}}> Train </Typography>
                }
                <img src={"Train.svg"} style={{width: "50px"}} />

            </Button>
            
            </Grid>
        
        </Grid>
    )
}