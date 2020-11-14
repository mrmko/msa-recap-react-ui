const functions = require("firebase-functions");
var Busboy = require("busboy");
var path = require("path");
var fs = require("fs");
var sha1 = require("sha1");
var bodyParser = require("body-parser");
const os = require("os");
const speech = require("@google-cloud/speech");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
var ffmpeg = require("fluent-ffmpeg");
const serviceAccount = require("./serviceAccount.json");
const u = require("uid");
const cors = require("cors")({ origin: true });

// The Firebase Admin SDK to access Cloud Firestore.
const admin = require("firebase-admin");
const { profile } = require("console");

//init firebase app
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ecm3440.firebaseio.com",
  storageBucket: "ecm3440.appspot.com",
});

//firebase function to get the transcript from the given audio file
exports.getTranscript = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {

    //get filename from query
    const fileName = req.query.fileName;
    console.log(fileName);

    //specifiy bucket
    const bucket = admin.storage().bucket();

    //create temp location to store the file
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, fileName);
    console.log(tempFilePath);

   //get the file from the bucket
    bucket
      .file("videos/" + fileName)
      .download({ destination: tempFilePath })
      .then(() => {
        
        //create ffmpeg object
        var proc = new ffmpeg({ source: tempFilePath, nolog: true });

        //set audio file path to be
        const audioFilepath = path.join(tempDir, "audio.mp3");
        console.log(audioFilepath);

        //convert webm file to mp3
        proc
          .setFfmpegPath(ffmpegPath)
          .fromFormat("webm")
          .toFormat("mp3")

          .on("end", function () {

            console.log("file has been converted successfully");

            //read newly converted file and conert to base64
            const file = fs.readFileSync(audioFilepath);
            const audioBytes = file.toString("base64");

            //setup project config to allow premission to api
            const pConfig = {
              projectId: serviceAccount.project_id,
              keyFilename: require.resolve("./serviceAccount.json"),
            };

            //setup google speech api
            const client = new speech.SpeechClient(pConfig);
            const encoding = "MP3";
            const languageCode = "en-US";

            console.log(serviceAccount.project_id);

            //config for the audio file to get the transcript from
            const config = {
              encoding: encoding,
              sampleRateHertz: 16000,
              languageCode: languageCode,
              audioChannelCount: 2, // hit 'Invalid audio channel count' if not specify
              enableAutomaticPunctuation: true, // https://cloud.google.com/speech-to-text/docs/automatic-punctuation
            };

            //set audio bytes
            const audio = {
              content: audioBytes,
            };

            const request = {
              audio: audio,
              config: config,
            };

            // Detects speech in the audio file
            client
              .recognize(request)
              .then((response) => {
                console.log(response);
                const transcription = response[0].results
                  .map((result) => result.alternatives[0].transcript)
                  .join("\n");
                  //send transcript result back to client
                res.send(`${transcription}`);
              })
              .catch(console.error);
          })
          .on("error", function (err) {
            console.log("an error happened: " + err.message);
            res.send(`File Error`);
          })
          .saveToFile(audioFilepath);
      });
  });
});

exports.projectName = functions.https.onRequest((request, response) => {
  return cors(request, response, async () => {
    response.send(u.uid());
  });
});
