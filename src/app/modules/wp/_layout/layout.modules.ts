import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ERMModule } from "@shared/erm.module";
import { CodxCoreModule } from "codx-core";
import { InlineSVGModule } from "ng-inline-svg";
import { environment } from "src/environments/environment";
import { HomeComponent } from "../home/home.component";
import { WPRoutingModule } from "../wp-routing.module";
import { ChatInnerComponent } from "./drawers/messenger-drawer/chat-inner/chat-inner.component";
import { MessengerDrawerComponent } from "./drawers/messenger-drawer/messenger-drawer.component";
import { NotifyDrawerComponent } from "./drawers/notify-drawer/notify-drawer.component";
import { QuickLinksInnerComponent } from "./dropdown-inner/quick-links-inner/quick-links-inner.component";
import { UserInnerComponent } from "./dropdown-inner/user-inner/user-inner.component";
import { LayoutComponent } from "./layout.component";


@NgModule({
    declarations: [
        LayoutComponent,
        MessengerDrawerComponent,
        ChatInnerComponent,
        NotifyDrawerComponent,
        QuickLinksInnerComponent,
        UserInnerComponent,
        HomeComponent
    ],
    imports: [
        CommonModule,
        InlineSVGModule,
        NgbModule,
        ERMModule,
        WPRoutingModule,
        CodxCoreModule.forRoot({environment}),
    ],
    exports: [RouterModule],
})
export class LayoutModule { }
