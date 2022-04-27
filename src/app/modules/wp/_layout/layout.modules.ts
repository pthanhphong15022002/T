import { SharedModule } from 'src/shared';
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { InlineSVGModule } from "ng-inline-svg";
import { WPRoutingModule } from "../wp-routing.module";
import { LayoutComponent } from "./layout.component";
import { HomeComponent } from '../home/home.component';


@NgModule({
  declarations: [
    LayoutComponent,
    HomeComponent
  ],
  imports: [
    InlineSVGModule,
    WPRoutingModule,
    SharedModule,
  ],
  exports: [RouterModule],
})
export class LayoutModule { }
