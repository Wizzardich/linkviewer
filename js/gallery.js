function initialize() {
   $("#container").html("");
   var lines = $('#links').val().split('\n');
   var oembed = "http://backend.deviantart.com/oembed?url=";
   for(var i = 0;i < lines.length;i++){
      $.getJSON( oembed + lines[i] + "&format=jsonp&callback=?", linkmediator(lines[i]));
   }
}

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

   /* ========== Freewall update ==========*/
   var wall = new Freewall("#container");
   wall.reset({
      selector: '.cell',
      animate: true,
      cellW: 300,
      cellH: 10,
      gutterX: 50,
      gutterY: 10,
      onResize: function() {
         wall.fitWidth();
      }
   });

   wall.fitWidth();
   // for scroll bar appear;
   $(window).trigger("resize");

}

