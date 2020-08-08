function range(n) {
    //alternatives (yes the link is weird and works) https://2ality.com/2018/12/creating-arrays.html#:~:text=One%20common%20way%20of%20creating,equal(arr.
    return Array.from({length: n}, (x, i) => i)
}