### A typical top-level directory layout

    .
    ├── build                   # Compiled files (alternatively `dist`)
    ├── app
    │   ├── css
    │   ├── images
    │   ├── screens             # contains screens for getBetter app (welcome screen, mood interface, etc)
    │   ├── screens             # not in used right now
    │   └── index.js            # main file that loads screens
    ├── package.json            # dependencies management
    ├── .gitignore              # keeps untracked files to be ignored by git
    └── README.md               # Documentation files (alternatively `doc`)

### Scripts

Step 1 - To install dependencies:

```
npm install
```

Step 2 - To run the app:

```
npm start
```

FYI:

```
1. Index.js controls which page is to be loaded. Currently it is loading welcome page on start up.
2. Everytime you update something in index.js, you have to restart the app from the terminal.
3. If you change something in html or css, just use ctrl/cmd + R on the app. it will get refreshed.
```

Readme file is still under development - Rahul
