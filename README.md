# FastDL server + BZ2 Archiver
My solution to organizing fastDL on VDS for Source engine games (CS:GO, CS:S and other)

Requirments:
```
Node.JS
Game server and this script on same VDS
Public access to server ip and port
```

Used modules:
```
-Express.JS
```


Installation:
```
1. Configure settings.json
2. Install Express.JS (npm i express)
```
<img src="https://github.com/kolesto65/FastDL-BZ2-Archiver/blob/main/settings_config.png?raw=true" alt="settings.json configuration">

Launch:
```
Start fastdl.js with any process manager you want, you can keep it in background.
```

How to use:
```
After launching script, open in browser http://yourserverip:port/update?pass=yourpassword 
it will start processing your server's /csgo/ directory and creating .bz2 archives for files with desired extensions.
After processing is done, page you opened will give you list of all processed files and their total count, created .bz2 archives will be already
accessible on http://yourserverip:port/example.ext.bz2, so for fastdl address you should use http://yourserverip:port.
```

TODO:
```
1. Add automatic updation if there was any changes in /csgo/ directory
2. Add automatic deletion of .bz2 archives of files that are not present in /csgo/ directory anymore
3. Made a way to add custom files/folders to processing
4. Maybe a little web interface to control and configure entire process.
```
#GOVNOCODE
