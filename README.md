# YoutubeSync

*This is a fork originally from https://github.com/PugPickles/YTD. I have no idea why they removed this, but it was something I was looking for my own server so I found the GitHub and reverted their changes where they deleted the entire docker folder.*

YoutubeSync allows you to easily sync your Youtube playlists locally. They download and save them either as MP3 or MP4 for easy use for Plex or Jellyfin. 

It only downloads the missing downloads (unless it is the first run of course, then it downloads the entire playlist). Super fast using multithreading.

# Docker
Available at https://hub.docker.com/r/davidisadev/youtubesync

```
docker run \
-p 8080:8080 \
-v </downloads/folder>:/downloads \
davidisadev/youtubesync:latest
```

# Config.json

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
    "log_path": "/home/wamy/ytd/log",
    "delay": 10,
    "playlists": [
        {
            "link": "https://www.youtube.com/playlist?list=YOURPLAYLISTLINK",
            "type": "mp3",
            "path": "/home/wamy/music",
            "stream_id": 140
        },
        {
            "link": "https://www.youtube.com/playlist?list=YOURPLAYLISTLINK",
            "type": "mp4",
            "path": "/home/wamy/videos",
            "stream_id": 22
        }
    ]
}
```
