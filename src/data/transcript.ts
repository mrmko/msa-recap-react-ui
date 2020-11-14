export { getTranscript };

async function getTranscript(fileName: string): Promise<string> {
  let response = await fetch(
    "https://us-central1-ecm3440.cloudfunctions.net/projectName?fileName=" +
      fileName
  );
  if (!response.ok) {
    throw new Error("No transcript returned");
  }
  console.log(response);
  return await response.text();
}
