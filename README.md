# Package Ripper

How to use

1. from your repo, run `npm ls --json > {filename}.json` (use `npm` instead of `yarn` here, because the data format is different)
2. run `yarn rip:npm {filename}.json` - this will create `{filename}.csv`
3. run `yarn enhance {filename}.csv` - will updated `{filename}.csv` with `repo` and `license` fields.

Note, you might get rate limited, but if you do, re-run the script after some time, and it should pick up where it left off (WARNING: not thoroughly tested yet!)