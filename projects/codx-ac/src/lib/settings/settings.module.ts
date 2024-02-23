import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { CodxCoreModule } from 'codx-core';
import { CodxReportModule } from 'projects/codx-report/src/public-api';
import { LayoutNoAsideComponent } from 'projects/codx-common/src/lib/_layout/_noAside/_noAside.component';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { NameByIdPipe } from '../pipes/name-by-id.pipe';
import { APPostingAccountsComponent } from './apposting-accounts/apposting-accounts.component';
import { ArPostingAccountsComponent } from './ar-posting-accounts/ar-posting-accounts.component';
import { FAPostingAccountsComponent } from './faposting-accounts/faposting-accounts.component';
import { FixedAssetsComponent } from './fixed-assets/fixed-assets.component';
import { InventoryComponent } from './inventory/inventory.component';
import { ItemBatchsComponent } from './item-batchs/item-batchs.component';
import { ItemSeriesComponent } from './item-series/item-series.component';
import { VATCodesComponent } from './vatcodes/vatcodes.component';
import { AccountsComponent } from './account-categories/accounts.component';
import { CurrencyComponent } from './currency-categories/currency.component';
import { TranformValueNumberPipe } from '../pipes/tranform-value-number.pipe';
import { ItempostingaccountsComponent } from './posting-accounts-categories/posting-accounts.component';
import { CustomersComponent } from './customers-categories/customers.component';
import { VendorsComponent } from './vendors-categories/vendors.component';
import { ItemsComponent } from './items-categories/items.component';
import { WarehousesComponent } from './warehouses-categories/warehouses.component';
import { UnitsofmearsureComponent } from './unitsofmearsure-categories/unitsofmearsure.component';
import { AcShareModule } from '../ac-share.module';
import { FiscalPeriodsComponent } from './fiscal-periods/fiscal-periods.component';
import { DimensionGroupsComponent } from './dimension-groups-categories/dimension-groups.component';

var routes: Routes = [
  {
    path: '',
    component: LayoutNoAsideComponent,
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

  exports: [RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SettingsModule {}
