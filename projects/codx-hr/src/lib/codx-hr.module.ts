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
import { UpdateStatusComponent } from './employees/update-status/update-status.component';
import { EmployeesLeaveComponent } from './employeesleave/employees-leave.component';
import { CertificatesComponent } from './hrparameters/category/certificates/certificates.component';
import { CompetencesComponent } from './hrparameters/category/competences/competences.component';
import { CountriesComponent } from './hrparameters/category/countries/countries.component';
import { DistrictsComponent } from './hrparameters/category/districts/districts.component';
import { EducationsComponent } from './hrparameters/category/educations/educations.component';
import { EthnicGroupsComponent } from './hrparameters/category/ethnic-groups/ethnic-groups.component';
import { NationalitiesComponent } from './hrparameters/category/nationalities/nationalities.component';
import { OrganizationsComponent } from './hrparameters/category/organizations/organizations.component';
import { ProvincesComponent } from './hrparameters/category/provinces/provinces.component';
import { ReligionsComponent } from './hrparameters/category/religions/religions.component';
import { HomeHrparametersComponent } from './hrparameters/home-hrparameters/home-hrparameters.component';
import { HRParametersComponent } from './hrparameters/hrparameters.component';
import { PopupAddPositionsComponent } from './positions/popup-add-positions/popup-add-positions.component';
import { PositionsComponent } from './positions/positions.component';
import { LayoutComponent } from './_layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'contactbook/:funcID',
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
        path: 'employeeinfomation/:funcID',
        component: EmployeeInfomationComponent,
      },
      {
        path: 'setting',
        component: HRParametersComponent,
        children: [
          {
            path: ':funcID',
            component: HomeHrparametersComponent
          },
          {
            path: 'certificate/:funcID',
            component: CertificatesComponent
          },
          {
            path: 'nationality/:funcID',
            component: NationalitiesComponent
          },
          {
            path: 'country/:funcID',
            component: CountriesComponent
          },
          {
            path: 'province/:funcID',
            component: ProvincesComponent
          },
          {
            path: 'district/:funcID',
            component: DistrictsComponent
          },
          {
            path: 'competence/:funcID',
            component: CompetencesComponent
          },
          {
            path: 'education/:funcID',
            component: EducationsComponent
          },
          {
            path: 'organization/:funcID',
            component: OrganizationsComponent
          },
          {
            path: 'religions/:funcID',
            component: ReligionsComponent
          },
          {
            path: 'ethnicgroups/:funcID',
            component: EthnicGroupsComponent
          },
        ]
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
  EmployeesLeaveComponent,
  HRParametersComponent,
  CertificatesComponent,
  HomeHrparametersComponent,
  NationalitiesComponent,
  CountriesComponent,
  ProvincesComponent,
  DistrictsComponent,
  CompetencesComponent,
  EducationsComponent,
  OrganizationsComponent,
  ReligionsComponent,
  EthnicGroupsComponent,
  UpdateStatusComponent,
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
