import { NgModule } from '@angular/core';
import { CodxWsComponent } from './codx-ws.component';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './_layout/layout.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { CodxCoreModule } from 'codx-core';
import { environment } from 'src/environments/environment';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { ProgressAnnotationService } from '@syncfusion/ej2-angular-progressbar';
import { CodxWsHeaderComponent } from './_layout/codx-ws-header/codx-ws-header.component';
import { CalendarComponent } from './calendar/calendar.component';
import { WpBreadcumComponent } from './workspace/wp-breadcum/wp-breadcum.component';
import { HeaderComponent } from './workspace/header/header.component';
import { PersonalComponent } from './personal/personal.component';
import { MenuListComponent } from './personal/menu-list/menu-list.component';
import { MasterDetailComponent } from './personal/master-detail/master-detail.component';
import { ApprovalsComponent } from './approvals/approvals.component';
import { MenuListApprovalComponent } from './approvals/menu-list-approval/menu-list-approval.component';
import { AccordionModule } from '@syncfusion/ej2-angular-navigations';
import { EPBookingComponent } from 'projects/codx-ep/src/lib/booking/ep-booking.component';
import { PersonalsComponent } from 'projects/codx-mwp/src/lib/personals/personals.component';
import { CodxCalendarComponent } from 'projects/codx-share/src/lib/components/codx-calendar/codx-calendar.component';
import { IncommingComponent } from 'projects/codx-od/src/lib/incomming/incomming.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ReportComponent } from './report/report.component';
import { TasksComponent } from 'projects/codx-tm/src/lib/tasks/tasks.component';
import { TaskExtendsComponent } from 'projects/codx-tm/src/lib/taskextends/taskextends.component';
import { EmployeeDayOffComponent } from 'projects/codx-hr/src/lib/employee-day-off/employee-day-off.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'workspace/:funcID',
        component: WorkspaceComponent,
      },
      {
        path: 'calendar/:funcID',
        //component: CalendarComponent,
        component: CodxCalendarComponent,
      },
      {
        path: 'personal/:funcID',
        component: PersonalsComponent,
        //component: PersonalComponent,
      },
      {
        path: 'approvals/:funcID',
        component: ApprovalsComponent,
      },
      {
        path: 'bookingrooms/:funcID',
        data: { noReuse: true },
        component: EPBookingComponent,
      },
      {
        path: 'bookingcars/:funcID',
        data: { noReuse: true },
        component: EPBookingComponent,
      },
      {
        path: 'bookingstationery/:funcID',
        data: { noReuse: true },
        component: EPBookingComponent,
      },
      {
        path: 'dispatches/:funcID',
        component: IncommingComponent,
      },
      {
        path: 'dashboard/:funcID',
        component: DashboardComponent,
      },
      {
        path: 'report/:funcID',
        component: ReportComponent,
      },
      // HR - QTNS - Đăng ký nghỉ phép
      {
        path: 'edayoffs/:funcID',
        component: EmployeeDayOffComponent,
      },
      //Task + duyyet TM
      {
        path: 'tasks/:funcID',
        component: TasksComponent,
      },
      {
        path: 'taskextends/:funcID',
        component: TaskExtendsComponent,
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
];

@NgModule({
  declarations: [
    CodxWsComponent,
    LayoutComponent,
    CodxWsHeaderComponent,
    WpBreadcumComponent,
    WorkspaceComponent,
    HeaderComponent,
    PersonalComponent,
    MenuListComponent,
    MasterDetailComponent,
    ApprovalsComponent,
    MenuListApprovalComponent,
    DashboardComponent,
    ReportComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    CodxCoreModule.forRoot({ environment }),
    CodxShareModule,
    AccordionModule,
    NgbDropdownModule,
  ],
  exports: [RouterModule],
})
export class CodxWsModule {}
