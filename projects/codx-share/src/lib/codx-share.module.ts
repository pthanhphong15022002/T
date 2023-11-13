import { ChartAllModule } from '@syncfusion/ej2-angular-charts';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CodxCoreModule } from 'codx-core';
import { AssignInfoComponent } from './components/assign-info/assign-info.component';
import { NgModule, Type } from '@angular/core';
import { SelectweekComponent } from './components/selectweek/selectweek.component';
import { CodxTabsComponent } from './components/codx-tabs/codx-tabs.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CalendarDateComponent } from './components/calendardate/calendardate.component';
import { CodxExportComponent } from './components/codx-export/codx-export.component';
import { CodxExportAddComponent } from './components/codx-export/codx-export-add/codx-export-add.component';
import { TreeviewCommentComponent } from './components/treeview-comment/treeview-comment.component';
import { ReadMoreComponent } from './components/readmore/readmore.component';
import { Readmorev2Component } from './components/readmorev2/readmorev2.component';
import { ImageGridComponent } from './components/image-grid/image-grid.component';
import { CalendarNotesComponent } from './components/calendar-notes/calendar-notes.component';
import {
  CalendarModule,
  DateRangePickerModule,
} from '@syncfusion/ej2-angular-calendars';
import { TabModule, TreeViewModule } from '@syncfusion/ej2-angular-navigations';
import { SliderModule, UploaderModule } from '@syncfusion/ej2-angular-inputs';
import { CodxImportComponent } from './components/codx-import/codx-import.component';
import { CodxFullTextSearch } from './components/codx-fulltextsearch/codx-fulltextsearch.component';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { PopupVoteComponent } from './components/treeview-comment/popup-vote/popup-vote.component';
import { SharedModule } from '@shared/shared.module';
// import { CodxReportComponent } from './components/codx-report/codx-report.component';
// import { CodxReportDesignerComponent } from './components/codx-report/codx-report-designer/codx-report-designer.component';
// import {
//   BoldReportDesignerModule,
//   BoldReportsModule,
//   BoldReportViewerModule,
// } from '@boldreports/angular-reporting-components';

// Report viewer
//import '@boldreports/javascript-reporting-controls/Scripts/bold.report-viewer.min';
// Report Designer
//import '@boldreports/javascript-reporting-controls/Scripts/bold.report-designer.min';

