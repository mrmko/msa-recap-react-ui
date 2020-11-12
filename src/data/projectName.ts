export { projectName };

async function projectName(): Promise<string> {
  let response = await fetch("api/projectName");
  if (!response.ok) {
    throw new Error("No project name returned");
  }
  return await response.text();
}
