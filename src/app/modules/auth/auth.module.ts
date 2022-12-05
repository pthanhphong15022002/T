import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { HoverPreloadModule } from 'ngx-hover-preload';

import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
// import { RegistrationComponent } from './registration/registration.component';
// import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
// import { LogoutComponent } from './logout/logout.component';
import { AuthComponent } from './auth.component';

import { ERMModule, SharedModule } from 'src/shared';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { CoreModule } from 'src/core/core.module';
import { CodxCoreModule } from 'codx-core';
import { environment } from 'src/environments/environment';
import { ForgotPasswordDefaultComponent } from './default/forgot-password-default/forgot-password-default.component';
import { ForgotPasswordQTSCComponent } from './cz/qtsc/forgot-password-qtsc/forgot-password-qtsc.component';
import { LoginDefaultComponent } from './default/login-default/login-default.component';
import { LoginQTSCComponent } from './cz/qtsc/login-qtsc/login-qtsc.component';

@NgModule({
  declarations: [
    LoginComponent,
    LoginDefaultComponent,
    LoginQTSCComponent,
    // RegistrationComponent,
    ForgotPasswordComponent,
    // LogoutComponent,
    AuthComponent,
    ForgotPasswordDefaultComponent,
    ForgotPasswordQTSCComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,

    SharedModule,
    CoreModule,
    ERMModule,
    CodxCoreModule,
    AuthRoutingModule,
    HoverPreloadModule,
    CodxCoreModule.forRoot({environment}),
  ]
})
export class AuthModule { }
