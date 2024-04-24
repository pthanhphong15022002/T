import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeesComponent } from './employees.component';
import { PopupAddEmployeesComponent } from './popup-add-employees/popup-add-employees.component';
import { UpdateStatusComponent } from './update-status/update-status.component';
import { LayoutComponent } from '../_layout/layout.component';
import { CodxHRCommonModule } from '../codx-hr-common/codx-hr-common.module';
import { CommonModule } from '@angular/common';
import { CoreModule } from '@core/core.module';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BasicPrimitivesModule } from 'ngx-basic-primitives';
import { SpeedDialModule } from '@syncfusion/ej2-angular-buttons';
import { DirectivesModule } from '../codx-hr-common/directives/directives.module';

export const routes: Routes = [
  {
    path:'employee/:funcID',
    component: LayoutComponent,
    children:[
      {
        path:'',
        data: { noReuse: true },
        component: EmployeesComponent,
      },
      {
        path: '**',
        redirectTo: 'error/404',
      },
    ]
  }
];
const T_Component = [
  EmployeesComponent,
  PopupAddEmployeesComponent,
  UpdateStatusComponent,
];


const T_Module = [
  CommonModule,
  FormsModule,
  HttpClientModule,
  CoreModule,
  DirectivesModule,
  CodxHRCommonModule,
]

@NgModule({
  imports: [
   ...T_Module,
    RouterModule.forChild(routes),

  ],
  declarations: [T_Component],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EmployeesModule {}
