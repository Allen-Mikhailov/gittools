const fs = require("fs");
const { stdin, stdout } = require("process");

function NormalizePath(path) {

    var pathargs = path.split("\\")

    //Dealing with ".."
    var backs = 0
    while (pathargs.indexOf("..") != -1) {
        pathargs.splice(pathargs.indexOf(".."), 1)
        backs++;
    }

    for (var i = 0; i < backs; i++) {
        pathargs.splice(pathargs.length - 1, 1)
    }

    //Dealing with "."
    while (pathargs.indexOf(".") != -1) {
        pathargs.splice(pathargs.indexOf("."), 1)
    }

    //Peicing pathargs back together
    path = pathargs[0];
    for (var i = 1; i < pathargs.length; i++) {
        path += "\\" + pathargs[i];
    }

    return path;
}

function onlydirs(files) {
    var newfiles = []
    for (var i = 0; i < files.length; i++) 
        if (files[i].isDirectory()) 
            newfiles[newfiles.length] = files[i].name;
    return newfiles
}

exports.function = function (args) {
    var path = exports.pass.path;
    const newpath = args[0]
    if (!newpath) { return console.log(path) }

    if (newpath == "??") {
        exports.pass.consoletools.Options((newpath) => {
            exports.pass.path = path + "\\" + newpath
            console.log(newpath)
            exports.pass.end();
        }, onlydirs(fs.readdirSync(path, { withFileTypes: true })))
        return { async: true }
    } else {
        path += "\\" + newpath

        path = NormalizePath(path)

        if (fs.existsSync(path)) {
            exports.pass.path = path
        } else {
            console.log("That path does not exist")
        }
    }
}