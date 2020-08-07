
/*
function(iter_obj) {
    //function* not supported by IE
    function* _range(start, stop, step = 1) {
        if (typeof stop === 'undefined') {
            // one param defined
            stop = start;
            start = 0;
        }

        for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
            yield i;
        }
    }
    //TODO type checks and what nots
    return _range(0, iter_obj.length)
}

//also not supported by IE, .entries() (python enumerate equilavelent)
//for (const [index, element] of foobar.entries()) {
//   console.log(index, element);
// }
 */

document.addEventListener("DOMContentLoaded", function() {
    
    alert("deneme");
    let a = 55*32;
});



function getBase64(url, then_func) {
    return axios
        .get(url, {
            responseType: 'arraybuffer'
        })
        .then(then_func)
}

function getImageUrls() {
    let url = "localhost:8081/imageurls"
    return axios
        .get(url, {
            responseType: 'arraybuffer'
        })
        .then(response => Buffer.from(response.data, 'binary').toString('base64'))
}

function set_frame(img_base64) {
    document.getElementById('frameImg')
        .setAttribute(
            'src', img_base64
        );
}

//should this get the urls by itself, or supplied trough .set_images(images)
class FramePlayer {
    constructor(id, video_id = 1) {
        /*
        // if this type of private var is good idea
        var _name = name
        this.setName = function(name) { _name = name; }
        this.getName = function() { return _name; }
         */

        //append _ to the start of all private vars? which are all vars?
        //TODO look js class get set best practice
        this.id = id
        this.video_id = 1
        this.is_playing = false
        this.img_element = document.getElementById(this.id);
        this._triggers = {}; // string eventname -> [func] callbacks

    }

    change_video_id(video_id){
        this.video_id = video_id
    }

    play(){
        this.is_playing = true

    }

    pause(){
        this.is_playing = false
    }

    //weird enough, i didnt find a "default implementation" of this.
    on(event,callback) {
        if(!this._triggers[event])
            this._triggers[event] = [];
        this._triggers[event].push( callback );
    }

    triggerHandler(event_name) {
        if( this._triggers[event_name] ) {
            //fun fact, callbacks.forEach(Function.prototype.call, Function.prototype.call); https://zpao.com/posts/calling-an-array-of-functions-in-javascript/
            for(let i of this._triggers[event_name] )
                i();
        }
    }

}


