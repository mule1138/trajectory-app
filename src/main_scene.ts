import EsriMap from "esri/Map";
import SceneView from "esri/views/SceneView";
import Camera from "esri/Camera";

const map = new EsriMap({
    basemap: "terrain",
    ground: "world-elevation"
});

const view = new SceneView({
    map: map,
    container: "viewDiv",
    camera: new Camera ({
        position: {
            longitude: -118.244,
            latitude: 33.62,
            z: 100000
        },
        heading: 0,
        tilt: 20
    }),
});
