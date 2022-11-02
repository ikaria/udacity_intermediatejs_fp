let store = {
    currentTab: 'curiosity',
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    manifest: {},
    manifestsLoaded: 0,
    photos: {},
}

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
    render(root, store)
}

const hideAllTabContent = () => {
    const allTabContents = document.getElementsByClassName("tabContent");
    Array.from(allTabContents).forEach(content => content.style.display = "none");
}

const showTabContent = (contentId) => {

    const content = document.getElementById(contentId);
    content.style.display = "block"
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

const updatePhotos = async (store, newState, rover) => {
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

    await render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
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
    return (`this is the home description`);
}

const Description = (tabName) => {
    if (tabName === 'home')
        return homeDescription();
    else
        return roverDescription(tabName);
}

const Photos = (tabName) => {
    const photos = 'photos wip';
    return (`${photos} `);
}

const loadRoverContent = (rover) => {
    if (!store.manifest.hasOwnProperty(rover)) {
        return (`${rover} content loading...`);
    }

    loadManifestInfo(rover);
    loadRoverPhotos(rover);
    return (
        ``
    )
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

async function loadPhotos(photos) {
    //let photo = store.photos.curiosity[0].img_src;
    await getPhotos('curiosity');
    document.getElementById('gallery').innerHTML += '<div class="gallery-item"><img src="./assets/images/rover.webp"></div>';
}

const App = (state) => {
    let { currentTab } = state

    return `
        <main>
            <section>
                <h3>${Tab(currentTab)}</h3>
                <p>
                    ${Description(currentTab)}
                </p>
                <p>
                    ${Photos(currentTab)}
                </p>
            </section>
        </main>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    getAllManifests();
    //hideAllTabContent();
    setupButtons();
    //showTabContent("home");
})

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
        < h1 > Welcome, ${name} !</h1 >
            `
    }

    return `
            < h1 > Hello!</h1 >
                `
}

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

const getAllManifests = () => {
    store.rovers.forEach((rover) => getManifest(rover.toLocaleLowerCase()));
}


// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state) => {
    //let { apod } = state
    console.log("CHECK: IMAGE");
    fetch(`http://localhost:3000/apod/`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }));

}

const getManifest = (rover) => {
    console.log("CHECK: MANIF");
    fetch(`http://localhost:3000/manifest/${rover}`)
        .then(res => res.json())
        .then(manifest => updateManifest(store, manifest, rover));
    //.then(data => console.log(data));
}

const getPhotos = (rover, max_date) => {
    console.log("CHECK: PHOTOS");
    fetch(`http://localhost:3000/photos/${rover}/${max_date}`)
        .then(res => res.json())
        .then(photos => updatePhotos(store, photos, rover));
    //.then(data => console.log(data));
}

const RoverPhotos = (photos, rover) => {
    console.log("MANIFEST FOR: " + rover);
    console.log(store.manifest[rover]);
    const max_date = store.manifest[rover].max_date;
    console.log(max_date);
    if (Object.keys(photos).length === 0) {
        getPhotos(rover, max_date)
        photos = store.photos;
    }

    //no image yet, return
    if (Object.keys(photos).length === 0)
        return (`
            loading rover photo...
        `);

    const image = photos[rover];

    return (`
            <img src="${image[0].img_src}"/>
        `)
}
