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
import { InventoryComponent } from '../settings/inventory/inventory.component';
import { ItempostingaccountsComponent } from '../settings/posting-accounts-categories/posting-accounts.component';
import { DimensionGroupsComponent } from '../settings/dimension-groups/dimension-groups.component';
import { ArPostingAccountsComponent } from '../settings/ar-posting-accounts/ar-posting-accounts.component';
import { APPostingAccountsComponent } from '../settings/apposting-accounts/apposting-accounts.component';
import { FAPostingAccountsComponent } from '../settings/faposting-accounts/faposting-accounts.component';
import { FixedAssetsComponent } from '../settings/fixed-assets/fixed-assets.component';
import { ItemBatchsComponent } from '../settings/item-batchs/item-batchs.component';
import { ItemSeriesComponent } from '../settings/item-series/item-series.component';
import { VATCodesComponent } from '../settings/vatcodes/vatcodes.component';

var routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'currencies/:funcID',
        component: CurrencyComponent,
      },
      {
        path: 'chartofaccounts/:funcID',
        component: AccountsComponent,
      },
      {
        path: 'customers/:funcID',
        component: CustomersComponent,
      },
      {
        path: 'vendors/:funcID',
        component: VendorsComponent,
      },
      {
        path: 'items/:funcID',
        component: ItemsComponent,
      },
      {
        path: 'warehouses/:funcID',
        component: WarehousesComponent,
      },
      {
        path: 'unitsofmearsure/:funcID',
        component: UnitsofmearsureComponent,
      },
      {
        path: 'inventorymodels/:funcID',
        component: InventoryComponent,
      },
      {
        path: 'postingaccounts/:funcID',
        component: ItempostingaccountsComponent,
      },
      {
        path: 'dimensiongroups/:funcID',
        component: DimensionGroupsComponent,
      },
      {
        path: 'arpostingaccounts/:funcID',
        component: ArPostingAccountsComponent,
      },
      {
        path: 'appostingaccounts/:funcID',
        component: APPostingAccountsComponent,
      },
      {
        path: 'fapostingaccounts/:funcID',
        component: FAPostingAccountsComponent,
      },
      {
        path: 'fixedassets/:funcID',
        component: FixedAssetsComponent,
      },
      {
        path: 'fiscalperiods/:funcID',
        component: FiscalPeriodsComponent,
      },
      {
        path: 'itembatchs/:funcID',
        component: ItemBatchsComponent,
      },
      {
        path: 'itemseries/:funcID',
        component: ItemSeriesComponent,
      },
      {
        path: 'vatcodes/:funcID',
        component: VATCodesComponent,
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
