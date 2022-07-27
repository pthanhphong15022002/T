import { NoteDrawerComponent } from './layout/drawers/note-drawer/note-drawer.component';
import { FormsModule } from '@angular/forms';
import { InlineSVGModule } from 'ng-inline-svg';
import { CodxCoreModule } from 'codx-core';
import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MomentModule } from 'ngx-moment';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MessengerDrawerComponent } from './layout/drawers/messenger-drawer/messenger-drawer.component';
import { ChatInnerComponent } from './layout/drawers/messenger-drawer/chat-inner/chat-inner.component';
import { NotifyDrawerComponent } from './layout/drawers/notify-drawer/notify-drawer.component';
import { ChatListComponent } from './layout/components/chat-list/chat-list.component';
import { ListChatBoxComponent } from './layout/components/list-chat-box/list-chat-box.component';
import { ChatBoxComponent } from './layout/components/chatbox/chat-box.component';
import { ERMModule } from './erm.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { CoreModule } from '@core/core.module';
import { DateRangePickerModule } from '@syncfusion/ej2-angular-calendars';

const T_Component: Type<any>[] = [
  MessengerDrawerComponent,
  ChatInnerComponent,
  NotifyDrawerComponent,
  ChatListComponent,
  ListChatBoxComponent,
  ChatBoxComponent,
  NoteDrawerComponent
];

const T_Moudule: Type<any>[] = [
  CoreModule,
  CommonModule,
  MomentModule,
  NgxSkeletonLoaderModule,
  CodxCoreModule,
  NgbModule,
  ERMModule,
  RouterModule,
  InlineSVGModule,
  NgxSkeletonLoaderModule,
  DateRangePickerModule,
  FormsModule
];
@NgModule({
  imports: [T_Moudule],
  declarations: [T_Component],
  exports: [T_Moudule, T_Component],
})
export class SharedModule { }
