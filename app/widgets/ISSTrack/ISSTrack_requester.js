var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
define(["require", "exports", "./ISSTrack_config", "ecef-utilities", "esri/Graphic", "esri/request", "esri/symbols/PointSymbol3D"], function (require, exports, ISSTrack_config_1, ECEFUtils, Graphic, esriRequest, PointSymbol3D) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ECEFUtils = __importStar(ECEFUtils);
    function makeInitialRequest() {
        var _this = this;
        // Get the current timestamp as a unix time (to the nearest second, not millisecond)
        var now = Math.floor(new Date().valueOf() / 1000);
        // Build out list of 10 timestamps starting from current time and working
        // backwards in steps defined by the update interval
        var timestamps = this.generateTimestampList(now, ISSTrack_config_1.config.update_interval, 10);
        // Build the URL for the positions request
        var requestUrl = ISSTrack_config_1.config.url + "/" + ISSTrack_config_1.config.endpoints.positions;
        var requestOptions = {
            query: {
                timestamps: timestamps,
                units: ISSTrack_config_1.config.units
            },
            responseType: "json"
        };
        return esriRequest(requestUrl, requestOptions).then(function (response) {
            return _this.handleResponse(response.data);
        });
    }
    exports.makeInitialRequest = makeInitialRequest;
    function requestPosition(timestamp) {
        var _this = this;
        if (timestamp === undefined) {
            // if timestamp is not provided, use the current time
            timestamp = (new Date()).valueOf() / 1000;
        }
        // Build the URL for the positions request
        var requestUrl = ISSTrack_config_1.config.url + "/" + ISSTrack_config_1.config.endpoints.position;
        var requestOptions = {
            query: {
                units: ISSTrack_config_1.config.units,
                timestamp: timestamp
            },
            responseType: "json"
        };
        return esriRequest(requestUrl, requestOptions).then(function (response) {
            var graphics = _this.handleResponse(response.data);
            return graphics[0];
        });
    }
    exports.requestPosition = requestPosition;
    function handleResponse(response) {
        var _this = this;
        // Create a new Graphic Feature or Features from the response
        var features = [];
        var feature;
        if (Array.isArray(response)) {
            response.forEach(function (element) {
                feature = _this.buildFeature(element);
                features.push(feature);
                feature = null;
            });
        }
        else {
            feature = this.buildFeature(response);
            features.push(feature);
        }
        return features;
    }
    function buildFeature(issData) {
        var issPoint = {
            type: "point",
            latitude: issData.latitude,
            longitude: issData.longitude,
            z: issData.altitude * 1000,
            hasZ: true
        };
        // Generate ECEF points
        var ecefPt = ECEFUtils.LLAToECEF({
            lat: issData.latitude,
            lon: issData.longitude,
            alt: issData.altitude * 1000
        });
        var symbol = PointSymbol3D.fromJSON(ISSTrack_config_1.config.symbols.observedPoint);
        var feature = new Graphic({
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
    function generateTimestampList(firstTime, interval, length) {
        if (interval === void 0) { interval = 1; }
        if (length === void 0) { length = 10; }
        var timestamps = "" + firstTime;
        var timestamp;
        for (var i = 1; i < length; ++i) {
            timestamp = firstTime - (interval * i);
            timestamps = timestamps + "," + timestamp;
        }
        return timestamps;
    }
});
//# sourceMappingURL=ISSTrack_requester.js.map