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
        // Add the graphics layer
        this.issPointLayer = new GraphicsLayer();
        this.issTrackLayer = new GraphicsLayer();
        this.map.addMany([this.issPointLayer, this.issTrackLayer]);

        // Make the inital request
        ISSTrackRequester.makeInitialRequest().then(results => {
            // Add the points to the point graphics layer
            this.issPointLayer.addMany(results);
            const currentFeature = results[0];
            this.updateState(currentFeature);
        });

        // set up periodic request
        setInterval(() => {
            ISSTrackRequester.requestPosition().then(results => {
                const feature = results[0];
                this.issPointLayer.add(feature);
                this.updateState(feature);
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
}

export = ISSTrack;