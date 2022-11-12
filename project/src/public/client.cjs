//const { Map } = require('immutable');
const testM = Immutable.Map({
    user: Immutable.Map({
        first_name: 'John',
        last_name: 'Doe'
    })
});

console.log(testM);

let store = Immutable.Map({
    currentTab: 'home',
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    manifest: {},
    manifestsLoaded: 0,
    photos: {},
});

// add our markup to the page
const root = document.getElementById('root')

const render = async (root, state) => {
    root.innerHTML = App(state)
}

const App = (state) => {
    const currentTab = state.get('currentTab');

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
    const allRovers = store.get('rovers');
    allRovers.forEach((rover) => getManifest(rover.toLocaleLowerCase()));
}

function setupButtons() {

    const tabs = createTabNames(store.get('rovers'));
    const buttons = createButtonNames(tabs);

    for (let i = 0; i < tabs.length; i++) {
        document.getElementById(buttons[i]).addEventListener('click', function () {
            setCurrentTab(store, tabs[i]);
        });
    }
}

const createTabNames = (roverArray) => {
    const tabArray = roverArray.map(rover => rover.toLowerCase());
    tabArray.push("home");
    return tabArray;
}

const createButtonNames = (tabArray) => {
    const buttonArray = tabArray.map(tab => tab + "Button");
    return buttonArray;
}

const setCurrentTab = (state, tabToSet) => {
    store = state.set('currentTab', tabToSet);
    render(root, store);
}

// ------------------------------------------------------  COMPONENTS

const Tab = (tabName) => {
    const formattedName = tabName.charAt(0).toUpperCase() + tabName.slice(1);
    return (`${formattedName}`);
}

const roverDescription = (rover) => {

    const landing_date = store.getIn(['manifest', rover, 'landing_date'])
    const launch_date = store.getIn(['manifest', rover, 'launch_date'])
    const max_date = store.getIn(['manifest', rover, 'max_date'])
    const status = store.getIn(['manifest', rover, 'status'])

    const hLandingDate = `<div><b>Landing Date: </b>` + landing_date + `</div>`;
    const hLaunchDate = `<div><b>Launch Date: </b>` + launch_date + `</div>`;
    const hMaxDate = `<div><b>Date of Last Available Photos: </b>` + max_date + `</div>`;
    const hStatus = `<div><b>Status: </b>` + status + `</div>`;

    return (`${hLandingDate} ${hLaunchDate} ${hMaxDate} ${hStatus}`);
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
    const manifest = store.get('manifest');

    const max_date = manifest[rover].max_date;
    if (!store.hasIn(['photos', rover])) {
        getPhotos(rover, max_date)
    }

    //no image yet, return
    if (!store.hasIn(['photos', rover])) {
        return (`
            loading rover photo...
        `);
    }

    const galleryStart = `<div class="gallery-grid" id="gallery">`
    const galleryEnd = `</div>`

    const images = store.getIn(['photos', rover]);
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

const updateStore = (state, newState) => {
    store = state.merge(newState);
    render(root, store)
}

const updateManifest = (store, newState, rover) => {
    let manifest;
    switch (rover) {
        case 'curiosity':
            const curiosity = newState.manifest.photo_manifest;
            manifest = Object.assign(store.get('manifest'), { curiosity });
            break;
        case 'opportunity':
            const opportunity = newState.manifest.photo_manifest;
            manifest = Object.assign(store.get('manifest'), { opportunity });
            break;
        case 'spirit':
            const spirit = newState.manifest.photo_manifest;
            manifest = Object.assign(store.get('manifest'), { spirit });
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
            photos = Object.assign(store.get('photos'), { curiosity });
            break;
        case 'opportunity':
            const opportunity = newState.photos.photos
            photos = Object.assign(store.get('photos'), { opportunity });
            break;
        case 'spirit':
            const spirit = newState.photos.photos
            photos = Object.assign(store.get('photos'), { spirit });
            break;
        default:
            break;
    }

    //both need to be maps?
    photos = Immutable.fromJS({ photos })
    store = store.merge(photos);

    render(root, store)
}