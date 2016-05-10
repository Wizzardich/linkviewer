db = db.getSiblingDB('plotsdb')

db.links.remove({ });
db.links.dropIndex({ _id:1 });
db.links.dropIndex({ submitted: 1 });

var links = db.getCollection("links");

var linkBulk = links.initializeUnorderedBulkOp();

linkBulk.insert({ _id: "42", links:[
    "[11:59:42 PM] Oleksandr: http://rossdraws.deviantart.com/art/Reaper-Overwatch-Video-606852718",
    "http://kate-fox.deviantart.com/art/Overwatch-Symmetra-Fanart-606598939",
    "http://alexnegrea.deviantart.com/art/Overwatch-Mercy-Fanart-6s06250936",
    "http://knkl.deviantart.com/art/Pharah-21-days-of-Overwatch-606718095",
    "http://fel03.deviantart.com/art/Fanart-Overwatch-game-496966134",
    "http://fel03.deviantart.com/art/Overwatch-Tracer-X-Widow-495425314",
    "http://www.deviantart.com/art/Overwatch-Fanart-McCree-554686008",
    "http://www.deviantart.com/art/Widowmaker-Overwatch-Fanart-496894351"
], submitted: new Date()});

linkBulk.execute();
links.createIndex( { _id:1 } );
links.createIndex( { submitted: 1 }, { expireAfterSeconds: 432000 } );