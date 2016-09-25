$(document).ready(function() {

    /** ================== CONSTANTS ================== **/

    var re_weburl = new RegExp("(https?:\/\/[^\\s]+)", "i");

    const linkmap = {
        ".*deviantart.com.*":
            function(str) {
                var oembed = "https://backend.deviantart.com/oembed?url=";
                $.getJSON( oembed + str + "&format=jsonp&callback=?", linkmediator(str));
            },
        ".*":
            function(str) {
                var img = new Image();
                img.src = str;
                $(img).one('load',function(){
                    var data = {}
                    data.thumbnail_width = 300;
                    data.thumbnail_height = img.height * (300 / img.width);
                    data.thumbnail_url = str;
                    data.url = str;
                    data.width = img.width;
                    data.height = img.height;
                    data.title = str;
                    add(data, str);
                });
            }
    }

    const sizes = [
        { columns: 2, gutter: 10 },
        { mq: '768px', columns: 3, gutter: 10 },
        { mq: '1600px', columns: 4, gutter: 15 }
    ];


    function openNewBackgroundTab(url){
        var a = document.createElement("a");
        a.href = url;
        var evt = new MouseEvent("click", {
            ctrlKey: true,
            view: window
        });
        a.dispatchEvent(evt);
    }

    var instance;
    var unpacked = true;
    var inProgress = 0;
    var container = $("#container");
    var starter = $("#starter");
    var link_container = $('#links');

    /** ================== BRICKS INITIALIZATION ================== **/

    instance = Bricks({
      container: '#container',
      packed:    'data-packed',        // if not prefixed with 'data-', it will be added
      sizes:     sizes
    });


    instance
      .on('pack',   () => console.log('ALL grid items packed.'))
      .on('update', () => console.log('NEW grid items packed.'))
      .on('resize', size => console.log('The grid has be re-packed to accommodate a new BREAKPOINT.'))


    document.addEventListener('DOMContentLoaded', event => {
     instance
        .resize()     // bind resize handler
        .pack()       // pack initial items
    })

    /** ================== LISTENERS ================== **/

    $("#starter").click(function() {
        if (inProgress) return;
        container.empty();
        container.removeData();

        var lines = link_container.val().split('\n');
        for(var i = 0; i < lines.length; i++){
            var line = re_weburl.exec(lines[i]);
            if (line) {
                line = line[0];
                for (key in linkmap) {
                    var re = RegExp(key);
                    if (re.test(line)) {
                        inProgress++;
                        linkmap[key](line);
                        break;
                    }
                }
            }
        }
    });

    $("#saver").click(function() {
        var data = {};
        data.links = link_container.val().split('\n');
        $.ajax({
            url: "/link-viewer/rest/store",
            type: "POST",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        }).done(function(dat) {
            var text = window.location.protocol + "//" +
                window.location.hostname +
                window.location.pathname + "?id=" + dat;
            $("#permalink").text(text).attr("href", text);
            $("#permalink-container").slideDown();
        }).fail(function() {
            $.notify("Failed to apply changes", {
                position: "top center",
                className: "error"
            })
        });
    });

    /** ================== PARSE PARAMETERS ================== **/

    var id = getUrlParameter('id');
    if (id) {
        $.get("/link-viewer/rest/links/" + id, function(data) {
                link_container.val(data.join("\n"));
                starter.trigger("click");
            })
            .fail(function () {
                $.notify("Failed to retrieve links", {
                    position: "top center",
                    className: "error"
                })
            });
    }

    /** ================== UTILITY FUNCTIONS ================== **/

    function getUrlParameter(sParam) {
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
    };

    function linkmediator(link) {
        return function(data) {
            add(data, link)
        }
    }

    function add(data, str) {

        /* ========== DOM manipulations ========== */
        var linkspan = $("<span>"+str+"</span>").addClass('link-info')
            .data(data);
        var imgsrc = $('<img>').addClass('freewall_thumbnail')
            .attr('src', data.thumbnail_url)
            .attr('height', data.thumbnail_height)
            .attr('width', data.thumbnail_width);

        var div = $("<div></div>").addClass('cell').append(linkspan).append(imgsrc);

        container.append(div);
        inProgress--;

        linkspan.data("index", $("#container .cell").index(div));

        /* ========== PhotoSwipe Init Listener ========== */
        $(".freewall_thumbnail").off("click").on("click", function(){
            var pswpElement = document.querySelectorAll('.pswp')[0];

            // build items array
            var items = [];
            $(".link-info").each(function() {
                var picdata = {
                    i: $(this).data("index"),
                    src: $(this).data("url"),
                    w: $(this).data("width"),
                    h: $(this).data("height"),
                    author: '<a href='+$(this).data("author_url")+'>'+$(this).data("author_name")+'</a>',
                    title: '<a href='+$(this).text()+' class="caption" >'+$(this).data("title")+'</a>'
                };


                items.push(picdata);
            });

            items.sort(function(a,b) {
                return a.i - b.i;
            });

            // define options (if needed)
            var options = {
                index: $(this).parent().index()
            };

            // Initializes and opens PhotoSwipe
            var gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
            gallery.init();

            $( pswpElement ).keydown( function(evt) {
                if (evt.keyCode == 32) {
                    var url = $(this).find(".caption:eq(1)").attr('href');
                    window.open(url, "_blank")
                }
            });
        });

	instance.pack();
        $( imgsrc ).imagesLoaded().always( function () {
            instance.pack();
        })
    }
});
