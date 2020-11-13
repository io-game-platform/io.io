const URL = 'https://jsonplaceholder.typicode.com/todos/1'


function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}


var _get_help;
function _get_helper(state) {
    _get_help = state;
}


function send_state(state) {
    fetch(URL, {
       method: "POST",
       body: JSON.stringify(state),
       headers: {
          "Content-type": "application/json; charset=UTF-8"
       }
    });
}


function get_state() {
    // Belongs in update
    var promise = fetch(URL, {method: "GET"});

    promise.then(res => res.json()).then(_get_helper);

    return _get_help;
}



var s = {};
//send_state(s);

var s_new = get_state();

//console.log(s_new);
sleep(100).then(() => console.log(_get_help));
