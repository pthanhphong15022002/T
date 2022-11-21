import { LayoutComponent } from './_layout/layout.component';
import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CodxEiComponent } from './codx-ei.component';
import { CodxCoreModule, EnvironmentConfig } from 'codx-core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { InvoicesComponent } from './invoices/invoices.component';
import { AddEditComponent } from './invoices/popups/add-edit/add-edit.component';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { GridModule } from '@syncfusion/ej2-angular-grids';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'invoices/:funcID',
        component: InvoicesComponent,
      },
      {
        path: '',
        redirectTo: 'invoices/EIT01',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'error/404',
      },
    ],
  },
];

const T_Component: Type<any>[] = [
  LayoutComponent,
  CodxEiComponent,
  InvoicesComponent,
  AddEditComponent,
];

@NgModule({
  declarations: T_Component,
  imports: [
    RouterModule.forChild(routes),
    CodxCoreModule.forRoot({ environment }),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    CodxShareModule,
    TabModule,
    GridModule,
  ],
  exports: [RouterModule],
})
export class CodxEiModule {
  public static forRoot(
    config?: EnvironmentConfig
  ): ModuleWithProviders<CodxCoreModule> {
    return {
      ngModule: CodxCoreModule,
      providers: [
        HttpClientModule,
        { provide: EnvironmentConfig, useValue: config },
        DatePipe,
      ],
    };
  }
}
