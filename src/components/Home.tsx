import React from "react";
import { useState } from "react";
import { enableMicrophone, disableMicrophone, startAudioCapture, stopAudioCapture, downloadAudioCapture } from '../audio_capture';
import {  startScreenCapture, stopScreenCapture, enableScreenCap, disableScreenCap, downloadScreenCapture } from '../capture';
import { withRouter } from "react-router-dom";

const logArray = Array(<></>);

function Home() {

    const [filename, setFilename] = useState("recording");

    let startCapture = () => {
        startAudioCapture();
        startScreenCapture();
      }
    
      let stopCapture = () => {
        stopAudioCapture();
        stopScreenCapture();
      }
    
      function download(){
        downloadScreenCapture(filename);
        downloadAudioCapture(filename);
      }

      const [log, setLog] = useState(<></>);

  let updateLog = (cl: string, msg: string) => {
    logArray.push(<span className={cl}>{msg}<br></br></span>);
    setLog(<>{[...logArray]}</>);
  }

  console.log = (msg: any) => updateLog("info", msg);
  console.error = (msg: any) => updateLog("error", msg);
  console.warn = (msg: any) => updateLog("warn", msg);
  console.info = (msg: any) => updateLog("info", msg);

  return (
    <div className="App">
    <p>
      <button id="enable" onClick={enableMicrophone}>Enable Microphone</button>
      <button id="disable" onClick={disableMicrophone}>Disable Microphone</button>
    </p>
    <p>
      <button id="enableScr" onClick={enableScreenCap}>Enable Screen Capture</button>
      <button id="disableScr" onClick={disableScreenCap}>Disable Screen Capture</button>
    </p>
    <p>
      <button id="start" onClick={startCapture}>Start Recording</button>
      <button id="stop" onClick={stopCapture}>Stop Recording</button>
    </p>
    <p>
    <button id="download" onClick={download}>Download</button>
    <input type="text" value={filename} onChange={(evt) => {setFilename(evt.target.value)}}/>
    </p>

    <video controls muted id="video" autoPlay></video>
    <br></br>

    <strong>Log:</strong>
    <div style={{textAlign:'left'}}>
    <br></br>
    <pre>{log}</pre>
    </div>
  </div>
  );
}

export default withRouter(Home);