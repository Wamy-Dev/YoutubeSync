import json, re, os, threading, sys
from datetime import datetime
from time import sleep
from pytube import Playlist, YouTube


def logger(log):
    try:
        logFile = "./download_logs/" + dt[0] + ".log"

        if not os.path.isfile(logFile):
            with open(logFile, "w+") as f:
                f.write(f"""\n
Name: {log["name"]}
Link: {log["pl"]}
Folder: {log["path"]}
Found: {log["found"]}
Downloaded: {log["downloaded"]}
Info: {log["downloaded_info"]}
\n
""")

        else:
            with open(logFile, "a") as f:
                f.write(f"""Name: {log["name"]}
Link: {log["pl"]}
Folder: {log["path"]}
Found: {log["found"]}
Downloaded: {log["downloaded"]}
Info: {log["downloaded_info"]}
\n
""")

    except Exception as e:
        print('Error on line {}'.format(sys.exc_info()[-1].tb_lineno), type(e).__name__, e)



def yt_download(link, type, path, vid_file, stream_id):
    try:
        if type == "mp3":
            # Download Video
            audio = YouTube(link).streams.get_by_itag(stream_id).download(path)           
            os.rename(audio, vid_file)
            print("mp3 file downloaded: ", vid_file)

        if type == "mp4":
            # Download Video
            video = YouTube(link).streams.get_by_itag(stream_id).download(path)
            os.rename(video, vid_file)
            print("mp4 file downloaded: ", vid_file)

    except Exception as e:
        print('Error on line {}'.format(sys.exc_info()[-1].tb_lineno), type(e).__name__, e)



def go(link, type, path, stream_id):
    try:
        # check empty data
        if (link == "") or (type == "") or (path == ""):
            return

        #if the type of the file is not correct
        if not (type == "mp3" or type == "mp4"):
            raise Exception(f"""
            File type not correct! (Playlist "{link}")
            Valid file types are "mp3" or "mp4".
            """)

        # get links from videos in playlist
        pl = Playlist(link)

        # when playlist is empty or private
        if len(pl) == 0:
            raise Exception(f"""
            No videos included in the playlist "{link}"
            Is the playlist set to "Public" or "Unlisted"?
            """)

        # for log
        downloaded_count = 0
        downloaded_info = []

        # check if video has already been downloaded
        for vid in pl:
            vid_title = str(YouTube(vid).title)

            # Not allowed characters in video title
            vid_title = re.sub('[:*/\\\|?"<>]', "", vid_title)

            vid_file = path + "/" + vid_title + "." + type

            # File does not exist, start download
            if not os.path.isfile(vid_file):
                downloaded_count += 1
                downloaded_info.append(vid_title)

                print("File missing: ", vid_title)

                threading.Thread(target=yt_download, args=(vid, type, path, vid_file, stream_id)).start()

        # logging
        if (config["log"] == "true"):
            logger({
                    "pl": link,
                    "name": pl.title,
                    "path": path,
                    "found": len(pl),
                    "downloaded": downloaded_count,
                    "downloaded_info": downloaded_info
                })

    except Exception as e:
        print('Error on line {}'.format(sys.exc_info()[-1].tb_lineno), type(e).__name__, e)



if __name__ == "__main__":
    try:
        # time for log
        dt = str(datetime.now()).replace(" ", "_").split(".")

        # load config
        with open("downloader.json") as c:
            config = json.load(c)
        
        # start check/download
        for pl in config["playlists"]:
            path = "/mnt/share" + pl["folder"]
            threading.Thread(target=go, args=(pl["link"], pl["type"], path, pl["stream_id"])).start()
            sleep(int(config["delay"]))

    except Exception as e:
        print('Error on line {}'.format(sys.exc_info()[-1].tb_lineno), type(e).__name__, e)