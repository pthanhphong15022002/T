import { DynamicFormComponent } from './../../projects/codx-share/src/lib/components/dynamic-form/dynamic-form.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HoverPreloadStrategy } from 'ngx-hover-preload';
import { AuthGuard } from 'codx-core';
import { SosComponent } from '@pages/sos/sos.component';
import { LayoutOnlyHeaderComponent } from 'projects/codx-share/src/lib/_layout/_onlyHeader/_onlyHeader.component';
import { LayoutNoAsideComponent } from 'projects/codx-share/src/lib/_layout/_noAside/_noAside.component';
import { SettingCalendarComponent } from 'projects/codx-share/src/lib/components/setting-calendar/setting-calendar.component';
import { ExternalSigningComponent } from 'projects/codx-es/src/lib/external-signing/external-signing.component';
export const routes: Routes = [
  {
    path: ':tenant',
    children: [
      {
        path: 'auth',
        loadChildren: () =>
          import('./modules/auth/auth.module').then((m) => m.AuthModule),
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
        path: 'error',
        loadChildren: () =>
          import('./pages/errors/errors.module').then((m) => m.ErrorsModule),
      },
      {
        path: 'tm',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('projects/codx-tm/src/lib/codx-tm.module').then(
            (m) => m.TMModule
          ),
      },
      {
        path: 'wp',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('projects/codx-wp/src/lib/codx-wp.module').then(
            (m) => m.CodxWpModule
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
        path: 'ep',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('projects/codx-ep/src/lib/codx-ep.module').then(
            (m) => m.CodxEpModule
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
          import('projects/codx-ad/src/lib/codx-ad.module').then(
            (m) => m.ADModule
          ),
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
        path: 'sos',
        component: SosComponent,
      },
      {
        path: 'externalsign',
        component: ExternalSigningComponent,
      },
      {
        path: '',
        redirectTo: 'wp',
        pathMatch: 'full',
      },
      { path: '**', redirectTo: 'error/404' },
    ],
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: HoverPreloadStrategy }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
