import { BackgroundImagePipe } from './pipes/background-image.pipe';
import { LOCALE_ID, NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { CommonModule } from '@angular/common';

import { ErrorInterceptor, JwtInterceptor } from './interceptors';
import { GroupFilterPipe } from './pipes';
import { DragDropFileUploadDirective } from './directives/drag-drop-file-upload.directive';
import { DragDropFileFolderDirective } from './directives/drag-drop-file-folder.directive';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from './pipes/filterObject.pipe';
import { DatetimePipe } from './pipes/datetime.pipe';
import { FormatDatetimePipe } from './pipes/format-datetime.pipe';
import { SharedControlPipe } from './pipes/sharedcontrol.pipe';
import { FunctionPipe } from './pipes/function.pipe';
// import { MessagePipe } from './pipes/message.pipe';

@NgModule({
  declarations: [
    GroupFilterPipe,
    DatetimePipe,
    DragDropFileUploadDirective,
    DragDropFileFolderDirective,
    FilterPipe,
    DatetimePipe,
    FormatDatetimePipe,
    SharedControlPipe,
    FunctionPipe,
    BackgroundImagePipe
  ],
  imports: [CommonModule, FormsModule],
  providers: [
    // { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: LOCALE_ID, useValue: 'vi-VN' }
  ],
  exports: [
    DatetimePipe,
    GroupFilterPipe,
    DragDropFileUploadDirective,
    DragDropFileFolderDirective,
    FilterPipe,
    FormatDatetimePipe,
    SharedControlPipe,
    FunctionPipe,
    BackgroundImagePipe,
  ],

})
export class CoreModule { }
