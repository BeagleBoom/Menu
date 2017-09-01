module.exports = ({Arg0, Else}) => {
    return {
        name: "sample_search",
        title: "Search Sample",
        data: {},
        resume: (name, returnData) => {
            console.log("Resume sample_search from", name, returnData);
        }, start: (name) => {
            console.log("Starting search")
        },
        events: {}
    };
};