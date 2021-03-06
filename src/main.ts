import Camera from "esri/Camera";
import EsriMap from "esri/Map";
import MapView from "esri/views/MapView";
import SceneView from "esri/views/SceneView";
import VectorTileLayer from "esri/layers/VectorTileLayer";

import Recenter from "./Recenter";

// *** GLOBAL VARS *** //
let map: EsriMap;
// let view: MapView;
let view: SceneView;
let recenter: Recenter;

// *** DO STUFF *** //
init();


// *** HELPER FUNCTIONS *** //
function init() {
    map = new EsriMap({
        basemap: "gray-vector"
    });
    const tileLayer = new VectorTileLayer({
        url: "https://www.arcgis.com/sharing/rest/content/items/92c551c9f07b4147846aae273e822714/resources/styles/root.json"
    });
    map.add(tileLayer);

    view = new SceneView({
        map: map,
        container: "viewDiv",
        camera: new Camera({
            position: {
                longitude: -118.244,
                latitude: 33.62,
                z: 100000
            },
            heading: 0,
            tilt: 20
        })
    });

    // view = new MapView({
    //     map: map,
    //     container: "viewDiv",
    //     center: [-100.33, 43.69],
    //     zoom: 4
    // });

    view.when(() => {
        recenter = new Recenter({
            view: view,
            initialCenter: [-100.33, 43.69]
        });
        view.ui.add(recenter, "top-right");
    });
}