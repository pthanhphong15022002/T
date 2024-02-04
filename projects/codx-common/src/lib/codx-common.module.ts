import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodxCoreModule } from 'codx-core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { ReactiveFormsModule } from '@angular/forms';
import {
  DocumentEditorAllModule,
  DocumentEditorContainerAllModule,
} from '@syncfusion/ej2-angular-documenteditor';
import { SpreadsheetAllModule } from '@syncfusion/ej2-angular-spreadsheet';
import { ViewFileDialogComponent } from './component/viewFileDialog/viewFileDialog.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { DashboardLayoutAllModule } from '@syncfusion/ej2-angular-layouts';
import { SliderModule, UploaderModule } from '@syncfusion/ej2-angular-inputs';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { DialogModule } from '@syncfusion/ej2-angular-popups';

//#region Layout
import { LayoutNoAsideToolbarFluidComponent } from './_layout/_noAsideToolbarFluid/_noAsideToolbarFluid.component';
import { LayoutOnlyHeaderComponent } from './_layout/_onlyHeader/_onlyHeader.component';
import { LayoutNoAsideComponent } from './_layout/_noAside/_noAside.component';
import { ActiviesApprovalListComponent } from './_layout/drawers/activies-approval-list/activies-approval-list.component';
import { AlertDrawerComponent } from './_layout/drawers/alert-drawer/alert-drawer.component';
import { ChatInnerComponent } from './_layout/drawers/messenger-drawer/chat-inner/chat-inner.component';
import { MessengerDrawerComponent } from './_layout/drawers/messenger-drawer/messenger-drawer.component';
import { NotifyDrawerComponent } from './_layout/drawers/notify-drawer/notify-drawer.component';
import { NotifyBodyComponent } from './_layout/drawers/notify-drawer/notify-body/notify-body.component';
import { CodxNotesComponent } from './_layout/drawers/note/codx-note/codx-notes.component';
import { NoteSliderComponent } from './_layout/drawers/note/note-slider/note-slider.component';
import { NotifyDrawerPopupComponent } from './_layout/drawers/notify-drawer/notify-drawer-popup/notify-drawer-popup.component';
import { NotifyDrawerSliderComponent } from './_layout/drawers/notify-drawer/notify-drawer-slider/notify-drawer-slider.component';
import { QuickLinksInnerComponent } from './_layout/dropdown-inner/quick-links-inner/quick-links-inner.component';
import { UserInnerComponent } from './_layout/dropdown-inner/user-inner/user-inner.component';

import { CodxCreateIndexComponent } from './_layout/codx-create-index/codx-create-index.component';
import { CodxClearCacheComponent } from './_layout/codx-clear-cache/codx-clear-cache.component';
import { CodxChatComponent } from './_layout/drawers/chat/codx-chat/codx-chat.component';
import { CodxChatContainerComponent } from './_layout/drawers/chat/chat-container/chat-container.component';
import { CodxChatListComponent } from './_layout/drawers/chat/chat-list/chat-list.component';
import { CodxChatBoxComponent } from './_layout/drawers/chat/chat-box/chat-box.component';
import { AddGroupChatComponent } from './_layout/drawers/chat/popup/popup-add-group/popup-add-group.component';
import { ActiviesSliderComponent } from './_layout/drawers/activies-approval-list/activies-slider/activies-slider.component';

//#endregion

//#region Component
import { AttachmentComponent } from './component/attachment/attachment.component';
import { CodxViewFilesComponent } from './component/codx-view-files/codx-view-files.component';
import { OpenFolderComponent } from './component/openFolder/openFolder.component';
import { DialogthumbComponent } from './component/thumbnail/dialogthumb/dialogthumb.component';
import { ThumbnailComponent } from './component/thumbnail/thumbnail.component';
import { BreadcumbComponent } from './component/breadcumb/breadcumb.component';
import { PdfComponent } from './component/pdf/pdf.component';
import { AttachmentWebComponent } from './component/attachment/attachment-web/attachment-web.component';

//#endregion

//#region Pipe
import { ColorPipe } from './pipe/Color.pipe';
import { SecurePipe } from './pipe/secure.pipe';

