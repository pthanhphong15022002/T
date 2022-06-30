import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule, Type, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CodxCoreModule, EnvironmentConfig } from 'codx-core';
import { InlineSVGModule } from 'ng-inline-svg';
import { CodxWpComponent } from './codx-wp.component';
import { LayoutComponent } from './_layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [],
  },
];

const Component: Type<any>[] = [LayoutComponent, CodxWpComponent];

@NgModule({
  declarations: [Component],
  imports: [
    CommonModule,
    FormsModule,
    OverlayModule,
    InlineSVGModule.forRoot(),
    HttpClientModule,
    CodxCoreModule,
    RouterModule.forChild(routes),
  ],
  exports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CodxWpModule {
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
