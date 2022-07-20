import { ViewFileDialogComponent } from './components/viewFileDialog/viewFileDialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { CodxExportComponent } from './components/codx-export/codx-export.component';
import { OpenFolderComponent } from './components/openFolder/openFolder.component';
import { CodxExportAddComponent } from './components/codx-export/codx-export-add/codx-export-add.component';
import { TreeviewCommentComponent } from './components/treeview-comment/treeview-comment.component';
import { ReadMoreComponent } from './components/readmore/readmore.component';
import { Readmorev2Component } from './components/readmorev2/readmorev2.component';
import { ImageGridComponent } from './components/image-grid/image-grid.component';
import { TruncatePipe } from './pipe/truncate.pipe';
import { CalendarNotesComponent } from './components/calendar-notes/calendar-notes.component';
import { CalendarModule, DateRangePickerModule } from '@syncfusion/ej2-angular-calendars';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { UploaderComponent, UploaderModule } from '@syncfusion/ej2-angular-inputs';
import { CodxImportComponent } from './components/codx-import/codx-import.component';
import { FileImage } from './pipe/fileImage.pipe';
import { PickerModule } from '@ctrl/ngx-emoji-mart';

const T_Component: Type<any>[] = [
  AssignInfoComponent,
  AttachmentComponent,
  OpenFolderComponent,
  ThumbnailComponent,
  BreadcumbComponent,
  SelectweekComponent,
  ViewFileDialogComponent,
  CodxTabsComponent,
  ImageGridComponent,
  CalendarDateComponent,
  CodxExportComponent,
  CodxExportAddComponent,
  CodxImportComponent,
  TreeviewCommentComponent,
  ReadMoreComponent,
  Readmorev2Component,
  ImageGridComponent,
  CalendarNotesComponent,
  CalendarDateComponent,
];


const T_Pipe: Type<any>[] = [
  TruncatePipe,
  FileImage
]


@NgModule({
  declarations: [T_Component, T_Pipe],  
    imports: [CommonModule, NgbModule, FormsModule, CodxCoreModule, CalendarModule, DateRangePickerModule, TabModule, UploaderModule , PickerModule],
  exports: [T_Component, T_Pipe],
})
export class CodxShareModule { }
/*

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
  FormsModule,
  TabModule,
  DateRangePickerModule 
]
@NgModule({
  imports: [
    T_Moudule
  ],
  declarations: [
    T_Component
  ],
  exports: [
    T_Moudule,
    T_Component
  ],
})
export class SharedModule { } */