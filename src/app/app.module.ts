
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
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import {
  AuthService,
  CodxCoreModule,
  CacheRouteReuseStrategy,
} from 'codx-core';
import { ERMModule, SharedModule } from '../shared';
import { registerLocaleData } from '@angular/common';
import localeVi from '@angular/common/locales/vi';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { environment } from 'src/environments/environment';
import { CoreModule } from 'src/core/core.module';
import { TMModule } from 'projects/codx-tm/src/public-api';
import { CodxEp4Module } from 'projects/codx-ep/src/lib/room/codx-ep4.module';
import { CodxEp7Module } from 'projects/codx-ep/src/lib/car/codx-ep7.module';
import { CodxEp8Module } from 'projects/codx-ep/src/lib/stationery/codx-ep8.module';
import { CodxEsModule } from 'projects/codx-es/src/public-api';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CodxReportModule } from 'projects/codx-report/src/public-api';
import { FileComponent } from './file/file.component';
import { AppConfigService } from '@core/services/config/app-config.service';
import { AppConfig } from '@core/services/config/app-config';
import { RouteReuseStrategy } from '@angular/router';
import { CodxEiModule } from 'projects/codx-ei/src/public-api';
import { SosComponent } from '@pages/sos/sos.component';
import { SocialLoginModule, SocialAuthServiceConfig, AmazonLoginProvider, FacebookLoginProvider, GoogleLoginProvider, MicrosoftLoginProvider } from '@abacritt/angularx-social-login';

const socialConfigFactory = () => {
  return new Promise((resolve, reject) => {
    try {
      setTimeout(()=>{
        let providers = [];
        
        if(environment.saas == 1){
          if(environment.externalLogin.amazonId){
            providers.push({
                id: AmazonLoginProvider.PROVIDER_ID,
                provider: new AmazonLoginProvider(
                  environment.externalLogin.amazonId
                ),
            });
          }

          if(environment.externalLogin.googleId){
            providers.push({
                id: GoogleLoginProvider.PROVIDER_ID,
                provider: new GoogleLoginProvider(
                  environment.externalLogin.googleId
                ),
            });
          }

          if(environment.externalLogin.facebookId){
            providers.push({
                id: FacebookLoginProvider.PROVIDER_ID,
                provider: new FacebookLoginProvider(
                  environment.externalLogin.facebookId
                ),
            });
          }

          if(environment.externalLogin.microsoftId){
            providers.push({
                id: MicrosoftLoginProvider.PROVIDER_ID,
                provider: new MicrosoftLoginProvider(
                  environment.externalLogin.microsoftId
                ),
            });
          }
        }

        var config =  {
          autoLogin: false,
          providers: providers,
        } as SocialAuthServiceConfig;

        resolve(config);
      }, 100);
    } catch (err) {
      reject(err);
    }
  });
};

registerLocaleData(localeVi);

function appInitializer(authService: AuthService, appConfig: AppConfigService) {
  return () => {
    return new Promise((resolve) => {
      appConfig.load().subscribe((res) => {
        authService.getUserByToken().subscribe((v) => {
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
  // minTime: 500
};

@NgModule({
  declarations: [AppComponent, FileComponent,SosComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,

    HttpClientModule,
    ClipboardModule,
    InlineSVGModule.forRoot(),

    NgxUiLoaderModule.forRoot(ngxUiLoaderConfig),
    NgxUiLoaderRouterModule, //.forRoot({ showForeground: false }), // import this module for showing loader automatically when navigating between app routes
    NgxUiLoaderHttpModule,
    
    SharedModule,
    CoreModule,
    ERMModule,
    CodxCoreModule.forRoot({ environment }),
    TMModule.forRoot({ environment }),
    CodxEp4Module.forRoot({ environment }),
    CodxEp7Module.forRoot({ environment }),
    CodxEp8Module.forRoot({ environment }),
    CodxEiModule.forRoot({ environment }),
    CodxEsModule.forRoot({ environment }),
    CodxReportModule.forRoot({ environment }),
    AppRoutingModule,
    HoverPreloadModule,
    NgxSkeletonLoaderModule.forRoot({
      animation: 'pulse',
      loadingText: 'This item is actually loading...',
    }),
    SocialLoginModule,
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
    {
      provide: 'SocialAuthServiceConfig',
      useFactory: socialConfigFactory
    },
    { provide: LOCALE_ID, useValue: 'vi-VN' },
    { provide: RouteReuseStrategy, useClass: CacheRouteReuseStrategy },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
