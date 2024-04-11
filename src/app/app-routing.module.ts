import { LayoutTenantComponent } from './modules/auth/tenants/layout/layout.component';
import { DynamicFormComponent } from './../../projects/codx-share/src/lib/components/dynamic-form/dynamic-form.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard, LayoutBaseComponent } from 'codx-core';
import { SettingCalendarComponent } from 'projects/codx-share/src/lib/components/setting-calendar/setting-calendar.component';
import { TenantsComponent } from '@modules/auth/tenants/tenants.component';
import { ReviewComponent } from 'projects/codx-sv/src/lib/add-survey/review/review.component';
import { SosComponent } from '@pages/sos/sos.component';
import { ExternalSigningComponent } from 'projects/codx-es/src/lib/external-signing/external-signing.component';
import { ViewFileDialogComponent } from 'projects/codx-common/src/lib/component/viewFileDialog/viewFileDialog.component';
import { LayoutOnlyHeaderComponent } from 'projects/codx-common/src/lib/_layout/_onlyHeader/_onlyHeader.component';
import { LayoutNoAsideComponent } from 'projects/codx-common/src/lib/_layout/_noAside/_noAside.component';
import { CodxViewFileComponent } from 'projects/codx-share/src/lib/components/codx-view-file/codx-view-file.component';

var childAuthRoutes: Routes = [
  {
    path: 'wr',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('projects/codx-wr/src/lib/codx-wr.module').then(
        (m) => m.CodxWrModule
      ),
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
    path: 'tme',
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
    path: 'wp4',
    canActivate: [AuthGuard],
    data: { noReuse: true },
    loadChildren: () =>
      import('projects/codx-wp/src/lib/knowledge/knowledge.module').then(
        (m) => m.CodxKnowledgeModule
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
    path: 'dme',
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
    path: 'ep',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('projects/codx-ep/src/lib/codx-ep.module').then(
        (m) => m.CodxEPModule
      ),
  },
  {
    path: 'epe',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('projects/codx-ep/src/lib/codx-ep.module').then(
        (m) => m.CodxEPModule
      ),
  },
  {
    path: 'co',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('projects/codx-co/src/lib/codx-co.module').then(
        (m) => m.CodxCoModule
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
    path: 'ese',
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
    path: 'fde',
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
    path: 'tr',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('projects/codx-tr/src/lib/codx-tr.module').then(
        (m) => m.CodxTrModule
      ),
  },
  {
    path: 'pr',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('projects/codx-pr/src/lib/codx-pr.module').then(
        (m) => m.CodxPrModule
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
    path: 'ode',
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
    path: 'ws',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('projects/codx-ws/src/lib/codx-ws.module').then(
        (m) => m.CodxWsModule
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
        data: { isReuse: true },
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
    path: 'tn',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('projects/codx-tn/src/lib/codx-tn.module').then(
        (m) => m.CodxTnModule
      ),
  },
  {
    path: 'pm',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('projects/codx-pm/src/lib/codx-pm.module').then(
        (m) => m.CodxPmModule
      ),
  },
];

var childPublicRoutes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'viewfile',
    component: ViewFileDialogComponent,
  },
  {
    path: 'file',
    component: CodxViewFileComponent,
  },
  {
    path: 'forms',
    component: ReviewComponent,
  },
  {
    path: 'esign/:id',
    component: ExternalSigningComponent,
  },
  {
    path: 'error',
    loadChildren: () =>
      import('./pages/errors/errors.module').then((m) => m.ErrorsModule),
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
    children: [...childAuthRoutes, ...childPublicRoutes],
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
    RouterModule.forRoot(routes),
    // RouterModule.forRoot(routes, {
    //   preloadingStrategy: HoverPreloadStrategy,
    // }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