// data-visualization
//import '@boldreports/javascript-reporting-controls/Scripts/data-visualization/ej.bulletgraph.min';
//import '@boldreports/javascript-reporting-controls/Scripts/data-visualization/ej.chart.min';
//import '@boldreports/global/l10n/ej.localetexts.vi-VN.min.js';
//import '@boldreports/global/i18n/ej.culture.vi-VN.min.js';
// import { CodxReportViewerComponent } from './components/codx-report/codx-report-viewer/codx-report-viewer.component';
//import { DynamicSettingParamaterComponent } from './components/dynamic-setting-paramater/dynamic-setting-paramater.component';
import { CodxApprovalComponent } from './components/codx-approval/codx-approval.component';
import { CodxCommentsComponent } from './components/codx-comments/codx-comments.component';
import { DynamicSettingComponent } from './components/dynamic-setting/dynamic-setting.component';
import { ApprovalTabsComponent } from './components/codx-approval/tab/tabs.component';
import { CodxViewApprovalStepComponent } from './components/codx-view-approval-step/codx-view-approval-step.component';
import { CodxReferencesComponent } from './components/codx-references/codx-references.component';
import { CodxImportAddTemplateComponent } from './components/codx-import/codx-import-add-template/codx-import-add-template.component';
import { CodxImportAddMappingComponent } from './components/codx-import/codx-import-add-template/codx-import-add-mapping/codx-import-add-mapping.component';
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
import { CodxViewAssignComponent } from './components/codx-view-assign/codx-view-assign.component';
import { FileComponent } from './components/codx-note/file/file.component';
import { CodxImportAddMappingTemplateComponent } from './components/codx-import/codx-import-add-template/codx-import-add-mapping/codx-import-add-mapping-template/codx-import-add-mapping-template.component';
import { DynamicFormComponent } from './components/dynamic-form/dynamic-form.component';
import { SettingCalendarComponent } from './components/setting-calendar/setting-calendar.component';
import { PopupSettingCalendarComponent } from './components/setting-calendar/popup-setting-calendar/popup-setting-calendar.component';
import { PopupAddCalendarComponent } from './components/setting-calendar/popup-add-calendar/popup-add-calendar.component';
import { PopupAddDayoffsComponent } from './components/setting-calendar/popup-add-dayoffs/popup-add-dayoffs.component';
import { PopupAddEventComponent } from './components/setting-calendar/popup-add-event/popup-add-event.component';
import { InfoLeftComponent } from 'projects/codx-mwp/src/lib/employeeinfomation/info-left/info-left.component';
import { DialogModule, TooltipModule } from '@syncfusion/ej2-angular-popups';
import {
  DocumentEditorAllModule,
  DocumentEditorContainerAllModule,
} from '@syncfusion/ej2-angular-documenteditor';
import { SpreadsheetAllModule } from '@syncfusion/ej2-angular-spreadsheet';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { ListViewAllModule } from '@syncfusion/ej2-angular-lists';
import { PopupEditShiftComponent } from './components/setting-calendar/popup-edit-shift/popup-edit-shift.component';
import { CodxPopupViewsComponent } from './components/codx-popup-views/codx-popup-views.component';
import { CodxUserTempComponent } from './components/codx-user-temp/codx-user-temp.component';
import { CodxCommentTempComponent } from './components/codx-comment-temp/codx-comment-temp.component';
import { CodxDashboardComponent } from './components/codx-dashboard/codx-dashboard.component';
import { PopupAddPanelComponent } from './components/codx-dashboard/popup-add-panel/popup-add-panel.component';
import { PopupAddChartComponent } from './components/codx-dashboard/popup-add-chart/popup-add-chart.component';
import { DashboardLayoutAllModule } from '@syncfusion/ej2-angular-layouts';
import { LayoutPanelComponent } from './components/codx-dashboard/layout-panel/layout-panel.component';
import { CodxAttachmentTempComponent } from './components/codx-attachment-temp/codx-attachment-temp.component';
import { CodxAssignTempComponent } from './components/codx-assign-temp/codx-assign-temp.component';
import { ListPostComponent } from 'projects/codx-wp/src/lib/dashboard/home/list-post/list-post.component';
import { CodxCompetencesComponent } from './components/codx-competences/codx-competences.component';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { CodxEmailComponent } from './components/codx-email/codx-email.component';
import { CoreModule } from '@core/core.module';
import { CodxApproveStepsComponent } from './components/codx-approve-steps/codx-approve-steps.component';
import { AddEditApprovalStepComponent } from './components/codx-approve-steps/add-edit-approval-step/add-edit-approval-step.component';
import { PopupAddApproverComponent } from './components/codx-approve-steps/popup-add-approver/popup-add-approver.component';
import { CodxHistoryComponent } from './components/codx-history/codx-history.component';
import { CodxHistoryItemComponent } from './components/codx-history/codx-history-item/codx-history-item.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PopupSelectTemplateComponent } from './components/codx-dashboard/popup-select-template/popup-select-template.component';
import { PopupMoreChartComponent } from './components/codx-dashboard/popup-more-chart/popup-more-chart.component';
import { CodxClearCacheComponent } from './components/codx-clear-cache/codx-clear-cache.component';
import { CodxViewCardComponent } from './components/codx-view-card/codx-view-card.component';
import { PopupAddEducationsComponent } from 'projects/codx-mwp/src/lib/employeeinfomation/popup/popup-add-educations/popup-add-educations.component';
import { CodxTreeCommentComponent } from './components/codx-tree-comment/codx-tree-comment.component';
import { CodxCommentHistoryComponent } from './components/codx-tree-comment/codx-comment-history/codx-comment-history.component';
import { ImageViewerComponent2 } from './components/ImageViewer2/imageViewer2.component';
import { CodxHistoryTempComponent } from './components/codx-history-temp/codx-history-temp.component';
import { CountChartComponent } from './components/codx-dashboard/template-chart/count-chart/count-chart.component';
import { CircularGaugeModule } from '@syncfusion/ej2-angular-circulargauge';
import { TopChartComponent } from './components/codx-dashboard/template-chart/top-chart/top-chart.component';
import { CodxTmmeetingsComponent } from './components/codx-tmmeetings/codx-tmmeetings.component';
import { ViewListMeetComponent } from './components/codx-tmmeetings/view-list-meet/view-list-meet.component';
import { PopupAddMeetingComponent } from './components/codx-tmmeetings/popup-add-meeting/popup-add-meeting.component';
import { TemplateComponent } from './components/codx-tmmeetings/template/template.component';
import { PopupStatusMeetingComponent } from './components/codx-tmmeetings/popup-status-meeting/popup-status-meeting.component';
import { PopupRescheduleMeetingComponent } from './components/codx-tmmeetings/popup-reschedule-meeting/popup-reschedule-meeting.component';
import { PopupAddResourcesComponent } from './components/codx-tmmeetings/popup-add-resources/popup-add-resources.component';
import { MeetingDetailComponent } from './components/codx-tmmeetings/meeting-detail/meeting-detail.component';
import { PostShareComponent } from 'projects/codx-wp/src/lib/dashboard/home/list-post/post-share/post-share.component';
import { CodxStepTaskComponent } from './components/codx-step/codx-step-task/codx-step-task.component';
import { UpdateProgressComponent } from './components/codx-step/codx-progress/codx-progress.component';
import { ProgressbarComponent } from './components/codx-step/codx-step-common/codx-progressbar/codx-progressbar.component';
import { ProgressBarAllModule } from '@syncfusion/ej2-angular-progressbar';
import { CodxBookingComponent } from './components/codx-booking/codx-booking.component';
import { CodxBookingCarScheduleContentComponent } from './components/codx-booking/codx-booking-car-schedule-content/codx-booking-car-schedule-content.component';
import { CodxBookingRoomScheduleContentComponent } from './components/codx-booking/codx-booking-room-schedule-content/codx-booking-room-schedule-content.component';
import { CodxBookingViewDetailComponent } from './components/codx-booking/codx-booking-view-detail/codx-booking-view-detail.component';
import { CodxMeetingOnlineComponent } from './components/codx-meeting-online/codx-meeting-online.component';
import { CodxAddGroupTaskComponent } from './components/codx-step/codx-popup-group/codx-add-group-task.component';
import { CodxAddTaskComponent } from './components/codx-step/codx-popup-task/codx-add-task.component';
import { CodxRoleComponent } from './components/codx-step/codx-step-common/codx-role/codx-role.component';
import { CodxTypeTaskComponent } from './components/codx-step/codx-step-common/codx-type-task/codx-type-task.component';
import { CodxViewTaskComponent } from './components/codx-step/codx-view-task/codx-view-task.component';
import { CodxAddBookingCarComponent } from './components/codx-booking/codx-add-booking-car/codx-add-booking-car.component';
import { CodxAddBookingRoomComponent } from './components/codx-booking/codx-add-booking-room/codx-add-booking-room.component';
import { CodxAddBookingStationeryComponent } from './components/codx-booking/codx-add-booking-stationery/codx-add-booking-stationery.component';
import { CodxInviteRoomAttendeesComponent } from './components/codx-booking/codx-invite-room-attendees/codx-invite-room-attendees.component';
import { CodxRescheduleBookingRoomComponent } from './components/codx-booking/codx-reschedule-booking-room/codx-reschedule-booking-room.component';
import { CodxInputCustomFieldComponent } from './components/codx-input-custom-field/codx-input-custom-field.component';
import { CodxFieldsDetailTempComponent } from './components/codx-fields-detail-temp/codx-fields-detail-temp.component';
import { PopupCustomFieldComponent } from './components/codx-fields-detail-temp/popup-custom-field/popup-custom-field.component';
import { CodxTaskbarComponent } from './components/codx-step/codx-step-common/codx-taskbar/codx-taskbar.component';
import { CodxViewDetailLittleComponent } from './components/codx-view-detail-little/codx-view-detail-little.component';
import { AddNoteComponent } from './components/calendar-notes/add-note/add-note.component';
import { PopupTitleComponent } from './components/calendar-notes/add-note/save-note/popup-title/popup-title.component';
import { SaveNoteComponent } from './components/calendar-notes/add-note/save-note/save-note.component';
import { UpdateNotePinComponent } from './components/calendar-notes/update-note-pin/update-note-pin.component';
import { CodxCreateIndexComponent } from './components/codx-create-index/codx-create-index.component';
import { CodxStepChartComponent } from './components/codx-step/codx-step-chart/codx-step-chart.component';
import { CodxTaskGoalTempComponent } from './components/codx-task-goal-temp/codx-task-goal-temp.component';
import { UsingHistoryComponent } from './components/dynamic-form/using-history/using-history.component';
import { AccessHistoryComponent } from './components/dynamic-form/access-history/access-history.component';
import { OrderHistoryComponent } from './components/dynamic-form/order-history/order-history.component';
import { CodxIconStepComponent } from './components/codx-step/codx-step-common/codx-icon-step/codx-icon-step.component';
import { CodxViewContentComponent } from './components/codx-view-content/codx-view-content.component';
import { PopupViewContentComponent } from './components/codx-view-content/popup-view-content.component';
import { CodxNoDataComponent } from './components/codx-step/codx-step-common/codx-no-data/codx-no-data.component';
import { CodxListReportsComponent } from './components/codx-list-reports/codx-list-reports.component';
import { CodxReportAddComponent } from './components/codx-list-reports/popup/codx-report-add/codx-report-add.component';

