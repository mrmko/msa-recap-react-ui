import logging

import azure.functions as func
import json
import base64

from . import ExtractTranscript

# To save output to blob update function.json to include an output and add this parameter
# outputBlob: func.Out[str]
def main(req: func.HttpRequest, jsonBlob: func.InputStream) -> func.HttpResponse:
    
    insightsData = json.loads(jsonBlob.read(-1))
    transcript = []
    ExtractTranscript.insights_to_vtt(insightsData,transcript)
    #outputBlob.set(''.join(transcript))

    return func.HttpResponse(base64.b64encode(''.join(transcript).encode("utf-8")).decode(),status_code=200)