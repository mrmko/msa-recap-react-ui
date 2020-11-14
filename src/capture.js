// See https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture
// for the original version of this code with detailed explanation.
import firebase from "firebase";

export {
  enableScreenCap,
  disableScreenCap,
  startScreenCapture,
  pauseScreenCapture,
  stopScreenCapture,
  downloadScreenCapture,
  getCaptureBlob,
  uploadScreenCapture,
};

var config = {
  apiKey: "AIzaSyC9v764dz0mmtTfDmCsWLXB4yfhma7hSZU",
  authDomain: "ecm3440.firebaseapp.com",
  databaseURL: "https://ecm3440.firebaseio.com",
  projectId: "ecm3440",
  storageBucket: "ecm3440.appspot.com",
  messagingSenderId: "849495698072",
  appId: "1:849495698072:web:3ce21ffcd70044a20f7eed",
  measurementId: "G-QS01FSP52H",
};
firebase.initializeApp(config);

// Options for getDisplayMedia()

var displayMediaOptions = {
  video: {
    cursor: "always",
  },
  audio: true,
};

let chunks = [];

let displayStream = null;
let mediaRecorder = null;

async function enableScreenCap() {
  const videoElem = document.getElementById("video");
  try {
    displayStream = await navigator.mediaDevices.getDisplayMedia(
      displayMediaOptions
    );
    videoElem.srcObject = displayStream;
  } catch (err) {
    console.error("Error: " + err);
  }
}

function disableScreenCap() {
  try {
    const videoElem = document.getElementById("video");
    let tracks = videoElem.srcObject.getTracks();
    tracks.forEach((track) => track.stop());
    videoElem.srcObject = null;
  } catch (err) {
    console.error("Error: " + err);
  }
}

function startScreenCapture() {
  console.info("Info: startCapture");

  //const videoElem = document.getElementById("video");
  try {
    // const displayStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    // videoElem.srcObject = displayStream;
    mediaRecorder = new MediaRecorder(displayStream, {
      mimeType: "video/webm",
    });
    mediaRecorder.onstop = (e) => {
      console.log("recorder stopped");
    };
    mediaRecorder.ondataavailable = function (e) {
      chunks.push(e.data);
    };
    mediaRecorder.start(1000); // Default behavoiur wasn't working. Slices do.
    console.log(mediaRecorder.state);
    console.log("recorder started");
    dumpOptionsInfo();
  } catch (err) {
    console.error("Error: " + err);
  }
}

function pauseScreenCapture() {
  if (mediaRecorder) {
    if (mediaRecorder.state === "recording") {
      console.info("Screen recording paused");
      mediaRecorder.pause();
    }
  }
}

function stopScreenCapture() {
  if (mediaRecorder) {
    if (mediaRecorder.state !== "inactive") {
      mediaRecorder.requestData();
      mediaRecorder.stop();
    }
  }
}

function dumpOptionsInfo() {
  const videoElem = document.getElementById("video");
  const videoTrack = videoElem.srcObject.getVideoTracks()[0];

  console.info("Track settings:");
  console.info(JSON.stringify(videoTrack.getSettings(), null, 2));
  console.info("Track constraints:");
  console.info(JSON.stringify(videoTrack.getConstraints(), null, 2));
}

function downloadScreenCapture(filename) {
  let data = chunks;
  let screen_capture = new Blob(data, {
    type: "video/webm",
  });
  let url = URL.createObjectURL(screen_capture);
  let a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  a.href = url;
  a.download = filename + ".webm";
  a.click();
  window.URL.revokeObjectURL(url);
}

function uploadScreenCapture(filename) {
  console.log("starting upload ");
  let data = chunks;
  let screen_capture = new Blob(data, {
    type: "video/webm",
  });

  firebase.storage().ref(`videos/${filename}.webm`).put(screen_capture);
}

function getCaptureBlob() {
  let screen_capture = new Blob(chunks, {
    type: "video/webm",
  });
  return screen_capture;
}
