import React from "react";
import { useState } from "react";

import {
  enableMicrophone, disableMicrophone, startAudioCapture, stopAudioCapture,
  downloadAudioCapture, pauseAudioCapture, getAudioCaptureBlob
} from "../audio_capture";
import {
  startScreenCapture, stopScreenCapture, enableScreenCap, disableScreenCap,
  downloadScreenCapture, pauseScreenCapture, getCaptureBlob
} from "../capture";
import { projectName, uploadBlob } from "../azure_upload";
import { withRouter } from "react-router-dom";

// const logArray = Array(<></>);

function Home() {

  const [filename, setFilename] = useState("recording");

  let startCapture = () => {
    startAudioCapture();
    startScreenCapture();
  }

  function download() {
    downloadScreenCapture(filename);
    downloadAudioCapture(filename);
  }

  let log = '';

  /*
  const [log, setLog] = useState(<></>);


  let updateLog = (cl: string, msg: string) => {
    logArray.push(<span className={cl}>{msg}<br></br></span>);
    setLog(<>{[...logArray]}</>);
  }

  console.log = (msg: any) => updateLog("info", msg);
  console.error = (msg: any) => updateLog("error", msg);
  console.warn = (msg: any) => updateLog("warn", msg);
  console.info = (msg: any) => updateLog("info", msg);
  */

  let enableRecording = () => {
    enableMicrophone();
    enableScreenCap();
  }

  let pauseRecording = () => {
    pauseAudioCapture();
    pauseScreenCapture();
  }

  let endRecording = () => {
    stopAudioCapture();
    stopScreenCapture();
    disableMicrophone();
    disableScreenCap();
  }

  let project = '';

  let upload = () => {

    projectName().then((name)=>{
      project = name;
    console.log("project", project)

    if (project) {
      console.info("Calling upload()");
      let ablob: Blob = getAudioCaptureBlob();
      uploadBlob(ablob, project, "ogg").then((m) => {
        console.warn("Upload message", m);
      });
      let vblob: Blob = getCaptureBlob();
      uploadBlob(vblob, project, "webm").then((m) => {
        console.warn("Upload message", m);
      });
    }
  });
  }

  return (
    <div className="App">

      <hr></hr>

      <p>
        <button id="enableRecording" onClick={enableRecording}>Enable Recording</button>
      </p>
      <p>
        <button id="start" onClick={startCapture}>Start Recording</button>
        <button id="pause" onClick={pauseRecording}>Pause Recording</button>
      </p>

      <p>
        <button id="endRecording" onClick={endRecording}>End Recording</button>
      </p>

      <p>
        <button id="download" onClick={download}>Download</button>
        <input type="text" value={filename} onChange={(evt) => { setFilename(evt.target.value) }} />
      </p>

      <p>
        <button id="upload" onClick={upload}>Upload</button>
        <span>{project}</span>
      </p>
      <hr></hr>

      <video controls muted id="video" autoPlay></video>
      <br></br>

      <div style={{ textAlign: 'left' }}>
        <br></br>
        <pre>{log}</pre>
      </div>
    </div>

  );
}

export default withRouter(Home);