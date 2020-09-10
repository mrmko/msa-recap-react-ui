import azure.functions as func
from .randomName import randomName

def main(req: func.HttpRequest) -> func.HttpResponse:

        return func.HttpResponse(randomName(),
             status_code=200
        )
