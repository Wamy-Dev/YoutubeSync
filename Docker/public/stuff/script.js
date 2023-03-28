function get_playlist_data(link, cb) {
    $.post("/api/playlist/get_data",
        {
            "playlist": link
        },
        function (res) {
            return cb(JSON.parse(res.replace(/'/g, '"')));
        });
}

function display_playlists(data) {
    data.forEach(function (pl, num) {
        let link = pl["link"];
        let type = pl["type"];
        let folder = pl["folder"];
        let stream_id = pl["stream_id"];

        get_playlist_data(link, function (pl_data) {
            let title = pl_data["title"];
            let description = pl_data["description"];

            let err_class = "";

            if (title == "ERROR" || description == "ERROR") {
                err_class = "pytube_error";
            }

            $("playlists").append(`
            <pl>
                <delete_playlist_btn pl-link="${link}" title="Delete Playlist"></delete_playlist_btn>

                <pl_type class="pl_type_${type}"></pl_type>
                <a class="playlist_title ${err_class}">${title}</a>
                
                <a class="playlist_description ${err_class}">${description}</a>

                <a class="pl_link" href="${link}" target="_blank">${link}</a>

                <table class="pl_folder_pl_stream">
                    <tr>
                        <th>Folder</th>
                        <th>Stream</th>
                    </tr>
                    <tr>
                        <td>${folder}</td>
                        <td>${stream_id}</td>
                    </tr>
                </table> 
            </pl>
            `);

            num += 1;
            if (num == data.length) {
                $("playlists").find("loader").remove();
            }
        });
    });
}

function get_config() {
    $.post("/api/config/cron", function (res) {
        $("#cron").val(res);
    });

    $.post("/api/config", function (res) {
        // logging en/disabled
        if (res["log"] == "true") {
            $(".log_status").addClass("log_enabled");
            $('#en_dis_log').prop('checked', true);
        } else {
            $(".log_status").addClass("log_disabled");
        }

        // Display delay
        $("#delay_time").val(res["delay"]);

        // Display playlist count
        $("pl_count_num").html(res["playlists"].length);

        if (res["playlists"].length == 0) {
            $("playlists").find("loader").remove();
        } else {
            display_playlists(res["playlists"]);
        }
    });
}

function get_logs() {
    $.post("/api/logs", function (res) {
        res.reverse();

        res.forEach(file => {
            let name = file.replace("_", " ").split(".");

            $("#log_select").append(new Option(name[0], file));

            $("#log_select").trigger("change");
        });
    });
}



function change_config(key, val) {
    $.post("/api/config/change",
        {
            "key": key,
            "val": val
        },
        function () {
            if (key == "playlists") {
                get_config();
            }
        });
}

$("info_wrp").change(function (e) {
    let target = e.target.id;
    let val = $("#" + target).val();

    let key = "";

    if (val == "") {
        return;
    }

    if (target == "delay_time") {
        key = "delay";
    } else {
        key = "cron";
    }

    change_config(key, val);
});


// ----- log -----

$("log_wrp").click(function () {
    $("log").fadeIn(100);
});

$('#en_dis_log').change(function () {
    let status = $(this).is(":checked");

    if (status) {
        $(".log_status").removeClass("log_disabled").addClass("log_enabled");
    } else {
        $(".log_status").removeClass("log_enabled").addClass("log_disabled");
    }

    change_config("log", status)
});

$('#log_select').change(function () {
    $("log_insrt").html("");

    $.post("/api/logs/get",
        {
            "log": $(this).val()
        },
        function (res) {
            $("log_insrt").html(res);
        });
});

$("exit_log").click(function () {
    $("log").fadeOut(100);
});

// ----- log -----



// ----- new playlist -----

$("add_pl_open_btn").click(function () {
    $("add_playlist_wrp").fadeIn(100);
});

$("#add_playlist_type").change(function () {
    if ($(this).val() == "mp4") {
        $("#add_playlist_stream_id").val(22);
    } else {
        $("#add_playlist_stream_id").val(140);
    }
});

$("add_playlist_btn").click(function () {
    let link = $("#add_playlist_link").val();
    let folder = $("#add_playlist_folder").val();
    let type = $("#add_playlist_type").val();
    let stream_id = $("#add_playlist_stream_id").val();

    if (link == "" ||
        folder == "" ||
        type == "" ||
        stream_id == "") {
        return;
    }

    let config_val = {
        "link": link,
        "type": type,
        "folder": folder,
        "stream_id": stream_id
    }

    change_config("playlists", JSON.stringify(config_val));

    $("#add_playlist_link").val("");
    $("#add_playlist_folder").val("");

    $("playlists").html(`
        <loader>
            <div class='loader'>
                <div class='circle'></div>
                <div class='circle'></div>
                <div class='circle'></div>
                <div class='circle'></div>
                <div class='circle'></div>
            </div>
        </loader>
    `);

    $("add_playlist_exit").trigger("click");
});

$("add_playlist_exit").click(function () {
    $("add_playlist_wrp").fadeOut(100);
});

// ----- new playlist -----



// delete playlist
$(document).on("click", "delete_playlist_btn", function() {
    $("playlists").html(`
        <loader>
            <div class='loader'>
                <div class='circle'></div>
                <div class='circle'></div>
                <div class='circle'></div>
                <div class='circle'></div>
                <div class='circle'></div>
            </div>
        </loader>
    `);

    $.post("/api/playlist/remove",
    {
        "link": $(this).attr("pl-link")
    },
    function () {
        get_config();
    });
});




$(document).ready(function () {
    get_config();
    get_logs();
});

$(window).on("load", function () {
    $("preloader").fadeOut(100);
});