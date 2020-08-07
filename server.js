//dependencies
var express = require('express');
var app = express();

const host_adress = "localhost:8081"

//static files, css, js, html
// TODO best practice for js css html node/backend file structure
// BTW, how to serve images: https://stackoverflow.com/questions/5823722/how-to-serve-an-image-using-nodejs
app.use(express.static('static')); //both works? cool, leaving for as example
app.use( express.static( __dirname + '/frontend' ));

//endpoints
app.get('/', function (req, res) {
   res.sendFile( __dirname + "/frontend/anasayfa.html" );
})

app.post('/imageurls', function (req, res) { // TODO better url name?
    let response_json = req.json()
    let video_id = response_json["video_id"]; // .video_id or ["video_id"] ?
   	let fs = require('fs');
	let file_urls = fs.readdirSync('./static/images/'+video_id.toString()+'/').sort().map(img_name => host_adress+"/"+img_name); //well, + is weird best practice but they say it has less "error cases", but i think concat() calling toString is better?
	res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ names: file_urls }));
})




//run the server
var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})