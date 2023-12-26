import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutNoAsideComponent } from 'projects/codx-common/src/lib/_layout/_noAside/_noAside.component';
import { RouterModule, Routes } from '@angular/router';
import { CodxCoreModule } from 'codx-core';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CustomerGroupsComponent } from './customer-groups/customer-groups.component';
import { PopupAddCustomerGroupsComponent } from './customer-groups/popup-add-customer-groups/popup-add-customer-groups.component';
import { ApproversComponent } from 'projects/codx-ad/src/lib/approvers/approvers.component';
import { StatusCodeComponent } from './status-code/status-code.component';
import { PopupAddStatusCodeComponent } from './status-code/popup-add-status-code/popup-add-status-code.component';
import { DocCategoryComponent } from 'projects/codx-es/src/lib/setting/category/category.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutNoAsideComponent,
    children: [
      {
        path: 'custgroups/:funcID',
        component: CustomerGroupsComponent,
      },
      {
        path: 'usergroups/:funcID',
        component: ApproversComponent,
      },
      {
        path: 'statuscode/:funcID',
        component: StatusCodeComponent,
      },
      {
        path: 'categories/:funcID',
        component: DocCategoryComponent,
        data: { noReuse: true },
      },
    ],
  },
];

@NgModule({
  declarations: [
    CustomerGroupsComponent,
    PopupAddCustomerGroupsComponent,
    StatusCodeComponent,
    PopupAddStatusCodeComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    CodxCoreModule,
    CodxShareModule,
    FormsModule,
    NgbModule,
  ],
  exports: [RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SettingsCmModule {}
