import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FiscalPeriodsComponent } from '../settings/fiscal-periods/fiscal-periods.component';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from '../_layout/layout.component';
import { AcShareModule } from '../ac-share.module';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { CurrencyComponent } from '../settings/currency-categories/currency.component';
import { AccountsComponent } from '../settings/account-categories/accounts.component';
import { CustomersComponent } from '../settings/customers-categories/customers.component';
import { VendorsComponent } from '../settings/vendors-categories/vendors.component';
import { ItemsComponent } from '../settings/items-categories/items.component';
import { WarehousesComponent } from '../settings/warehouses-categories/warehouses.component';
import { UnitsofmearsureComponent } from '../settings/unitsofmearsure-categories/unitsofmearsure.component';
import { ItempostingaccountsComponent } from '../settings/posting-accounts-categories/posting-accounts.component';
import { ArPostingAccountsComponent } from '../settings/ar-posting-accounts/ar-posting-accounts.component';
import { APPostingAccountsComponent } from '../settings/apposting-accounts/apposting-accounts.component';
import { FAPostingAccountsComponent } from '../settings/faposting-accounts/faposting-accounts.component';
import { FixedAssetsComponent } from '../settings/fixed-assets/fixed-assets.component';
import { ItemBatchsComponent } from '../settings/item-batchs/item-batchs.component';
import { ItemSeriesComponent } from '../settings/item-series/item-series.component';
import { VATCodesComponent } from '../settings/vatcodes/vatcodes.component';
import { DynamicFormComponent } from 'projects/codx-share/src/lib/components/dynamic-form/dynamic-form.component';
import { DimensionGroupsComponent } from '../settings/dimension-groups-categories/dimension-groups.component';
import { ModelsComponent } from '../settings/models-categories/models.component';

var routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'currencies/:funcID',
        component: CurrencyComponent,
        data: { isSubView: true },
      },
      {
        path: 'chartofaccounts/:funcID',
        component: AccountsComponent,
        data: { isSubView: true },
      },
      {
        path: 'customers/:funcID',
        component: CustomersComponent,
        data: { isSubView: true },
      },
      {
        path: 'vendors/:funcID',
        component: VendorsComponent,
        data: { isSubView: true },
      },
      {
        path: 'items/:funcID',
        component: ItemsComponent,
        data: { isSubView: true },
      },
      {
        path: 'warehouses/:funcID',
        component: WarehousesComponent,
        data: { isSubView: true },
      },
      {
        path: 'unitsofmearsure/:funcID',
        component: UnitsofmearsureComponent,
        data: { isSubView: true },
      },
      {
        path: 'inventorymodels/:funcID',
        component: ModelsComponent,
        data: { isSubView: true },
      },
      {
        path: 'postingaccounts/:funcID',
        component: ItempostingaccountsComponent,
        data: { isSubView: true },
      },
      {
        path: 'dimensiongroups/:funcID',
        component: DimensionGroupsComponent,
        data: { isSubView: true },
      },
      {
        path: 'arpostingaccounts/:funcID',
        component: ArPostingAccountsComponent,
        data: { isSubView: true },
      },
      {
        path: 'appostingaccounts/:funcID',
        component: APPostingAccountsComponent,
        data: { isSubView: true },
      },
      {
        path: 'fapostingaccounts/:funcID',
        component: FAPostingAccountsComponent,
        data: { isSubView: true },
      },
      {
        path: 'fixedassets/:funcID',
        component: FixedAssetsComponent,
        data: { isSubView: true },
      },
      {
        path: 'fiscalperiods/:funcID',
        component: FiscalPeriodsComponent,
        data: { isSubView: true },
      },
      {
        path: 'itembatchs/:funcID',
        component: ItemBatchsComponent,
        data: { isSubView: true },
      },
      {
        path: 'itemseries/:funcID',
        component: ItemSeriesComponent,
        data: { isSubView: true },
      },
      {
        path: 'vatcodes/:funcID',
        component: VATCodesComponent,
        data: { isSubView: true },
      },
      {
        path: 'dynamic/:funcID',
        component: DynamicFormComponent,
        data: { isSubView: true },
      },
    ],
  },
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    AcShareModule,
    CodxShareModule,
  ],
})
export class CategoriesModule {}