import { DisplayValue } from './pipe/displayValue.pipe';
import { FileSizePipe } from './pipe/file-size.pipe';
import { FileImage } from './pipe/fileImage.pipe';
import { GroupModulePipe } from './pipe/groupmodoule.pipe';
import { NumberPipe } from './pipe/Number.pipe';
import { SearchPipe } from './pipe/search.pipe';
import { TextValuePipe } from './pipe/textValue.pipe';
import { TruncatePipe } from './pipe/truncate.pipe';
import { FillterReferType } from './pipe/filterReferPipe.pipe';
import { DatetimePipe } from './pipe/datetime.pipe';
import { MessageSystemPipe } from './pipe/mssgSystem.pipe';
import { ScrollPipe } from './pipe/scrollPipe.pipe';
import { FilterPipe } from './pipe/filterObject.pipe';
import { TimeFromPipe } from './pipe/format-datetime.pipe';
import { MessageReplacePipe } from './pipe/mssgReplace.pipe';
import { BackHomeComponent } from './_layout/back-home/back-home.component';
import { CoDxAddApproversComponent } from './component/codx-approval-procress/codx-add-approvers/codx-add-approvers.component';
import { CoDxViewReleaseSignFileComponent } from './component/codx-approval-procress/codx-view-release-sign-file/codx-view-release-sign-file.component';
import { CoDxGetTemplateSignFileComponent } from './component/codx-approval-procress/codx-get-template-sign-file/codx-get-template-sign-file.component';
import { CodxAiComponent } from './_layout/drawers/codx-ai/codx-ai.component';
import { PresentationComponent } from './_layout/drawers/codx-ai/presentation/presentation.component';
import { SubstringPipe } from './pipe/substring';
import { DebounceDirective } from './directives/debounce-click.directive';
import { AssetURLPipe } from './pipe/assetURL';
import { AttachmentGridComponent } from './component/attachment-grid/attachment-grid.component';
import { AttachmentGridFilesComponent } from './component/attachment-grid/attachment-grid-files/attachment-grid-files.component';
//#endregion

const T_Component: Type<any>[] = [
  //#region Layout
  LayoutNoAsideComponent,
  LayoutOnlyHeaderComponent,
  LayoutNoAsideToolbarFluidComponent,
  ActiviesApprovalListComponent,
  ActiviesSliderComponent,
  AlertDrawerComponent,
  CodxChatComponent,
  CodxChatContainerComponent,
  CodxChatListComponent,
  CodxChatBoxComponent,
  AddGroupChatComponent,
  ChatInnerComponent,
  MessengerDrawerComponent,
  CodxNotesComponent,
  NoteSliderComponent,
  NotifyBodyComponent,
  NotifyDrawerPopupComponent,
  NotifyDrawerSliderComponent,
  NotifyDrawerComponent,
  QuickLinksInnerComponent,
  UserInnerComponent,
  CodxCreateIndexComponent,
  CodxClearCacheComponent,
  //#endregion

  //#region Component
  CodxViewFilesComponent,
  OpenFolderComponent,
  AttachmentComponent,
  AttachmentGridComponent,
  AttachmentGridFilesComponent,
  PdfComponent,
  ViewFileDialogComponent,
  DialogthumbComponent,
  ThumbnailComponent,
  BreadcumbComponent,
  AttachmentWebComponent,
  //#endregion

  BackHomeComponent,

  //Approval Process
  CoDxAddApproversComponent,
  CoDxViewReleaseSignFileComponent,
  CoDxGetTemplateSignFileComponent,

  //Ai Tool
  CodxAiComponent,
  PresentationComponent,
];

const T_Pipe: Type<any>[] = [
  //#region Pipe
  AssetURLPipe,
  ColorPipe,
  SecurePipe,
  DatetimePipe,
  DisplayValue,
  FileImage,
  FileSizePipe,
  GroupModulePipe,
  NumberPipe,
  SearchPipe,
  TextValuePipe,
  TruncatePipe,
  FillterReferType,
  MessageSystemPipe,
  MessageReplacePipe,
  ScrollPipe,
  FilterPipe,
  TimeFromPipe,
  SubstringPipe,
  //#endregion
];

const T_Directive: Type<any>[] = [DebounceDirective];

@NgModule({
  declarations: [T_Component, T_Pipe, T_Directive],
  imports: [
    CommonModule,
    CodxCoreModule,
    NgbModule,
    LazyLoadImageModule,
    PickerModule,
    ReactiveFormsModule,
    DocumentEditorAllModule,
    DocumentEditorContainerAllModule,
    SpreadsheetAllModule,
    NgxExtendedPdfViewerModule,
    DashboardLayoutAllModule,
    SliderModule,
    UploaderModule,
    DialogModule,
  ],
  exports: [T_Component, T_Pipe, T_Directive],
})
export class CodxCommonModule {}
