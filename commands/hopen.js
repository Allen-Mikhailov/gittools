const fs = require("fs");
const { stdout, stdin } = require("process");
const { style } = require("../modules/consoletools");
const Buffer = require("buffer").Buffer;

const hexkeys = "0123456789abcdef";
const boundingoptions = ["[Exit]", "[Save/Exit]", "[Next Block]", "[Preivous Block]"];

function inttohex(int) {
    return hexkeys[Math.floor(int / 16)] + hexkeys[int % 16];
}

function hextoint(hex) {
    return hexkeys.indexOf(hex[1]) + hexkeys.indexOf(hex[0]) * 16;
}

function hextobinary(hex) {
    var point = 128;
    var binary = ""
    for (var i = 0; i < 8; i++) {
        if (Math.floor(hex / point) == 1) {
            binary += "1";
            hex -= point;
        } else {
            binary += "0";
        }
        point /= 2;
    }
    return binary;
}

function command(args) {
    const EditLine = exports.pass.consoletools.EditLine

    const file = args[0]

    if (!file) { return console.log("No file to open specified") };

    if (!fs.existsSync(exports.pass.path + "\\" + file)) { return console.log("File does not exist"); }

    const filedata = fs.readFileSync(exports.pass.path + "\\" + file);

    const ttysize = stdout.getWindowSize();
    const HexPerRow = Math.floor(ttysize[0] / 3);

    const values = [];
    const linecount = Math.ceil(filedata.length / HexPerRow);;
    const blocks = Math.ceil(linecount / (ttysize[1] - 2));
    const blocksize = ttysize[1] - 2;

    var currentblock = 0;

    for (var i = 0; i < Math.ceil(filedata.length / HexPerRow); i++) {
        values[i] = [];
        const start = i * HexPerRow;
        for (var j = 0; j < Math.min(filedata.length - i * HexPerRow, HexPerRow); j++) {
            values[i][j] = inttohex(filedata[start + j]);
        }
    }

    var x = 0;
    var y = 0;
    var lastline = -1;
    var pos = 0;

    function linesize(cy) {
        if (cy == 0 || cy == blocksize + 1) {
            return 3;
        } else {
            return (values[blocksize * currentblock + cy - 1] || "").length;
        }
    }

    function GenerateLine(ly) {
        if (ly == 0 || ly == blocksize + 1) {
            var line = "Block " + (currentblock + 1) + "/" + blocks + ": ";
            for (var i = 0; i < boundingoptions.length; i++) {
                if (x == i && y == ly) {
                    line += style(boundingoptions[i], 7) + " ";
                } else {
                    line += boundingoptions[i] + " ";
                }
            }
            return line;
        } else {
            const vy = ly + blocksize * currentblock - 1;
            const linedata = values[vy] || [];
            var line = ""
            for (var i = 0; i < linedata.length; i++) {
                if (x == i && y == ly)
                    line += exports.pass.style(linedata[i], 7) + " ";
                else
                    line += linedata[i] + " ";
            }
            return line;
        }
    }

    function UpdateBlock() {
        stdout.cursorTo(0, 0);

        if (blocksize > values.length - currentblock * blocksize) {
            lastline = values.length - currentblock * blocksize + 1;
        } else {
            lastline = -1;
        }

        for (var i = 0; i < blocksize + 1; i++) {
            EditLine(GenerateLine(i));
            stdout.moveCursor(0, 1);
        }
        EditLine(GenerateLine(blocksize + 1));

        stdout.cursorTo(0, y);
    }

    for (var i = 0; i < ttysize[1] - 1; i++) {
        console.log();
    }

    for (var i = 0; i < values.length; i++) {
        var line = "";
        for (var j = 0; j < values[i].length; j++)
            line += values[i][j] + " ";
    }

    function listen(str, key) {
        key = key || {};
        switch (key.name) {
            case "right":
                if (x != linesize(y) - 1) {
                    x++;
                    pos = 0;
                }

                break;
            case "left":
                if (x != 0) {
                    x--;
                    pos = 0;
                }

                break;
            case "up":
                if (y != 0) {
                    y--;
                    if (lastline != -1 && y > lastline) {
                        y = lastline - 1
                    }

                    x = Math.min(x, linesize(y) - 1)
                    pos = 0;
                }
                break
            case "down":
                if (y != blocksize + 1)// && y != values.length-blocksize*currentblock)
                {
                    y++;
                    if (lastline != -1 && y == lastline) {
                        y = blocksize + 1
                    }
                    x = Math.min(x, linesize(y) - 1)
                    pos = 0;
                }
                break
            case "return":
                stdout.moveCursor(0, -1)
                if (y == 0 || y == ttysize[1] - 1) {
                    if (x == 0)
                    {
                        //Ending
                        stdout.cursorTo(0, ttysize[1])
                        console.log()
                        exports.pass.end()
                        return;
                    } else if (x == 1) {
                        //Save and Exit
                        //Saving
                        var hexstring = "";
                        var size = 0;
                        for (var i = 0; i < values.length; i++) {
                            for (var j = 0; j < values[i].length; j++) {
                                hexstring += values[i][j];
                                size++;
                            }
                        }

                        const buf = Buffer.alloc(size, hexstring, "hex")
                        fs.writeFileSync(exports.pass.path + "\\" + file, buf);

                        stdin.removeListener("keypress", listen)

                        //Ending
                        stdout.cursorTo(0, ttysize[1])
                        console.log()
                        exports.pass.end()
                        return;

                    } else if (x == 2) {
                        //Next Block

                        if (currentblock != blocks - 1) {
                            currentblock++;
                            pos = 0;
                        }
                    } else {
                        //Last block

                        if (currentblock != 0) {
                            currentblock--;
                            pos = 0;
                        }
                    }
                } else {

                }

                break;
            default:
                if (hexkeys.indexOf(key.name) != -1) {
                    if (pos == 0) {
                        values[currentblock * blocksize + y - 1][x] = key.name + values[currentblock * blocksize + y - 1][x][1]
                    } else {
                        values[currentblock * blocksize + y - 1][x] = values[currentblock * blocksize + y - 1][x][0] + key.name
                    }
                    pos = (pos + 1) % 2;
                }
        }
        UpdateBlock();
    }

    stdin.on("keypress", listen)
    UpdateBlock()

    return { async: true }
}

exports.function = command