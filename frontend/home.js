const FRAME_PER_IMAGE = 25 // bad/good practice?
const FPS = 10


/*
//should this get the urls by itself, or supplied trough .set_images(images)
class FramesLoader {

}
*/

class FramePlayer {
    //TODO refactor frameloading, progressbar and state functionalities out (to sub classes?)
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
        this.video_state = VideoStateEnum.INIT
        this.img_element = document.getElementById(this.html_id);
        this._triggers = {}; // string eventname -> [func] callbacks
        this.frames = [] //init with undefined?
        this.frame_index = 0
        this.progress=0 // 0-100, current progress of the progress bar
        //this.last_loaded_frame_index = 0

        document.getElementById('myProgress').addEventListener('click', this.set_position) //todo change id

        this.getVideoUrls().then(urls => {
            let frame_count = urls.length * FRAME_PER_IMAGE;
            //this.frames = new Array(frame_count)//init the array,
            this.frames=[]

            //init the interval
            this.frame_index = 0;
            // TODO do this here and lazy load setInterval(this.interval_method.bind(this), 3000);

            //start getting frames
            //for(let i=0;i<urls.length;i++){
            for (let i of range(urls.length)) {
                //wait every n frame? //later, wait when open requests > n
                this.getBase64Async(urls[i]).then(img_base64 => {
                    console.log("fetching image "+i.toString())
                    this.frames_from_image(img_base64);

                })
            }

            //TODO FrameLoader().then(setframe; setinterval; fireevent;)
            //this.set_frame(this.frames[0])
            this.triggerHandler(VideoEventsEnum.DOWNLADED);
            setInterval(this.interval_method.bind(this), 100);

        })
    }

    /*
    change_video_id(video_id){
        this.video_id = video_id
    }
    */

    //accesing this., 3 ways, https://stackoverflow.com/questions/2001920/calling-a-class-prototype-method-by-a-setinterval-event
    interval_method() {
        if(this.video_state !== VideoStateEnum.PLAYING ){
            return;
        }

        //console.log("framing interval method: ")
        //console.log(this.frame_index)
        //console.log(this.frames)
        //console.log(this.frames[this.frame_index])
        this.set_frame(this.frames[this.frame_index])
        this.frame_index = this.frame_index + 1
        this.move_progress()
        if(this.frame_index === this.frames.length){
            //TODO refactor moveout to this.end_video()
            this.video_state = VideoStateEnum.END;
            this.triggerHandler(VideoEventsEnum.END);
            return;
        }
    }

    frames_from_image(image_data_base64) { // returns [ base64 ]
        //base64 to image
        // for better readability image is created here everytime
        // if performance matters just put it out there above
        let image = new Image()
        image.onload = this.cutImageUp(image, this.frames, this.video_state, this.set_frame, this) //returns a function with no arguments //yeah bad shit, TODO
        image.src = image_data_base64
        //crop images into 25 smaller ones
    }

    changestate(new_state){
        // TODO assert new_state is of type VideoStateEnum
    }

    play() { //private
        this.video_state = VideoStateEnum.PLAYING
        this.triggerHandler(VideoEventsEnum.PLAY);
    }

    pause() { //private
        this.video_state = VideoStateEnum.PAUSE
        this.triggerHandler(VideoEventsEnum.PAUSE);
    }

    show_icon(icon_id){

    }

    playpause(){ //public
        if(this.video_state == VideoStateEnum.PLAYING) {
            this.pause();
        }
        else if(this.video_state == VideoStateEnum.PAUSE || this.video_state == VideoStateEnum.STARTING){
            this.play();
        }
        else if(this.video_state==VideoStateEnum.END){
            this.progress = 0;
            this.frame_index=0;
            this.play()
        }

    }


    cutImageUp(image, frames, video_state, set_frame_fnc, thiss) {// returns [ base64 ]
        return function () {
            //console.log("image source: "+image.src)
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
                    //here we will the frames array
                    let toadd=canvas.toDataURL();
                    //console.log("toadd: "+toadd)
                    frames.push(toadd);
                }
            }
            //weird way to do this, TODO, do this in the constructor or something
            if(video_state == VideoStateEnum.INIT){
                thiss.video_state = VideoStateEnum.STARTING;
                set_frame_fnc(frames[0]);
            }
            //
            let anImageElement = document.getElementById("frames");
        }

    }

    //weird enough, i didnt find a "default implementation" of this.
    on(event, callback) {
        if (!this._triggers[event])
            this._triggers[event] = [];
        this._triggers[event].push(callback);
    }

    triggerHandler(event_name) {
        //TODO add ms as argument
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
    } //TODO bad naming, fix convention

    set_frame(img_base64) {
        //("framing set frame: ", img_base64)
        document.getElementById('frameImg')
            .setAttribute(
                'src', img_base64
            );
    }


    set_bar_position(progress, width){
        let elem = document.getElementById("myBar");
        elem.style.width = width + "%";
        elem.innerHTML = Math.round(progress)  + "%";
    }

    move_progress() {
        if(this.progress>=100){
            return;
        }
        let width = 0;
        let raise_by = 100/this.frames.length
        this.progress+=raise_by;
        let progress = this.progress;
        let thiss = this;
        let id = setInterval(frame, 10); //TODO make this with FPS
        function frame() {
            if (width >= raise_by || thiss.video_state != VideoStateEnum.PLAYING) {
                clearInterval(id);
            } else {
                width+=raise_by/10; //TODO make this with FPS
                thiss.set_bar_position(progress, progress+width);
            }
        }

    }

    set_position = e => {
        //this.video_state = VideoStateEnum.PAUSE; //style choice, may be removed
        this.pause() //do we want event fire here? //style choice, may be removed
        let rect;
        let totalwidth;
        if(e.target.id == "myProgress" ){ //hack, clicked on myProgress (outer bar)
            rect = e.target.children[0].getBoundingClientRect();
            totalwidth = e.target.getBoundingClientRect().width
        }
        else{ //clicked on myBar (inner bar)
            rect = e.target.getBoundingClientRect();
            totalwidth = e.target.parentElement.getBoundingClientRect().width
        }



        let x = ((e.clientX - rect.left)/totalwidth )*100;
        //var y = e.clientY - rect.top;
        //this.progress = Math.max(x-0.5,0); //cosmetic buffer, disabled
        this.progress = x;
        this.frame_index = Math.floor(this.frames.length*this.progress/100);
        this.set_frame(this.frames[this.frame_index])
        this.set_bar_position(this.progress, this.progress)

        let a = 32*43;

    }



}

let img_frame = undefined;
document.addEventListener("DOMContentLoaded", function () {

    img_frame = new FramePlayer("frameImg", 1)
    // TODO, make 3 have ms argument
    img_frame.on(VideoEventsEnum.PLAY, () => console.log("playing, event") )
    img_frame.on(VideoEventsEnum.PAUSE, () => console.log("pausing, event") )
    img_frame.on(VideoEventsEnum.END, () => console.log("ended, event") )
    img_frame.on(VideoEventsEnum.DOWNLADED, () => console.log("downloaded, event") )


});

function OnClickFrameArea(arg) {
    img_frame.playpause()
}


