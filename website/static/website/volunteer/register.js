document.addEventListener("DOMContentLoaded", () => {

    registrationForm = document.querySelector("form"); //its the only form

    registrationForm.onsubmit = register;
});

function register() {
    registerUser(() => {
        fetch('/volunteer/register', {
            method: 'POST',
            body: JSON.stringify({
                address: document.querySelector("#address").value
            })
        })
            .then(response => response.json())
            .then(result => {
                console.log(result);

                window.location.replace("/volunteer");
            });
    });

    return false;
}