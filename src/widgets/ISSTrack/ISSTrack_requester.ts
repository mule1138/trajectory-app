import { config } from "./ISSTrack_config";
import * as ECEFUtils from "../../libs/ecef-utilities/ecef-utilities";
import { ECEFPoint } from "../../libs/ecef-utilities/ecef-utilities";

import Graphic = require("esri/Graphic");
import esriRequest = require("esri/request");
import { Point } from "esri/geometry";
import { SimpleMarkerSymbol } from "esri/symbols";

export function makeInitialRequest(): Promise<Graphic[]> {
    // Get the current timestamp as a unix time (to the nearest second, not millisecond)
    const now = Math.floor(new Date().valueOf() / 1000);

    // Build out list of 10 timestamps starting from current time and working
    // backwards in steps defined by the update interval
    const timestamps = generateTimestampList(now, config.update_interval, 10);

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
        return handleResponse(response.data);
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
        const graphics = handleResponse(response.data);
        return graphics[0];
    });
}

function handleResponse(response: any): Graphic[] {
    // Create a new Graphic Feature or Features from the response
    const features = [];
    let feature: Graphic;
    if (Array.isArray(response)) {
        response.forEach(element => {
            feature = buildFeature(element);
            features.push(feature);
            feature = null;
        });
    } else {
        feature = buildFeature(response);
        features.push(feature);
    }

    return features;
}

function buildFeature(issData: any): Graphic {
    const issPoint: Point = new Point({
        latitude: issData.latitude,
        longitude: issData.longitude,
        z: issData.altitude * 1000,
    });

    // Generate ECEF points
    const ecefPt: ECEFPoint = ECEFUtils.LLAToECEF({
        lat: issData.latitude,
        lon: issData.longitude,
        alt: issData.altitude * 1000
    });

    const symbol = buildObservedPointSymbol();

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

// function buildObservedPointSymbol(): PointSymbol3D {
//     const symbol: PointSymbol3D = new PointSymbol3D({
//         symbolLayers: [
//             new ObjectSymbol3DLayer({
//                 anchor: "origin",
//                 depth: 10,
//                 height: 10,
//                 resource: { primitive: "sphere" },
//                 width: 10,
//                 material: { color: [191, 191, 0, 1] }
//             })]
//     });

//     return symbol;
// }

function buildObservedPointSymbol(): SimpleMarkerSymbol {
    const symbol: SimpleMarkerSymbol = new SimpleMarkerSymbol({
        outline: {
            color: [36, 36, 36, 1]
        },
        size: 10,
        color: [230, 230, 0, 0.52]
    });

    return symbol;
}

function buildCurrentPointSymbol(): SimpleMarkerSymbol {
    const symbol: SimpleMarkerSymbol = new SimpleMarkerSymbol({
        style: "diamond",
        outline: {
            color: [36, 36, 36, 1]
        },
        size: 10,
        color: [230, 230, 0, 0.52]
    });

    return symbol;
}