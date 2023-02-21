//"immutable" imported in index.html;

//state stored as an immutable
let store = Immutable.Map({
    currentTab: 'home',
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    manifest: Immutable.Map({
    }),
    manifestsLoaded: 0,
    photos: Immutable.Map({
    })
});

// add our markup to the page
const root = document.getElementById('root')

const render = async (root, state) => {
    root.innerHTML = App(state)
}

const App = (state) => {
    const currentTab = state.get("currentTab");

    return `
        <section>
            <h3>${Tab(currentTab)}</h3>
            <p>
                ${Description(currentTab)}
            </p>
            <p>
                ${Photos(currentTab)}
            </p>
        </section>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    getAllManifests();
    setupButtons();
})

//get manifests for all rovers
const getAllManifests = () => {
    store.get('rovers').forEach((rover) => getManifest(rover.toLocaleLowerCase()));
}

//setup tab buttons with events
function setupButtons() {
    document.getElementById("curiosityButton").addEventListener('click', function () {
        store = store.set("currentTab", "curiosity");
        render(root, store);
    });
    document.getElementById("opportunityButton").addEventListener('click', function () {
        store = store.set("currentTab", "opportunity");
        render(root, store);
    });
    document.getElementById("spiritButton").addEventListener('click', function () {
        store = store.set("currentTab", "spirit");
        render(root, store);
    });
    document.getElementById("homeButton").addEventListener('click', function () {
        store = store.set("currentTab", "home");
        render(root, store);
    });
}


// ------------------------------------------------------  COMPONENTS

const Tab = (tabName) => {
    const formattedName = tabName.charAt(0).toUpperCase() + tabName.slice(1);
    return (`${formattedName}`);
}

//generate rover description
const roverDescription = (rover) => {
    const roverRef = store.toJS().manifest[rover];
    const landingDate = `<div><b>Landing Date: </b>` + roverRef.landing_date + `</div>`;
    const launchDate = `<div><b>Launch Date: </b>` + roverRef.launch_date + `</div>`;
    const maxDate = `<div><b>Date of Last Available Photos: </b>` + roverRef.max_date + `</div>`;
    const status = `<div><b>Status: </b>` + roverRef.status + `</div>`;
    return (`${landingDate} ${launchDate} ${maxDate} ${status}`);
}

//get unique description for the home screen
const homeDescription = () => {
    const homePhoto = `<div><img src="./assets/images/rover.webp" width="500" height="350px"></div>`;
    const info = `<div> Select a Mars Rover to View Latest Mission Photos</div>`;
    return (`${homePhoto} ${info}`);
}

const Description = (tabName) => {
    if (tabName === 'home')
        return homeDescription();
    else
        return roverDescription(tabName);
}

const Photos = (rover) => {
    if (rover === 'home')
        return ` `

    const max_date = store.getIn(["manifest", rover, "max_date"]);
    const photos = store.getIn(["photos", rover]);

    if (typeof photos === 'undefined' || Object.entries(photos).length === 0) {
        getPhotos(rover, max_date)

        //no image yet, return message
        return (`
            loading rover photo...
        `);
    }

    const galleryStart = `<div class="gallery-grid" id="gallery">`
    const galleryEnd = `</div>`

    let embeddedPhotos = '';
    photos.forEach(url => {
        embeddedPhotos += `<div class="gallery-item"><img src=` + url + `></div>`
    });

    return (`${galleryStart} ${embeddedPhotos} ${galleryEnd}`);
}


// ------------------------------------------------------  API CALLS

const getManifest = async (rover) => {
    await fetch(`http://localhost:3000/manifest/${rover}`)
        .then(res => res.json())
        .then(obj => updateManifest(obj.manifest.photo_manifest, rover));
}

const getPhotos = (rover, max_date) => {
    fetch(`http://localhost:3000/photos/${rover}/${max_date}`)
        .then(res => res.json())
        .then(photos => updatePhotos(photos, rover));
}

const updateManifest = (manifest, rover) => {

    //clean up manifest data
    const cleanManifest = {
        landing_date: manifest.landing_date,
        launch_date: manifest.launch_date,
        max_date: manifest.max_date,
        status: manifest.status
    };

    //store manifest in state
    store = store.setIn(["manifest", rover], cleanManifest)

    let loaded = store.get("manifestsLoaded");
    store = store.set("manifestsLoaded", loaded + 1);

    //all manifests loaded, render page
    if (store.get("manifestsLoaded") === 3) {
        render(root, store)
    }

}

const updatePhotos = (newState, rover) => {

    const photoURLs = newState.photos.photos.map(photo => photo.img_src);
    store = store.setIn(["photos", rover], photoURLs)

    render(root, store)
}