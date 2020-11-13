const URL = 'https://jsonplaceholder.typicode.com/todos/1'


function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}


var state_output;
function _get_helper(state) {
    state_output = state;
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
}



var s = {};
//send_state(s);

get_state();
sleep(200).then(() => console.log(state_output));
