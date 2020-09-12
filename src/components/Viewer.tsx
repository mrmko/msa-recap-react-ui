import React from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";

// See https://developer.mozilla.org/en-US/docs/Web/Guide/Audio_and_video_delivery/Adding_captions_and_subtitles_to_HTML5_video
// 
function Viewer() {

  let { project } = useParams();

  //let transcript = "https://saunby.blob.core.windows.net/recordings/" + project + ".vtt";
  //let transcript = "https://saunby.blob.core.windows.net/recordings/recording.vtt";

  const [transcript, setTranscript] = useState('data:text/plain;base64,');
  
  let data = {
    "Insights": {
      "FileName": project + ".ogg_insights.json"
    },
    "Transcript": {
      "FileName": project + ".vtt"
    }
  };

  async function createTranscriptCall(): Promise<string> {
    console.info("fetching", JSON.stringify(data));
    let response = await fetch('/api/HttpJsonTranscript', {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Unable to create transcript');
    }
    return await response.text();
  }

  let createTranscript = () => {
    createTranscriptCall().then((msg) => { console.info(msg);
      setTranscript('data:text/plain;base64,'+msg)
     }).catch((err) => { console.warn(err); })

  }

  return (
    <div className="about">
      <div className="container">
        <div className="row align-items-center my-5">
          <div className="col-lg-9">
            <p>
              {project}
            </p>
            <p>
              <button id="transcript" onClick={createTranscript}>Create transcript</button>
            </p>
            <p>
              <video controls id="video" preload="metadata" crossOrigin="*" autoPlay>
                <source src={"https://saunby.blob.core.windows.net/recordings/" + project + ".webm"}
                  type="video/webm" />
                <track label="English" kind="subtitles" srcLang="en" src={transcript} default>
                </track>
              </video>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Viewer;