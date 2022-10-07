import { LOCALE_ID, NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { CommonModule } from '@angular/common';

import { GroupFilterPipe } from './pipes';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from './pipes/filterObject.pipe';
import { DatetimePipe } from './pipes/datetime.pipe';
import { FormatDatetimePipe } from './pipes/format-datetime.pipe';
import { SharedControlPipe } from './pipes/sharedcontrol.pipe';
import { FunctionPipe } from './pipes/function.pipe';
import { BackgroundImagePipe } from './pipes/background-image.pipe';
import { ErrorInterceptor, JwtInterceptor } from 'codx-core';
import { AvatarCardPipe } from './pipes/AvatarCard.pipe';
import { DisplayNameCardPipe } from './pipes/display-name-card.pipe';
import { TimeAgoPipe } from '../../projects/codx-hr/src/lib/pipe/time-ago.pipe';
// import { MessagePipe } from './pipes/message.pipe';

@NgModule({
  declarations: [
    GroupFilterPipe,
    DatetimePipe,
    FilterPipe,
    DatetimePipe,
    FormatDatetimePipe,
    SharedControlPipe,
    FunctionPipe,
    BackgroundImagePipe,
    AvatarCardPipe,
    DisplayNameCardPipe,
  ],
  imports: [CommonModule, FormsModule],
  providers: [
    // { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: LOCALE_ID, useValue: 'vi-VN' },
  ],
  exports: [
    DatetimePipe,
    GroupFilterPipe,
    FilterPipe,
    FormatDatetimePipe,
    SharedControlPipe,
    FunctionPipe,
    BackgroundImagePipe,
    AvatarCardPipe,
    DisplayNameCardPipe,
  ],
})
export class CoreModule {}
