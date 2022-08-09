import { DynamicFormComponent } from './components/dynamic-form/dynamic-form.component';
import { ChartAllModule } from '@syncfusion/ej2-angular-charts';
import { ViewFileDialogComponent } from './components/viewFileDialog/viewFileDialog.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CodxCoreModule, EnvironmentConfig } from 'codx-core';
import { BreadcumbComponent } from './components/breadcumb/breadcumb.component';
import { AttachmentComponent } from './components/attachment/attachment.component';
import { AssignInfoComponent } from './components/assign-info/assign-info.component';
import { ModuleWithProviders, NgModule, Type } from '@angular/core';
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
import {
  CalendarModule,
  DateRangePickerModule,
} from '@syncfusion/ej2-angular-calendars';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { UploaderModule } from '@syncfusion/ej2-angular-inputs';
import { CodxImportComponent } from './components/codx-import/codx-import.component';
import { FileImage } from './pipe/fileImage.pipe';
import { CodxFullTextSearch } from './components/codx-fulltextsearch/codx-fulltextsearch.component';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { PopupVoteComponent } from './components/treeview-comment/popup-vote/popup-vote.component';
import { LayoutNoAsideComponent } from './_layoutNoAside/layoutNoAside.component';
import { LayoutOnlyHeaderComponent } from './_layoutOnlyHeader/layoutOnlyHeader.component';
import { InlineSVGModule } from 'ng-inline-svg';
import { SharedModule } from '@shared/shared.module';
import { QuickLinksInnerComponent } from './layout/dropdown-inner/quick-links-inner/quick-links-inner.component';
import { UserInnerComponent } from './layout/dropdown-inner/user-inner/user-inner.component';
import { CodxReportComponent } from './components/codx-report/codx-report.component';
import { CodxReportDesignerComponent } from './components/codx-report/codx-report-designer/codx-report-designer.component';
import {
  BoldReportDesignerModule,
  BoldReportsModule,
  BoldReportViewerModule,
} from '@boldreports/angular-reporting-components';

// Report viewer
import '@boldreports/javascript-reporting-controls/Scripts/bold.report-viewer.min';
// Report Designer
import '@boldreports/javascript-reporting-controls/Scripts/bold.report-designer.min';

// data-visualization
import '@boldreports/javascript-reporting-controls/Scripts/data-visualization/ej.bulletgraph.min';
import '@boldreports/javascript-reporting-controls/Scripts/data-visualization/ej.chart.min';
import '@boldreports/global/l10n/ej.localetexts.vi-VN.min.js';
import '@boldreports/global/i18n/ej.culture.vi-VN.min.js';
import { CodxReportViewerComponent } from './components/codx-report/codx-report-viewer/codx-report-viewer.component';
import { NoteDrawerComponent } from './layout/drawers/note-drawer/note-drawer.component';
import { DynamicSettingComponent } from './components/dynamic-setting/dynamic-setting.component';
import { CodxApprovalComponent } from './components/codx-approval/codx-approval.component';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

export const routes: Routes = [
  {
    path: '',
    component: LayoutOnlyHeaderComponent,
    children: [
      {
        path: 'setting/:funcID',
        loadChildren: () =>
          import(
            'projects/codx-share/src/lib/components/dynamic-setting/dynamic-setting.module'
          ).then((m) => m.CodxShareModule),
      },
    ],
  },
];
import { CodxCommentsComponent } from './components/codx-comments/codx-comments.component';

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
  CodxFullTextSearch,
  CodxImportComponent,
  TreeviewCommentComponent,
  PopupVoteComponent,
  ReadMoreComponent,
  Readmorev2Component,
  ImageGridComponent,
  CalendarNotesComponent,
  CalendarDateComponent,
  LayoutNoAsideComponent,
  LayoutOnlyHeaderComponent,
  QuickLinksInnerComponent,
  UserInnerComponent,
  CodxReportComponent,
  CodxReportViewerComponent,
  CodxReportDesignerComponent,
  NoteDrawerComponent,
  CodxApprovalComponent,
  CodxCommentsComponent,
  DynamicFormComponent,
  DynamicSettingComponent,
];

const T_Pipe: Type<any>[] = [TruncatePipe, FileImage];

@NgModule({
  declarations: [T_Component, T_Pipe],
  imports: [
    CommonModule,
    NgbModule,
    FormsModule,
    SharedModule,
    InlineSVGModule.forRoot(),
    CodxCoreModule,
    CalendarModule,
    RouterModule.forChild(routes),
    DateRangePickerModule,
    TabModule,
    UploaderModule,
    PickerModule,
    ChartAllModule,
    BoldReportsModule,
    BoldReportDesignerModule,
    BoldReportViewerModule,
  ],
  exports: [T_Component, T_Pipe],
})
export class CodxShareModule {
  // public static forRoot(
  //   config?: EnvironmentConfig
  // ): ModuleWithProviders<CodxCoreModule> {
  //   return {
  //     ngModule: CodxCoreModule,
  //     providers: [
  //       HttpClientModule,
  //       { provide: EnvironmentConfig, useValue: config },
  //     ],
  //   };
  // }
}
// const T_Moudule: Type<any>[] = [
//   CommonModule,
//   CodxCoreModule,
//   NgbModule,
//   FormsModule,
//   TabModule,
//   DateRangePickerModule
// ]
// @NgModule({
//   imports: [
//     T_Moudule
//   ],
//   declarations: [
//     T_Component
//   ],
//   exports: [
//     T_Moudule,
//     T_Component
//   ],
// })
// export class SharedModule { }
