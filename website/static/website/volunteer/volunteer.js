let counter = 1;

//take the screen area and divide by the card area to see (aproximatedely) 
//how many cards fit in the screen
let quantity = Math.round((window.innerHeight * window.innerWidth) / (400 * 300));

//must try to load at least 15 at a time and in maximum 50
quantity = clamp(quantity, 15, 50);

document.addEventListener('DOMContentLoaded', load);

//when scrolled to bottom load the next establishments
window.onscroll = () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        load();
    }
};

function load() {
    // Set start and end post numbers, and update counter
    const start = counter;
    const end = start + quantity - 1;
    counter = end + 1;

    // Get new establishments and add establishments
    fetch(`/establishments?start=${start}&end=${end}`)
        .then(response => response.json())
        .then(result => {
            const establishments = result["establishments"];

            //add each card to the html
            for (let i in establishments) {
                add_card(establishments[i]);
            }
        });
}

function add_card(establishment) {
    const card = document.createElement('div');
    card.innerHTML = /*html*/`
        <a href="/establishment/${establishment["id"]}" class="establishment-card card">
            <div class="card-body text-center">
                <img src="${establishment["image_url"]}"/> 
            </div>
            <div class="card-footer">
                <strong>${establishment["name"]}</strong><br>
                <span class="address">Address: ${establishment["address"]}</span><br>
                <span class="need">Needs: ${establishment["need"]} face shields</span>
            </div>
        </a>
    `;

    document.querySelector('#establishments').append(card);
};
