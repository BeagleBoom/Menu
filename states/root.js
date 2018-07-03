module.exports = ({Arg0, Else}, api) => {
    function getIPs() {
        let os = require('os');
        let ifaces = os.networkInterfaces();
        let qr = require('qr-image');

        let ipAdresses = [];
        Object.keys(ifaces).forEach(function (ifname) {
            var alias = 0;

            ifaces[ifname].forEach(function (iface) {
                if ('IPv4' !== iface.family || iface.internal !== false) {
                    // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                    return;
                }
                let url = 'http://' + iface.address + ":8080/remote.html";
                let qr_svg = qr.imageSync(url, {type: 'svg'});

                if (alias >= 1) {
                    // this single interface has multiple ipv4 addresses
                    ipAdresses.push({name: ifname + ':' + alias, address: iface.address, url: url, qr: qr_svg});
                } else {
                    // this interface has only one ipv4 adress
                    ipAdresses.push({name: ifname, address: iface.address, url: url, qr: qr_svg});
                }
                ++alias;
            });
        });
        return ipAdresses;
    }

    const diskspace = require('diskspace');

    return {
        name: "root",
        title: "Start",
        info: "Please choose whether you want to record or search a sample.",
        captions: {
            "A": "Load",
            "B": "Midi",
            "C": "Search",
            "D": "Record"
        },

        data: {
            settings: {},
            ips: [],
            ipIndex: 0,
            internetConnection: false
        },
        resume: (name, returnData, data) => {
            console.log("Resume root from:", name, returnData);
            api.display("root", data);
        },
        start: (data) => {
            function checkInternet() {
                let dns = require('dns');
                dns.lookupService('8.8.8.8', 53, function (err) {
                    let newState = true;
                    if (err) {
                        newState = false;
                    }
                    if (newState != data.internetConnection) {
                        data.internetConnection = newState;
                        api.sendView("INTERNET_CONNECTION", data.internetConnection);
                    }
                });
            }


            setInterval(() => {
                checkInternet();
            }, 1000);

            checkInternet();
            /*api.getSettings().then((tmp) => {
                data.settings = tmp;
            });*/
            data.ips = getIPs();
            api.display("root", data);


            diskspace.check('/dev/volume', function (err, result) {
                console.log(err, result);
                api.sendView("DISK_SPACE", result);
            });
        },

        events: {
            "BUTTON_UP": [
                [Arg0("A"), [
                    (api, data, event) => {
                        api.pushState("load_sample", data);
                    }
                ]],
                [Arg0("C"), [
                    (api, data, event) => {
                        api.pushState("sample_search", data);
                    }
                ]],
                [Arg0("B"), [
                    (api, data, event) => {
                        api.pushState("midi");
                    }
                ]],
                [Arg0("D"), [
                    (api, data, event) => {
                        api.pushState("sample_record", data);
                    }
                ]]
            ],
            "ROTARY_LEFT": [
                [Arg0("Z2"), [
                    (api, data, event) => {
                        data.ipIndex--;
                        if (data.ipIndex < 0) {
                            data.ipIndex = data.ips.length - 1;
                        }
                        api.sendView("SHOW_IP", {
                            "ipIndex": data.ipIndex
                        });
                    }
                ]]
            ],
            "ROTARY_RIGHT": [
                [Arg0("Z2"), [
                    (api, data, event) => {
                        data.ipIndex++;
                        if (data.ipIndex >= data.ips.length) {
                            data.ipIndex = 0;
                        }
                        api.sendView("SHOW_IP", {
                            "ipIndex": data.ipIndex
                        });
                    }
                ]]
            ]
        }
    };
};