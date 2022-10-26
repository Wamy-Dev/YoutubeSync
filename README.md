# YTD

With this small script you can sync your Youtube playlists locally (download videos and save them either as mp3 or mp4)

Only missing videos are downloaded

With multithreading


### Docker

https://hub.docker.com/r/pickl3s/ytsync



### config.json

**paths must be absolute, under windows use `/` instead of `\`, no slash at the end**

`log` enable/disable log

`log_path` location for log files (A new file is created for each run, with date and time as name)

`delay` Timeout between playlists

`playlists` Here you can specify multiple playlist

`link` Link from the playlist

`type` As which file should be saved (mp3 or mp4)

`path` Path where to save

`stream_id` Stream with which to download (https://pytube.io/en/latest/user/streams.html)

For example:

```json
{   
    "log": "true",
    "log_path": "/home/pickles/ytd/log",

    "delay": 10,

    "playlists": [
        {
            "link": "https://www.youtube.com/playlist?list=YOURPLAYLISTLINK",
            "type": "mp3",
            "path": "/home/pickles/music",
            "stream_id": 140
        },
        {
            "link": "https://www.youtube.com/playlist?list=YOURPLAYLISTLINK",
            "type": "mp4",
            "path": "/home/pickles/videos",
            "stream_id": 22
        }
    ]
}
```
