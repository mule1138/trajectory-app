/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";

import Widget from "esri/widgets/Widget";
import * as watchUtils from "esri/core/watchUtils";

import { renderable, tsx } from "esri/widgets/support/widget";

import Point = require("esri/geometry/Point");
import SceneView = require("esri/views/SceneView");

type Coordinates = Point | number[] | any;

interface Center {
    x: number,
    y: number,
    latitude: number,
    longitude: number
}

interface State extends Center {
    interacting: boolean,
    scale: number,
    cameraHeight: number
}

interface Style {
    textShadow: string
}

const CSS = {
    base: "recenter-tool"
}

@subclass("esri.widgets.Recenter")
class Recenter extends declared(Widget) {
    constructor(params?: any) {
        super();
        this._onViewChange = this._onViewChange.bind(this);
    }

    // Called by the framework after widget is created but before it is rendered
    postInitialize() {
        watchUtils.init(this, "view.center, view.interacting, view.scale", () => this._onViewChange());
    }

    @property()
    @renderable()
    view: SceneView;

    @property()
    @renderable()
    initialCenter: Center;

    @property()
    @renderable()
    state: State;

    render() {
        const { x, y, latitude, longitude, scale, cameraHeight } = this.state;
        const styles: Style = {
            textShadow: this.state.interacting ? '-1px 0 red, 0 1px red, 1px 0 red, 0 -1px red' : ''
        };

        const retElement =
            <div
                bind={this}
                class={CSS.base}
                styles={styles}
                onclick={this._defaultCenter}>
                <p>lat: {Number(latitude).toFixed(3)}</p>
                <p>lon: {Number(longitude).toFixed(3)}</p>
                <p>Camera Alt: {Number(cameraHeight).toFixed(3)}</p>
            </div>

        return retElement;
    }

    private _onViewChange() {
        let { interacting, center, scale, camera } = this.view;
        this.state = {
            x: center.x,
            y: center.y,
            latitude: center.latitude,
            longitude: center.longitude,
            interacting,
            scale,
            cameraHeight: camera.position.z
        };
    }

    private _defaultCenter() {
        this.view.goTo(this.initialCenter);
    }
}

export = Recenter;

