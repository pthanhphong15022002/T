import { NgModule, APP_INITIALIZER, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { ClipboardModule } from 'ngx-clipboard';
import { InlineSVGModule } from 'ng-inline-svg';
import { HoverPreloadModule } from 'ngx-hover-preload';
import { NgxUiLoaderModule, SPINNER, NgxUiLoaderConfig, NgxUiLoaderRouterModule, NgxUiLoaderHttpModule } from 'ngx-ui-loader';
import { AppRoutingModule, routes } from './app-routing.module';
import { AppComponent } from './app.component';

import { AuthService, CodxCoreModule } from 'codx-core';
import { ERMModule, SharedModule } from '../shared';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/vi';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { environment } from 'src/environments/environment';
import { CoreModule } from 'src/core/core.module';
import { CbxpopupComponent } from './modules/tm/controls/cbxpopup/cbxpopup.component';
import { UpdateStatusPopupComponent } from './modules/tm/controls/update-status-popup/update-status-popup.component';


//import { ReportComponent } from './modules/report/report.component';
registerLocaleData(localeFr);


function appInitializer(authService: AuthService) {
  return () => {
    return new Promise((resolve) => {
      authService.getUserByToken().subscribe(v => { resolve(v); });
    });
  };
}

const ngxUiLoaderConfig: NgxUiLoaderConfig = {
  bgsColor: '#187DE4',
  // bgsOpacity: 0.5,
  // bgsPosition: POSITION.bottomLeft,
  // bgsSize: 60,
  bgsType: SPINNER.pulse,
  // blur: 5,
  // delay: 0,
  fastFadeOut: true,
  fgsColor: '#187DE4',
  // fgsPosition: POSITION.centerCenter,
  fgsSize: 60,
  fgsType: SPINNER.cubeGrid,
  // gap: -65,
  // logoPosition: POSITION.centerCenter,
  // logoSize: 32,
  // logoUrl: 'assets/media/logos/logo-1.svg',
  // overlayBorderRadius: '0',
  overlayColor: 'rgba(255,255,255,0.7)',
  pbColor: '#187DE4',
  // pbDirection: PB_DIRECTION.leftToRight,
  // pbThickness: 5,
  // hasProgressBar: true,
  // text: 'Welcome to ngx-ui-loader',
  // textColor: '#FFFFFF',
  // textPosition: POSITION.centerCenter,
  // maxTime: -1,
  // minTime: 500
};

@NgModule({
  declarations: [
    AppComponent,
    CbxpopupComponent,
    UpdateStatusPopupComponent,
    //ReportComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,

    HttpClientModule,
    ClipboardModule,
    InlineSVGModule.forRoot(),

    NgxUiLoaderModule.forRoot(ngxUiLoaderConfig),
    NgxUiLoaderRouterModule,//.forRoot({ showForeground: false }), // import this module for showing loader automatically when navigating between app routes
    NgxUiLoaderHttpModule,

    SharedModule,
    CoreModule,
    ERMModule,
    CodxCoreModule.forRoot({ environment }),
    AppRoutingModule,
    HoverPreloadModule,
    NgxSkeletonLoaderModule.forRoot({ animation: 'pulse', loadingText: 'This item is actually loading...' }),
  ],
  exports: [],
  providers: [
    { provide: APP_INITIALIZER, useFactory: appInitializer, multi: true, deps: [AuthService] },
    { provide: LOCALE_ID, useValue: 'vi-VN' },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
