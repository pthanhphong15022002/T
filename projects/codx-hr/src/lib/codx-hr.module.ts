import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ModuleWithProviders,
  NgModule,
  Type,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CoreModule } from '@core/core.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ChartAllModule } from '@syncfusion/ej2-angular-charts';
import { DiagramAllModule } from '@syncfusion/ej2-angular-diagrams';
import { SliderModule } from '@syncfusion/ej2-angular-inputs';
import { CodxCoreModule, EnvironmentConfig } from 'codx-core';
import { InlineSVGModule } from 'ng-inline-svg';
import { EmployeeInfomationComponent } from 'projects/codx-mwp/src/lib/employeeinfomation/employee-infomation.component';
import { LayoutNoAsideComponent } from 'projects/codx-share/src/lib/_layout/_noAside/_noAside.component';
import { LayoutOnlyHeaderComponent } from 'projects/codx-share/src/lib/_layout/_onlyHeader/_onlyHeader.component';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { EmployeeProfileComponent } from './employee-profile/employee-profile.component';
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
import { OrgorganizationComponent } from './organization/organization.component';
import { OrganizeDetailComponent } from './organization/organize-detail/organize-detail.component';
import { FilterPipe } from './organization/pipes/filterObject.pipe';
import { PopupAddOrganizationComponent } from './organization/popup-add-organization/popup-add-organization.component';
import { TimeAgoPipe } from './pipe/time-ago.pipe';
import { OrgchartDetailComponent } from './reportingline/orgchart-detail/orgchart-detail.component';
import { PopupAddPositionsComponent } from './reportingline/popup-add-positions/popup-add-positions.component';
import { ReportinglineDetailComponent } from './reportingline/reportingline-detail/reportingline-detail.component';
import { ReportinglineOrgChartComponent } from './reportingline/reportingline-orgchart/reportingline-orgchart.component';
import { ReportinglineComponent } from './reportingline/reportingline.component';
import { LayoutComponent } from './_layout/layout.component';
import { NoSubAsideComponent } from './_noSubAside/_noSubAside.component';
import { PopupAddEmployeesPartyInfoComponent } from './employee-profile/popup-add-employees-party-info/popup-add-employees-party-info.component';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: LayoutNoAsideComponent,
        children: [
          {
            path: 'contactbook/:funcID',
            component: EmpContactsComponent,
          },
        ],
      },
      {
        path: '',
        component: LayoutOnlyHeaderComponent,
        children: [
          {
            path: 'empinfosub/:funcID',
            component: EmployeeInfomationComponent,
          },
        ],
      },
      {
        path: '',
        component: NoSubAsideComponent,
        children: [
          // {
          //   path: 'contactbook/:funcID',
          //   component: EmpContactsComponent,
          // },
          {
            path: 'orgchart/:funcID',
            component: OrgorganizationComponent,
          },
          {
            path: 'employee/:funcID',
            component: EmployeesComponent,
          },
          {
            path: 'employeelist/:funcID',
            component: EmployeeProfileComponent,
          },
          {
            path: 'employeedetail/:funcID',
            component: EmployeeProfileComponent,
          },
          {
            path: 'employeeleave/:funcID',
            component: EmployeesLeaveComponent,
          },
          {
            path: 'reportingline/:funcID',
            component: ReportinglineComponent,
          },
          // {
          //   path: 'employeeinfomation/:funcID',
          //   component: EmployeeInfomationComponent,
          // },
          {
            path: 'setting',
            component: HRParametersComponent,
            children: [
              {
                path: ':funcID',
                component: HomeHrparametersComponent,
              },
              {
                path: 'certificate/:funcID',
                component: CertificatesComponent,
              },
              {
                path: 'nationality/:funcID',
                component: NationalitiesComponent,
              },
              {
                path: 'country/:funcID',
                component: CountriesComponent,
              },
              {
                path: 'province/:funcID',
                component: ProvincesComponent,
              },
              {
                path: 'district/:funcID',
                component: DistrictsComponent,
              },
              {
                path: 'competence/:funcID',
                component: CompetencesComponent,
              },
              {
                path: 'education/:funcID',
                component: EducationsComponent,
              },
              {
                path: 'organization/:funcID',
                component: OrganizationsComponent,
              },
              {
                path: 'religions/:funcID',
                component: ReligionsComponent,
              },
              {
                path: 'ethnicgroups/:funcID',
                component: EthnicGroupsComponent,
              },
            ],
          },
        ],
      },
    ],
  },
];

const T_Component: Type<any>[] = [
  LayoutComponent,
  EmpContactsComponent,
  EmployeesComponent,
  PopupAddEmployeesComponent,
  ReportinglineComponent,
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
  NoSubAsideComponent,
  OrgorganizationComponent,
  OrganizeDetailComponent,
  FilterPipe,
  OrgchartDetailComponent,
  PopupAddOrganizationComponent,
  PopupAddPositionsComponent,
  TimeAgoPipe,
  ReportinglineOrgChartComponent,
  ReportinglineDetailComponent,
  EmployeeProfileComponent,
  PopupAddEmployeesPartyInfoComponent
];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    OverlayModule,
    InlineSVGModule.forRoot(),
    HttpClientModule,
    CodxCoreModule,
    RouterModule.forChild(routes),
    CoreModule,
    SliderModule,
    CodxShareModule,
    ChartAllModule,
    DiagramAllModule,
    NgbModule,
  ],
  exports: [RouterModule],
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
