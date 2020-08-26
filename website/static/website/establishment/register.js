document.addEventListener("DOMContentLoaded", () => {

    registrationForm = document.querySelector("form"); //its the only form

    registrationForm.onsubmit = register;
});

function register() {
    registerUser(() => {
        fetch('/establishment/register', {
            method: 'POST',
            body: JSON.stringify({
                name: document.querySelector("#name").value,
                address: document.querySelector("#address").value,
                need: document.querySelector("#need").value,
                image_url: document.querySelector("#image-url").value
            })
        })
            .then(response => response.json())
            .then(result => {
                console.log(result);

                window.location.replace("/establishment/manage");
            });
    });

    return false;
}