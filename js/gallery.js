function initialize() {
   $("#container").html("");
   var lines = $('#links').val().split('\n');
   //var oembed = "http://backend.deviantart.com/oembed?url=";
   for(var i = 0;i < lines.length;i++){
      //$.getJSON( oembed + lines[i] + "&format=jsonp&callback=?", linkmediator(lines[i]));
      for (key in linkmap) {
         var re = RegExp(key)
         if (re.test(lines[i])) {
            linkmap[key](lines[i]);
         }
      }
   }
}

const linkmap = {
   ".*deviantart.com.*": 
      function(str) {
         var oembed = "http://backend.deviantart.com/oembed?url=";
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
            data.title = img;
            add(data, str);
         });
      }
}

// define your grid at different breakpoints, mobile first (smallest to largest)

const sizes = [
{ columns: 2, gutter: 10 },                   // assumed to be mobile, because of the missing mq property
{ mq: '768px', columns: 3, gutter: 25 },
{ mq: '1024px', columns: 4, gutter: 50 }
];

// create an instance

var instance;
var flag = false;

$(document).ready(function() {

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

});

function linkmediator(link) {
   return function(data) {
      add(data, link)
   }
}

function add(data, str) {

   /* ========== DOM manipulations ==========*/
   var linkspan = $("<span>"+str+"</span>").addClass('link-info')
      .data(data);
   var imgsrc = $('<img>').addClass('freewall_thumbnail')
      .attr('src', data.thumbnail_url)
      .attr('height', data.thumbnail_height)
      .attr('width', data.thumbnail_width);

   var div = $("<div></div>").addClass('cell').append(linkspan).append(imgsrc);

   $("#container").append(div);

   linkspan.data("index", $("#container .cell").index(div));

   /* ========== PhotoSwipe Init Listener==========*/
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
            title: '<a href='+$(this).text()+'>'+$(this).data("title")+'</a>'
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

   });

   instance.pack();
}

