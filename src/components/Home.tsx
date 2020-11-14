import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

import {
  enableMicrophone,
  disableMicrophone,
  startAudioCapture,
  stopAudioCapture,
  downloadAudioCapture,
  pauseAudioCapture,
  getAudioCaptureBlob,
} from "../audio_capture";
import {
  startScreenCapture,
  stopScreenCapture,
  enableScreenCap,
  disableScreenCap,
  downloadScreenCapture,
  pauseScreenCapture,
  getCaptureBlob,
  uploadScreenCapture,
} from "../capture";
import { projectName } from "../data/projectName";
import { withRouter } from "react-router-dom";

// const logArray = Array(<></>);

function Home() {
  const [disabled, setDisabled] = useState({
    enable: false,
    start: true,
    pause: true,
    end: true,
    upload: true,
    download: true,
  });

  const [filename, setFilename] = useState("recording");

  const [project, setProject] = useState("");

  //setDisabled({enable:false,start:true,pause:true,end:true,upload:true,download:true});

  function download() {
    downloadScreenCapture(filename);
    downloadAudioCapture(filename);
  }

  let enableRecording = () => {
    projectName()
      .then((name) => {
        setProject(name);
      })
      .catch((err) => {
        console.warn(err);
      });
    enableMicrophone();
    enableScreenCap();
    setDisabled({
      enable: true,
      start: false,
      pause: true,
      end: true,
      upload: true,
      download: true,
    });
  };

  let startRecording = () => {
    startAudioCapture();
    startScreenCapture();
    setDisabled({
      enable: true,
      start: true,
      pause: false,
      end: false,
      upload: true,
      download: true,
    });
  };

  let pauseRecording = () => {
    pauseAudioCapture();
    pauseScreenCapture();
    setDisabled({
      enable: true,
      start: false,
      pause: true,
      end: false,
      upload: true,
      download: true,
    });
  };

  let endRecording = () => {
    stopAudioCapture();
    stopScreenCapture();
    disableMicrophone();
    disableScreenCap();
    setDisabled({
      enable: false,
      start: true,
      pause: true,
      end: true,
      upload: false,
      download: false,
    });
  };

  let upload = () => {
    uploadScreenCapture(project);
  };

  return (
    <div className="App">
      <hr></hr>

      <p>
        <button
          id="enableRecording"
          disabled={disabled.enable}
          onClick={enableRecording}
        >
          Enable Recording
        </button>
      </p>
      <p>
        <button id="start" disabled={disabled.start} onClick={startRecording}>
          Start Recording
        </button>
        <button id="pause" disabled={disabled.pause} onClick={pauseRecording}>
          Pause Recording
        </button>
        <button
          id="endRecording"
          disabled={disabled.end}
          onClick={endRecording}
        >
          End Recording
        </button>
      </p>

      <p>
        <button id="upload" disabled={disabled.upload} onClick={upload}>
          Upload
        </button>
        <span>
          &nbsp;&nbsp;
          <Link to={"/viewer/" + project}>{project}</Link>
        </span>
      </p>
      <hr></hr>

      <video controls muted id="video" autoPlay></video>
      <br></br>

      <p>
        <button id="download" disabled={disabled.download} onClick={download}>
          Download
        </button>
        <input
          type="text"
          value={filename}
          onChange={(evt) => {
            setFilename(evt.target.value);
          }}
        />
      </p>

      <div style={{ textAlign: "left" }}>
        <br></br>
      </div>
    </div>
  );
}

export default withRouter(Home);
