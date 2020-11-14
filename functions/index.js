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
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ecm3440.firebaseio.com",
  storageBucket: "ecm3440.appspot.com",
});

exports.getTranscript = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    const fileName = req.query.fileName;
    console.log(fileName);

    const bucket = admin.storage().bucket();

    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, fileName);
    console.log(tempFilePath);

    bucket
      .file("videos/" + fileName)
      .download({ destination: tempFilePath })
      .then(() => {
        var inStream = fs.createReadStream(tempFilePath);
        console.log(tempFilePath);
        var proc = new ffmpeg({ source: tempFilePath, nolog: true });
        const audioFilepath = path.join(tempDir, "audio.mp3");
        console.log(audioFilepath);
        proc
          .setFfmpegPath(ffmpegPath)
          .fromFormat("webm")
          .toFormat("mp3")

          .on("end", function () {
            console.log("file has been converted successfully");
            const file = fs.readFileSync(audioFilepath);
            const audioBytes = file.toString("base64");

            const pConfig = {
              projectId: serviceAccount.project_id,
              keyFilename: require.resolve("./serviceAccount.json"),
            };

            const client = new speech.SpeechClient(pConfig);
            const encoding = "MP3";
            const languageCode = "en-US";

            console.log(serviceAccount.project_id);

            const config = {
              encoding: encoding,
              sampleRateHertz: 16000,
              languageCode: languageCode,
              audioChannelCount: 2, // hit 'Invalid audio channel count' if not specify
              enableAutomaticPunctuation: true, // https://cloud.google.com/speech-to-text/docs/automatic-punctuation
            };

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
                res.send(`Transcription ${transcription} created.`);
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
