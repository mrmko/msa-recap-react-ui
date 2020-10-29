import azure.functions as func

def main(req: func.HttpRequest) -> func.HttpResponse:

        return func.HttpResponse("this is a test name",
             status_code=200
        )
