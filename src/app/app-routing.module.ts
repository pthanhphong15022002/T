import { environment } from './../environments/environment.prod';
import { LayoutTenantComponent } from './modules/auth/tenants/layout/layout.component';
import { DynamicFormComponent } from './../../projects/codx-share/src/lib/components/dynamic-form/dynamic-form.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HoverPreloadStrategy } from 'ngx-hover-preload';
import { AuthGuard } from 'codx-core';
import { SosComponent } from '@pages/sos/sos.component';
import { LayoutOnlyHeaderComponent } from 'projects/codx-share/src/lib/_layout/_onlyHeader/_onlyHeader.component';
import { LayoutNoAsideComponent } from 'projects/codx-share/src/lib/_layout/_noAside/_noAside.component';
import { SettingCalendarComponent } from 'projects/codx-share/src/lib/components/setting-calendar/setting-calendar.component';
import { TenantsComponent } from '@modules/auth/tenants/tenants.component';
import { ViewFileDialogComponent } from 'projects/codx-share/src/lib/components/viewFileDialog/viewFileDialog.component';

var childRoutes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'cm',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('projects/codx-cm/src/lib/codx-cm.module').then(
        (m) => m.CodxCmModule
      ),
  },
  {
    path: 'bp',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('projects/codx-bp/src/lib/codx-bp.module').then(
        (m) => m.CodxBpModule
      ),
  },
  {
    path: 'dp',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('projects/codx-dp/src/lib/codx-dp.module').then(
        (m) => m.CodxDpModule
      ),
  },
  {
    path: 'tm',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('projects/codx-tm/src/lib/codx-tm.module').then((m) => m.TMModule),
  },
  {
    path: 'wp',
    canActivate: [AuthGuard],
    data: { noReuse: true },
    loadChildren: () =>
      import('projects/codx-wp/src/lib/codx-wp.module').then(
        (m) => m.CodxWpModule
      ),
  },
  {
    path: 'wp2',
    canActivate: [AuthGuard],
    data: { noReuse: true },
    loadChildren: () =>
      import('projects/codx-wp/src/lib/news/codx-new.module').then(
        (m) => m.CodxNewModule
      ),
  },
  {
    path: 'dm',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('projects/codx-dm/src/lib/codx-dm.module').then(
        (m) => m.CodxDmModule
      ),
  },
  {
    path: 'ei',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('projects/codx-ei/src/lib/codx-ei.module').then(
        (m) => m.CodxEiModule
      ),
  },
  {
    path: 'ep4',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('projects/codx-ep/src/lib/room/codx-ep4.module').then(
        (m) => m.CodxEp4Module
      ),
  },
  {
    path: 'ep7',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('projects/codx-ep/src/lib/car/codx-ep7.module').then(
        (m) => m.CodxEp7Module
      ),
  },
  {
    path: 'ep8',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('projects/codx-ep/src/lib/stationery/codx-ep8.module').then(
        (m) => m.CodxEp8Module
      ),
  },
  {
    path: 'es',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('projects/codx-es/src/lib/codx-es.module').then(
        (m) => m.CodxEsModule
      ),
  },
  {
    path: 'fd',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('projects/codx-fd/src/lib/codx-fd.module').then(
        (m) => m.CodxFdModule
      ),
  },
  {
    path: 'hr',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('projects/codx-hr/src/lib/codx-hr.module').then(
        (m) => m.CodxHRModule
      ),
  },
  {
    path: 'mwp',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('projects/codx-mwp/src/lib/codx-mwp.module').then(
        (m) => m.CodxMwpModule
      ),
  },
  {
    path: 'od',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('projects/codx-od/src/lib/codx-od.module').then(
        (m) => m.CodxODModule
      ),
  },
  {
    path: 'ad',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('projects/codx-ad/src/lib/codx-ad.module').then((m) => m.ADModule),
  },
  {
    path: 'ac',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('projects/codx-ac/src/lib/codx-ac.module').then((m) => m.AcModule),
  },
  {
    path: 'report',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('projects/codx-report/src/lib/codx-report.module').then(
        (m) => m.CodxReportModule
      ),
  },
  {
    path: 'sv',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('projects/codx-sv/src/lib/codx-sv.module').then(
        (m) => m.CodxSVModule
      ),
  },
  {
    path: 'om',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('projects/codx-om/src/lib/codx-om.module').then(
        (m) => m.CodxOmModule
      ),
  },
  {
    path: 'shared',
    canActivate: [AuthGuard],
    component: LayoutOnlyHeaderComponent,
    children: [
      {
        path: 'settings/:funcID',
        loadChildren: () =>
          import(
            'projects/codx-share/src/lib/components/dynamic-setting/dynamic-setting.module'
          ).then((m) => m.DynamicSettingModule),
      },
      {
        path: 'settingcalendar/:funcID',
        component: SettingCalendarComponent,
      },
    ],
  },
  {
    path: 'shared',
    canActivate: [AuthGuard],
    component: LayoutNoAsideComponent,
    children: [
      {
        path: 'dynamic/:funcID',
        component: DynamicFormComponent,
      },
    ],
  },
  {
    path: 'error',
    loadChildren: () =>
      import('./pages/errors/errors.module').then((m) => m.ErrorsModule),
  },
  {
    path: 'viewfile',
    component: ViewFileDialogComponent,
  },
  {
    path: 'sos',
    component: SosComponent,
  },
  {
    path: 'tn',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('projects/codx-tn/src/lib/codx-tn.module').then(
        (m) => m.CodxTnModule
      ),
  },
  {
    path: '',
    redirectTo: 'wp',
    pathMatch: 'full',
  },
  { path: '**', redirectTo: 'error/404' },
];

export const routes: Routes = [
  {
    path: 'tenants',
    component: LayoutTenantComponent,
    children: [{ path: '', component: TenantsComponent }],
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: ':tenant',
    children: childRoutes,
  },
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
];
//export const routes1: Routes = environment.saas == 1 ? routes : childRoutes;

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: HoverPreloadStrategy,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
