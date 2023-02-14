//import Immutable from "immutable";

let testM = Immutable.Map({
    normalfield: 2,
    user: Immutable.Map({
        first_name: 'John',
        last_name: 'Doe'
    })
});

console.log("TESTING IMMUTABLE.JS")
testM = testM.setIn(['user', 'first_name'], 'Jane');
const testM2 = testM.getIn(['user', 'first_name']);
console.log(testM2);
testM = testM.set('normalfield', 3);
console.log("normalfield: " + testM.get('normalfield'));

console.log("---------------------");

let store = Immutable.Map({
    currentTab: 'home',
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    manifest: Immutable.Map({
        curiosity: {},
        opportunity: {},
        spirit: {}
    }),
    manifestsLoaded: 0,
    photos: {
        curiosity: {},
        opportunity: {},
        spirit: {}
    },
});

// add our markup to the page
const root = document.getElementById('root')

const render = async (root, state) => {
    root.innerHTML = App(state)
}


const App = (state) => {
    const currentTab = state.get("currentTab");
    //let { currentTab } = state.toJS();

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
    store.get('rovers').forEach((rover) => getManifest(rover.toLocaleLowerCase()));
}

function setupButtons() {
    document.getElementById("curiosityButton").addEventListener('click', function () {
        setCurrentTab('curiosity');
    });
    document.getElementById("opportunityButton").addEventListener('click', function () {
        setCurrentTab('opportunity');
    });
    document.getElementById("spiritButton").addEventListener('click', function () {
        setCurrentTab('spirit');
    });
    document.getElementById("homeButton").addEventListener('click', function () {
        setCurrentTab('home');
    });
}

const setCurrentTab = (tabToSet) => {
    store = store.set("currentTab", tabToSet);
    //state.set("currentTab", tabToSet);
    render(root, store);
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
    const roverRef = store.toJS().manifest[rover];
    const landingDate = `<div><b>Landing Date: </b>` + roverRef.landing_date + `</div>`;
    const launchDate = `<div><b>Launch Date: </b>` + roverRef.launch_date + `</div>`;
    const maxDate = `<div><b>Date of Last Available Photos: </b>` + roverRef.max_date + `</div>`;
    const status = `<div><b>Status: </b>` + roverRef.status + `</div>`;
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


    const max_date = store.getIn(["manifest", rover, "max_date"]);
    console.log("max_date: " + max_date);
    //const max_date = store.toJS().manifest[rover].max_date;
    const photos = store.getIn(["photos", rover]);
    //if (!Object.hasOwn(store.getIn("manifest", rover), tabName)) {
    if (Object.entries(photos).length === 0) {
        //if (!Object.hasOwn(store.getIn("manifest", rover), tabName)) {
        getPhotos(rover, max_date)
    }

    //no image yet, return
    /*
    if (!Object.hasOwn(store.toJS().photos, tabName)) {
        return (`
            loading rover photo...
        `);
    }
    */

    const galleryStart = `<div class="gallery-grid" id="gallery">`
    const galleryEnd = `</div>`

    //const images = store.toJS().photos[rover];
    let embeddedPhotos = '';
    photos.forEach(image => {
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
        .then(manifest => updateManifest(manifest, rover));
    //.then(manifest => updateManifest(store, manifest, rover));
}

const getPhotos = (rover, max_date) => {
    fetch(`http://localhost:3000/photos/${rover}/${max_date}`)
        .then(res => res.json())
        .then(photos => updatePhotos(photos, rover));
}

const updateStore = (store, newState) => {
    store = store.merge(newState);
    //store = Object.assign(store, newState)
    render(root, store)
}

const updateManifest = (newState, rover) => {
    let manifest;
    let currManifest;
    switch (rover) {
        case 'curiosity':
            const curiosity = newState.manifest.photo_manifest;
            //currManifest = store.get("manifest").toJS();
            //manifest = Object.assign(currManifest, { curiosity });
            store = store.setIn(["manifest", "curiosity"], curiosity)
            console.log(store.getIn(["manifest", "curiosity"]));
            break;
        case 'opportunity':
            const opportunity = newState.manifest.photo_manifest;
            //currManifest = store.get("manifest").toJS();
            //manifest = Object.assign(currManifest, { opportunity });
            store = store.setIn(["manifest", "opportunity"], opportunity)
            console.log(store.getIn(["manifest", "opportunity"]));
            break;
        case 'spirit':
            const spirit = newState.manifest.photo_manifest;
            //currManifest = store.get("manifest").toJS();
            //manifest = Object.assign(currManifest, { spirit });
            store = store.setIn(["manifest", "spirit"], spirit)
            console.log(store.getIn(["manifest", "spirit"]));
            break;
        default:
            break;
    }


    let loaded = store.get("manifestsLoaded");
    console.log("before: " + loaded);
    store = store.set("manifestsLoaded", loaded + 1);
    //store = Object.assign(store, { manifest })
    //store = store.set("manifest", manifest);
    //store = store.merge({ manifest });
    console.log("after" + store.get("manifestsLoaded"));
    if (store.get("manifestsLoaded") === 3) {
        console.log("STORE");
        console.log(store);
        render(root, store)
    }

}

const updatePhotos = (newState, rover) => {
    let photos;
    switch (rover) {
        case 'curiosity':
            const curiosity = newState.photos.photos;
            //photos = Object.assign(store.photos, { curiosity });
            store = store.setIn(["photos", "curiosity"], curiosity)
            //photos = Object.assign(store.toJS().photos, { curiosity });
            break;
        case 'opportunity':
            const opportunity = newState.photos.photos
            store = store.setIn(["photos", "opportunity"], opportunity)
            //photos = Object.assign(store.toJS().photos, { opportunity });
            break;
        case 'spirit':
            const spirit = newState.photos.photos
            //photos = Object.assign(store.photos, { spirit });
            store = store.setIn(["photos", "spirit"], spirit)
            //photos = Object.assign(store.toJS().photos, { spirit });
            break;
        default:
            break;
    }

    //store = Object.assign(store, { photos })

    render(root, store)
}