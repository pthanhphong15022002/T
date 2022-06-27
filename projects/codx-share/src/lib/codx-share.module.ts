import { ViewFileDialogComponent } from './components/viewFileDialog/viewFileDialog.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CodxCoreModule } from 'codx-core';

import { BreadcumbComponent } from './components/breadcumb/breadcumb.component';
import { AttachmentComponent } from './components/attachment/attachment.component';
import { AssignInfoComponent } from './components/assign-info/assign-info.component';

import { NgModule, Type } from '@angular/core';
import { SelectweekComponent } from './components/selectweek/selectweek.component';
import { CodxTabsComponent } from './components/codx-tabs/codx-tabs.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ImageGridComponent } from './components/image-grid/image-grid.component';
import { ThumbnailComponent } from './components/thumbnail/thumbnail.component';
import { CalendarDateComponent } from './components/calendardate/calendardate.component';
import { DateRangePickerModule } from '@syncfusion/ej2-angular-calendars';
import { TabAllModule } from '@syncfusion/ej2-angular-navigations';

const T_Component: Type<any>[] = [
  AssignInfoComponent,
  AttachmentComponent,
  ThumbnailComponent,
  BreadcumbComponent,
  SelectweekComponent,
  ViewFileDialogComponent,
  CodxTabsComponent,
  ImageGridComponent,
  CalendarDateComponent
];

@NgModule({
  declarations: T_Component,
  imports: [CommonModule, NgbModule, FormsModule, CodxCoreModule, TabAllModule ,DateRangePickerModule],
  exports: [T_Component],
})
export class CodxShareModule {}
