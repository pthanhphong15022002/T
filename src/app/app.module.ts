import { HttpClient } from '@angular/common/http';
import { NgModule, APP_INITIALIZER, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { ClipboardModule } from 'ngx-clipboard';
import { InlineSVGModule } from 'ng-inline-svg';
import { HoverPreloadModule } from 'ngx-hover-preload';
import {
  NgxUiLoaderModule,
  SPINNER,
  NgxUiLoaderConfig,
  NgxUiLoaderRouterModule,
  NgxUiLoaderHttpModule,
} from 'ngx-ui-loader';
import { AppRoutingModule, routes } from './app-routing.module';
import { AppComponent } from './app.component';

import { AuthService, CodxCoreModule } from 'codx-core';
import { ERMModule, SharedModule } from '../shared';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/vi';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { environment } from 'src/environments/environment';
import { CoreModule } from 'src/core/core.module';
import { TMModule } from 'projects/codx-tm/src/public-api';
import { CodxEpModule } from 'projects/codx-ep/src/public-api';
import { CodxEsModule } from 'projects/codx-es/src/public-api';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CodxReportModule } from 'projects/codx-report/src/public-api';
import { FileComponent } from './file/file.component';
import { AppConfigService } from '@core/services/config/app-config.service';
import { AppConfig } from '@core/services/config/app-config';
import { RouteReuseStrategy } from '@angular/router';
import { CodxSVModule } from 'projects/codx-sv/src/public-api';
import { CacheRouteReuseStrategy } from './cache-router-reuse-strategy';


//import { ReportComponent } from './modules/report/report.component';
registerLocaleData(localeFr);

function appInitializer(authService: AuthService, appConfig: AppConfigService) {
  return () => {
    return new Promise((resolve) => {
      appConfig.load().subscribe(res => {
        authService.getUserByToken().subscribe((v) => {
          resolve(v);
        });
      });
    });
  }
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
  overlayColor: 'rgba(255,255,255,0)',
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
    FileComponent
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
    TMModule.forRoot({ environment }),
    CodxEpModule.forRoot({ environment }),
    CodxEsModule.forRoot({ environment }),
    CodxReportModule.forRoot({ environment }),
    AppRoutingModule,
    HoverPreloadModule,
    NgxSkeletonLoaderModule.forRoot({
      animation: 'pulse',
      loadingText: 'This item is actually loading...',
    }),
    NgbModule
  ],
  exports: [],
  providers: [
    {
      provide: AppConfig,
      deps: [HttpClient],
      useExisting: AppConfigService
    },
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
      multi: true,
      deps: [AuthService, AppConfigService],
    },
    { provide: LOCALE_ID, useValue: 'vi-VN' },
    { provide: RouteReuseStrategy, useClass: CacheRouteReuseStrategy },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
