let store = {
    currentTab: 'home',
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    manifest: {},
    manifestsLoaded: 0,
    photos: {},
}

// add our markup to the page
const root = document.getElementById('root')

const render = async (root, state) => {
    root.innerHTML = App(state)
}


const App = (state) => {
    let { currentTab } = state

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

const getAllManifests = () => {
    store.rovers.forEach((rover) => getManifest(rover.toLocaleLowerCase()));
}

function setupButtons() {
    document.getElementById("curiosityButton").addEventListener('click', function () {
        setCurrentTab(store, 'curiosity');
    });
    document.getElementById("opportunityButton").addEventListener('click', function () {
        setCurrentTab(store, 'opportunity');
    });
    document.getElementById("spiritButton").addEventListener('click', function () {
        setCurrentTab(store, 'spirit');
    });
    document.getElementById("homeButton").addEventListener('click', function () {
        setCurrentTab(store, 'home');
    });
}

const setCurrentTab = (state, tabToSet) => {
    state.currentTab = tabToSet;
    render(root, state);
}


// ------------------------------------------------------  COMPONENTS


// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {

    if (!apod || apod === '') {
        getImageOfTheDay(store)
        apod = store.apod;
    }

    //no image yet, return
    if (apod === '')
        return;

    // check if the photo of the day is actually type video!
    if (apod.media_type === "video") {
        return (`
            < p > See today's featured video <a href="${apod.url}">here</a></p>
                < p > ${apod.title}</p >
                    <p>${apod.explanation}</p>
`)
    } else {
        return (`
    < img src = "${apod.image.url}" height = "350px" width = "100%" />
        <p>${apod.image.explanation}</p>
`)
    }
}

const Tab = (tabName) => {
    const formattedName = tabName.charAt(0).toUpperCase() + tabName.slice(1);
    return (`${formattedName}`);
}

const roverDescription = (rover) => {
    const landingDate = `<div><b>Landing Date: </b>` + store.manifest[rover].landing_date + `</div>`;
    const launchDate = `<div><b>Launch Date: </b>` + store.manifest[rover].launch_date + `</div>`;
    const maxDate = `<div><b>Date of Last Available Photos: </b>` + store.manifest[rover].max_date + `</div>`;
    const status = `<div><b>Status: </b>` + store.manifest[rover].status + `</div>`;
    return (`${landingDate} ${launchDate} ${maxDate} ${status}`);
}

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

const Photos = (tabName) => {
    if (tabName === 'home')
        return ` `

    const rover = tabName;

    const max_date = store.manifest[rover].max_date;
    if (!Object.hasOwn(store.photos, tabName)) {
        getPhotos(rover, max_date)
    }

    //no image yet, return
    if (!Object.hasOwn(store.photos, tabName)) {
        return (`
            loading rover photo...
        `);
    }

    const galleryStart = `<div class="gallery-grid" id="gallery">`
    const galleryEnd = `</div>`

    const images = store.photos[rover];
    let embeddedPhotos = '';
    images.forEach(image => {
        embeddedPhotos += `<div class="gallery-item"><img src=` + image.img_src + `></div>`
    });

    return (`${galleryStart} ${embeddedPhotos} ${galleryEnd}`);
}


// ------------------------------------------------------  API CALLS

const getImageOfTheDay = (state) => {
    //let { apod } = state
    fetch(`http://localhost:3000/apod/`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }));

}

const getManifest = (rover) => {
    fetch(`http://localhost:3000/manifest/${rover}`)
        .then(res => res.json())
        .then(manifest => updateManifest(store, manifest, rover));
}

const getPhotos = (rover, max_date) => {
    fetch(`http://localhost:3000/photos/${rover}/${max_date}`)
        .then(res => res.json())
        .then(photos => updatePhotos(store, photos, rover));
}

const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
    render(root, store)
}

const updateManifest = (store, newState, rover) => {
    let manifest;
    switch (rover) {
        case 'curiosity':
            const curiosity = newState.manifest.photo_manifest;
            manifest = Object.assign(store.manifest, { curiosity });
            break;
        case 'opportunity':
            const opportunity = newState.manifest.photo_manifest;
            manifest = Object.assign(store.manifest, { opportunity });
            break;
        case 'spirit':
            const spirit = newState.manifest.photo_manifest;
            manifest = Object.assign(store.manifest, { spirit });
            break;
        default:
            break;
    }

    store.manifestsLoaded += 1;
    store = Object.assign(store, { manifest })
    if (store.manifestsLoaded == 3)
        render(root, store)
}

const updatePhotos = (store, newState, rover) => {
    let photos;
    switch (rover) {
        case 'curiosity':
            const curiosity = newState.photos.photos;
            photos = Object.assign(store.photos, { curiosity });
            break;
        case 'opportunity':
            const opportunity = newState.photos.photos
            photos = Object.assign(store.photos, { opportunity });
            break;
        case 'spirit':
            const spirit = newState.photos.photos
            photos = Object.assign(store.photos, { spirit });
            break;
        default:
            break;
    }

    store = Object.assign(store, { photos })

    render(root, store)
}