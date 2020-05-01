import * as ECEFUtils from "ecef-utilities";
import { LLAPoint, ECEFPoint, ECEFVelocity } from "ecef-utilities";

class EphemerisPost {
    private _timestamp: number;
    private _lla: LLAPoint;
    private _ecef: ECEFPoint;
    private _velocity: ECEFVelocity;
    public speed: number;

    private constructor(timestamp: number) {
        this._lla = null;
        this._ecef = null;
        this._velocity = null;
        this.speed = 0;
        this._timestamp = timestamp;
    }

    static createWithLLA(lla: LLAPoint, timestamp: number): EphemerisPost {
        const post = new EphemerisPost(timestamp);
        post.lla = lla;
        post.ecef = ECEFUtils.LLAToECEF(lla);

        return post;
    }

    static createWithECEF(ecef: ECEFPoint, timestamp: number): EphemerisPost {
        const post = new EphemerisPost(timestamp);
        post.lla = ECEFUtils.ECEFToLLA(ecef);
        post.ecef = ecef;

        return post;
    }

    calculateVelocityFromOtherPost(post: EphemerisPost): void {

    }

    // *** ACCESSOR FUNCTIONS *** //
    set lla(lla: { lat: number, lon: number, alt: number }) {
        if (lla.lat > 90.0 || lla.lat < -90.0) {
            throw new RangeError("Lat must be between -90 and 90 degrees");
        }
        if (lla.lon > 180.0 || lla.lon < -180.0) {
            throw new RangeError("Lon must be betwen -180 and 180");
        }

        this._lla = lla;
    };

    get lla(): LLAPoint {
        return this._lla;
    }

    set ecef(ecef: ECEFPoint) {
        this._ecef = ecef;
    }

    get ecef(): ECEFPoint {
        return this._ecef
    }

    set velocity(velocity: ECEFVelocity) {
        this._velocity = velocity;
        this.speed = Math.sqrt(Math.pow(this.velocity.vx, 2) + Math.pow(this.velocity.vy, 2) + Math.pow(this.velocity.vz, 2));
    }

    get velocity(): ECEFVelocity {
        return this._velocity;
    }

    get timestamp(): number {
        return this._timestamp;
    }
}

export = EphemerisPost;