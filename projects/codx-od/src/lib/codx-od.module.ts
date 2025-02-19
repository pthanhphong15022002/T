import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CodxCoreModule } from 'codx-core';
import { environment } from 'src/environments/environment';
import { IncommingComponent } from './incomming/incomming.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartsComponent } from './charts/charts.component';
import {
  AccumulationChartAllModule,
  ChartAllModule,
} from '@syncfusion/ej2-angular-charts';
import { SharedModule } from '@shared/shared.module';
import { DepartmentComponent } from './incomming/department/department.component';
import { ForwardComponent } from './incomming/forward/forward.component';
//import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CodxOdComponent } from './codx-od.component';
import { UpdateExtendComponent } from './incomming/update/update.component';
import { AgencyComponent } from './incomming/agency/agency.component';
import { ExtendDeadlineComponent } from './incomming/deadline/deadline.component';
import { SharingComponent } from './incomming/sharing/sharing.component';
import { AssignTaskComponent } from './incomming/assigntask/assigntask.component';
import { AssignSubMenuComponent } from './assignsubmenu/assignsubmenu.component';
import { AddLinkComponent } from './incomming/addlink/addlink.component';
import { SendEmailComponent } from './incomming/sendemail/sendemail.component';
import { ViewDetailComponent } from './incomming/view-detail/view-detail.component';
import { IncommingAddComponent } from './incomming/incomming-add/incomming-add.component';
import { FolderComponent } from './incomming/folder/folder.component';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { SearchingComponent } from './incomming/searching/searching.component';
import { TabsComponent } from './incomming/tab/tabs.component';
import { ODApprovelComponent } from './incomming/approvel/approvel.component';
import { CompletedComponent } from './incomming/completed/completed.component';
import { RefuseComponent } from './incomming/refuse/refuse.component';
import { UpdateVersionComponent } from './incomming/updateversion/updateversion.component';
import { UploaderModule } from '@syncfusion/ej2-angular-inputs';
import { CodxReportViewDetailComponent } from 'projects/codx-report/src/lib/codx-report-view-detail/codx-report-view-detail.component';
import { CodxReportViewsComponent } from 'projects/codx-report/src/lib/codx-report-views/codx-report-views.component';
import {
  ProgressAnnotationService,
  ProgressBarModule,
} from '@syncfusion/ej2-angular-progressbar';
import { ApprovalStepComponent } from './incomming/approval-step/approval-step.component';
import { ODDashboardComponent } from './oddashboard/oddashboard.component';
import { TreeMapModule } from '@syncfusion/ej2-angular-treemap';
import { LayoutComponent } from 'projects/codx-share/src/lib/components/layout/layout.component';
import { DealsComponent } from 'projects/codx-cm/src/lib/deals/deals.component';
import { CasesComponent } from 'projects/codx-cm/src/lib/cases/cases.component';
import { LeadsComponent } from 'projects/codx-cm/src/lib/leads/leads.component';
import { ViewInstancesComponent } from 'projects/codx-dp/src/lib/view-instances/view-instances.component';
import { ContractsComponent } from 'projects/codx-cm/src/lib/contracts/contracts.component';
import { EditFileComponent } from './incomming/edit-file/edit-file.component';
import { DocumentEditorAllModule, DocumentEditorContainerAllModule } from '@syncfusion/ej2-angular-documenteditor';
const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'home/:funcID',
        component: HomeComponent,
      },
      {
        path: 'dashboard/:funcID',
        component: ODDashboardComponent,
      },
      {
        path: 'dispatches/:funcID',
        component: IncommingComponent,
      },
      {
        path: 'report/:funcID',
        component: CodxReportViewsComponent,
      },
      {
        path: 'report/detail/:funcID',
        component: CodxReportViewDetailComponent,
      },
      /*  {
        path: 'dispatches/:funcID/detail',
        //outlet : "test1",
        component: ODTestDetailComponent
      },    */
      {
        path: 'searching/:funcID',
        component: SearchingComponent,
      },
      {
        path: 'approvals/:funcID',
        loadChildren: () =>
          import('projects/codx-od/src/lib/codx-approvel.module').then(
            (m) => m.ApprovelModule
          ),
        data: { noReuse: true },
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
      //----phát hành quy trình DP-CRM----//
      {
        path: 'deals/:funcID',
        component: DealsComponent,
        data: { noReuse: true },
      },
      {
        path: 'cases/:funcID',
        component: CasesComponent,
        data: { noReuse: true },
      },
      {
        path: 'leads/:funcID',
        component: LeadsComponent,
        data: { noReuse: true },
      },
      {
        path: 'contracts/:funcID',
        component: ContractsComponent,
        data: { noReuse: true },
      },
      {
        path: 'instances/:funcID/:processID',
        component: ViewInstancesComponent,
        data: { noReuse: true },
      },
      //-----------end--------------//
    ],
  },
];

@NgModule({
  declarations: [
    HomeComponent,
    IncommingComponent,
    CodxOdComponent,
    UpdateExtendComponent,
    ChartsComponent,
    AgencyComponent,
    DepartmentComponent,
    ForwardComponent,
    ExtendDeadlineComponent,
    SharingComponent,
    AssignTaskComponent,
    AssignSubMenuComponent,
    AddLinkComponent,
    SendEmailComponent,
    ViewDetailComponent,
    IncommingAddComponent,
    FolderComponent,
    SearchingComponent,
    TabsComponent,
    ODApprovelComponent,
    CompletedComponent,
    RefuseComponent,
    UpdateVersionComponent,
    ApprovalStepComponent,
    ODDashboardComponent,
    EditFileComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CodxCoreModule.forRoot({ environment }),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ChartAllModule,
    AccumulationChartAllModule,
    SharedModule,
    CodxShareModule,
    UploaderModule,
    ProgressBarModule,
    TreeMapModule,
    DocumentEditorAllModule,
    DocumentEditorContainerAllModule,
    // NgbModule
  ],
  exports: [RouterModule],
  providers: [ProgressAnnotationService],
})
export class CodxODModule {}
