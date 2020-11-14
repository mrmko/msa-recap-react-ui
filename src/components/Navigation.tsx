import { Button, Toolbar, Typography } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar/AppBar";
import React from "react";
import { Link, withRouter, useHistory } from "react-router-dom";

function Navigation(props: any) {
  const history = useHistory();
  return (
    <div className="navigation">
      <AppBar position="static" style={{ backgroundColor: "#0373fc" }}>
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Screen Recorder with Transcription
          </Typography>
          <Button
            color="inherit"
            onClick={() => {
              history.push("/");
            }}
          >
            Home
          </Button>
          <Button
            color="inherit"
            onClick={() => {
              history.push("/about");
            }}
          >
            About
          </Button>
          <Button
            color="inherit"
            onClick={() => {
              history.push("/viewer");
            }}
          >
            Viewer
          </Button>
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default withRouter(Navigation);