import { CodxAddApproversComponent } from './components/codx-approval-procress/codx-add-approvers/codx-add-approvers.component';
import { CodxAddSignFileComponent } from './components/codx-approval-procress/codx-add-sign-file/codx-add-sign-file.component';
import { CodxGetTemplateSignFileComponent } from './components/codx-approval-procress/codx-get-template-sign-file/codx-get-template-sign-file.component';
import { CodxInstancesComponent } from './components/codx-instances/codx-instances.component';
import { CodxFilesAttachmentComponent } from './components/codx-files-attachment/codx-files-attachment.component';
import { CodxFilesAttachmentViewComponent } from './components/codx-files-attachment-view/codx-files-attachment-view.component';
import { CodxViewReleaseSignFileComponent } from './components/codx-approval-procress/codx-view-release-sign-file/codx-view-release-sign-file.component';
import { CodxViewDetailBookingComponent } from './components/codx-booking/codx-view-detail-booking/codx-view-detail-booking.component';
import { CodxView2Component } from './components/codx-view2/codx-view2.component';
import { NgxCaptureModule } from 'ngx-capture';
import { CodxFieldsFormatValueComponent } from './components/codx-fields-detail-temp/codx-fields-format-value/codx-fields-format-value.component';
import { PopupAddLineTableComponent } from './components/codx-input-custom-field/popup-add-line-table/popup-add-line-table.component';
import { AddTemplateComponent } from './components/codx-import/add-template/add-template.component';
import { CodxDateComponent } from './components/codx-date/codx-date.component';
import { CodxCommonModule } from 'projects/codx-common/src/public-api';
import { FormatDataValuePipe } from './components/codx-fields-detail-temp/pipes-fields/format-data-value.pipe';
import { AddImportDetailsComponent } from './components/codx-import/add-template/add-import-details/add-import-details.component';
import { AddIetablesComponent } from './components/codx-import/add-template/add-ietables/add-ietables.component';
import { FreezeService, GridModule } from '@syncfusion/ej2-angular-grids';
import { CodxViewDetailSignFileComponent } from './components/codx-approval-procress/codx-view-detail-signfile/codx-view-detail-signfile.component';
import { CodxViewApproveComponent } from './components/codx-step/codx-step-common/codx-view-approve/codx-view-approve.component';
import { LayoutComponent } from './components/layout/layout.component';
import { FormSettingComponent } from './components/form-setting/form-setting.component';
const T_Component: Type<any>[] = [
  AssignInfoComponent,
  // AttachmentComponent,
  // OpenFolderComponent,
  // ThumbnailComponent,
  // BreadcumbComponent,
  SelectweekComponent,
  // ViewFileDialogComponent,
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
  // LayoutNoAsideComponent,
  // LayoutOnlyHeaderComponent,
  // LayoutNoAsideToolbarFluidComponent,
  // QuickLinksInnerComponent,
  // UserInnerComponent,
  // CodxReportComponent,
  // CodxReportViewerComponent,
  // CodxReportDesignerComponent,
  // Codx note
  // NoteSliderComponent,
  // CodxNotesComponent,

  CodxApprovalComponent,
  CodxCommentsComponent,
  DynamicSettingComponent,
  DynamicFormComponent,
  ApprovalTabsComponent,
  CodxViewApprovalStepComponent,
  CodxApproveStepsComponent,
  // NotifyDrawerComponent,
  // NotifyDrawerSliderComponent,
  // MessengerDrawerComponent,
  // ChatInnerComponent,
  CodxReferencesComponent,
  //import
  CodxImportAddTemplateComponent,
  CodxImportAddMappingTemplateComponent,
  CodxImportAddMappingComponent,
  AddTemplateComponent,
  AddImportDetailsComponent,
  AddIetablesComponent,
  //
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
  SettingCalendarComponent,
  PopupAddCalendarComponent,
  PopupAddDayoffsComponent,
  PopupAddEventComponent,
  PopupSettingCalendarComponent,
  PopupEditShiftComponent,
  FileComponent,
  InfoLeftComponent,
  // ActiviesApprovalListComponent,
  // DialogthumbComponent,
  CodxPopupViewsComponent,
  CodxCommentTempComponent,
  CodxUserTempComponent,
  CodxCompetencesComponent,
  CodxTreeCommentComponent,
  //pdf
  // PdfComponent,
  CodxDashboardComponent,
  PopupAddPanelComponent,
  PopupAddChartComponent,
  LayoutPanelComponent,
  CodxAttachmentTempComponent,
  CodxAssignTempComponent,
  ListPostComponent,
  PostShareComponent,

  CodxHistoryComponent,
  CodxHistoryItemComponent,
  PopupSelectTemplateComponent,
  PopupMoreChartComponent,
  CodxViewCardComponent,
  // CodxViewFilesComponent,
  PopupAddEducationsComponent,
  ImageViewerComponent2,
  CodxHistoryTempComponent,
  // NotifyDrawerPopupComponent,
  // NotifyBodyComponent,
  //meetings
  CodxTmmeetingsComponent,
  ViewListMeetComponent,
  PopupAddMeetingComponent,
  TemplateComponent,
  PopupStatusMeetingComponent,
  PopupRescheduleMeetingComponent,
  PopupAddResourcesComponent,
  MeetingDetailComponent,

  // chatting
  // CodxChatComponent,
  // CodxChatContainerComponent,
  // CodxChatListComponent,
  // CodxChatBoxComponent,
  // AddGroupChatComponent,
  //booking
  CodxBookingComponent,
  CodxAddBookingCarComponent,
  CodxAddBookingRoomComponent,
  CodxAddBookingStationeryComponent,
  CodxInviteRoomAttendeesComponent,
  CodxRescheduleBookingRoomComponent,
  CodxBookingCarScheduleContentComponent,
  CodxBookingRoomScheduleContentComponent,
  CodxBookingViewDetailComponent,
  CodxViewDetailBookingComponent,
  CountChartComponent,
  TopChartComponent,
  CodxMeetingOnlineComponent,
  //CM+DP
  CodxStepTaskComponent,
  UpdateProgressComponent,
  ProgressbarComponent,
  CodxAddGroupTaskComponent,
  CodxAddTaskComponent,
  CodxRoleComponent,
  CodxTypeTaskComponent,
  CodxViewTaskComponent,
  CodxTaskbarComponent,
  CodxNoDataComponent,
  CodxInstancesComponent,

  CodxInputCustomFieldComponent,
  CodxFieldsDetailTempComponent,
  CodxFieldsFormatValueComponent,
  PopupCustomFieldComponent,
  CodxViewDetailLittleComponent,
  CodxStepChartComponent,
  CodxIconStepComponent,
  CodxViewApproveComponent,
  //CO
  AddNoteComponent,
  PopupTitleComponent,
  SaveNoteComponent,
  UpdateNotePinComponent,
  PopupViewContentComponent,
  CodxViewContentComponent,

  //report
  CodxReportAddComponent,

  //Approval Process
  CodxAddApproversComponent,
  CodxViewReleaseSignFileComponent,
  CodxAddSignFileComponent,
  CodxGetTemplateSignFileComponent,
  CodxViewDetailSignFileComponent,

  //View
  CodxView2Component,
  FormSettingComponent
];

