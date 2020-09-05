
export { enableMicrophone, disableMicrophone, startAudioCapture, stopAudioCapture, downloadAudioCapture };


let mediaOptions = {
    video: false,
    audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100
    }
};

let chunks = [];

let mediaRecorder = null;
let audioStream = null;

async function enableMicrophone() {
    try {

        audioStream = await navigator.mediaDevices.getUserMedia(mediaOptions);
    } catch (err) {
        console.error("Error: " + err);
    }
}

function disableMicrophone() {
    try {
        let tracks = audioStream.getTracks();
        tracks.forEach(track => track.stop());
        audioStream = null;
    } catch (err) {
        console.error("Error: " + err);
    }
}

function startAudioCapture() {
    console.info("Info: startAudioCapture");
    try {
        mediaRecorder = new MediaRecorder(audioStream);
        mediaRecorder.onstop = (e) => { console.log("audio recorder stopped"); };
        mediaRecorder.ondataavailable = function (e) {
            chunks.push(e.data);
        };
        mediaRecorder.start(100); // Default behavoiur wasn't working. Slices do.
        console.log(mediaRecorder.state);
        console.log("recorder started");
    } catch (err) {
        console.error("Error: " + err);
    }
}

function downloadAudioCapture(filename) {
    let data = chunks;
    let blob = new Blob(data, { 'type': 'audio/ogg; codecs=opus' });
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = filename + ".ogg";
    a.click();
    window.URL.revokeObjectURL(url);
}


function stopAudioCapture() {
    if (mediaRecorder) {
        mediaRecorder.requestData();
        mediaRecorder.stop();
    }
}


