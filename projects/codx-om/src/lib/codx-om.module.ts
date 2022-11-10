import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { CodxOmComponent } from './codx-om.component';
import { LayoutComponent } from './_layout/layout.component';

import { OKRComponent } from './okr/okr.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
        {
          path: 'okr/:funcID',
          component: OKRComponent,
        },
      ]
    // children: [
    //   {
    //     path: 'home/:funcID',
    //     component: HomeComponent,
    //   },
    //   {
    //     path: 'dispatches/:funcID',
    //     component: IncommingComponent,
    //   },
    //   /*  {
    //     path: 'dispatches/:funcID/detail',
    //     //outlet : "test1",
    //     component: ODTestDetailComponent
    //   },    */
    //   {
    //     path: 'searching/:funcID',
    //     component: SearchingComponent,
    //   },
    //   {
    //     path: 'approvals/:funcID',
    //     loadChildren: () =>
    //       import('projects/codx-od/src/lib/codx-approvel.module').then(
    //         (m) => m.ApprovelModule
    //       ),
    //   },
    //   {
    //     path: '',
    //     redirectTo: 'home',
    //     pathMatch: 'full',
    //   },
    //   {
    //     path: '**',
    //     redirectTo: 'error/404',
    //   },
    // ],
  }
];

@NgModule({
  declarations: [
    CodxOmComponent,
    OKRComponent
  ],
  imports: [
  ],
  exports: [
    CodxOmComponent
  ]
})
export class CodxOmModule { }
