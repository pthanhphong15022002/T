import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PagesRoutingModule } from '../pages-routing.module';
import { InlineSVGModule } from 'ng-inline-svg';
import { CodxCoreModule } from 'codx-core';
import { ERMModule } from 'src/shared';
import { LayoutComponent } from './layout.component';
import { environment } from 'src/environments/environment';
import { ChatInnerComponent } from "./drawers/messenger-drawer/chat-inner/chat-inner.component";
import { MessengerDrawerComponent } from "./drawers/messenger-drawer/messenger-drawer.component";
import { NotifyDrawerComponent } from "./drawers/notify-drawer/notify-drawer.component";
import { QuickLinksInnerComponent } from "./dropdown-inner/quick-links-inner/quick-links-inner.component";
import { UserInnerComponent } from "./dropdown-inner/user-inner/user-inner.component";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
    declarations: [
        LayoutComponent,
        MessengerDrawerComponent,
        ChatInnerComponent,
        NotifyDrawerComponent,
        QuickLinksInnerComponent,
        UserInnerComponent,
    ],
    imports: [
        CommonModule,
        InlineSVGModule,
        NgbModule,
        ERMModule,
        CodxCoreModule.forRoot({environment}),
        PagesRoutingModule,
    ],
    exports: [RouterModule],
})
export class LayoutModule { }
