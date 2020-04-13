/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";
import Widget from "esri/widgets/Widget";
import { renderable, tsx } from "esri/widgets/support/widget";

const CSS = {
    base: "esri-hello-world",
    emphasis: "esri-hello-world--emphasis"
};

@subclass("esri.widgets.HelloWorld")
class HelloWorld extends declared(Widget) {
    constructor(params?: any) {
        super();
    }

    @property()
    @renderable()
    firstName: string = 'John';

    @property()
    @renderable()
    lastName: string = "Smith"

    @property()
    @renderable()
    emphasized: boolean = false;

    render() {
        const greeting = this._getGreeting();
        const classes = {
            [CSS.emphasis]: this.emphasized
        }

        return(
            <div class={this.classes(CSS.base, classes)}>
                {greeting}
            </div>
        );
    }

    private _getGreeting() {
        return `Hello, my name is ${this.firstName} ${this.lastName}!`;
    }
}

export = HelloWorld;