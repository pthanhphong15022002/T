import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { HttpClient } from '@angular/common/http';
import { NgModule, APP_INITIALIZER, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import {
  NgxUiLoaderModule,
  SPINNER,
  NgxUiLoaderConfig,
  NgxUiLoaderRouterModule,
  NgxUiLoaderHttpModule,
} from 'ngx-ui-loader';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import {
  AuthService,
  CodxCoreModule,
  CacheRouteReuseStrategy,
} from 'codx-core';
import { ERMModule, SharedModule } from '../shared';
import { registerLocaleData, CommonModule } from '@angular/common';
import localeVi from '@angular/common/locales/vi';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { environment } from 'src/environments/environment';
import { CoreModule } from 'src/core/core.module';
import { TMModule } from 'projects/codx-tm/src/public-api';
import { CodxEsModule } from 'projects/codx-es/src/public-api';
import { CodxDpModule } from 'projects/codx-dp/src/public-api';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FileComponent } from './file/file.component';
import { AppConfigService } from '@core/services/config/app-config.service';
import { AppConfig } from '@core/services/config/app-config';
import { RouteReuseStrategy } from '@angular/router';
import { CodxEiModule } from 'projects/codx-ei/src/public-api';

import { LayoutTenantComponent } from '@modules/auth/tenants/layout/layout.component';
import { SosComponent } from '@pages/sos/sos.component';
import { CodxContainersComponent } from './codx-containers/codx-containers.component';
import { CodxPmModule } from 'projects/codx-pm/src/public-api';

registerLocaleData(localeVi);

function appInitializer(authService: AuthService, appConfig: AppConfigService) {
  return () => {
    return new Promise((resolve) => {
      appConfig.load().subscribe((res) => {
        (authService.checkTenant() as any).subscribe((v) => {
          resolve(v);
        });
      });
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
  overlayColor: 'rgba(255,255,255,0)',
  pbColor: '#187DE4',
  // pbDirection: PB_DIRECTION.leftToRight,
  // pbThickness: 5,
  // hasProgressBar: true,
  // text: 'Welcome to ngx-ui-loader',
  // textColor: '#FFFFFF',
  // textPosition: POSITION.centerCenter,
  // maxTime: -1,
  minTime: 100,
};

@NgModule({
  declarations: [
    AppComponent,
    FileComponent,
    SosComponent,
    LayoutTenantComponent,
    CodxContainersComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    HttpClientModule,

    NgxUiLoaderModule.forRoot(ngxUiLoaderConfig),
    NgxUiLoaderRouterModule, //forRoot({ showForeground: true }), // import this module for showing loader automatically when navigating between app routes
    NgxUiLoaderHttpModule.forRoot({ showForeground: false }),

    SharedModule,
    CoreModule,
    ERMModule,
    CodxCoreModule.forRoot({ environment }),
    TMModule.forRoot({ environment }),
    // CodxEp4Module.forRoot({ environment }),
    // CodxEp7Module.forRoot({ environment }),
    // CodxEp8Module.forRoot({ environment }),
    CodxEiModule.forRoot({ environment }),
    CodxEsModule.forRoot({ environment }),
    CodxDpModule.forRoot({ environment }),
    CodxPmModule.forRoot({ environment }),
    CodxShareModule,
    AppRoutingModule,
    NgxSkeletonLoaderModule.forRoot({
      animation: 'pulse',
      loadingText: 'This item is actually loading...',
    }),
    NgbModule,
  ],
  exports: [],
  providers: [
    {
      provide: AppConfig,
      deps: [HttpClient],
      useExisting: AppConfigService,
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
export class AppModule {}
