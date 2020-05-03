/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";
import Widget from "esri/widgets/Widget";
import { renderable, tsx } from "esri/widgets/support/widget";

import { config } from "./ISSTrack_config";
import * as ISSTrackRequester from "./ISSTrack_requester";

import Graphic = require("esri/Graphic");
import GraphicsLayer = require("esri/layers/GraphicsLayer");
import Map = require("esri/Map");
import Point = require("esri/geometry/Point");
import SceneView = require("esri/views/SceneView");
import { PointSymbol3D, ObjectSymbol3DLayer, PictureMarkerSymbol, SimpleMarkerSymbol } from "esri/symbols";

interface Style {
}

const CSS = {
    base: "iss-track"
}

interface ISSPoint {
    timestamp: number,
    lat: number,
    lon: number,
    alt: number,
};

// Enum for where we got our ISS ephemeris
enum EphemerisSource {
    None = "NONE",
    Generated = "GENERATED",
    WebService = "WEB_SERVICE"
}

interface State {
    currentPoint: ISSPoint,
    source: EphemerisSource
}

@subclass("esri.widgets.ISSTrack")
class ISSTrack extends declared(Widget) {
    constructor(params?: any) {
        super();

        this.addFeatures = this.addFeatures.bind(this);
        this.addFeature = this.addFeature.bind(this);
    }

    @property()
    @renderable()
    state: State;

    @property()
    view: SceneView;

    @property()
    issPointLayer: GraphicsLayer;

    @property()
    issTrackLayer: GraphicsLayer;

    @property()
    map: Map;

    @property()
    requestIntervalId: number

    postInitialize() {
        if (this.state === undefined) {
            this.state = {
                currentPoint: {
                    timestamp: 0,
                    lat: 0,
                    lon: 0,
                    alt: 0
                },
                source: EphemerisSource.None
            }
        }

        // Add the graphics layer
        this.issPointLayer = new GraphicsLayer();
        this.issTrackLayer = new GraphicsLayer();
        this.map.addMany([this.issPointLayer, this.issTrackLayer]);

        const testGraphic = new Graphic({
            geometry: new Point({
                latitude: 0.0,
                longitude: 0.0,
                z: 10000
            }),
            symbol: new PointSymbol3D({
                symbolLayers: [
                    new ObjectSymbol3DLayer({
                        anchor: "origin",
                        depth: 10,
                        height: 10,
                        resource: { primitive: "sphere" },
                        width: 10,
                        material: { color: [191, 191, 0, 1] }

                    })
                ]
            }),
            attributes: {
                name: "Test Point"
            }
        });
        this.issPointLayer.add(testGraphic);

        const testPictureGraphic = new Graphic({
            geometry: new Point({
                latitude: 10.0,
                longitude: 10.0,
                z: 400000
            }),
            symbol: new PictureMarkerSymbol({
                url: "https://developers.arcgis.com/javascript/latest/sample-code/satellites-3d/live/satellite.png",
                width: 48,
                height: 48
            }),
            attributes: {
                name: "Test Point"
            }
        });
        this.issPointLayer.add(testPictureGraphic);

        const testMarkerGraphic = new Graphic({
            geometry: new Point({
                latitude: 10.0,
                longitude: 20.0,
                z: 400000
            }),
            symbol: new SimpleMarkerSymbol({
                outline: {
                    color: [36, 36, 36, 1]
                },
                size: 10,
                color: [230, 230, 0, 0.52]
            }),
            attributes: {
                name: "Test Point"
            }
        });
        this.issPointLayer.add(testMarkerGraphic);

        // Make the inital request
        // const self = this;
        // ISSTrackRequester.makeInitialRequest().then(results => {
        //     // Add the points to the point graphics layer
        //     self.issPointLayer.addMany(results);
        //     const currentFeature = results[0];
        //     self.updateState(currentFeature);
        // }).catch(error => {
        //     console.log(`The initial request failed with error: ${error}`);
        // });
        ISSTrackRequester.makeInitialRequest()
            .then(this.addFeatures)
            .catch(error => {
                console.log(`The initial request failed with error: ${error}`);
            });

        // set up periodic request
        // setInterval(() => {
        //     ISSTrackRequester.requestPosition().then(results => {
        //         const feature = results[0];
        //         this.issPointLayer.add(feature);
        //         this.updateState(feature);
        //     }).catch(error => {
        //         console.log(`The periodic request failed with error: ${error}`);
        //     });
        // }, config.update_interval * 1000);
        setInterval(() => {
            ISSTrackRequester.requestPosition()
            .then(this.addFeature)
            .catch(error => {
                console.log(`The periodic request failed with error: ${error}`);
            });
        }, config.update_interval * 1000);
    }

    destroy() {
        clearInterval(this.requestIntervalId);
    }

    updateState(currentFeature: Graphic) {
        // Set the current state
        this.state.currentPoint.timestamp = currentFeature.attributes.timestamp;
        this.state.currentPoint.lat = (currentFeature.geometry as Point).latitude;
        this.state.currentPoint.lon = (currentFeature.geometry as Point).longitude;
        this.state.currentPoint.alt = (currentFeature.geometry as Point).z;

        this.view.goTo(currentFeature.geometry)
    }

    render() {
        const timestamp = (new Date(this.state.currentPoint.timestamp * 1000)).toISOString;
        const { lat, lon, alt } = this.state.currentPoint;
        const retElement =
            <div
                bind={this}
                class={CSS.base}>
                <p>Time: timestamp</p>
                <p>Lat: {Number(lat).toFixed(3)}</p>
                <p>Lon: {Number(lon).toFixed(3)}</p>
                <p>Alt: {Number(alt).toFixed(3)}</p>
            </div>

        return retElement;
    }

    private addFeatures(features: Graphic[]) {
        // Add the points to the point graphics layer
        this.issPointLayer.addMany(features);
        const currentFeature = features[0];
        this.updateState(currentFeature);
    }

    private addFeature(feature: Graphic) {
        // Add the points to the point graphics layer
        this.issPointLayer.add(feature);
        const currentFeature = feature;
        this.updateState(currentFeature);
    }
}

export = ISSTrack;