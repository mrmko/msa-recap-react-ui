import React from "react";
import { useParams } from "react-router-dom";

// See https://developer.mozilla.org/en-US/docs/Web/Guide/Audio_and_video_delivery/Adding_captions_and_subtitles_to_HTML5_video
// 
function Viewer() {
  let  {slug} = useParams();
  console.info('match',slug);
  return (
    <div className="about">
      <div className="container">
        <div className="row align-items-center my-5">
          <div className="col-lg-9">
            <p>
              {slug}
            </p>
            <p>
              <video controls id="video" preload="metadata" crossOrigin="*" autoPlay>
              <source src={"https://saunby.blob.core.windows.net/recordings/"+slug+".webm"}
            type="video/webm" />
            <track label="English" kind="subtitles" srcLang="en" src="https://saunby.blob.core.windows.net/recordings/recording.vtt" default>
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