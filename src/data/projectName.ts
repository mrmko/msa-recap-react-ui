export { projectName };

async function projectName(): Promise<string> {
  let response = await fetch(
    "https://us-central1-ecm3440.cloudfunctions.net/projectName"
  );
  if (!response.ok) {
    throw new Error("No project name returned");
  }
  console.log(response);
  return await response.text();
}
