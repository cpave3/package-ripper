import fs from "fs";

const fileName = process.argv[2];

// Read the file
fs.readFile(fileName, "utf8", (err, rawData) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = JSON.parse(rawData);
  const topLevelPackages = data.data.trees;

  console.log("top level packages: ", topLevelPackages);

  const mapped = topLevelPackages.map(({ name }) => {
    // get last index of @
    const lastAt = name.lastIndexOf("@");
    const packageName = name.slice(0, lastAt);
    const version = name.slice(lastAt + 1);
    return { packageName, version };
  });

  console.log("mapped: ", mapped);

  // write mapped data to csv with same file name as the input json file
  const csv = mapped
    .map(({ packageName, version }) => {
      return `${packageName},${version}`;
    })
    .join("\n");

  // get file name without extension
  const fileNameWithoutExtension = fileName.slice(0, fileName.lastIndexOf("."));

  // add header row to top of csv object
  const csvWithHeader = `packageName,version\n${csv}`;

  fs.writeFile(`${fileNameWithoutExtension}.csv`, csvWithHeader, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("file written successfully");
  });
});
