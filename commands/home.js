const fs = require("fs")

exports.function = function (args) {
    const home = args[0];
    const path = exports.pass.settings.homes[home || ""]

    if (home == null)
        console.log("No home given")
    else if (path == null)
        console.log("There is not home named \""+home+"\"")
    else if (!fs.existsSync(path)) {
        console.log("Cannot reach path")
        console.log(path)
    } else {
        exports.pass.path = path
    }
}