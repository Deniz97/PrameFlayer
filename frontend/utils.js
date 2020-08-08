function range(n) {
    //alternatives (yes the link is weird and works) https://2ality.com/2018/12/creating-arrays.html#:~:text=One%20common%20way%20of%20creating,equal(arr.
    return Array.from({length: n}, (x, i) => i)
}

//carry this to inside FramePlayer class?
const VideoStateEnum = {
    INIT: 1,
    STARTING: 2,
    PLAYING: 3,
    PAUSE: 4,
    END: 5
};

const VideoEventsEnum = {
    DOWNLADED: "ondownloadcomplete",
    PLAY: "onplay",
    PAUSE: "onpause",
    END: "onend",
};