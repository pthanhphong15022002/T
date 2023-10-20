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
import { MenuListApprovalComponent } from './approvals/menu-list-approval/menu-list-approval.component';
import { AccordionModule } from '@syncfusion/ej2-angular-navigations';
import { EPBookingComponent } from 'projects/codx-ep/src/lib/booking/ep-booking.component';
import { PersonalsComponent } from 'projects/codx-mwp/src/lib/personals/personals.component';
import { IncommingComponent } from 'projects/codx-od/src/lib/incomming/incomming.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ReportComponent } from './report/report.component';
import { TasksComponent } from 'projects/codx-tm/src/lib/tasks/tasks.component';
import { TaskExtendsComponent } from 'projects/codx-tm/src/lib/taskextends/taskextends.component';
import { EmployeeDayOffComponent } from 'projects/codx-hr/src/lib/employee-day-off/employee-day-off.component';
import { TargetsComponent } from 'projects/codx-cm/src/lib/targets/targets.component';
import { DealsComponent } from 'projects/codx-cm/src/lib/deals/deals.component';
import { RequestReviewComponent } from './approvals/request-review/request-review.component';
import { CodxReportViewsComponent } from 'projects/codx-report/src/lib/codx-report-views/codx-report-views.component';
import { CodxReportViewDetailComponent } from 'projects/codx-report/src/lib/codx-report-view-detail/codx-report-view-detail.component';
import { ODDashboardComponent } from 'projects/codx-od/src/lib/oddashboard/oddashboard.component';
import { DMDashboardComponent } from 'projects/codx-dm/src/lib/dmdashboard/dmdashboard.component';
import { TMDashboardComponent } from 'projects/codx-tm/src/lib/tmdashboard/tmdashboard.component';
import { EmployeeQuitComponent } from 'projects/codx-hr/src/lib/employee-quit/employee-quit.component';
import { BookmarkComponent } from './bookmark/bookmark.component';
import { COCalendarComponent } from 'projects/codx-co/src/lib/calendar/calendar.component';
import { ApprovalsComponent } from 'projects/codx-ac/src/lib/approvals/approvals.component';
import { SpeedDialModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { InformationComponent } from './personal/master-detail/information/information.component';
import { CashPaymentsComponent } from 'projects/codx-ac/src/lib/vouchers/cashpayments/cashpayments.component';
import { EmployeeInfoDetailComponent } from 'projects/codx-hr/src/lib/employee-list/employee-info-detail/employee-info-detail.component';
import { LayoutOnlyHeaderComponent } from 'projects/codx-common/src/lib/_layout/_onlyHeader/_onlyHeader.component';
import { LoginSercurityComponent } from './personal/master-detail/information/login-sercurity/login-sercurity.component';
import { SercurityTOTPComponent } from './personal/master-detail/information/sercurity-totp/sercurity-totp.component';
import { AdvancePaymentRequestComponent } from 'projects/codx-ac/src/lib/vouchers/advance-payment-request/advance-payment-request.component';
import { LayoutNoasideAcComponent } from 'projects/codx-ac/src/lib/_layout-noaside-ac/layout-noaside-ac.component';
import { LayoutNoAsideComponent } from 'projects/codx-common/src/lib/_layout/_noAside/_noAside.component';
import { PaymentOrderComponent } from 'projects/codx-ac/src/lib/vouchers/payment-order/payment-order.component';

import { MyPageComponent } from './personal/master-detail/my-page/my-page.component';
import { TabAllModule } from '@syncfusion/ej2-angular-navigations';
import { ImgComponent } from './personal/master-detail/my-page/img/img.component';
import { VideoComponent } from './personal/master-detail/my-page/video/video.component';
import { AddUpdateNoteBookComponent } from './personal/master-detail/my-page/add-update-note-book/add-update-note-book.component';
import { AddUpdateStorageComponent } from './personal/master-detail/my-page/add-update-storage/add-update-storage.component';
import { DetailStorageComponent } from './personal/master-detail/my-page/detail-storage/detail-storage.component';
import { ExtendStorageComponent } from './personal/master-detail/my-page/extend-storage/extend-storage.component';
import { ExtendNoteBookComponent } from './personal/master-detail/my-page/extend-note-book/extend-note-book.component';
import { CommonModule } from '@angular/common';
import { PopupAddPostComponent } from 'projects/codx-wp/src/lib/dashboard/home/list-post/popup-add/popup-add-post.component';
import { PopupDetailComponent } from 'projects/codx-wp/src/lib/dashboard/home/list-post/popup-detail/popup-detail.component';
const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      //-----------Khai báo routing nghiệp vu---------------
      {
        path: 'workspace/:funcID',
        component: WorkspaceComponent,
      },
      {
        path: 'calendar/:funcID',
        component: COCalendarComponent,
      },
      {
        path: 'personal/:funcID',
        component: PersonalComponent,
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
      // HR - QTNS - Đăng ký nghỉ phép
      {
        path: 'equit/:funcID',
        component: EmployeeQuitComponent,
      },
      // HR - Hồ sơ cá nhân
    //   {
    // component: LayoutOnlyHeaderComponent,

    //     path: 'employeedetail/:funcID',
    //     component: EmployeeInfoDetailComponent,
    //   },
      {
        path: '',
        component: LayoutOnlyHeaderComponent,
        children: [
          {
            path: 'employeedetail/:funcID',
            component: EmployeeInfoDetailComponent,
          },
        ],
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
      //CM mục tiêu + cơ hội
      {
        path: 'targets/:funcID',
        component: TargetsComponent,
        data: { noReuse: true },
      },
      {
        path: 'deals/:funcID',
        component: DealsComponent,
        // data: { noReuse: true },
      },
      {
        path: '',
        component: LayoutNoasideAcComponent,
        children: [
          {
            path: 'requestsforadvances/:funcID',
            component: AdvancePaymentRequestComponent,
            data: { noReuse: true },
          },
        ],
      },
      {
        path: '',
        component: LayoutNoasideAcComponent,
        children: [
          {
            path: 'paymentorders/:funcID',
            component: PaymentOrderComponent,
            data: { noReuse: true },
          },
        ],
      },
      // Phiếu chi
      // {
      //   path: 'cashpayments/:funcID',
      //   component: CashPaymentsComponent,
      // },
      // {
      //   path: 'paymentorders/:funcID',
      //   component: PaymentOrderComponent,
      // },
      //-----------Khai báo routing nghiệp vu---------------
      //-----------Khai báo routing báo cáo---------------
      {
        path: 'report/detail/:funcID',
        component: CodxReportViewDetailComponent,
      },
      //-----------Khai báo routing báo cáo---------------
      //-----------Khai báo routing Dashboard---------------
      //OD
      {
        path: 'od/dashboard/:funcID',
        component: ODDashboardComponent,
      },
      //DM
      {
        path: 'dm/dashboard/:funcID',
        component: DMDashboardComponent,
      },
      //TM
      {
        path: 'tm/dashboard/:funcID',
        component: TMDashboardComponent,
      },
      //-----------Khai báo routing Dashboard---------------
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
  {
    path: 'storage',
    component: ExtendStorageComponent,
  },
  {
    path: 'notebook',
    component: ExtendNoteBookComponent,
  }
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
    RequestReviewComponent,
    BookmarkComponent,
    InformationComponent,
    LoginSercurityComponent,
    SercurityTOTPComponent,
    AddUpdateNoteBookComponent,
    AddUpdateStorageComponent,
    DetailStorageComponent,
    ExtendStorageComponent,
    ExtendNoteBookComponent,
    MyPageComponent,
    ImgComponent,
    VideoComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CodxCoreModule.forRoot({ environment }),
    CodxShareModule,
    AccordionModule,
    NgbDropdownModule,
    SpeedDialModule,
    TooltipModule,
    TabAllModule,
  ],
  exports: [RouterModule],
})
export class CodxWsModule {}
