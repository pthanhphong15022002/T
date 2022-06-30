import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HoverPreloadStrategy } from 'ngx-hover-preload';
import { AuthGuard } from 'codx-core';
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
        path: 'error',
        loadChildren: () =>
          import('./pages/errors/errors.module').then((m) => m.ErrorsModule),
      },
      {
        path: '',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./pages/_layout/layout.module').then((m) => m.LayoutModule),
      },
      {
        path: 'tm',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('projects/codx-tm/src/lib/codx-tm.module').then((m) => m.TMModule),
      },
      {
        path: 'dm',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('projects/codx-dm/src/lib/codx-dm.module').then((m) => m.CodxDmModule),
      },
      // {
      //   path: 'mwp',
      //   canActivate: [AuthGuard],
      //   loadChildren: () =>
      //     import('/modules/tm/mwp/_layout/layout.modules').then((m) => m.LayoutModule),
      // },
      {
        path: 'ep',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('projects/codx-ep/src/lib/codx-ep.module').then((m) => m.CodxEpModule),
      },
      {
        path: 'es',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('projects/codx-es/src/lib/codx-es.module').then((m) => m.CodxEsModule),
      },
      {
        path: 'fd',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('projects/codx-fd/src/lib/codx-fd.module').then((m) => m.CodxFdModule),
      },
      {
        path: 'hr',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('projects/codx-hr/src/lib/codx-hr.module').then((m) => m.CodxHRModule),
      },
      {
        path: 'mwp',
        canActivate: [AuthGuard],  
        loadChildren: () =>
          import('projects/codx-mwp/src/lib/codx-mwp.module').then((m) => m.CodxMwpModule),
      },
      {
        path: 'od',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('projects/codx-od/src/lib/codx-od.module').then((m) => m.CodxODModule),
      }, 
      { path: '**', redirectTo: 'error/404' }
    ]
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: HoverPreloadStrategy })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
