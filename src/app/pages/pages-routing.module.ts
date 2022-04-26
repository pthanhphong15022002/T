import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './_layout/layout.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'home',
        loadChildren: () =>
          import('./home/home.module').then((m) => m.HomeModule),
      },
      // {
      //     path: 'ad',
      //     loadChildren: () =>
      //         import('../modules/AD/ad.module').then(
      //             (m) => m.ADModule
      //         ),
      // },
      // {
      //     path: 'hr',
      //     loadChildren: () =>
      //         import('../modules/HR/HR.module').then(
      //             (m) => m.HRModule
      //         ),
      // },
      // {
      //     path: 'dm',
      //     loadChildren: () =>
      //         import('../modules/dm/dm.module').then(
      //             (m) => m.DMModule
      //         ),
      // },
      // {
      //     path: 'standard',
      //     loadChildren: () =>
      //         import('../modules/standard/standard.module').then(
      //             (m) => m.StandardModule
      //         ),
      // },
      // {
      //     path: 'user',
      //     loadChildren: () =>
      //         import('../modules/user-profile/user-profile.module').then(
      //             (m) => m.UserProfileModule
      //         ),
      // },
      // {
      //     path: 'fed',
      //     loadChildren: () =>
      //         import('../modules/fed/fed.module').then(
      //             (m) => m.FEDModule
      //         ),
      // },
      {
        path: 'tm',
        loadChildren: () =>
          import('../modules/tm/tm.module').then(
            (m) => m.TmModule
          ),
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'error/404',
      },
    ],
  },
  {
    path: 'wp',
    loadChildren: () =>
      import('../modules/wp/_layout/layout.modules').then((m) => m.LayoutModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule { }
