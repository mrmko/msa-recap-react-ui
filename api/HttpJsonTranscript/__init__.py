import logging

import azure.functions as func

import tempfile

import json

from . import ExtractTranscript

def main(req: func.HttpRequest, jsonBlob: func.InputStream, outputBlob: func.Out[func.InputStream]) -> func.HttpResponse:
    
    insightsData = json.loads(jsonBlob.read(-1))
    transcript = []
    ExtractTranscript.insights_to_vtt(insightsData,transcript)
    outputBlob.set(''.join(transcript))

    return func.HttpResponse(f"Done",status_code=200)