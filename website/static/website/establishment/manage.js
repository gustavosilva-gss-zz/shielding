document.addEventListener("DOMContentLoaded", () => {
    let modal = document.querySelector(".modal");

    document.querySelector(".close").addEventListener("click", () => {
        modal.style.display = 'none';
    });

    document.querySelector("#edit-name").onclick = () => {
        let body = /* html */`
            <label>Type new name</label>
            <input class="form-control" type="text" required id="edit-field" value="${document.querySelector("#name").innerHTML}">
        `;

        editModal('Edit Name', body, () => {
            editField('name');
        });
    };

    document.querySelector("#edit-address").onclick = () => {
        let body = /* html */`
            <label>Type new address</label>
            <input class="form-control" type="text" required id="edit-field" value="${document.querySelector("#address").innerHTML}">
        `;

        editModal('Edit Address', body, () => {
            editField('address');
        });
    };

    document.querySelector("#edit-need").onclick = () => {
        let body = /* html */`
            <label>Type new quantity of need</label>
            <input class="form-control" required min="0" type="number" id="edit-field" value="${document.querySelector("#need").innerHTML}">
        `;

        editModal('Edit quantity of need', body, () => {
            editField('need');
        });
    };

    //get the image url
    imageUrl = document.querySelector("#establishment-image").src;

    document.querySelector("#edit-image").onclick = () => {
        let body = /* html */`
            <img src="${imageUrl}" class="col-10 col-md-7 col-lg-4">
            <input class="form-control" required type="url" id="edit-field" value="${imageUrl}">
        `;

        editModal('Edit image url', body, () => {
            editField('imageUrl');
        });
    };

});

function editField(field) {
    fetch(`/edit-establishment/${field}`, {
        method: 'PUT',
        body: JSON.stringify({
            establishmentId: document.querySelector("#establishment-id").value,
            editedVal: document.querySelector("#edit-field").value
        })
    })
        .then(response => response.json())
        .then(result => {
            if (result["error"]) {
                showError(result['error'], ".container");
                return;
            }

            location.reload(true);
        });
}
