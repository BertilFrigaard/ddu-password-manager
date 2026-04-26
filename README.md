# DDU Password Manager

## About

Created in relation to our exam project in Digital Design and Development (Digitalt Design og Udvikling)

## The structure

The app is divided into

- Backend
- Frontend (Chrome Extension)

which live in their respective folders

- /backend
- /chrome-extension

## Design

### Frontend (Chrome Extension)

**services**
Services should be used to interact with the backend.
Services should save fetched data directly to store, and thus not return any data to the function caller.
Services should always throw Error if fetch didn't succed or data can't be read
Services should always log errors with console.error before throwing

**contexts**
Contexts should be used as a interface for information lookup
Thus contexts should expose only readable values and one refresh function
The refresh function should not refetch data, but only ensure contexts are up to date with store

## Commands

These are the defined npm commands for each sub-project

### Backend

**npm run dev** for running the typescript src directly
**npm run build** build the typescript src to js which is placed in _/backend/build_
**npm run start** run the build js src code

### Frontend (Chrome Extension)

**npm run build** build the typescript src to js which is placed in _/chrome-extension/dist_
