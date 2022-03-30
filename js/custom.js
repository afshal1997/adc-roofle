mapboxgl.accessToken =
    "pk.eyJ1Ijoic21hbGxjcm93ZCIsImEiOiJja3o3YjhpdGoxOHJtMndxb2ozZjM2MzBqIn0.AfrVDa-gWP3PEg2od9XWMA";

const bounds = [
    [-97.846976993, 30.167105159], // Southwest coordinates
    [-97.751211018, 30.242129961], // Northeast coordinates
];


var center = [-79.4512, 43.6568];
let geoDetailsInfo = {}


const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/smallcrowd/cl07a4926001b15pnu5we767g", //change this style according to you
    center: center,
    minZoom: 15,
    maxZoom: 19,
    zoom: 19,
    maxBounds: bounds,
});

// Add the control to the map.
const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    zoom: 19,
    bbox: [-97.846976993, 30.167105159, -97.751211018, 30.242129961],
});
map.addControl(new mapboxgl.NavigationControl());

map.on("load", function () {
    geocoder.on("clear", () => {
        $("#map").css("display", "none");
        clearNotification()
    });

    map.addLayer({
        id: "3d-buildings",
        source: "composite",
        "source-layer": "building",
        type: "fill",
        minzoom: 15,
        paint: {
            "fill-color": "transparent",
        },
    });

    map.addSource("currentBuildings", {
        type: "geojson",
        data: {
            type: "FeatureCollection",
            features: [],
        },
    });
    map.addLayer({
        id: "highlight",
        source: "currentBuildings",
        type: "fill",
        minzoom: 15,
        paint: {
            "fill-color": "#E28A5E", //this is paint color, change it according to you
        },
    });
    geocoder.on("result", ({ result: retrievedGeoInformation }) => {
        if (retrievedGeoInformation) {
            geoDetailsInfo = retrievedGeoInformation
        }
        $(".loader").css("display", "block");
        $("#map").css("opacity", 0);
        $("#map").css("display", "block");
        getArea();
    });
});

document.getElementById("geocoder").appendChild(geocoder.onAdd(map));

function getArea() {
    map.once("idle", () => {
        const xP = map.getContainer()?.getClientRects()[0]?.width / 2;
        const yP = map.getContainer()?.getClientRects()[0]?.height / 2;
        const point = [xP, yP];
        const selectedFeatures = map.queryRenderedFeatures(point, {
            layers: ["3d-buildings"],
        });
        if (selectedFeatures.length == 0) {
            alertNotification()
        } else {
            successNotification()
            map.getSource("currentBuildings").setData({
                type: "FeatureCollection",
                features: selectedFeatures,
            });
            hideLoader()
            const coordinates = selectedFeatures[0].geometry.coordinates;
            const polygon = turf.polygon(coordinates);
            const area = turf.area(polygon);
            const rounded_area_in_meter = Math.round(area * 100) / 100; //this is your square/meter area, use this in your calculation
            const rounded_area_in_ft =
                Math.round(rounded_area_in_meter * 10.764 * 100) / 100;
            const price_per_square_ft = rounded_area_in_ft * 5.55;
            const btnToOpenModal = document.getElementById('info-modal')
            btnToOpenModal.removeAttribute('disabled');
            const modal_title = document.querySelector('.modal-title')
            const areaInSqFtForModal = document.querySelector('#roof-top-sqft')
            const roofPriceForModal = document.querySelector('#roof-top-price')
            areaInSqFtForModal.innerText = `Your square feet area is ${rounded_area_in_ft}`
            modal_title.innerText = geoDetailsInfo['place_name']
            roofPriceForModal.innerText = `$ ${Math.ceil(price_per_square_ft)}`
        }
    });
}
function roofNotFound() {

}

const alertNotification = () => {
    document.querySelector('#not-found-alert').classList.toggle('d-none')
    document.querySelector('#not-found-alert').classList.add('alert-danger')
    document.querySelector('#not-found-alert #search-result').innerHTML = "Roof Top Not found"
    hideLoader()
}
const clearNotification = () => {
    document.querySelector('#not-found-alert').classList.add('d-none')
    document.querySelector('#not-found-alert').classList.remove('alert-danger', 'alert-success')
    document.querySelector('#not-found-alert #search-result').innerHTML = ""
    hideLoader()
}
const successNotification = () => {
    document.querySelector('#not-found-alert').classList.remove('d-none', 'alert-danger')
    document.querySelector('#not-found-alert').classList.add('alert-success')
    document.querySelector('#not-found-alert #search-result').innerHTML = "Roof Top found"
    hideLoader()
}

const hideLoader = () => {
    $("#map").css("opacity", 1);
    $(".loader").css("display", "none");
}
function openDetailsModel() {
    document.getElementById('exampleModal').classList.toggle('d-none')
}