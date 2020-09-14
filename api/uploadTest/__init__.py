import azure.functions as func

def main(req: func.HttpRequest, outputBlob: func.Out[func.InputStream]) -> func.HttpResponse:

    # If function.json is configured correctly, saving data to a storage blob is as simple as this -
    body = req.get_body()
    outputBlob.set(body)

    # Note that the content-type will be the default value application/octet-stream
    # This will need to be changed, e.g. to video/webm, if streaming from Azure storage is required. 

    name = req.params.get('name')
    exten = req.params.get('exten')
    # Param 'insights' will need to be set to '-for-insights' to generate transcript
    return func.HttpResponse(f"{name}.{exten} successfully uploaded.")

