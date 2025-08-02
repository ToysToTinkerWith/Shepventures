import React from 'react'

import { Grid, Button, Typography } from "@mui/material"

import Connect from "./connect"

import WbSunnyIcon from '@mui/icons-material/WbSunny';
import DarkModeIcon from '@mui/icons-material/DarkMode';

export default class Nav extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
        width: 1000,
        height: 1000
    };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this)
  }

  updateWindowDimensions() {
      this.setState({ width: window.innerWidth, height: window.innerHeight });
    }


  componentDidMount() {
  this.updateWindowDimensions();
  window.addEventListener('resize', this.updateWindowDimensions);
  }

  componentWillUnmount() {
  window.removeEventListener('resize', this.updateWindowDimensions);
  }

  // Map through the providers.
  // Render account information and "connect", "set active", and "disconnect" buttons.
  // Finally, map through the `accounts` property to render a dropdown for each connected account.
  render() {
    if (this.state.width > 600) {
      return (
        <Grid container align="center" style={{backgroundColor: this.props.mode == "light" ? "#94D2BD" : "#0A9396"}}>
          
            <Grid item xs={3} sm={3} md={3}>
              <Button style={{marginTop: 25}} onClick={() => this.props.setPage("SHEPVENTURES")}>
                <img src={"./Home.svg"} style={{width: this.state.width > 600 ? 40 : 30}} />
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={6} style={{paddingBottom: 10}}>
              <br />
              <Typography variant="h2" style={{fontFamily: "LondrinaSolid"}}> {this.props.page} </Typography>
              {this.props.mode == "light" ? 
              <Button onClick={() => this.props.setMode("dark")}>
                <DarkModeIcon />
              </Button>
              :
              <Button onClick={() => this.props.setMode("light")}>
                <WbSunnyIcon />
              </Button>
              }
              
          </Grid>
           
            <Grid item xs={3} sm={3} md={3}>
              <br />
              <Connect activeAddress={this.props.activeAddress} page={this.props.page} open={this.props.page == "connect" ? true : false} setPage={this.props.setPage} />
            </Grid>
            
            

        </Grid>
    )
  }
  else {
    return (
      <Grid container align="center" style={{backgroundColor: "#94D2BD"}}>
        <Grid item xs={12} sm={6} md={6} style={{paddingBottom: 10}}>
            <br />
            <Typography variant="h2" style={{fontFamily: "LondrinaSolid"}}> {this.props.page} </Typography>
            {this.props.mode == "light" ? 
              <Button onClick={() => this.props.setMode("dark")}>
                <DarkModeIcon />
              </Button>
              :
              <Button onClick={() => this.props.setMode("light")}>
                <WbSunnyIcon />
              </Button>
              }
        </Grid>
          <Grid item xs={6} sm={3} md={3}>
            <Button style={{marginTop: 25}} onClick={() => this.props.setPage("SHEPVENTURES")}>
              <img src={"./Home.svg"} style={{width: 38}} />
            </Button>
          </Grid>         
          <Grid item xs={6} sm={3} md={3}>
            <br />
            <Connect page={this.props.page} open={this.props.page == "connect" ? true : false} setPage={this.props.setPage} />
          </Grid>
          
          

      </Grid>
)
  }
    
  }
  
}