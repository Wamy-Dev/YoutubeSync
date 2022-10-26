#!/usr/bin/env node
const express = require('express');
const http = require('http');
const helmet = require("helmet");
const cors = require('cors');
const bodyParser = require('body-parser');
const minify = require('express-minify');
const fs = require('fs');
const path = require("path");
var CronJob = require('cron').CronJob;
const app = express();

let config = JSON.parse(fs.readFileSync("config.json"));

// Server Settings
app.use(helmet());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

// Header
app.use(function (req, res, next) {
  let headers = config["header"];

  for (let [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }

  next();
});

// Minify
if (config["minify"]["enabled"] == "true") {
  app.use(minify({
    cache: config["minify"]["cache"],
    uglifyJsModule: null,
    errorHandler: null,
    jsMatch: /javascript/,
    cssMatch: /css/,
  }));
}

// Server
http.createServer(app).listen(config["server_port"]);



// App data path
app.use('/appdata', express.static(path.join(__dirname, "/public/stuff"), {
  setHeaders: function (res) {
    res.set('Cache-control', 'public, max-age=31536000');
  }
}));



// Send page
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "public/index.html"));
});



// ########## API ##########

// ----- config -----

// get config.json
app.post("/api/config", function (req, res) {
  res.sendFile(path.join(__dirname, "downloader.json"));
});

// get cron job
app.post("/api/config/cron", function (req, res) {
  res.send(config["cron"]);
});

// change cron job
let cron_job;
function change_cron(cron_job) {
  if (cron_job) {
    cron_job.stop();
  }
  cron_job = new CronJob(config["cron"], function () {
    const spawn = require("child_process").spawn;
    const downloader = spawn('python3', ["run.py"]);
  
    console.log("SYNC START");
  
    downloader.stderr.on("data", data => {
      console.error("stderr: ", data.toString());
    });
  
    downloader.stderr.on("end", () => {
      console.log("SYNC END");
    });
  },null, true, 'America/Los_Angeles');
}

// change config.json
app.post("/api/config/change", function (req, res) {
  let key = req.body.key;
  let val = req.body.val;

  if (key == "cron") {
    config["cron"] = val;

    fs.writeFileSync("config.json", JSON.stringify(config));

    // change cron job
    change_cron(cron_job);
  } else {
    let dwnl_config = JSON.parse(fs.readFileSync("downloader.json"));

    if (key == "playlists") {
      dwnl_config["playlists"].push(JSON.parse(val));
    } else {
      dwnl_config[key] = val;
    }

    fs.writeFileSync("downloader.json", JSON.stringify(dwnl_config));
  }

  res.sendStatus(204);
});

// ----- config -----



// ----- playlists -----

// get data from playlist
app.post("/api/playlist/get_data", function (req, res) {
  const spawn = require("child_process").spawn;
  const get_playlist_data = spawn('python3', ["get_playlist_data.py", req.body.playlist]);

  let stderr = "";

  get_playlist_data.stderr.on("data", data => {
    console.log("API: '/api/get_pl_data'");
    console.error("stderr: ", data.toString());
    stderr += data.toString();
  });

  get_playlist_data.stdout.on('data', (data) => {
    res.send(data.toString());
  });

  get_playlist_data.stderr.on("end", () => {
    if (stderr !== "") {
      res.status(500).send(stderr);
    }
  });
});

// remove playlist
app.post("/api/playlist/remove", function (req, res) {
  let dwnl_config = JSON.parse(fs.readFileSync("downloader.json"));
  let playlists = dwnl_config["playlists"];

  const index = playlists.findIndex(pl => {
    return pl.id === req.body.link;
  });

  playlists.splice(index, 1);

  fs.writeFileSync("downloader.json", JSON.stringify(dwnl_config));

  res.sendStatus(204);
});

// start downloader
app.post("/api/playlist/start_download", function (req, res) {
  const spawn = require("child_process").spawn;
  const downloader = spawn('python3', ["run.py"]);

  let stderr = "";

  downloader.stderr.on("data", data => {
    console.log("API: '/api/start'");
    console.error("stderr: ", data.toString());
    stderr += data.toString();
  });

  downloader.stderr.on("end", () => {
    if (stderr !== "") {
      res.status(500).send(stderr);
      return;
    }

    res.sendStatus(204);
  });
});

// ----- playlists -----



// ----- logs -----

// get all logs (only name)
app.post("/api/logs", function (req, res) {
  fs.readdir("download_logs", (err, files) => {
    res.send(files);
  });
});

// get log data
app.post("/api/logs/get", function (req, res) {
  let log = req.body.log;
  let regex = new RegExp(/^([0-9]+(-[0-9]+)+)_[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,3})?\.log$/);

  if (!regex.test(log)) {
    res.sendStatus(403);
    return;
  }

  res.send(fs.readFileSync("download_logs/" + log).toString().replace(/\n/g, "<br><br>").replaceAll("/mnt/share", ""));
});

// ----- logs -----

// ########## API ##########



// 404 error
app.get("*", function (req, res) {
  res.sendStatus(404);
});



// start cron
change_cron(cron_job);