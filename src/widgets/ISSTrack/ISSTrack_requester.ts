import { config } from "./ISSTrack_config";
import * as ECEFUtils from "../../libs/ecef-utilities/ecef-utilities";
import { ECEFPoint } from "../../libs/ecef-utilities/ecef-utilities";

// import ECEFUtils = require("../node_modules/ecef-utilities/dist/ecef_uilts");

import Graphic = require("esri/Graphic");
import esriRequest = require("esri/request");
import PointSymbol3D = require("esri/symbols/PointSymbol3D");

export function makeInitialRequest(): Promise<Graphic[]> {
    // Get the current timestamp as a unix time (to the nearest second, not millisecond)
    const now = Math.floor(new Date().valueOf() / 1000);

    // Build out list of 10 timestamps starting from current time and working
    // backwards in steps defined by the update interval
    const timestamps = this.generateTimestampList(now, config.update_interval, 10);

    // Build the URL for the positions request
    const requestUrl = `${config.url}/${config.endpoints.positions}`;
    const requestOptions: __esri.RequestOptions = {
        query: {
            timestamps: timestamps,
            units: config.units
        },
        responseType: "json"
    };

    return esriRequest(requestUrl, requestOptions).then(response => {
        return this.handleResponse(response.data);
    });
}

export function requestPosition(timestamp?: number): Promise<Graphic> {
    if (timestamp === undefined) {
        // if timestamp is not provided, use the current time
        timestamp = (new Date()).valueOf() / 1000;
    }

    // Build the URL for the positions request
    const requestUrl = `${config.url}/${config.endpoints.position}`;

    const requestOptions: __esri.RequestOptions = {
        query: {
            units: config.units,
            timestamp: timestamp
        },
        responseType: "json"
    };

    return esriRequest(requestUrl, requestOptions).then(response => {
        const graphics = this.handleResponse(response.data);
        return graphics[0];
    });
}

function handleResponse(response: any): Graphic[] {
    // Create a new Graphic Feature or Features from the response
    const features = [];
    let feature: Graphic;
    if (Array.isArray(response)) {
        response.forEach(element => {
            feature = this.buildFeature(element);
            features.push(feature);
            feature = null;
        });
    } else {
        feature = this.buildFeature(response);
        features.push(feature);
    }

    return features;
}

function buildFeature(issData: any): Graphic {
    const issPoint = {
        type: "point",
        latitude: issData.latitude,
        longitude: issData.longitude,
        z: issData.altitude * 1000,
        hasZ: true
    };

    // Generate ECEF points
    const ecefPt: ECEFUtils.ECEFPoint = ECEFUtils.LLAToECEF({
        lat: issData.latitude,
        lon: issData.longitude,
        alt: issData.altitude * 1000
    });

    const symbol = PointSymbol3D.fromJSON(config.symbols.observedPoint);

    const feature = new Graphic({
        geometry: issPoint,
        symbol: symbol,
        attributes: {
            velocity: issData.velocity,
            timestamp: issData.timestamp,
            visibility: issData.visibility,
            solar_lat: issData.solar_lat,
            solar_lon: issData.solar_lon,
            ecef_x: ecefPt.x,
            ecef_y: ecefPt.y,
            ecef_z: ecefPt.z
        }
    });

    return feature;
}

function generateTimestampList(firstTime: number, interval: number = 1, length: number = 10): string {
    let timestamps = `${firstTime}`;
    let timestamp;
    for (let i = 1; i < length; ++i) {
        timestamp = firstTime - (interval * i);
        timestamps = `${timestamps},${timestamp}`;
    }

    return timestamps;
}
