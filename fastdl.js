const express = require("express");
const app = express();
let exec = require('child_process')
var fs = require('fs');
var path = require('path');
let settings = require('./settings.json')
var files = require('./files.json')
var mainpath = path.resolve(settings.game_dir)
var dlpath = path.resolve(settings.fastdl_dir)
app.get('/update', async (req, res) => {
    var total = ''
    if (!req.query) return res.sendStatus(403)
    if (!req.query.pass) return res.sendStatus(403)
    if (req.query.pass !== settings.password) return res.sendStatus(403)
    if (req.query.pass == settings.password) {

        var walk = function(dir, done) {
            fs.readdir(dir, function(err, list) {
                if (err) return done(err);
                var results = []
                var i = 0;
                (function next() {
                    var file = list[i++];
                    if (!file) return done(null, results);
                    file = path.resolve(dir, file);
                    fs.stat(file, async function(err, stat) {
                        if (stat && stat.isDirectory()) {
                            try {
                                await fs.mkdirSync(settings.fastdl_dir + '/' + file.slice(mainpath.length + 1));
                            } catch (error) {
                                if (error.errno == -17) console.log(`Skipping existing directory (${error.path})`)
                                else console.error(error);
                            }
                            walk(file, function(err, res) {
                                results = results.concat(res);
                                next();
                            });
                        } else {
                            if (settings.extensions.find(x => x == path.extname(file))) {
                                results.push(file);
                                console.log(`Processing: ${file}`)
                                total += file + '<br/>'
                                if (files.indexOf(file) == -1) {
                                    files.push(file)
                                    await exec.execSync(`bzip2 -ckz "${file}" > "${settings.fastdl_dir+'/'+file.slice(mainpath.length+1)}.bz2"`)
                                }
                            }
                            next();
                        }
                    });
                })();
            });
        };

        walk(settings.game_dir, function(err, results) {
            if (err) throw err;
            fs.writeFileSync('files.json', JSON.stringify(files, null, '\t'));
            return res.send(`Files: ${results.length}<br/>${total}`)
            console.log(`Done! ${results.length} files`)
        });
    }
})

app.use(express.static(settings.fastdl_dir))

app.listen(settings.port, () => {
    console.log(`FastDL server started on port: ${settings.port}`)
})
