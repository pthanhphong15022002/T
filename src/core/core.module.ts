import { LOCALE_ID, NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
// import { SharedControlPipe } from './pipes/sharedcontrol.pipe';
import { ErrorInterceptor, JwtInterceptor } from 'codx-core';
// import { DisplayNameCardPipe } from './pipes/display-name-card.pipe';
// import { MessagePipe } from './pipes/message.pipe';

@NgModule({
  declarations: [],
  imports: [CommonModule, FormsModule],
  providers: [
    // { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: LOCALE_ID, useValue: 'vi-VN' },
  ],
  exports: [],
})
export class CoreModule {}
