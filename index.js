const fs = require("fs")
const tty = require("tty")
const { stdin, stdout } = require("process")
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const base = "C:\\Users\\vigor10\\Documents\\Node\\GitTools\\"

const settings = JSON.parse(fs.readFileSync(base + "settings.json"))

const consoletools = require("./modules/consoletools.js");

consoletools.pass(readline);

const pass = {
    path: process.cwd(),
    settings: settings,
    consoletools: consoletools,
    readline: readline,
    style: consoletools.style
}

consoletools.pass = pass

const style = pass.style

//Command requiring
const commands = {}
const commanddir = fs.readdirSync(base + "commands")
for (var i = 0; i < commanddir.length; i++) {
    const filename = commanddir[i]
    const c = require(base + "commands\\" + filename)
    c.pass = pass
    commands[filename.substring(0, filename.length - 3)] = c
}

function Question() {
    readline.question(style(pass.path, "green") + "$ ", command)
}

function command(c) {
    var commandargs = c.split(" ")
    if (commands[commandargs[0]]) {
        const request = commands[commandargs[0]].function(commandargs.splice(1)) || {}
        if (!request.async) {
            end()
        }

        if (request.save)
        {
            fs.writeFileSync(base + "settings.json", JSON.stringify(settings))
        }
    } else {
        console.log("Invalid command: \"" + commandargs[0] + "\"")
        end()
    }
}

function end() {
    console.log("");
    Question();
}

pass.end = end

Question();