const FRAME_PER_IMAGE = 25 // bad/good practice?

function range(n) {
    //alternatives (yes the link is weird and works) https://2ality.com/2018/12/creating-arrays.html#:~:text=One%20common%20way%20of%20creating,equal(arr.
    return Array.from({length: n}, (x, i) => i)
}

/*
//should this get the urls by itself, or supplied trough .set_images(images)
class FramesLoader {

}
*/

class FramePlayer {
    constructor(html_id, video_id = 1) {
        /*
        // if this type of private var is good idea
        var _name = name
        this.setName = function(name) { _name = name; }
        this.getName = function() { return _name; }
         */

        //append _ to the start of all private vars? which are all vars?
        //TODO look up js class getter setter best practices
        this.html_id = html_id
        this.video_id = video_id
        this.is_playing = false
        this.img_element = document.getElementById(this.html_id);
        this._triggers = {}; // string eventname -> [func] callbacks
        this.frames = [] //init with undefined?
        this.frame_index = 0

        this.getVideoUrls().then(urls => {
            let frame_count = urls.length * FRAME_PER_IMAGE;
            //this.frames = new Array(frame_count)//init the array,
            this.frames=[]

            //init the interval
            this.frame_index = 0
            setInterval(this.interval_method.bind(this), 3000);

            //start getting frames
            //for(let i=0;i<urls.length;i++){
            for (let i of range(urls.length)) {
                //wait every n frame? //later, wait when open requests > n
                this.getBase64Async(urls[i]).then(img_base64 => {
                    this.frames_from_image(img_base64);
                })
            }
        })
    }

    /*
    change_video_id(video_id){
        this.video_id = video_id
    }
    */

    //accesing this., 3 ways, https://stackoverflow.com/questions/2001920/calling-a-class-prototype-method-by-a-setinterval-event
    interval_method() {
        this.set_frame(this.frames[this.frame_index])
        this.frame_index = this.frame_index + 1
    }

    frames_from_image(image_data_base64) { // returns [ base64 ]
        //base64 to image
        // for better readability image is created here everytime
        // if performance matters just put it out there above
        let image = new Image()
        image.src = image_data_base64
        //crop images into 25 smaller ones
        return this.cutImageUp(image);
    }


    play() {
        this.is_playing = true

    }

    pause() {
        this.is_playing = false
    }

    cutImageUp(image) {// returns [ base64 ]

        for (let y = 0; y < 5; ++y) {
            for (let x = 0; x < 5; ++x) {
                let canvas = document.createElement("canvas");
                canvas.width = 128;
                canvas.height = 72;
                let context = canvas.getContext("2d");
                context.drawImage(
                    image,
                    x * 128,
                    y * 72,
                    128,
                    72,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );
                let toadd=canvas.toDataURL();
                this.frames.push(toadd);
            }
        }
        let anImageElement = document.getElementById("frames");
    }

    //weird enough, i didnt find a "default implementation" of this.
    on(event, callback) {
        if (!this._triggers[event])
            this._triggers[event] = [];
        this._triggers[event].push(callback);
    }

    triggerHandler(event_name) {
        if (this._triggers[event_name]) {
            //fun fact, callbacks.forEach(Function.prototype.call, Function.prototype.call); https://zpao.com/posts/calling-an-array-of-functions-in-javascript/
            for (let i of this._triggers[event_name]) {
                i();
            }

        }
    }

    getVideoUrls() {
        let url = "http://localhost:8081/videos/urls/" + this.video_id + "/";

        return axios
            .get(url)
            .then(res => {
                return res.data.urls //list of string

            }).catch(error => error)
    }

     _imageEncode (arrayBuffer) {
        let u8 = new Uint8Array(arrayBuffer)
        let b64encoded = btoa([].reduce.call(new Uint8Array(arrayBuffer),function(p,c){return p+String.fromCharCode(c)},''))
        let mimetype="image/jpeg"
        return "data:"+mimetype+";base64,"+b64encoded
    }

    getBase64Async(url) {
        return axios
            .get(url, {
                responseType: 'arraybuffer'
            })
            //.then(response => Buffer.from(response.data, 'binary').toString('base64')) //for nodejs
            .then(response => this._imageEncode(response.data)) //should be Buffer.from for nodejs>6
    }

    set_frame(img_base64) {
        console.log("framing: ", img_base64)
        document.getElementById('frameImg')
            .setAttribute(
                'src', img_base64
            );
    }


}

document.addEventListener("DOMContentLoaded", function () {

    let img_frame = new FramePlayer("frameImg", 1)

});



