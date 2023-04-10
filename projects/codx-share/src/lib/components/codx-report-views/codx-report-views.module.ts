import { NgModule, Type } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { CodxCoreModule } from 'codx-core';
import { CodxReportViewsComponent } from './codx-report-views.component';

export const routes: Routes = [
  {
    path: '',
    component: CodxReportViewsComponent,
    children: [
      {
        path: ':reports/:funcID',
        component: CodxReportViewsComponent,
        //data: { noReuse: true },
      },
      {
        path: ':reports/detail/:funcID',
        component: CodxReportViewsComponent,
      },
    ],
  },
];

const T_Component: Type<any>[] = [
  CodxReportViewsComponent, 
];



@NgModule({
  declarations: [T_Component],
  imports: [
    CommonModule,
    NgbModule,
    FormsModule,
    SharedModule,
    CodxCoreModule,
    RouterModule.forChild(routes),
  ],
  exports: [T_Component],
})
export class CodxReportViewsModule {}
