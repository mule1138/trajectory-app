/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget", "./ISSTrack_config", "./ISSTrack_requester", "esri/layers/GraphicsLayer"], function (require, exports, __extends, __decorate, decorators_1, Widget_1, widget_1, ISSTrack_config_1, ISSTrackRequester, GraphicsLayer) {
    "use strict";
    Widget_1 = __importDefault(Widget_1);
    ISSTrackRequester = __importStar(ISSTrackRequester);
    var CSS = {
        base: "iss-track"
    };
    ;
    // Enum for where we got our ISS ephemeris
    var EphemerisSource;
    (function (EphemerisSource) {
        EphemerisSource["Generated"] = "GENERATED";
        EphemerisSource["WebService"] = "WEB_SERVICE";
    })(EphemerisSource || (EphemerisSource = {}));
    var ISSTrack = /** @class */ (function (_super) {
        __extends(ISSTrack, _super);
        function ISSTrack(params) {
            return _super.call(this) || this;
        }
        ISSTrack.prototype.postInitialize = function () {
            var _this = this;
            // Add the graphics layer
            this.issPointLayer = new GraphicsLayer();
            this.issTrackLayer = new GraphicsLayer();
            this.map.addMany([this.issPointLayer, this.issTrackLayer]);
            // Make the inital request
            ISSTrackRequester.makeInitialRequest().then(function (results) {
                // Add the points to the point graphics layer
                _this.issPointLayer.addMany(results);
                var currentFeature = results[0];
                _this.updateState(currentFeature);
            });
            // set up periodic request
            setInterval(function () {
                ISSTrackRequester.requestPosition().then(function (results) {
                    var feature = results[0];
                    _this.issPointLayer.add(feature);
                    _this.updateState(feature);
                });
            }, ISSTrack_config_1.config.update_interval * 1000);
        };
        ISSTrack.prototype.destroy = function () {
            clearInterval(this.requestIntervalId);
        };
        ISSTrack.prototype.updateState = function (currentFeature) {
            // Set the current state
            this.state.currentPoint.timestamp = currentFeature.attributes.timestamp;
            this.state.currentPoint.lat = currentFeature.geometry.latitude;
            this.state.currentPoint.lon = currentFeature.geometry.longitude;
            this.state.currentPoint.alt = currentFeature.geometry.z;
            this.view.goTo(currentFeature.geometry);
        };
        ISSTrack.prototype.render = function () {
            var timestamp = (new Date(this.state.currentPoint.timestamp * 1000)).toISOString;
            var _a = this.state.currentPoint, lat = _a.lat, lon = _a.lon, alt = _a.alt;
            var retElement = widget_1.tsx("div", { bind: this, class: CSS.base },
                widget_1.tsx("p", null, "Time: timestamp"),
                widget_1.tsx("p", null,
                    "Lat: ",
                    Number(lat).toFixed(3)),
                widget_1.tsx("p", null,
                    "Lon: ",
                    Number(lon).toFixed(3)),
                widget_1.tsx("p", null,
                    "Alt: ",
                    Number(alt).toFixed(3)));
            return retElement;
        };
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], ISSTrack.prototype, "state", void 0);
        __decorate([
            decorators_1.property()
        ], ISSTrack.prototype, "view", void 0);
        __decorate([
            decorators_1.property()
        ], ISSTrack.prototype, "issPointLayer", void 0);
        __decorate([
            decorators_1.property()
        ], ISSTrack.prototype, "issTrackLayer", void 0);
        __decorate([
            decorators_1.property()
        ], ISSTrack.prototype, "map", void 0);
        __decorate([
            decorators_1.property()
        ], ISSTrack.prototype, "requestIntervalId", void 0);
        ISSTrack = __decorate([
            decorators_1.subclass("esri.widgets.ISSTrack")
        ], ISSTrack);
        return ISSTrack;
    }(decorators_1.declared(Widget_1.default)));
    return ISSTrack;
});
//# sourceMappingURL=ISSTrack.js.map