import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, ModuleWithProviders, NgModule, Type } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CodxCoreModule, EnvironmentConfig } from 'codx-core';
import { InlineSVGModule } from 'ng-inline-svg';
import { EmployeeInfomationComponent } from 'projects/codx-mwp/src/lib/employeeinfomation/employee-infomation.component';
import { EmpContactsComponent } from './empcontacts/emp-contacts.component';
import { EmployeesComponent } from './employees/employees.component';
import { PopupAddEmployeesComponent } from './employees/popup-add-employees/popup-add-employees.component';
import { EmployeesLeaveComponent } from './employeesleave/employees-leave.component';
import { PopupAddPositionsComponent } from './positions/popup-add-positions/popup-add-positions.component';
import { PositionsComponent } from './positions/positions.component';
import { LayoutComponent } from './_layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'contactbook',
        component: EmpContactsComponent
      },
      {
        path: 'employee/:funcID',
        component: EmployeesComponent
      },
      {
        path: 'employeeleave/:funcID',
        component: EmployeesLeaveComponent
      },
      {
        path: 'reportingline/:funcID',
        component: PositionsComponent
      },
      {
        path: 'employeeinfo/:funcID',
        component: EmployeeInfomationComponent,
      },
    ],
  },
];

const T_Component: Type<any>[] = [
  LayoutComponent,
  EmpContactsComponent,
  EmployeesComponent,
  PopupAddEmployeesComponent,
  PositionsComponent,
  PopupAddPositionsComponent,
  EmployeesLeaveComponent
]
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    OverlayModule,
    InlineSVGModule.forRoot(),
    HttpClientModule,
    CodxCoreModule,
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule
  ],
  declarations: T_Component,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CodxHRModule {
  public static forRoot(
    config?: EnvironmentConfig
  ): ModuleWithProviders<CodxCoreModule> {
    return {
      ngModule: CodxCoreModule,
      providers: [
        HttpClientModule,
        { provide: EnvironmentConfig, useValue: config },
      ],
    };
  }
}
