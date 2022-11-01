let store = {
    user: { name: "Student" },
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    manifest: {},
    manifestsLoaded: 0,
    photos: {},
}

// add our markup to the page
const root = document.getElementById('home')

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

const showRoverInfo = (rover) => {
    hideAllTabContent();
    showTabContent(rover);
}

function setupButtons() {
    document.getElementById("curiosityButton").addEventListener('click', function () {
        showRoverInfo('curiosity');
    });
    document.getElementById("opportunityButton").addEventListener('click', function () {
        showRoverInfo('opportunity');
    });
    document.getElementById("spiritButton").addEventListener('click', function () {
        showRoverInfo('spirit');
    });
    document.getElementById("homeButton").addEventListener('click', function () {
        showRoverInfo('home');
    });
}

async function loadPhotos(photos) {
    //let photo = store.photos.curiosity[0].img_src;
    await getPhotos('curiosity');
    document.getElementById('gallery').innerHTML += '<div class="gallery-item"><img src="./assets/images/rover.webp"></div>';
}

/*
// create content
const App = (state) => {
    let { rovers, apod } = state

    return `
        <header></header>
        <main>
            ${Greeting(store.user.name)}
            <section>
                <h3>Put things on the page!</h3>
                <p>Here is an example section.</p>
                <p>
                    One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                    the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                    This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                    applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                    explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                    but generally help with discoverability of relevant imagery.
                </p>
                ${ImageOfTheDay(apod)}
            </section>
        </main>
        <footer></footer>
    `
}
*/


const App = (state) => {
    let { rovers, apod, photos } = state

    return `
        <header></header>
        <main>
            ${Greeting(store.user.name)}
            <section>
                <h3>Put things on the page!</h3>
                <p>Here is an example section.</p>
                <p>
                    One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                    the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                    This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                    applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                    explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                    but generally help with discoverability of relevant imagery.
                </p>
                ${ShowPhoto(photos)}
            </section>
        </main>
        <footer></footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    getAllManifests();
    /*
    while (!store.manifest.hasOwnProperty('curiosity')) {
        console.log("NO curiosity");
    }
    */
    //while(store.manifest.)
    hideAllTabContent();
    setupButtons();
    //getPhotos('curiosity');
    //loadPhotos('curiosity');
    showTabContent("home");
    //render(root, store)
})

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h1>Welcome, ${name}!</h1>
        `
    }

    return `
        <h1>Hello!</h1>
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
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `)
    } else {
        return (`
            <img src="${apod.image.url}" height="350px" width="100%" />
            <p>${apod.image.explanation}</p>
        `)
    }
}

const getAllManifests = () => {
    store.rovers.forEach((rover) => getManifest(rover.toLocaleLowerCase()))
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

const getManifest = async (rover) => {
    console.log("CHECK: MANIF");
    fetch(`http://localhost:3000/manifest/${rover}`)
        .then(res => res.json())
        .then(manifest => updateManifest(store, manifest, rover));
    //.then(data => console.log(data));
}

const getPhotos = (rover) => {
    console.log("CHECK: PHOTOS");
    fetch(`http://localhost:3000/photos/${rover}`)
        .then(res => res.json())
        .then(photos => updatePhotos(store, photos, rover));
    //.then(data => console.log(data));
}

const ShowPhoto = (photos) => {
    if (Object.keys(photos).length === 0) {
        getPhotos('curiosity')
        photos = store.photos;
    }

    //no image yet, return
    if (Object.keys(photos).length === 0)
        return (`
            loading rover photo...
        `);

    return (`
            <img src="${photos.curiosity[0].img_src}"/>
        `)
}

            //<img src="${photos.curiosity[0].img_src}" height="350px" width="100%" />