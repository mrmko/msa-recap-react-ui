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

// The Firebase Admin SDK to access Cloud Firestore.
const admin = require("firebase-admin");
const { profile } = require("console");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ecm3440.firebaseio.com",
});

exports.fu = functions.https.onRequest((req, res) => {
  const busboy = new Busboy({
    headers: req.headers,
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  });
  const fields = {};
  const files = [];
  const fileWrites = [];
  // Note: os.tmpdir() points to an in-memory file system on GCF
  // Thus, any files in it must fit in the instance's memory.
  const tmpdir = os.tmpdir();
  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    const filepath = path.join(tmpdir, filename);
    console.log(
      `Handling file upload field ${fieldname}: ${filename} (${filepath})`
    );
    const writeStream = fs.createWriteStream(filepath);
    file.pipe(writeStream);
    fileWrites.push(
      new Promise((resolve, reject) => {
        file.on("end", () => writeStream.end());
        writeStream.on("finish", () => {
          fs.readFile(filepath, (err, buffer) => {
            const size = Buffer.byteLength(buffer);
            console.log(`${filename} is ${size} bytes`);
            if (err) {
              return reject(err);
            }
            files.push({
              fieldname,
              originalname: filename,
              encoding,
              mimetype,
              buffer,
              size,
            });
            try {
              fs.unlinkSync(filepath);
            } catch (error) {
              return reject(error);
            }
            resolve();
          });

          // Reads a local audio file and converts it to base64

          var inStream = fs.createReadStream(filepath);
          var proc = new ffmpeg({ source: inStream, nolog: true });
          const audioFilepath = path.join(tmpdir, "audio.mp3");

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
            // save to file <-- the new file I want -->
            .saveToFile(audioFilepath);
        });
        writeStream.on("error", reject);
      })
    );
  });
  busboy.on("finish", () => {
    Promise.all(fileWrites).then(() => {
      req.body = fields;
      req.files = files;
    });
  });
  busboy.end(req.rawBody);
});

exports.projectName = functions.https.onRequest((request, response) => {
  response.send(u.uid());
});

exports.uploadFiles = functions.https.onRequest((request, response) => {
  functions.logger.info("Got file", { structuredData: true });

  // Create folder for uploading files.
  var filesDir = path.join(path.dirname(require.main.filename), "uploads");

  if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir);
  }

  upload(request, function (err, data) {
    functions.logger.info("callback", { structuredData: true });
    if (err) {
      return response.status(404).end(JSON.stringify(err));
    }

    response.send(data);
  });
});

// Gets a filename extension.
function getExtension(filename) {
  return filename.split(".").pop();
}

// Test if a file is valid based on its extension and mime type.
function isFileValid(filename, mimetype) {
  var allowedExts = ["mp4", "webm", "ogg"];
  var allowedMimeTypes = ["video/mp4", "video/webm", "video/ogg"];

  // Get file extension.
  var extension = getExtension(filename);

  return (
    allowedExts.indexOf(extension.toLowerCase()) != -1 &&
    allowedMimeTypes.indexOf(mimetype) != -1
  );
}
