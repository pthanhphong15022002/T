import { AddApproversComponent } from './approvers/add/add.component';
import { ApproversComponent } from './approvers/approvers.component';
import { UserComponent } from './users/user.component';
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
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import {
  AccumulationChartAllModule,
  ChartAllModule,
} from '@syncfusion/ej2-angular-charts';
import { CircularGaugeModule } from '@syncfusion/ej2-angular-circulargauge';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { ProgressBarModule } from '@syncfusion/ej2-angular-progressbar';
import { TreeMapModule } from '@syncfusion/ej2-angular-treemap';
import { CodxCoreModule, EnvironmentConfig } from 'codx-core';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { PopupContactComponent } from './company-setting/popup-contact/popup-contact.component';
import { ViewUsersComponent } from './users/view-users/view-users.component';
import { AddUserComponent } from './users/add-user/add-user.component';
import { PopupPersonalComponent } from './company-setting/popup-personal/popup-personal.component';
import { PopRolesComponent } from './users/pop-roles/pop-roles.component';
import { CompanySettingComponent } from './company-setting/company-setting.component';
import { SharedModule } from '@shared/shared.module';
import { RolesComponent } from './Roles/home/home.component';
import { RoleEditComponent } from './Roles/role-edit/role-edit.component';
import { RoleDetailComponent } from './Roles/detail/detail.component';
import { UserGroupsComponent } from './user-groups/user-group.component';
import { AddUserGroupsComponent } from './user-groups/add-user-groups/add-user-groups.component';
import { SystemsettingsComponent } from './systemsettings/systemsettings.component';
import { SliderModule } from '@syncfusion/ej2-angular-inputs';
import { LayoutOnlyHeaderComponent } from 'projects/codx-common/src/lib/_layout/_onlyHeader/_onlyHeader.component';
import { BindPipe } from './Roles/detail/pipes/bindValue.pipe';
import { ActiveTemplatePipe } from './Roles/detail/pipes/activeTemplate.pipe';
import { PleaseUseComponent } from './users/please-use/please-use.component';
import { PopupModuleDetailComponent } from './company-setting/popup-module-detail/popup-module-detail.component';
import { PopupInfoComponent } from './company-setting/popup-info/popup-info.component';
import { PopActiveAccountComponent } from './users/pop-active-account/pop-active-account.component';
import { DecentralizedGroupComponent } from './decentralized-group/decentralized-group.component';
import { AddDecentralGroupMemComponent } from './decentralized-group/add-decentral-group-mem/add-decentral-group-mem.component';
import { PopupOrderDetailComponent } from './company-setting/popup-order-detail/popup-order-detail.component';
import { PopupExtendModuleComponent } from './company-setting/popup-extend-module/popup-extend-module.component';
import { CodxReportViewsComponent } from 'projects/codx-report/src/lib/codx-report-views/codx-report-views.component';
import { CodxReportViewDetailComponent } from 'projects/codx-report/src/lib/codx-report-view-detail/codx-report-view-detail.component';
import { LayoutComponent } from 'projects/codx-share/src/lib/components/layout/layout.component';
import { DynamicFormComponent } from 'projects/codx-share/src/lib/components/dynamic-form/dynamic-form.component';
import { AddDecentralGroupComponent } from './decentralized-group/add-decentral-group/add-decentral-group.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'users/:funcID',
        component: UserComponent,
      },

      {
        path: 'groupusers/:funcID',
        component: UserGroupsComponent,
      },

      {
        path: 'usergroups/:funcID',
        component: ApproversComponent,
      },
      {
        path: 'roles/:funcID',
        component: RolesComponent,
      },
      {
        path: 'grouppermissions/:funcID',
        component: DecentralizedGroupComponent,
      },
      {
        path: 'report/:funcID',
        component: CodxReportViewsComponent,
      },
      {
        path: 'report/detail/:funcID',
        component: CodxReportViewDetailComponent,
      },
      {
        path: 'shared/dynamic/:funcID',
        component: DynamicFormComponent,
      },
    ],
  },
  {
    path: '',
    component: LayoutOnlyHeaderComponent,
    children: [
      {
        path: 'roledetails/:funcID',
        component: RoleDetailComponent,
        data: { noReuse: true },
      },
      {
        path: 'systemsetting/:funcID',
        component: SystemsettingsComponent,
      },
      {
        path: 'accountinfo/:funcID',
        component: CompanySettingComponent,
      },
    ],
  },
];

const T_Component: Type<any>[] = [
  UserComponent,
  CompanySettingComponent,
  PopupContactComponent,
  ViewUsersComponent,
  AddUserComponent,
  PopupPersonalComponent,
  PopRolesComponent,
  UserGroupsComponent,
  RolesComponent,
  RoleEditComponent,
  RoleDetailComponent,
  AddUserGroupsComponent,
  SystemsettingsComponent,
  ApproversComponent,
  AddApproversComponent,
  BindPipe,
  ActiveTemplatePipe,
  PleaseUseComponent,
  PopupModuleDetailComponent,
  PopupInfoComponent,
  PopActiveAccountComponent,
  DecentralizedGroupComponent,
  AddDecentralGroupMemComponent,
  AddDecentralGroupComponent,
  PopupOrderDetailComponent,
  PopupExtendModuleComponent,
];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    OverlayModule,
    HttpClientModule,
    CodxCoreModule,
    RouterModule.forChild(routes),
    CodxShareModule,
    ChartAllModule,
    AccumulationChartAllModule,
    ProgressBarModule,
    CircularGaugeModule,
    TreeMapModule,
    DatePickerModule,
    TabModule,
    FormsModule,
    NgbModule,
    SharedModule,
    SliderModule,
  ],
  exports: [RouterModule],
  declarations: T_Component,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ADModule {
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
