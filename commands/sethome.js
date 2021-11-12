const fs = require("fs")

exports.function = function(args)
{

    if (!args[0]) {return console.log("Error: No name given")}
    const homename = args[0];
    var path = args[1];

    if (path == null)
        path = exports.pass.path;
    else if (path.substring(0, 2) == "./")
        path = exports.pass.path + "\"" + path.substring(2);


    if (!fs.existsSync(path))
        return console.log("Path does not exist");

    console.log("Path set to: ")
    console.log(path)

    exports.pass.settings.homes[homename] = path
    return {save: true}
}