//functions used in multiple pages

document.addEventListener("DOMContentLoaded", () => {
    //set status tags colors
    colorStatus();
});

function colorStatus() {
    let status_elements = document.getElementsByClassName("status");

    for (const status of status_elements) {
        if (status.innerHTML === "submitted") {
            status.style.backgroundColor = 'blue';
            continue;
        }

        if (status.innerHTML === "delivered") {
            status.style.backgroundColor = 'green';
            continue;
        }

        else {
            status.style.backgroundColor = 'red';
        }
    }
}

function showError(error, querySelector) {
    let errorElement = document.createElement("div");

    errorElement.innerHTML = /*html*/`
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            ${error}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
        </div>
    `;

    document.querySelector(querySelector).append(errorElement);
}

function registerUser(callback) {
    fetch('/register', {
        method: 'POST',
        body: JSON.stringify({
            username: document.querySelector("#username").value,
            email: document.querySelector("#email").value,
            password: document.querySelector("#password").value,
            confirmation: document.querySelector("#confirmation").value
        })
    })
        .then(response => response.json())
        .then(result => {
            console.log(result);

            if (result["error"]) {
                showError(result["error"], ".card-body");
                return;
            }

            callback();
        });
}

function clamp(num, min, max) {
    //from https://stackoverflow.com/a/11410079
    return num <= min ? min : num >= max ? max : num;
}

function editModal(title, body, callback) {
    let modal = document.querySelector(".modal");

    modal.style.display = 'block';

    document.querySelector(".modal-title").innerHTML = title;
    document.querySelector(".modal-body").innerHTML = /*html*/`
        <form id="edit-form">
            <div class="form-group">
                ${body}
            </div>
            <input class="btn btn-primary modal-btn" type="submit" value="edit">
        </form>
    `;

    document.querySelector("#edit-form").onsubmit = () => {
        callback();
        return false;
    };
}

function displayDonation(id, volunteer=false) {
    //this is called when a donations table row is clicked
    fetch(`/donation/${id}`, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(result => {
            let donation = result["donation"];

            let modal = document.querySelector(".modal");

            modal.style.display = 'block';
        
            document.querySelector(".modal-title").innerHTML = /*html*/`
                Donation's information&nbsp;
                <span class="status">${donation["status"]}</span>
            `;

            colorStatus();

            document.querySelector(".modal-body").innerHTML = /*html*/`
                <p>Donation quantity: ${donation["quantity"]} face shields</p>
            `;

            document.querySelector(".modal-body").innerHTML += /*html*/`
                <button type="button" onclick="chat(${donation['establishment']['id']}, ${donation['volunteer']['id']})" class="btn btn-danger btn-sm btn-block">Chat</button>
            `;

            if (!volunteer) {
                //only the establishment would want to know these fields
                document.querySelector(".modal-body").innerHTML += /*html*/`
                    <p>Volunteer's username: ${donation["volunteer"]["user"]["username"]}</p>
                    <p>Volunteer's email: ${donation["volunteer"]["user"]["email"]}</p>
                `;
            }

            document.querySelector(".modal-body").innerHTML += /*html*/`
                <p>
                    Volunteer delivering: 
                    <input type="checkbox" ${donation["volunteer_delivering"] ? "checked" : ""} disabled>
                </p>
            `;

            //only show if the establishment will get the face shields at the volunteer's address
            if (!donation["volunteer_delivering"]) {
                document.querySelector(".modal-body").innerHTML += /*html*/`
                    <p>Volunteer's address: ${donation["volunteer"]["address"]}</p>
                `;
            } else {
                //show the address of the establishment if the user is delivering
                document.querySelector(".modal-body").innerHTML += /*html*/`
                    <p>Establishment's address: ${donation["establishment"]["address"]}</p>
                `;
            }

            document.querySelector(".modal-body").innerHTML += /*html*/`
                <p>Submission time: ${donation["submission_time"]}</p>
                <p>Estimated time: ${donation["estimated_time"]}</p>
            `;

            //show the delivered timestap if the face shields were already delivered
            //else, show a button to confirm the delivery or to cancel
            if (donation["delivered_time"]) {
                document.querySelector(".modal-body").innerHTML += /*html*/`
                    <p>Delivered time: ${donation["delivered_time"]}</p>
                `;

                return;
            }

            if (donation["status"] !== "submitted") {
                //means it got cancelled, or delivered, dont show the buttons to change status
                return;
            }

            if (!volunteer) {
                //only the establishment should be able to change the status to delivered
                document.querySelector(".modal-body").innerHTML += /*html*/`
                    <button type="button" onclick="changeDonationStatus(${donation['id']}, 'delivered')" class="btn btn-success btn-sm btn-block">Confirm delivery</button>
                `;
            }

            document.querySelector(".modal-body").innerHTML += /*html*/`
                <button type="button" onclick="changeDonationStatus(${donation['id']}, 'canceled')" class="btn btn-danger btn-sm btn-block">Cancel donation</button>
            `;
        });
}

function chat(establishmentId, volunteerId) {
    fetch(`/open-chat?establishmentId=${establishmentId}&volunteerId=${volunteerId}`)
        .then(response => response.json())
        .then(result => {
            if (result["error"]) {
                showError(result['error'], ".modal-body");
                return;
            }

            window.location.replace(`/chat/${result["chat_id"]}`);
        });
}

function changeDonationStatus(id, newStatus) {
    fetch(`/edit-donation/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            newStatus: newStatus
        })
    })
        .then(response => response.json())
        .then(result => {
            if (result["error"]) {
                showError(result['error'], ".modal-body");
                return;
            }

            location.reload(true);
        });
}
