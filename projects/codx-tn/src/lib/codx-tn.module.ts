import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import {
  EnvironmentConfig,
  CodxCoreModule,
  CodxShareComponent,
} from 'codx-core';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { environment } from 'src/environments/environment.prod';
import { CodxTnComponent } from './codx-tn.component';
import { OrderComponent } from './order/order.component';
import { LayoutComponent } from './_layout/layout.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'order',
        component: OrderComponent,
      },
    ],
  },
];
@NgModule({
  declarations: [CodxTnComponent, LayoutComponent, OrderComponent],
  imports: [
    RouterModule.forChild(routes),
    CodxCoreModule.forRoot({ environment }),
    CommonModule,
    SharedModule,
    CodxShareModule,
  ],
  exports: [CodxTnComponent],
})
export class CodxTnModule {
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
