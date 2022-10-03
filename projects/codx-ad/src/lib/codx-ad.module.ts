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
import { InlineSVGModule } from 'ng-inline-svg';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { LayoutComponent } from './_layout/layout.component';
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
import { AsideroledetailComponent } from './Roles/asideroledetail/asideroledetail.component';
import { UserGroupsComponent } from './user-groups/user-group.component';
import { AddUserGroupsComponent } from './user-groups/add-user-groups/add-user-groups.component';
import { SystemsettingsComponent } from './systemsettings/systemsettings.component';
import { LayoutNoAsideToolbarFluidComponent } from './../../../codx-share/src/lib/_layout/_noAsideToolbarFluid/_noAsideToolbarFluid.component';

import { SliderModule } from '@syncfusion/ej2-angular-inputs';
import { LayoutOnlyHeaderComponent } from 'projects/codx-share/src/lib/_layout/_onlyHeader/_onlyHeader.component';
import { NoSubAsideComponent } from './_noSubAside/_noSubAside.component';

export const routes: Routes = [
  {
    path: '',
    component: NoSubAsideComponent,
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
        path: 'roles/:funcID',
        component: RolesComponent,
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
  LayoutComponent,
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
  AsideroledetailComponent,
  AddUserGroupsComponent,
  SystemsettingsComponent,
  NoSubAsideComponent,

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
