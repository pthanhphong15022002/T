import { EmployeeContractComponent } from './employee-contract/employee-contract.component';
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
import { PopupEDiseasesComponent } from './employee-profile/popup-ediseases/popup-ediseases.component';
import { PopupEappointionsComponent } from './employee-profile/popup-eappointions/popup-eappointions.component';
import { PopupEContractComponent } from './employee-profile/popup-econtract/popup-econtract.component';
import { PopupEaccidentsComponent } from './employee-profile/popup-eaccidents/popup-eaccidents.component';
import { PopupSubEContractComponent } from './employee-profile/popup-sub-econtract/popup-sub-econtract.component';
import { PopupEdayoffsComponent } from './employee-profile/popup-edayoffs/popup-edayoffs.component';
import { PopupEmpBusinessTravelsComponent } from './employee-profile/popup-emp-business-travels/popup-emp-business-travels.component';
import { PopupEbenefitComponent } from './employee-profile/popup-ebenefit/popup-ebenefit.component';
import { PopupJobGeneralInfoComponent } from './employee-profile/popup-job-general-info/popup-job-general-info.component';
import { EmployeeDetailComponent } from './employee-list/employee-detail/employee-detail.component';
// import { LayoutComponent } from './_layout/layout.component';
import { LayoutComponent } from 'projects/codx-hr/src/lib/_layout/layout.component';
import { ScrollSpyDirective } from './scroll-spy.directive';
import { PopupEProcessContractComponent } from './employee-contract/popup-eprocess-contract/popup-eprocess-contract.component';
// import { ViewContractDetailComponent } from './employee-contract/view-contracts-detail/view-contracts-detail.component';
import { EmployeeBasicSalaryComponent } from './employee-basic-salary/employee-basic-salary.component';
import { EmployeeJobSalaryComponent } from './employee-job-salary/employee-job-salary.component';
import { PopupEmployeeJobsalaryComponent } from './employee-job-salary/popup-employee-jobsalary/popup-employee-jobsalary.component';
import { ViewBasicSalaryDetailComponent } from './employee-basic-salary/view-basic-salary-detail/view-basic-salary-detail.component';
import { EmployeeBenefitComponent } from './employee-benefit/employee-benefit.component';
import { PopupEmployeeBenefitComponent } from './employee-benefit/popup-employee-benefit/popup-employee-benefit.component';
import { ViewDetailContractsComponent } from './employee-contract/popup-eprocess-contract/view-detail-contracts/view-detail-contracts/view-detail-contracts.component';
import { ViewDetailEjobsalaryComponent } from './employee-job-salary/view-detail-ejobsalary/view-detail-ejobsalary.component';
import { EmployeeAwardsComponent } from './employee-awards/employee-awards.component';
import { EmployeeDisciplineComponent } from './employee-discipline/employee-discipline.component';
import { ViewDetailEbenefitComponent } from './employee-benefit/view-detail-ebenefit/view-detail-ebenefit.component';
import { ViewAwardDetailComponent } from './employee-awards/view-award-detail/view-award-detail.component';
import { TestComponent } from './test/test.component';
import { ApprovalHRContractComponent } from './approval-hr/approval-hrcontract/approval-hrcontract.component';
import { ViewDetailDisciplinesComponent } from './employee-discipline/view-detail-disciplines/view-detail-disciplines.component';
import { EmployeeBusinessTravelComponent } from './employee-business-travel/employee-business-travel.component';
import { PopupEmployeeBusinessComponent } from './employee-business-travel/popup-employee-business/popup-employee-business.component';
import { ViewDetailEmployeeBusinessComponent } from './employee-business-travel/view-detail-employee-business/view-detail-employee-business.component';
import { EmployeeDayOffComponent } from './employee-day-off/employee-day-off.component';
import { ViewDayOffDetailComponent } from './employee-day-off/view-day-off-detail/view-day-off-detail.component';
import { EmployeeInfoDetailComponent } from './employee-list/employee-info-detail/employee-info-detail.component';
import { PopupForeignWorkerComponent } from './employee-profile/popup-foreign-worker/popup-foreign-worker.component';
import { PopupAddEmployeeComponent } from './employee-list/popup/popup-add-employee/popup-add-employee.component';
import { PopupViewAllComponent } from './employee-list/employee-info-detail/pop-up/popup-view-all/popup-view-all.component';
import { EmployeeAppointionsComponent } from './employee-appointions/employee-appointions.component';
import { ViewDetailEappointionsComponent } from './employee-appointions/view-detail-eappointions/view-detail-eappointions.component';
import { PopupEquitjobComponent } from './employee-profile/popup-equitjob/popup-equitjob.component';
import { CodxReportViewsComponent } from 'projects/codx-report/src/lib/codx-report-views/codx-report-views.component';
import { CodxReportViewDetailComponent } from 'projects/codx-report/src/lib/codx-report-view-detail/codx-report-view-detail.component';
import { EmployeePolicygenernalComponent } from './employee-policygenernal/employee-policygenernal.component';
import { PopupPolicygeneralComponent } from './employee-policygenernal/popup-policygeneral/popup-policygeneral.component';
import { EmployeePolicyalComponent } from './employee-policyal/employee-policyal.component';
import { PopupPolicyalComponent } from './employee-policyal/popup-policyal/popup-policyal.component';
import { EmployeePolicybenefitsComponent } from './employee-policybenefits/employee-policybenefits.component';
import { PopupPolicybenefitsComponent } from './employee-policybenefits/popup-policybenefits/popup-policybenefits.component';
import { OrgEmpContactDetailComponent } from './empcontacts/org-emp-contact-detail/org-emp-contact-detail.component';
import { OrgEmpContactDetailCardComponent } from './empcontacts/org-emp-contact-detail-card/org-emp-contact-detail-card.component';
import { EmployeeListByOrgComponent } from './employee-list/employee-list-by-org/employee-list-by-org.component';
export const routes: Routes = [
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
            // component: EmployeeInfomationComponent,
            component: EmployeeInfoDetailComponent,

          },
          {
            path: 'employeedetail/:funcID',
            component: EmployeeInfoDetailComponent,
          },
        ],
      },
      {
        path: '',
        component: LayoutComponent,
        children: [
          // {
          //   path: 'contactbook/:funcID',
          //   component: EmpContactsComponent,
          // },
          {
            path: 'report/:funcID',
            component: CodxReportViewsComponent,
          },
          {
            path: 'report/detail/:funcID',
            component: CodxReportViewDetailComponent,
          },
          {
            path: 'orgchart/:funcID',
            data: { noReuse: true },
            component: OrgorganizationComponent,
          },
          {
            path: 'employee/:funcID',
            data: { noReuse: true },
            component: EmployeesComponent,
          },
          {
            path: 'employeelist/:funcID',
            data: { noReuse: true },
            component: EmployeeListComponent,
          },
          {
            path: 'reportingline/:funcID',
            data: { noReuse: true },
            component: ReportinglineComponent,
          },
          {
            path: 'econtracts/:funcID',
            component: EmployeeContractComponent,
          },
          {
            path: 'ebasicsalaries/:funcID',
            component: EmployeeBasicSalaryComponent,
          },
          {
            path: 'ejobsalaries/:funcID',
            component: EmployeeJobSalaryComponent,
          },
          {
            path: 'eawards/:funcID',
            component: EmployeeAwardsComponent,
          },
          {
            path: 'edisciplines/:funcID',
            component: EmployeeDisciplineComponent,
          },
          {            
            path: 'ebenefits/:funcID',
            component: EmployeeBenefitComponent,
          },
          {            
            path: 'ebusinesstravels/:funcID',
            component: EmployeeBusinessTravelComponent,
          },
          {
            path: 'edayoffs/:funcID',
            component: EmployeeDayOffComponent
          },
          {
            path: 'eappointions/:funcID',
            component: EmployeeAppointionsComponent
          },
          {
            path: 'policygeneral/:funcID',
            component: EmployeePolicygenernalComponent
          },
          {
            path: 'policyal/:funcID',
            component: EmployeePolicyalComponent
          },
          {
            path: 'policybenefits/:funcID',
            component: EmployeePolicybenefitsComponent
          },
          // {
          //   path: 'employeeinfomation/:funcID',
          //   component: EmployeeInfomationComponent,
          // },
          {
            path: 'approvals/:funcID',
            loadChildren: () =>
              import('projects/codx-hr/src/lib/codx-approvel.module').then(
                (m) => m.CodxApprovelModule
              ),
            data: { noReuse: true },
          },

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
  PopupEDiseasesComponent,
  PopupEappointionsComponent,
  PopupEContractComponent,
  PopupEaccidentsComponent,
  PopupSubEContractComponent,
  PopupEdayoffsComponent,
  PopupEmpBusinessTravelsComponent,
  PopupEbenefitComponent,
  PopupJobGeneralInfoComponent,
  EmployeeDetailComponent,
  EmployeeContractComponent,
  ScrollSpyDirective,
  PopupEProcessContractComponent,
  PopupEmployeeJobsalaryComponent,
  // ViewContractDetailComponent,
  EmployeeBasicSalaryComponent,
  ViewBasicSalaryDetailComponent,
  EmployeeJobSalaryComponent,
  EmployeeBenefitComponent,
  PopupEmployeeBenefitComponent,
  ViewDetailContractsComponent,
  ViewDetailEjobsalaryComponent,
  EmployeeAwardsComponent,
  EmployeeDisciplineComponent,
  ViewDetailEbenefitComponent,
  ViewAwardDetailComponent,
  TestComponent,
  ApprovalHRContractComponent,
  ViewDetailDisciplinesComponent,
  EmployeeBusinessTravelComponent,
  EmployeeDayOffComponent,
  ViewDayOffDetailComponent,
  PopupEmployeeBusinessComponent,
  ViewDetailEmployeeBusinessComponent,
  EmployeeInfoDetailComponent,
  PopupForeignWorkerComponent,
  PopupViewAllComponent,
  EmployeeAppointionsComponent,
  PopupAddEmployeeComponent,
  ViewDetailEappointionsComponent,
  PopupEquitjobComponent,
  EmployeePolicygenernalComponent,
  PopupPolicygeneralComponent,
  EmployeePolicyalComponent,
  PopupPolicyalComponent,
  EmployeePolicybenefitsComponent,
  PopupPolicybenefitsComponent,
  OrgEmpContactDetailComponent,
  OrgEmpContactDetailCardComponent,
  EmployeeListByOrgComponent
];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    OverlayModule,
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
