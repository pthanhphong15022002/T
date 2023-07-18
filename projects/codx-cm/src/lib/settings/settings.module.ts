import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutNoAsideComponent } from 'projects/codx-share/src/lib/_layout/_noAside/_noAside.component';
import { RouterModule, Routes } from '@angular/router';
import { CodxCoreModule } from 'codx-core';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CustomerGroupsComponent } from './customer-groups/customer-groups.component';
import { PopupAddCustomerGroupsComponent } from './customer-groups/popup-add-customer-groups/popup-add-customer-groups.component';
import { CodxDpModule } from 'projects/codx-dp/src/public-api';

const routes: Routes = [
  {
    path: '',
    component: LayoutNoAsideComponent,
    children: [
      {
        path: 'custgroups/:funcID',
        component: CustomerGroupsComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [CustomerGroupsComponent, PopupAddCustomerGroupsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CodxCoreModule,
    CodxShareModule,
    FormsModule,
    NgbModule,
  ],
  exports: [RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SettingsCmModule {}
