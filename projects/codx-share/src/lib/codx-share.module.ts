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
import { ThumbnailComponent } from './components/thumbnail/thumbnail.component';
import { CalendarDateComponent } from './components/calendardate/calendardate.component';
import { CalendarModule, DateRangePickerModule } from '@syncfusion/ej2-angular-calendars';
import { TabAllModule, TabModule } from '@syncfusion/ej2-angular-navigations';
import { TreeviewCommentComponent } from './components/treeview-comment/treeview-comment.component';
import { ReadMoreComponent } from './components/readmore/readmore.component';
import { Readmorev2Component } from './components/readmorev2/readmorev2.component';
import { ImageGridComponent } from './components/image-grid/image-grid.component';
import { TruncatePipe } from './pipe/truncate.pipe';
import { CodxExportComponent } from './components/codx-export/codx-export.component';

const T_Component: Type<any>[] = [
  AssignInfoComponent,
  AttachmentComponent,
  ThumbnailComponent,
  BreadcumbComponent,
  SelectweekComponent,
  ViewFileDialogComponent,
  CodxTabsComponent,
  ImageGridComponent,
  CalendarDateComponent,
  TreeviewCommentComponent,
  ReadMoreComponent,
  Readmorev2Component,
  ImageGridComponent,
  CodxExportComponent
];


const T_Pipe: Type<any>[] = [
  TruncatePipe,
]


@NgModule({
  declarations:[ T_Component,T_Pipe],
  imports: [CommonModule, NgbModule, FormsModule, CodxCoreModule, ],
  exports: [T_Component, T_Pipe],
})
export class CodxShareModule {}
