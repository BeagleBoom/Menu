# ![alt text](docs/menu_logo.png "BeagleBoom Menu")

# About this repository
This repository is part of the [BeagleBoom](https://github.com/beagleboom)-Sampler project developed by the academic working group "[Creative Technologies AG](http://www.creative-technologies.de/)" (ctag) at the [University of Applied Sciences Kiel](https://www.fh-kiel.de/).

# What is it used for?
![docs/screenshot.png](docs/screenshot.png)

![docs/BeagleMenuDemo.gif](docs/BeagleMenuDemo.gif)

This repository is the Browser frontend for the BeagleBoom project. 

# Prerequirements
- NodeJS >= 10
    - Yarn (`npm install -g yarn`)
    - PM2 (`npm install pm2`)
- FFmpeg
- mplayer

# Installation
If all requirements are met, just run
```
yarn install
```

# Usage
Start the menu with `pm2 start index.js -- 1`