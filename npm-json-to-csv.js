import fs from "fs";

const fileName = process.argv[2];

function getPackageDetails(packages, requiredBy) {
  const mapped = [];
  const names = Object.keys(packages);

  names.forEach((name) => {
    const lib = packages[name];
    const { version, dependencies, devDependencies } = lib;

    mapped.push({ name, version, requiredBy });

    if (dependencies) {
      const nestedPackages = getPackageDetails(
        dependencies,
        `${name}@${version}`
      );
      mapped.push(...nestedPackages);
    }

    if (devDependencies) {
      const nestedPackages = getPackageDetails(
        devDependencies,
        `${name}@${version}`
      );
      mapped.push(...nestedPackages);
    }
  });

  return mapped;
}

// Read the file
fs.readFile(fileName, "utf8", (err, rawData) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = JSON.parse(rawData);
  const topLevelPackages = data.dependencies;

  const mapped = getPackageDetails(topLevelPackages, null);

  // ---
  // write mapped data to csv with same file name as the input json file
  const csv = mapped
    .map(({ name, version, requiredBy }) => {
      return `${name},${version},${requiredBy}`;
    })
    .join("\n");

  // get file name without extension
  const fileNameWithoutExtension = fileName.slice(0, fileName.lastIndexOf("."));

  // add header row to top of csv object
  const csvWithHeader = `packageName,version,requiredBy\n${csv}`;

  fs.writeFile(`${fileNameWithoutExtension}.csv`, csvWithHeader, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("file written successfully");
  });
});
