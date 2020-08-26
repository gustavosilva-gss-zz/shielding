document.addEventListener("DOMContentLoaded", () => {
    let modal = document.querySelector(".modal");

    document.querySelector(".close").addEventListener("click", () => {
        modal.style.display = 'none';
    });

    document.querySelector("#edit-address").onclick = () => {
        let body = /* html */`
            <label>Type new adress</label>
            <input class="form-control" type="text" required id="edit-field" value="${document.querySelector("#address").innerHTML}">
        `;

        editModal('Edit Address', body, () => {
            edit('address');
        });
    };

    document.querySelector("#edit-email").onclick = () => {
        let body = /* html */`
            <label>Type new email</label>
            <input class="form-control" type="text" required id="edit-field" value="${document.querySelector("#email").innerHTML}">
        `;

        editModal('Edit Email', body, () => {
            edit('email');
        });
    };
});

function edit(field) {
    fetch(`/edit-volunteer/${field}`, {
        method: 'PUT',
        body: JSON.stringify({
            editedVal: document.querySelector("#edit-field").value
        })
    })
        .then(response => response.json())
        .then(result => {
            if (result["error"]) {
                showError(result['error'], ".column");
                return;
            }

            location.reload(true);
        });
}