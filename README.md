# Introduction 
## Beez Marketplace v1.0
Beez mobile app for Android si iOS devices developed with Ionic Framework v5, Angular 9 and Capacitor 2.4.2

# Getting Started
1.	Ionic 5 - Installation process
    - Make sure you have an up-to-date version of Node.js installed on your system. If you don't have Node.js installed, you can install it from [here](https://nodejs.org/en/download/).
    - Open a terminal (Mac) or a command interpreter (cmd, Windows), and install Ionic v5.
    On a Mac, you may have to use sudo depending on your system configuration: 
    `npm install -g @ionic/cli`

2. Project setup
    We need to set up some stuff before starting working on the Beez mobile project.
    - Install all project dependencies:
    `npm install`
    - Install Ionic Lab for preview app in browser
    `npm i @ionic/lab`

# Build and Test
## Run the app in browser 
`ionic lab`

## Build and Run on mobile
1. Build your Ionic app
You must build your Ionic project at least once before adding any native platforms.
    - build testing version
    `ionic build`
    - build production version 
    `ionic build --prod`
This creates the www folder that Capacitor has been automatically configured to use as the webDir in capacitor.config.json.
2. Syncing your app with Capacitor
Every time you perform a build (e.g. ionic build) that changes your web directory (default: www), you'll need to copy those changes down to your native projects:
`npx cap copy`
Note: After making updates to the native portion of the code (such as adding a new plugin), use the sync command:
`npx cap sync`
3. Open project in Android studio or xCode, and run the app in emulator
    - Android: `npx cap open android`
    - iOS: `npx cap open ios`

## Build Status
| __Platform__            | __Dev__    | __Release__ |
|:-----------------------:|:----------:|:-----------:|
| __Android GooglePlay__  | v1.0     | [1.0]() |
| __Android Huawei__      | v1.0     | [1.0]() |
| __iOS__                 | v1.0     | [1.0]() |
