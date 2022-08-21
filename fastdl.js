const express = require("express");
const app = express();
let exec = require('child_process')
var fs = require('fs');
var path = require('path');
let settings = require('./settings.json')
var files = []
var results = []
var done = true
var added = []
var added_text = ''
var files = 0
var mainpath = path.resolve(settings.game_dir)
var dlpath = path.resolve(settings.fastdl_dir)
app.get('/status', async (req, res) => {
    added_text = ''
    if (!req.query) return res.sendStatus(403)
    if (!req.query.pass) return res.sendStatus(403)
    if (req.query.pass !== settings.password) return res.sendStatus(403)
    var added_reverse = added.reverse()
    for (i = 0; i < added_reverse.length; i++) {
        added_text += added_reverse[i].text
    }
    return res.send(`<script>
  var done = ${done}
  var refresh = setTimeout("location.reload(true);", 3000);
  if(done) clearTimeout(refresh)
</script>
${done ? `<a href="/update?pass=${settings.password}">
   <button>Update again</button>
</a>
<br/>
Done!
<br/>` : ``}
Total: ${files} Added: ${added.length}<br/>${added_text}`)
})
app.get('/update', async (req, res) => {
    await res.redirect(`/status?pass=${settings.password}`);
    done = false
    added = []
    files = 0
    if (!req.query) return res.sendStatus(403)
    if (!req.query.pass) return res.sendStatus(403)
    if (req.query.pass !== settings.password) return res.sendStatus(403)

    var walk = function(dir, done) {
        fs.readdir(dir, function(err, list) {
            if (err) return done(err);
            results = []
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
                            if (!fs.existsSync(`${settings.fastdl_dir+'/'+file.slice(mainpath.length+1)}.bz2`)) {
                                added.push({
                                    text: `${file}<br/>`
                                })
                                files += 1
                                await exec.execSync(`bzip2 -ckz "${file}" > "${settings.fastdl_dir+'/'+file.slice(mainpath.length+1)}.bz2"`)
                            } else {
                                files += 1
                                console.log(`Skipping existing file (${settings.fastdl_dir+'/'+file.slice(mainpath.length+1)}.bz2)`)
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
        console.log(`Done!
New: ${added.length}
Total: ${files}`)
        done = true
    });
})

app.use(express.static(settings.fastdl_dir))

app.listen(settings.port, () => {
    console.log(`FastDL server started on port: ${settings.port}`)
})
