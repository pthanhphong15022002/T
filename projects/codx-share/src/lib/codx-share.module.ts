import { DynamicFormComponent } from './components/dynamic-form/dynamic-form.component';
import { ChartAllModule } from '@syncfusion/ej2-angular-charts';
import { ViewFileDialogComponent } from './components/viewFileDialog/viewFileDialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CodxCoreModule, EnvironmentConfig } from 'codx-core';
import { BreadcumbComponent } from './components/breadcumb/breadcumb.component';
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
import { LayoutNoAsideComponent } from './_layout/_noAside/_noAside.component';
import { LayoutOnlyHeaderComponent } from './_layout/_onlyHeader/_onlyHeader.component';
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
//import { DynamicSettingParamaterComponent } from './components/dynamic-setting-paramater/dynamic-setting-paramater.component';
import { CodxApprovalComponent } from './components/codx-approval/codx-approval.component';
import { CodxCommentsComponent } from './components/codx-comments/codx-comments.component';
import { LayoutNoAsideToolbarFluidComponent } from './_layout/_noAsideToolbarFluid/_noAsideToolbarFluid.component';
import { DynamicSettingComponent } from './components/dynamic-setting/dynamic-setting.component';
import { CodxFilesComponent } from './components/codx-files/codx-files.component';
import { ApprovalTabsComponent } from './components/codx-approval/tab/tabs.component';
import { CodxApprovalStepComponent } from './components/codx-approval-step/codx-approval-step.component';
import { NotifyDrawerComponent } from './layout/drawers/notify-drawer/notify-drawer.component';
import { MessengerDrawerComponent } from './layout/drawers/messenger-drawer/messenger-drawer.component';
import { ChatInnerComponent } from './layout/drawers/messenger-drawer/chat-inner/chat-inner.component';
import { CodxReferencesComponent } from './components/codx-references/codx-references.component';
import { CodxImportAddTemplateComponent } from './components/codx-import/codx-import-add-template/codx-import-add-template.component';
import { CodxImportAddMappingComponent } from './components/codx-import/codx-import-add-template/codx-import-add-mapping/codx-import-add-mapping.component';
import { CodxAlertComponent } from './components/codx-alert/codx-alert.component';
import { SettingNotifyDrawerComponent } from './layout/drawers/notify-drawer/setting-notify-drawer/setting-notify-drawer.component';
import { PopupAddNotifyComponent } from './layout/drawers/notify-drawer/popup-add-notify/popup-add-notify.component';
import { PopupUpdateStatusComponent } from './components/codx-tasks/popup-update-status/popup-update-status.component';
import { CodxNoteComponent } from './components/codx-note/codx-note.component';
import { ViewDetailComponent } from './components/codx-tasks/view-detail/view-detail.component';
import { PopupConfirmComponent } from './components/codx-tasks/popup-confirm/popup-confirm.component';
import { PopupExtendComponent } from './components/codx-tasks/popup-extend/popup-extend.component';
import { PopupUpdateProgressComponent } from './components/codx-tasks/popup-update-progress/popup-update-progress.component';
import { ViewListComponent } from './components/codx-tasks/view-list/view-list.component';
import { PopupAddComponent } from './components/codx-tasks/popup-add/popup-add.component';
import { CodxTasksComponent } from './components/codx-tasks/codx-tasks.component';
import { TreeViewComponent } from './components/codx-tasks/tree-view/tree-view.component';
import { CodxCommentHistoryComponent } from './components/codx-comment-history/codx-comment-history.component';
import { PdfViewerAllModule } from '@syncfusion/ej2-angular-pdfviewer';
import { CodxTreeHistoryComponent } from './components/codx-tree-history/codx-tree-history.component';
import { CodxViewAssignComponent } from './components/codx-view-assign/codx-view-assign.component';
import { FileComponent } from './components/codx-note/file/file.component';
import { AttachmentComponent } from './components/attachment/attachment.component';
import { CodxImportAddMappingTemplateComponent } from './components/codx-import/codx-import-add-template/codx-import-add-mapping/codx-import-add-mapping-template/codx-import-add-mapping-template.component';
import { LayoutNoToolbarComponent } from './_layout/_noToolbar/_noToolbar.component';

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
  LayoutNoAsideToolbarFluidComponent,
  LayoutNoToolbarComponent,
  QuickLinksInnerComponent,
  UserInnerComponent,
  CodxReportComponent,
  CodxReportViewerComponent,
  CodxReportDesignerComponent,
  NoteDrawerComponent,
  CodxApprovalComponent,
  CodxCommentsComponent,
  DynamicSettingComponent,
  DynamicFormComponent,
  CodxFilesComponent,
  ApprovalTabsComponent,
  CodxApprovalStepComponent,
  NotifyDrawerComponent,
  MessengerDrawerComponent,
  ChatInnerComponent,
  CodxReferencesComponent,
  CodxImportAddTemplateComponent,
  CodxImportAddMappingTemplateComponent,
  CodxImportAddMappingComponent,
  CodxAlertComponent,
  SettingNotifyDrawerComponent,
  PopupAddNotifyComponent,
  PopupUpdateStatusComponent,
  CodxNoteComponent,
  ViewDetailComponent,
  PopupConfirmComponent,
  PopupExtendComponent,
  PopupUpdateProgressComponent,
  ViewListComponent,
  PopupAddComponent,
  CodxTasksComponent,
  TreeViewComponent,
  CodxViewAssignComponent,
  CodxCommentHistoryComponent,
  CodxTreeHistoryComponent,
  FileComponent,
];

const T_Pipe: Type<any>[] = [TruncatePipe, FileImage];

@NgModule({
  declarations: [T_Component, T_Pipe, AttachmentComponent],
  imports: [
    CommonModule,
    NgbModule,
    FormsModule,
    SharedModule,
    InlineSVGModule.forRoot(),
    CodxCoreModule,
    CalendarModule,
    DateRangePickerModule,
    TabModule,
    UploaderModule,
    PickerModule,
    ChartAllModule,
    BoldReportsModule,
    BoldReportDesignerModule,
    BoldReportViewerModule,
    PdfViewerAllModule,
    ReactiveFormsModule
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
