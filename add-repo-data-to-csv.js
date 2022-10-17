import fs from "fs";
import fetch from "node-fetch";

const fileName = process.argv[2];

let rateLimiter = false;

// Read the file
fs.readFile(fileName, "utf8", (err, rawData) => {
  // parse the data from csv
  const [headers, ...data] = rawData.split("\n").map((row) => {
    const [packageName, version, repo, license] = row.split(",");
    return { packageName, version, repo, license };
  });

  // iterate through each row and add repo data to the row if not present
  Promise.all(
    data.map(async (row) => {
      if (row.repo || rateLimiter) {
        console.log(
          "skipping row: ",
          rateLimiter ? "rate limited" : "has repo"
        );
        return row;
      }
      const { packageName, version } = row;
      const packageData = await getRepo(packageName, version);

      // wait 100ms
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (!packageData) {
        rateLimiter = true;
      }

      // add repo and license to row
      const { repo, license } = packageData;
      return { ...row, repo, license };
    })
  ).then((mapped) => {
    // write the csv back, with the new data, and new headers
    const csv = mapped
      .map(({ packageName, version, repo, license }) => {
        return `${packageName},${version},${repo},${license}`;
      })
      .join("\n");

    const csvWithHeader = `packageName,version,repo,license\n${csv}`;

    // write the file
    fs.writeFile(`${fileName}`, csvWithHeader, (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("file written successfully");
    });
  });
});

async function getRepo(packageName, version) {
  console.log("getting repo for: ", packageName, version);
  // call npm API for this package
  const response = await fetch(
    `https://registry.npmjs.org/${packageName}/${version}`
  );

  // if the response is a 429, stop for now
  if (response.status === 429) {
    console.log("429 error, stopping for now");
    return null;
  }

  console.log("got data for ", packageName, version);
  const data = await response.json();
  const repo = data.repository?.url ?? "";
  const license = data.license;

  return { repo, license };
}
