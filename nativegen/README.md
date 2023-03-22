# RAGE:MP alt:V native bridge generator

This script takes [natives.json](https://raw.githubusercontent.com/alloc8or/gta5-nativedb-data/master/natives.json), [natives.ts](https://github.com/ragempcommunity/ragemp-types/blob/main/packages/client/natives.d.ts) and RAGE:MP client dump to generate an alt:V bridge API for RAGE:MP natives.

## Usage

- Make sure that `natives.json` and `natives.ts` are in assets folder.
- Make sure that `client_internals.js` is in the repository root.
- Run `npm run start`
- Resulting file is located at `dist/out.js`