import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, ModuleWithProviders, NgModule, Type } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CodxCoreModule, EnvironmentConfig } from 'codx-core';
import { InlineSVGModule } from 'ng-inline-svg';
import { CodxMwpComponent } from './codx-mwp.component';
import { LayoutComponent } from './_layout/layout.component';
import { EmployeeInfomationComponent } from './employeeinfomation/employee-infomation.component';
import { InfoLeftComponent } from './employeeinfomation/info-left/info-left.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'employeeinfo/:funcID',
        component: EmployeeInfomationComponent,
      },
    ],
  },
];

const Component: Type<any>[] = [
  LayoutComponent,
  CodxMwpComponent,
  EmployeeInfomationComponent,
  InfoLeftComponent,
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
  ],
  exports: [
    RouterModule,
  ],
  declarations: [Component],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CodxMwpModule {
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
