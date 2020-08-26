document.addEventListener("DOMContentLoaded", () => {
    let donateForm = document.querySelector("#donate-form");
    let donateBtn = document.querySelector("#donate-btn");
    let closeBtn = document.querySelector(".close");
    let address = document.querySelector("#address");

    //by default hide address field
    address.style.display = 'none';
    address.required = false;
    
    closeBtn.onclick = () => {
        donateForm.style.display = 'none';
    };

    donateBtn.onclick = () => {
        donateForm.style.display = 'block';
    };

    //means volunteer will deliver the face shields to the establishment's address
    let volunteerDelivering = document.querySelector("#delivery-1");

    //means establishment will take the face shields on the volunteer's address
    let volunteerWithdrawing = document.querySelector("#delivery-2");

    volunteerDelivering.onclick = () => {
        //choosing this means no address is needed
        address.style.display = 'none';
        address.required = false;
    };

    volunteerWithdrawing.onclick = () => {
        //choosing this means the volunteer's address is needed
        address.style.display = 'block';
        address.required = true;
    };

    donateForm.onsubmit = donate;

    //allow to pick dates only from today forwards
    //https://stackoverflow.com/a/38638741
    var today = new Date().toISOString().split('T')[0];
    document.querySelector("#estimated_time").setAttribute('min', today);
});

function donate() {
    let establishmentId = document.querySelector("#establishment-id").value;
    let quantity = document.querySelector("#quantity").value;
    let address = document.querySelector("#address").value;
    let estimatedTime = document.querySelector("#estimated_time").value;

    //this time, instead of a radio it's a boolean
    let volunteerDelivering = document.querySelector("#delivery-1").checked;

    if (!volunteerDelivering && address === null) {
        //then address is needed, decline the form if it isnt
        showError('The establishment must know your address', ".modal-body");
        return false;
    }

    fetch('/donate', {
        method: 'POST',
        body: JSON.stringify({
            establishmentId: establishmentId,
            quantity: quantity,
            volunteerDelivering: volunteerDelivering,
            address: address,
            estimatedTime: estimatedTime
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

    return false;
}
