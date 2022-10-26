import sys
from pytube import Playlist

try:
    pl = Playlist(sys.argv[1])

    print({
        "title": pl.title,
        "description": pl.description
    })
except Exception:
    print({
        "title": "ERROR",
        "description": "ERROR"
    })

sys.stdout.flush()