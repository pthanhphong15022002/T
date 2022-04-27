import { SharedModule } from 'src/shared';
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { InlineSVGModule } from "ng-inline-svg";
import { WPRoutingModule } from "../wp-routing.module";
import { LayoutComponent } from "./layout.component";


@NgModule({
  declarations: [
    LayoutComponent,
    // MessengerDrawerComponent,
    // ChatInnerComponent,
    // NotifyDrawerComponent,
    // QuickLinksInnerComponent,
    // UserInnerComponent,
  ],
  imports: [
    // CommonModule,
    InlineSVGModule,
    // NgbModule,
    // ERMModule,
    WPRoutingModule,
    // CodxCoreModule.forRoot({ environment }),
    SharedModule,
  ],
  exports: [RouterModule],
})
export class LayoutModule { }
