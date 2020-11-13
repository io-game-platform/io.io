
var ip = "127.0.0.1";
const URL = 'https://jsonplaceholder.typicode.com/todos/1'

function send_state(state) {

}

function get_state() {
    // Belongs in update
    var state = fetch(URL, {method: "GET"});

    //state.then(res => res.json()).then(d => {console.log(d)});

    return state;
}

var s = {};
//send_state(s);

var s_new = get_state();

//console.log(s);
console.log(s_new);
