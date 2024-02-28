import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CodxWsComponent } from './codx-ws.component';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './_layout/layout.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { CodxCoreModule } from 'codx-core';
import { environment } from 'src/environments/environment';
import { CodxWsHeaderComponent } from './_layout/codx-ws-header/codx-ws-header.component';
import { WpBreadcumComponent } from './workspace/wp-breadcum/wp-breadcum.component';
import { HeaderComponent } from './workspace/header/header.component';
import { PersonalComponent } from './personal/personal.component';
import { MenuListComponent } from './personal/menu-list/menu-list.component';
import { MasterDetailComponent } from './personal/master-detail/master-detail.component';
import { MenuListApprovalComponent } from './approvals/menu-list-approval/menu-list-approval.component';
import { AccordionModule } from '@syncfusion/ej2-angular-navigations';
import { EPBookingComponent } from 'projects/codx-ep/src/lib/booking/ep-booking.component';
import { IncommingComponent } from 'projects/codx-od/src/lib/incomming/incomming.component';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ReportComponent } from './report/report.component';
import { TasksComponent } from 'projects/codx-tm/src/lib/tasks/tasks.component';
import { TaskExtendsComponent } from 'projects/codx-tm/src/lib/taskextends/taskextends.component';
import { EmployeeDayOffComponent } from 'projects/codx-hr/src/lib/employee-day-off/employee-day-off.component';
import { TargetsComponent } from 'projects/codx-cm/src/lib/targets/targets.component';
import { DealsComponent } from 'projects/codx-cm/src/lib/deals/deals.component';
import { RequestReviewComponent } from './approvals/request-review/request-review.component';
import { CodxReportViewDetailComponent } from 'projects/codx-report/src/lib/codx-report-view-detail/codx-report-view-detail.component';
import { ODDashboardComponent } from 'projects/codx-od/src/lib/oddashboard/oddashboard.component';
import { DMDashboardComponent } from 'projects/codx-dm/src/lib/dmdashboard/dmdashboard.component';
import { TMDashboardComponent } from 'projects/codx-tm/src/lib/tmdashboard/tmdashboard.component';
import { EmployeeQuitComponent } from 'projects/codx-hr/src/lib/employee-quit/employee-quit.component';
import { BookmarkComponent } from './bookmark/bookmark.component';
import { COCalendarComponent } from 'projects/codx-co/src/lib/calendar/calendar.component';
import { ApprovalsComponent } from 'projects/codx-ac/src/lib/approvals/approvals.component';
import { ApprovalsComponent as ApprovalsComponentWS } from './approvals/approvals.component';
import { SpeedDialModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { InformationComponent } from './personal/master-detail/information/information.component';
import { CashPaymentsComponent } from 'projects/codx-ac/src/lib/vouchers/cashpayments/cashpayments.component';
import { EmployeeInfoDetailComponent } from 'projects/codx-hr/src/lib/employee-list/employee-info-detail/employee-info-detail.component';
import { LoginSercurityComponent } from './personal/master-detail/information/login-sercurity/login-sercurity.component';
import { SercurityTOTPComponent } from './personal/master-detail/information/sercurity-totp/sercurity-totp.component';
import { AdvancePaymentRequestComponent } from 'projects/codx-ac/src/lib/vouchers/advance-payment-request/advance-payment-request.component';
import { LayoutNoAsideComponent } from 'projects/codx-common/src/lib/_layout/_noAside/_noAside.component';
import { PaymentOrderComponent } from 'projects/codx-ac/src/lib/vouchers/payment-order/payment-order.component';
import { PersonalAchievementComponent } from 'projects/codx-fd/src/lib/personal-achievement/personal-achievement.component';

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
import { CvInformationComponent } from './workspace/AITool/cv-information/cv-information.component';
import { CvEvaluateComponent } from './workspace/AITool/cv-evaluate/cv-evaluate.component';
import { PersonalUsageHistoryComponent } from 'projects/codx-fd/src/lib/personal-usage-history/personal-usage-history.component';
import { CodxEPModule } from 'projects/codx-ep/src/lib/codx-ep.module';
import { CodxCommonModule } from 'projects/codx-common/src/public-api';
import { CodxViewWsComponent } from './codx-view-ws/codx-view-ws.component';
import { CodxWpV2Module } from 'projects/codx-wp/src/lib/codx-wp-v2.module';
import { AcModule } from 'projects/codx-ac/src/public-api';
import { CodxHRModule } from 'projects/codx-hr/src/public-api';
import { Layout2Component } from './_layout/layout2/layout2.component';
import { HomeComponent as HomeDMComponent } from 'projects/codx-dm/src/lib/home/home.component';
import { CardsComponent } from 'projects/codx-fd/src/lib/cards/cards.component';
import { SignFileComponent } from 'projects/codx-es/src/lib/sign-file/sign-file.component';
import { CalendarsComponent } from 'projects/codx-cm/src/lib/calendars/calendars.component';
import { SprintsComponent } from 'projects/codx-tm/src/lib/sprints/sprints.component';
import { TMMeetingsComponent } from 'projects/codx-tm/src/lib/tmmeetings/tmmeetings.component';
import { CodxDmModule } from 'projects/codx-dm/src/public-api';
import { SearchingComponent as SearchingODComponent } from 'projects/codx-od/src/lib/incomming/searching/searching.component';
import { SearchingComponent as SearchingDMComponent } from 'projects/codx-dm/src/lib/searching/searching.component';
import { SearchingComponent as SearchingESComponent } from 'projects/codx-es/src/lib/searching/searching.component';
import { CodxCoModule } from 'projects/codx-co/src/public-api';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { DetailNotebookComponent } from './personal/master-detail/my-page/detail-notebook/detail-notebook.component';
const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      //-----------Khai báo routing nghiệp vu---------------
      // {
      //   path: 'workspace/:funcID',
      //   component: WorkspaceComponent,
      // },
      {
        path: 'wscalendar/:funcID',
        component: COCalendarComponent,
      },
      {
        path: 'personal/:funcID',
        component: PersonalComponent,
        //component: PersonalComponent,
      },

      {
        path: 'wsapprovals/:funcID',
        component: ApprovalsComponentWS,
      },

      {
        path: 'bookingstationery/:funcID',
        data: { noReuse: true },
        component: EPBookingComponent,
      },
      // {
      //   path: 'dispatches/:funcID',
      //   component: IncommingComponent,
      // },
      {
        path: 'wsdashboard/:funcID',
        component: DashboardComponent,
      },
      {
        path: 'wsreport/:funcID',
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

      // {
      //   path: '',
      //   component: LayoutNoasideAcComponent,
      //   children: [
      //     {
      //       path: 'requestsforadvances/:funcID',
      //       component: AdvancePaymentRequestComponent,
      //       data: { noReuse: true },
      //     },
      //   ],
      // },
      // {
      //   path: '',
      //   component: LayoutNoasideAcComponent,
      //   children: [
      //     {
      //       path: 'paymentorders/:funcID',
      //       component: PaymentOrderComponent,
      //       data: { noReuse: true },
      //     },
      //   ],
      // },
      // Phiếu chi
      {
        path: 'cashpayments/:funcID',
        component: CashPaymentsComponent,
        data: { noReuse: true, runMode: 1 },
      },
      // {
      //   path: 'paymentorders/:funcID',
      //   component: PaymentOrderComponent,
      // },
      //-----------Khai báo routing nghiệp vu---------------
      //-----------Khai báo routing báo cáo---------------
      {
        path: 'wsreport/detail/:funcID',
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
      //FD
      {
        path: 'mykudostrans/:funcID',
        component: PersonalAchievementComponent,
      },
      {
        path: 'mywallet/:funcID',
        component: PersonalUsageHistoryComponent,
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
    path: '',
    component: Layout2Component,
    children: [
      //-----------Khai báo routing nghiệp vu---------------
      {
        path: '',
        component: WorkspaceComponent,
        children: [
          {
            path: 'dispatches/:funcID',
            component: IncommingComponent,
          },
          //Task + duyyet TM
          {
            path: 'tasks/:funcID',
            component: TasksComponent,
          },
          //Kho tài liệu
          {
            path: 'wsfiles/:funcID',
            component: HomeDMComponent,
          },
          //Tuyên dương
          {
            path: 'cards/:funcID',
            component: CardsComponent,
          },
          //Trình ký
          {
            path: 'signfiles/:funcID',
            component: SignFileComponent,
          },
          {
            path: 'wsbookingrooms/:funcID',
            data: { noReuse: true },
            component: EPBookingComponent,
          },
          {
            path: 'wsbookingcars/:funcID',
            data: { noReuse: true },
            component: EPBookingComponent,
          },
          {
            path: 'wsbookingstationery/:funcID',
            data: { noReuse: true },
            component: EPBookingComponent,
          },
          {
            path: 'requestsforadvances/:funcID',
            component: AdvancePaymentRequestComponent,
            data: { noReuse: true },
          },
          {
            path: 'requestsforadvances/:funcID',
            component: AdvancePaymentRequestComponent,
            data: { noReuse: true },
          },
          {
            path: 'paymentorders/:funcID',
            component: PaymentOrderComponent,
            data: { noReuse: true },
          },
          //CM mục tiêu + cơ hội
          {
            path: 'targets/:funcID',
            component: TargetsComponent,
            data: { noReuse: true },
          },
          {
            path: 'wsdeals/:funcID',
            component: DealsComponent,
            // data: { noReuse: true },
          },
          {
            path: 'calendars/:funcID',
            component: CalendarsComponent,
            data: { noReuse: true },
          },
          {
            path: 'viewboards/:funcID',
            component: SprintsComponent,
          },
          {
            path: 'meeting/:funcID',
            component: TMMeetingsComponent,
          },
          {
            path: 'employeedetail/:funcID',
            component: EmployeeInfoDetailComponent,
          },
          {
            path: 'odsearching/:funcID',
            component: SearchingODComponent,
          },
          {
            path: 'dmsearching/:funcID',
            component: SearchingDMComponent,
          },
          {
            path: 'essearching/:funcID',
            component: SearchingESComponent,
          },
          {
            path: 'taskextends/:funcID',
            component: TaskExtendsComponent,
          },
          // //Tìm kiếm
          // {
          //   path: 'searching/:funcID',
          //   component: SearchingComponent,
          // },
        ],
      },
      {
        path: 'workspace/:funcID',
        component: WorkspaceComponent,
      },
    ],
  },
  {
    path: '',
    component: LayoutNoAsideComponent,
    children: [
      {
        path: 'storage',
        component: ExtendStorageComponent,
      },
      {
        path: 'notebook',
        component: ExtendNoteBookComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [
    CodxWsComponent,
    LayoutComponent,
    Layout2Component,
    CodxWsHeaderComponent,
    WpBreadcumComponent,
    WorkspaceComponent,
    HeaderComponent,
    PersonalComponent,
    MenuListComponent,
    MasterDetailComponent,
    ApprovalsComponent,
    ApprovalsComponentWS,
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
    CvInformationComponent,
    CvEvaluateComponent,
    CodxViewWsComponent,
    DetailNotebookComponent,
  ],
  exports: [RouterModule],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CodxCoreModule.forRoot({ environment }),
    CodxShareModule,
    CodxEPModule,
    CodxDmModule,
    CodxWpV2Module,
    AcModule,
    CodxHRModule,
    CodxCoModule,
    //CodxWpModule,
    //CodxWpV2Module,
    //CodxCoModule,
    AccordionModule,
    NgbDropdownModule,
    SpeedDialModule,
    TooltipModule,
    TabAllModule,
    CodxCommonModule,
    NgbModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CodxWsModule {}
