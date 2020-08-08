//dependencies
//const sharp = require('sharp');
//const imageToSlices = require('image-to-slices');
/*
imageToSlices.configure({
    clipperOptions: {
        canvas: require('canvas')
    }
});
 */
//const path = require('path');
//const fs = require('fs');
const express = require('express');
//const cors = require('cors');
const app = express();


//app.use(cors())


const host_adress = "http://localhost:8081"
//const videos_root = "./static/images/"
//static files, css, js, html
// TODO best practice for js css html node/backend file structure
// BTW, how to serve images: https://stackoverflow.com/questions/5823722/how-to-serve-an-image-using-nodejs
app.use(express.static('static')); //both works? cool, leaving for as example
app.use(express.static(__dirname + '/frontend'));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
//endpoints
app.get('/', function (req, res) {
    res.sendFile(__dirname + "/frontend/home.html");
})
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
// this could have been post and not take id in url, but given the nature of the assignment i prefered this for clean code over security.
//example usage for post, just in case
//let response_json = req.json()
// let video_id = response_json["video_id"]; // .video_id or ["video_id"] ?
app.get('/videos/urls/:video_id', function (req, res) { // TODO better url name?
    let video_id = req.params.video_id
    let fs = require('fs');
    let file_urls = fs.readdirSync('./static/images/' + video_id.toString() + '/').sort()
        .map(img_name => host_adress + "/images/" +video_id+"/"+ img_name); //well, + is weird best practice but they say it has less "error cases", but i think concat() calling toString is better?
    //above TODO bad join
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({urls: file_urls}));
})


/*
class VideosManager {

    get_image_path(video_id, image_id) {
        let image_name = fs.readdirSync('./static/images/' + video_id.toString() + '/').sort()[image_id]
        let image_path = path.join(videos_root, video_id.toString(), image_name.toString())
        return image_path;
    }

    async get_frames_async(video_id, image_id) {
        let lineXArray = Array.from({length: 5 - 1}, (x, i) => (i + 1) * 640 / 5);
        //TODO write here by hand
        let lineYArray = Array.from({length: 5 - 1}, (x, i) => (i + 1) * 360 / 5);
        let source = this.get_image_path(video_id, image_id);
        source = "C:\\Users\\duboy\\alyo\\static\\images\\1";
        console.log('sadfas');
        console.log(source);
        let base64s = imageToSlices(source, lineXArray, lineYArray, {
            saveToDataUrl: true
        }, function (dataUrlList) {
            console.log('slicedfsadfsad');
            console.log('sliced', dataUrlList);
            //dataUrlList.map(frame_data => frame_data.dataURI);
        });
        let a = 43 * 43;

        return base64s;
    }

    get_videos_metadata() {

    }


}
*/


//extra feature, probably wont do it
/*
app.get('/videos/', function (req, res) { // TODO better url name?
})
*/

/*
//todo AVX2  encoding
//todo parse at the frontend vs at the backend
//todo base64 vs bytearray
app.get('/videos/:video_id/frames/:image_id/', function (req, res) { // TODO better url name?
    res.setHeader('Content-Type', 'application/json');
    let promise = new VideosManager().get_frames_async(req.params.video_id, req.params.image_id);
    //promise.then(frames=>{urls:frames}).catch((err) => {
    //    return console.error(err);
    //});

    //res.end(JSON.stringify({urls: "file_urls"}));
})
*/

//run the server
let server = app.listen(8081, function () {
    let host = server.address().address
    let port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
})