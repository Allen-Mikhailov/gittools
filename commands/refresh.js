const { exec } = require("child_process");

function callback(error, stdout, stderr)
{
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(stdout);
}

exports.function = function(args)
{
    exec("gittools", callback)
    // process.exit();
}
