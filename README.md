# Package Ripper

How to use

1. from your repo, run `yarn list --json > {filename}.json`
2. run `node json-to-csv.js {filename}.json` - this will create `{filename}.csv`
3. run `node add-repo-data-to-csv.js {filename}.csv` - will updated `{filename}.csv` with `repo` and `license` fields.

Note, you might get rate limited, but if you do, re-run the script after some time, and it should pick up where it left off (WARNING: not thoroughly tested yet!)