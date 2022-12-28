import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthComponent } from './auth.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LoginComponent } from './login/login.component';
import { TenantsComponent } from './tenants/tenants.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    data: { returnUrl: window.location.pathname, noReuse: true },
  },
  {
    path: 'tenants',
    component: TenantsComponent,
  },
  {
    path: '',
    component: AuthComponent,
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
      {
        path: 'login',
        component: LoginComponent,
        data: { returnUrl: window.location.pathname, noReuse: true },
      },
      {
        path: 'forgotpassword',
        component: ForgotPasswordComponent,
        data: { returnUrl: window.location.pathname, noReuse: true },
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: '**', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  { path: '**', redirectTo: 'login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
