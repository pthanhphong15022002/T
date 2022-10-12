import { Component, Injector } from "@angular/core";
import { Layout } from "@syncfusion/ej2-angular-diagrams";
import { LayoutBaseComponent } from "codx-core";


@Component({
    selector: 'lib-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss']
})

export class LyoutComponent extends LayoutBaseComponent{

    module: string = 'TM';
    constructor(inject: Injector){
        super(inject);
    }

    onInit(): void { }
    onAfterViewInit(): void {}
}