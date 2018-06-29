let alphabet = `
1	2	3	4	5	6	7	8	9	0
q	w	e	r	t	y	u	i	o	p
a	s	d	f	g	h	j	k	l	space
z	x	c	v	b	n	m	-	_	+
`.split("\n").filter(l => l.length > 0).map(l => l.split("\t"));

console.log(alphabet);

module.exports = ({Arg0, Else}, api) => {
    return {
        name: "_keyboard",
        title: "",
        captions: {
            "C": "Delete",
            "D": "Submit"
        },

        data: {
            text: "",
            row: 0,
            column: 0
        },
        start: (data) => {
            api.display("keyboard", data);
            api.sendView("displayChar", alphabet[data.row][data.column]);
            api.sendView("text", data.text);
        },

        events: {
            "BUTTON_UP": [
                [Arg0("A"),
                    [(api, data, event) => {
                        api.popState(null);
                    }]
                ],
                [Arg0("C"),
                    [(api, data, event) => {
                        if (data.text.length > 0) {
                            data.text = data.text.slice(0, -1);
                        }
                        api.sendView("text", data.text);
                    }]
                ],
                [Arg0("D"),
                    [(api, data, event) => {
                        api.popState(data.text);
                    }]
                ],
                [(args) => args === "Z1" || args === "Z2",
                    [(api, data, event) => {
                        var char = alphabet[data.row][data.column];
                        if (char === "space") char = " ";
                        data.text += char;
                        api.sendView("text", data.text);
                    }]
                ]
            ],
            "ROTARY_RIGHT": [
                [Arg0("Z1"), [
                    (api, data, event) => {
                        data.row = (data.row + 1) % alphabet.length;
                        api.sendView("displayChar", alphabet[data.row][data.column]);
                    }
                ]],
                [Arg0("Z2"), [
                    (api, data, event) => {
                        data.column = (data.column + 1) % alphabet[0].length;
                        api.sendView("displayChar", alphabet[data.row][data.column]);
                    }
                ]]
            ],
            "ROTARY_LEFT": [
                [Arg0("Z1"), [
                    (api, data, event) => {
                        data.row = (data.row - 1);
                        if (data.row < 0) data.row = alphabet.length - 1;
                        api.sendView("displayChar", alphabet[data.row][data.column]);
                    }
                ]], [Arg0("Z2"), [
                    (api, data, event) => {
                        data.column = (data.column - 1);
                        if (data.column < 0) data.column = alphabet[0].length - 1;
                        api.sendView("displayChar", alphabet[data.row][data.column]);
                    }
                ]]
            ],
            "TEXT": [
                [Else, [
                    (api, data, {data: text}) => {
                        data.text = text;
                        api.sendView("text", data.text);
                    }
                ]]
            ]
        }
    }
};
