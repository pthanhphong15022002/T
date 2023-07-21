import { ChartAllModule } from '@syncfusion/ej2-angular-charts';
import { ViewFileDialogComponent } from './components/viewFileDialog/viewFileDialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CodxCoreModule } from 'codx-core';
import { BreadcumbComponent } from './components/breadcumb/breadcumb.component';
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
import {
  CalendarModule,
  DateRangePickerModule,
} from '@syncfusion/ej2-angular-calendars';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { SliderModule, UploaderModule } from '@syncfusion/ej2-angular-inputs';
import { CodxImportComponent } from './components/codx-import/codx-import.component';
import { FileImage } from './pipe/fileImage.pipe';
import { CodxFullTextSearch } from './components/codx-fulltextsearch/codx-fulltextsearch.component';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { PopupVoteComponent } from './components/treeview-comment/popup-vote/popup-vote.component';
import { LayoutNoAsideComponent } from './_layout/_noAside/_noAside.component';
import { LayoutOnlyHeaderComponent } from './_layout/_onlyHeader/_onlyHeader.component';
import { SharedModule } from '@shared/shared.module';
import { QuickLinksInnerComponent } from './layout/dropdown-inner/quick-links-inner/quick-links-inner.component';
import { UserInnerComponent } from './layout/dropdown-inner/user-inner/user-inner.component';
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
import { NoteDrawerComponent } from './layout/drawers/note-drawer/note-drawer.component';
//import { DynamicSettingParamaterComponent } from './components/dynamic-setting-paramater/dynamic-setting-paramater.component';
import { CodxApprovalComponent } from './components/codx-approval/codx-approval.component';
import { CodxCommentsComponent } from './components/codx-comments/codx-comments.component';
import { LayoutNoAsideToolbarFluidComponent } from './_layout/_noAsideToolbarFluid/_noAsideToolbarFluid.component';
import { DynamicSettingComponent } from './components/dynamic-setting/dynamic-setting.component';
import { ApprovalTabsComponent } from './components/codx-approval/tab/tabs.component';
import { CodxViewApprovalStepComponent } from './components/codx-view-approval-step/codx-view-approval-step.component';
import { NotifyDrawerComponent } from './layout/drawers/notify-drawer/notify-drawer.component';
import { MessengerDrawerComponent } from './layout/drawers/messenger-drawer/messenger-drawer.component';
import { ChatInnerComponent } from './layout/drawers/messenger-drawer/chat-inner/chat-inner.component';
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
import { AttachmentComponent } from './components/attachment/attachment.component';
import { CodxImportAddMappingTemplateComponent } from './components/codx-import/codx-import-add-template/codx-import-add-mapping/codx-import-add-mapping-template/codx-import-add-mapping-template.component';
import { NotifyDrawerSliderComponent } from './layout/drawers/notify-drawer/notify-drawer-slider/notify-drawer-slider.component';
import { DynamicFormComponent } from './components/dynamic-form/dynamic-form.component';
import { SettingCalendarComponent } from './components/setting-calendar/setting-calendar.component';
import { PopupSettingCalendarComponent } from './components/setting-calendar/popup-setting-calendar/popup-setting-calendar.component';
import { PopupAddCalendarComponent } from './components/setting-calendar/popup-add-calendar/popup-add-calendar.component';
import { PopupAddDayoffsComponent } from './components/setting-calendar/popup-add-dayoffs/popup-add-dayoffs.component';
import { PopupAddEventComponent } from './components/setting-calendar/popup-add-event/popup-add-event.component';
import { InfoLeftComponent } from 'projects/codx-mwp/src/lib/employeeinfomation/info-left/info-left.component';
import { ActiviesApprovalListComponent } from './layout/drawers/activies-approval-list/activies-approval-list.component';
import { ActiviesSliderComponent } from './layout/drawers/activies-approval-list/activies-slider/activies-slider.component';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import {
  DocumentEditorAllModule,
  DocumentEditorContainerAllModule,
} from '@syncfusion/ej2-angular-documenteditor';
import { SpreadsheetAllModule } from '@syncfusion/ej2-angular-spreadsheet';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { PdfComponent } from './components/pdf/pdf.component';
import { ListViewAllModule } from '@syncfusion/ej2-angular-lists';
import { DialogthumbComponent } from './components/thumbnail/dialogthumb/dialogthumb.component';
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
import { CodxCalendarComponent } from './components/codx-calendar/codx-calendar.component';
import { CalendarCenterComponent } from './components/codx-calendar/calendar-center/calendar-center.component';
import { CodxViewCardComponent } from './components/codx-view-card/codx-view-card.component';
import { CodxViewFilesComponent } from './components/codx-view-files/codx-view-files.component';
import { PopupAddEducationsComponent } from 'projects/codx-mwp/src/lib/employeeinfomation/popup/popup-add-educations/popup-add-educations.component';
import { DisplayValue } from './pipe/displayValue.pipe';
import { TextValuePipe } from './pipe/textValue.pipe';
import { CodxTreeCommentComponent } from './components/codx-tree-comment/codx-tree-comment.component';
import { CodxCommentHistoryComponent } from './components/codx-tree-comment/codx-comment-history/codx-comment-history.component';
import { ImageViewerComponent2 } from './components/ImageViewer2/imageViewer2.component';
import { CodxHistoryTempComponent } from './components/codx-history-temp/codx-history-temp.component';
import { NotifyDrawerPopupComponent } from './layout/drawers/notify-drawer/notify-drawer-popup/notify-drawer-popup.component';
import { NotifyBodyComponent } from './layout/drawers/notify-drawer/notify-body/notify-body.component';
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
import { CodxChatComponent } from './layout/drawers/chat/codx-chat/codx-chat.component';
import { CodxChatContainerComponent } from './layout/drawers/chat/chat-container/chat-container.component';
import { CodxChatListComponent } from './layout/drawers/chat/chat-list/chat-list.component';
import { CodxChatBoxComponent } from './layout/drawers/chat/chat-box/chat-box.component';
import { MessageSystemPipe } from './layout/drawers/chat/chat-box/mssgSystem.pipe';
import { ScrollPipe } from './layout/drawers/chat/chat-box/scrollPipe.pipe';
import { AddGroupChatComponent } from './layout/drawers/chat/popup/popup-add-group/popup-add-group.component';
import { SearchPipe } from './pipe/search.pipe';
import { PostShareComponent } from 'projects/codx-wp/src/lib/dashboard/home/list-post/post-share/post-share.component';
import { CodxStepTaskComponent } from './components/codx-step/codx-step-task/codx-step-task.component';
import { UpdateProgressComponent } from './components/codx-step/codx-progress/codx-progress.component';
import { ProgressbarComponent } from './components/codx-step/codx-progressbar/codx-progressbar.component';
import { ProgressBarAllModule } from '@syncfusion/ej2-angular-progressbar';
import { FillterReferType } from './components/codx-view-files/filterReferPipe.pipe';
import { CodxBookingComponent } from './components/codx-booking/codx-booking.component';
import { CodxBookingCarScheduleContentComponent } from './components/codx-booking/codx-booking-car-schedule-content/codx-booking-car-schedule-content.component';
import { CodxBookingRoomScheduleContentComponent } from './components/codx-booking/codx-booking-room-schedule-content/codx-booking-room-schedule-content.component';
import { CodxBookingViewDetailComponent } from './components/codx-booking/codx-booking-view-detail/codx-booking-view-detail.component';
import { CodxMeetingOnlineComponent } from './components/codx-meeting-online/codx-meeting-online.component';
import { CodxAddGroupTaskComponent } from './components/codx-step/codx-add-group-task/codx-add-group-task.component';
import { CodxAddTaskComponent } from './components/codx-step/codx-add-stask/codx-add-task.component';
import { CodxRoleComponent } from './components/codx-step/codx-role/codx-role.component';
import { CodxTypeTaskComponent } from './components/codx-step/codx-type-task/codx-type-task.component';
import { CodxViewTaskComponent } from './components/codx-step/codx-view-task/codx-view-task.component';
import { CodxAddBookingCarComponent } from './components/codx-booking/codx-add-booking-car/codx-add-booking-car.component';
import { CodxAddBookingRoomComponent } from './components/codx-booking/codx-add-booking-room/codx-add-booking-room.component';
import { CodxAddBookingStationeryComponent } from './components/codx-booking/codx-add-booking-stationery/codx-add-booking-stationery.component';
import { CodxInviteRoomAttendeesComponent } from './components/codx-booking/codx-invite-room-attendees/codx-invite-room-attendees.component';
import { CodxRescheduleBookingRoomComponent } from './components/codx-booking/codx-reschedule-booking-room/codx-reschedule-booking-room.component';
import { CodxInputCustomFieldComponent } from './components/codx-input-custom-field/codx-input-custom-field.component';
import { CodxFieldsDetailTempComponent } from './components/codx-fields-detail-temp/codx-fields-detail-temp.component';
import { PopupCustomFieldComponent } from './components/codx-fields-detail-temp/popup-custom-field/popup-custom-field.component';
import { CodxTaskbarComponent } from './components/codx-step/codx-taskbar/codx-taskbar.component';
import { GroupModulePipe } from './pipe/groupmodoule.pipe';
import { CodxViewDetailLittleComponent } from './components/codx-view-detail-little/codx-view-detail-little.component';
import { AddNoteComponent } from './components/calendar-notes/add-note/add-note.component';
import { PopupTitleComponent } from './components/calendar-notes/add-note/save-note/popup-title/popup-title.component';
import { SaveNoteComponent } from './components/calendar-notes/add-note/save-note/save-note.component';
import { UpdateNotePinComponent } from './components/calendar-notes/update-note-pin/update-note-pin.component';
import { CodxCreateIndexComponent } from './components/codx-create-index/codx-create-index.component';
import { SpeedDialModule } from '@syncfusion/ej2-angular-buttons';
import { CodxStepChartComponent } from './components/codx-step/codx-step-chart/codx-step-chart.component';
import { CodxTaskGoalTempComponent } from './components/codx-task-goal-temp/codx-task-goal-temp.component';
import { UsingHistoryComponent } from './components/dynamic-form/using-history/using-history.component';
import { AccessHistoryComponent } from './components/dynamic-form/access-history/access-history.component';
import { OrderHistoryComponent } from './components/dynamic-form/order-history/order-history.component';
import { CodxIconStepComponent } from './components/codx-step/codx-icon-step/codx-icon-step.component';
import { CodxViewContentComponent } from './components/codx-view-content/codx-view-content.component';
import { PopupViewContentComponent } from './components/codx-view-content/popup-view-content.component';
import { CodxNoDataComponent } from './components/codx-step/codx-no-data/codx-no-data.component';
import { CodxListReportsComponent } from './components/codx-list-reports/codx-list-reports.component';
import { CodxReportAddComponent } from './components/codx-list-reports/popup/codx-report-add/codx-report-add.component';

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
  QuickLinksInnerComponent,
  UserInnerComponent,
  // CodxReportComponent,
  // CodxReportViewerComponent,
  // CodxReportDesignerComponent,
  NoteDrawerComponent,
  CodxApprovalComponent,
  CodxCommentsComponent,
  DynamicSettingComponent,
  DynamicFormComponent,
  ApprovalTabsComponent,
  CodxViewApprovalStepComponent,
  CodxApproveStepsComponent,
  NotifyDrawerComponent,
  NotifyDrawerSliderComponent,
  MessengerDrawerComponent,
  ChatInnerComponent,
  CodxReferencesComponent,
  CodxImportAddTemplateComponent,
  CodxImportAddMappingTemplateComponent,
  CodxImportAddMappingComponent,
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
  ActiviesApprovalListComponent,
  ActiviesSliderComponent,
  DialogthumbComponent,
  CodxPopupViewsComponent,
  CodxCommentTempComponent,
  CodxUserTempComponent,
  CodxCompetencesComponent,
  CodxTreeCommentComponent,
  //pdf
  PdfComponent,
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
  CodxCalendarComponent,
  CalendarCenterComponent,
  CodxViewCardComponent,
  CodxViewFilesComponent,
  PopupAddEducationsComponent,
  ImageViewerComponent2,
  CodxHistoryTempComponent,
  NotifyDrawerPopupComponent,
  NotifyBodyComponent,
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
  CodxChatComponent,
  CodxChatContainerComponent,
  CodxChatListComponent,
  CodxChatBoxComponent,
  AddGroupChatComponent,
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

  CodxInputCustomFieldComponent,
  CodxFieldsDetailTempComponent,
  PopupCustomFieldComponent,
  CodxViewDetailLittleComponent,
  CodxStepChartComponent,
  CodxIconStepComponent,
  //CO
  CalendarCenterComponent,
  AddNoteComponent,
  PopupTitleComponent,
  SaveNoteComponent,
  UpdateNotePinComponent,
  PopupViewContentComponent,
  CodxViewContentComponent,

  //report
  CodxReportAddComponent
];

const T_Pipe: Type<any>[] = [
  TruncatePipe,
  FileImage,
  DisplayValue,
  TextValuePipe,
  // chatting
  ScrollPipe,
  MessageSystemPipe,
  SearchPipe,
  FillterReferType,
  GroupModulePipe,
];

@NgModule({
  declarations: [
    T_Component,
    T_Pipe,
    AttachmentComponent,
    DialogthumbComponent,
    CodxEmailComponent,
    //CodxApproveStepsComponent,
    AddEditApprovalStepComponent,
    PopupAddApproverComponent,
    CodxClearCacheComponent,
    CodxCreateIndexComponent,
    CodxTaskGoalTempComponent,
    UsingHistoryComponent,
    AccessHistoryComponent,
    OrderHistoryComponent,
    CodxListReportsComponent,
  ],
  exports: [T_Component, T_Pipe],
  imports: [
    CommonModule,
    NgbModule,
    FormsModule,
    SharedModule,
    CodxCoreModule,
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
    SpeedDialModule,
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
