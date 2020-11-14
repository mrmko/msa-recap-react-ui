import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { getTranscript } from "../data/transcript";

// See https://developer.mozilla.org/en-US/docs/Web/Guide/Audio_and_video_delivery/Adding_captions_and_subtitles_to_HTML5_video
//
function Viewer() {
  // @ts-ignore
  let { slug } = useParams();

  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);

  let project = slug;

  return (
    <div className="about">
      <div className="container">
        <div className="row align-items-center my-5">
          <div className="col-lg-9">
            <p>{slug}</p>
            <p>
              <button
                id="transcript"
                onClick={() => {
                  setLoading(true);
                  getTranscript(project).then((t) => {
                    console.log("got transcript");
                    setTranscript(t);
                    setLoading(false);
                  });
                }}
              >
                Create transcript
              </button>
              {transcript}
            </p>
            <p>
              <video
                controls
                id="video"
                preload="metadata"
                crossOrigin="*"
                autoPlay
              >
                <source
                  src={
                    "https://saunby.blob.core.windows.net/recordings/" +
                    project +
                    ".webm"
                  }
                  type="video/webm"
                />
                <track
                  label="English"
                  kind="subtitles"
                  srcLang="en"
                  src={
                    "https://saunby.blob.core.windows.net/recordings/" +
                    project +
                    ".vtt"
                  }
                  default
                ></track>
              </video>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Viewer;
