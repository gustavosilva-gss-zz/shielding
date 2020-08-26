document.addEventListener("DOMContentLoaded", () => {

    loginForm = document.querySelector("form");

    loginForm.onsubmit = login;
});

function login() {
    fetch('/login', {
        method: 'POST',
        body: JSON.stringify({
            username: document.querySelector("#username").value,
            password: document.querySelector("#password").value,
        })
    })
        .then(response => response.json())
        .then(result => {
            console.log(result);

            if (result["error"]) {
                showError(result["error"], ".card-body");
                return;
            }
            
            //redirect to /establishment or /volunteer correctly
            if (result["volunteer"]) {
                window.location.replace("/volunteer");
            } else {
                window.location.replace("/establishment/manage");
            }
        });

    return false;
}