import { BookingModule } from '../booking-routing.module';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/shared';
import { LayoutComponent } from './layout.component';

@NgModule({
  declarations: [
    LayoutComponent,
    // MessengerDrawerComponent,
    // ChatInnerComponent,
    // NotifyDrawerComponent,
    // QuickLinksInnerComponent,
    // UserInnerComponent,
    // ChatListComponent,
    // ListChatBoxComponent,
    // ChatBoxComponent
  ],
  imports: [
    // CommonModule,
    // InlineSVGModule,
    // NgbModule,
    // ERMModule,
    // CodxCoreModule.forRoot({ environment }),
    BookingModule,
    // FormsModule
    SharedModule
  ],
  exports: [RouterModule],
})
export class LayoutModule { }
