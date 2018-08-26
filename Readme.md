# ![alt text](docs/menu_logo.png "BeagleBoom Menu")
![docs/screenshot.png](docs/screenshot.png) ![docs/BeagleMenuDemo.gif](docs/BeagleMenuDemo.gif)

This repository is the frontend and main logic for the BeagleBoom project. 
Because of the browser based frontend, the beagle boom supports smartphones and computers as additional screens and remote controls.

# Running it
## Prerequirements
- NodeJS >= 10
    - Yarn (`npm install -g yarn`)
    - PM2 (`npm install pm2`)
- FFmpeg
- mplayer

## Installation
If all requirements are met, just run
```
yarn install
```

## Start
Start the menu with `pm2 start index.js -- 1`

# Remote Screen and Control
By default, a webserver is started on port `8080` and two pages are exposed.

- http://[BEAGLE_BOOM_IP]:8080/index.html => A non interactable rendering of the screen. Used internally by the BeagleBoom on the LCD.
- http://[BEAGLE_BOOM_IP]:8080/remote.html => The screen in conjunction with all rotary encoders and buttons (in form of html buttons). Additionaly a textbox is present for fast text input.

# Creating custom states
[See the wiki.](https://github.com/BeagleBoom/Menu/wiki/States)
# Use new events
The BeagleQueue library is not used directly and events added to it have to be added to the Menu as well. This can either be done by adding the event name at the same position as in the enum in the file [lib/QueueEventEnum.js](lib/QueueEventEnum.js) or by automatic generation. The generation is done by the script `node src/EventTypes`. The script will parse the C++ enum and output the code which can be put into the [lib/QueueEventEnum.js](lib/QueueEventEnum.js) file.

# About this repository
This repository is part of the [BeagleBoom](https://github.com/beagleboom)-Sampler project developed by the academic working group "[Creative Technologies AG](http://www.creative-technologies.de/)" (ctag) at the [University of Applied Sciences Kiel](https://www.fh-kiel.de/).

# License
The content and source code of this project itself is licensed under the [Creative Commons Attribution 4.0 International license](https://creativecommons.org/licenses/by/4.0/).