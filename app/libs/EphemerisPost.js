var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
define(["require", "exports", "ecef-utilities"], function (require, exports, ECEFUtils) {
    "use strict";
    ECEFUtils = __importStar(ECEFUtils);
    var EphemerisPost = /** @class */ (function () {
        function EphemerisPost(timestamp) {
            this._lla = null;
            this._ecef = null;
            this._velocity = null;
            this.speed = 0;
            this._timestamp = timestamp;
        }
        EphemerisPost.createWithLLA = function (lla, timestamp) {
            var post = new EphemerisPost(timestamp);
            post.lla = lla;
            post.ecef = ECEFUtils.LLAToECEF(lla);
            return post;
        };
        EphemerisPost.createWithECEF = function (ecef, timestamp) {
            var post = new EphemerisPost(timestamp);
            post.lla = ECEFUtils.ECEFToLLA(ecef);
            post.ecef = ecef;
            return post;
        };
        EphemerisPost.prototype.calculateVelocityFromOtherPost = function (post) {
        };
        Object.defineProperty(EphemerisPost.prototype, "lla", {
            get: function () {
                return this._lla;
            },
            // *** ACCESSOR FUNCTIONS *** //
            set: function (lla) {
                if (lla.lat > 90.0 || lla.lat < -90.0) {
                    throw new RangeError("Lat must be between -90 and 90 degrees");
                }
                if (lla.lon > 180.0 || lla.lon < -180.0) {
                    throw new RangeError("Lon must be betwen -180 and 180");
                }
                this._lla = lla;
            },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(EphemerisPost.prototype, "ecef", {
            get: function () {
                return this._ecef;
            },
            set: function (ecef) {
                this._ecef = ecef;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EphemerisPost.prototype, "velocity", {
            get: function () {
                return this._velocity;
            },
            set: function (velocity) {
                this._velocity = velocity;
                this.speed = Math.sqrt(Math.pow(this.velocity.vx, 2) + Math.pow(this.velocity.vy, 2) + Math.pow(this.velocity.vz, 2));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EphemerisPost.prototype, "timestamp", {
            get: function () {
                return this._timestamp;
            },
            enumerable: true,
            configurable: true
        });
        return EphemerisPost;
    }());
    return EphemerisPost;
});
//# sourceMappingURL=EphemerisPost.js.map