const T_Pipe: Type<any>[] = [FormatDataValuePipe];

@NgModule({
  declarations: [
    T_Component,
    CodxEmailComponent,
    AddEditApprovalStepComponent,
    PopupAddApproverComponent,
    CodxClearCacheComponent,
    CodxCreateIndexComponent,
    CodxTaskGoalTempComponent,
    UsingHistoryComponent,
    AccessHistoryComponent,
    OrderHistoryComponent,
    CodxListReportsComponent,
    CodxFilesAttachmentComponent,
    CodxFilesAttachmentViewComponent,
    PopupAddLineTableComponent,
    CodxDateComponent,
    LayoutComponent,
    T_Pipe,
  ],
  exports: [T_Component, T_Pipe, CodxCommonModule],
  imports: [
    CommonModule,
    NgbModule,
    FormsModule,
    GridModule,
    SharedModule,
    CodxCoreModule,
    CodxCommonModule,
    CalendarModule,
    CoreModule,
    DateRangePickerModule,
    TabModule,
    UploaderModule,
    PickerModule,
    ChartAllModule,
    CircularGaugeModule,
    // BoldReportsModule,
    // BoldReportDesignerModule,
    // BoldReportViewerModule,
    ReactiveFormsModule,
    DocumentEditorAllModule,
    DocumentEditorContainerAllModule,
    SpreadsheetAllModule,
    DialogModule,
    //pdf
    ListViewAllModule,
    NgxExtendedPdfViewerModule,
    DashboardLayoutAllModule,
    SliderModule,
    LazyLoadImageModule,
    DragDropModule,
    ProgressBarAllModule,
    NgxCaptureModule,
    TooltipModule,
    TreeViewModule
  ],
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
