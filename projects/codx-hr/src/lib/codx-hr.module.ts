import { PopupEBasicSalariesComponent } from './employee-profile/popup-ebasic-salaries/popup-ebasic-salaries.component';
import { PopupEJobSalariesComponent } from './employee-profile/popup-ejob-salaries/popup-ejob-salaries.component';
import { PopupEWorkPermitsComponent } from './employee-profile/popup-ework-permits/popup-ework-permits.component';
import { PopupEVisasComponent } from './employee-profile/popup-evisas/popup-evisas.component';
import { PopupETraincourseComponent } from './employee-profile/popup-etraincourse/popup-etraincourse.component';
import { PopupESkillsComponent } from './employee-profile/popup-eskills/popup-eskills.component';
import { PopupESelfInfoComponent } from './employee-profile/popup-eself-info/popup-eself-info.component';
import { PopupEFamiliesComponent } from './employee-profile/popup-efamilies/popup-efamilies.component';
import { PopupEDisciplinesComponent } from './employee-profile/popup-edisciplines/popup-edisciplines.component';
import { PopupEDegreesComponent } from './employee-profile/popup-edegrees/popup-edegrees.component';
import { PopupECertificatesComponent } from './employee-profile/popup-ecertificates/popup-ecertificates.component';
import { PopupEAwardsComponent } from './employee-profile/popup-eawards/popup-eawards.component';
import { PopupEAssurTaxBankComponent } from './employee-profile/popup-eassur-tax-bank/popup-eassur-tax-bank.component';
import { PopupEmployeePartyInfoComponent } from './employee-profile/popup-employee-party-info/popup-employee-party-info.component';
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
import { EmployeeProfileComponent } from './employee-list/employee-profile/employee-profile.component';
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
import { NoSubAsideComponent } from './_noSubAside/_noSubAside.component';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { PopupAddNewHRComponent } from './employee-list/popup-add-new-hr/popup-add-new-hr.component';
import { TmpGridViewComponent } from './employee-list/employee-profile/tmp-grid-view/tmp-grid-view.component';
import { PopupEAssetsComponent } from './employee-profile/popup-eassets/popup-eassets.component';
import { PopupEPassportsComponent } from './employee-profile/popup-epassports/popup-epassports.component';
import { EmployeePositionsComponent } from './employee-list/employee-profile/employee-positions/employee-positions.component';
import { PopupEexperiencesComponent } from './employee-profile/popup-eexperiences/popup-eexperiences.component';
import { OrganizationOrgchartComponent } from './organization/organization-orgchart/organization-orgchart.component';
import { OrganizationMasterDetailComponent } from './organization/organization-master-detail/organization-master-detail.component';
import { OrganizationListComponent } from './organization/organization-list/organization-list.component';
import { PopupECalculateSalaryComponent } from './employee-profile/popup-ecalculate-salary/popup-ecalculate-salary.component';
import { PopupETimeCardComponent } from './employee-profile/popup-etime-card/popup-etime-card.component';
import { PopupEhealthsComponent } from './employee-profile/popup-ehealths/popup-ehealths.component';
import { PopupEVaccineComponent } from './employee-profile/popup-evaccine/popup-evaccine.component';

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
          {
            path: 'employeelist/:funcID',
            component: EmployeeListComponent,
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
        component: LayoutOnlyHeaderComponent,
        children: [
          {
            path: 'employeedetail/:funcID',
            component: EmployeeProfileComponent,
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
            component: EmployeeListComponent,
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
  EmployeeListComponent,
  EmployeeProfileComponent,
  PopupAddNewHRComponent,
  TmpGridViewComponent,
  PopupEmployeePartyInfoComponent,
  PopupEAssetsComponent,
  PopupEPassportsComponent,
  PopupEAssurTaxBankComponent,
  PopupEAwardsComponent,
  PopupECertificatesComponent,
  PopupEDegreesComponent,
  PopupEDisciplinesComponent,
  PopupEFamiliesComponent,
  PopupESelfInfoComponent,
  PopupESkillsComponent,
  PopupETraincourseComponent,
  PopupEVisasComponent,
  PopupEWorkPermitsComponent,
  EmployeePositionsComponent,
  PopupEJobSalariesComponent,
  PopupEBasicSalariesComponent,
  PopupEexperiencesComponent,
  OrganizationOrgchartComponent,
  OrganizationMasterDetailComponent,
  OrganizationListComponent,
  PopupECalculateSalaryComponent,
  PopupETimeCardComponent,
  PopupEhealthsComponent,
  PopupEVaccineComponent,
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
