import { FormsModule } from '@angular/forms';
import { CodxShareModule } from './../../../codx-share/src/lib/codx-share.module';
import { LayoutComponent } from './_layout/layout.component';
import { CodxCoreModule, EnvironmentConfig } from 'codx-core';
import { CUSTOM_ELEMENTS_SCHEMA, ModuleWithProviders, NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { Routes, RouterModule } from '@angular/router';
import { InlineSVGModule } from 'ng-inline-svg';
import { AccumulationChartAllModule, ChartAllModule } from '@syncfusion/ej2-angular-charts';
import { ProgressBarModule } from '@syncfusion/ej2-angular-progressbar';
import { TreeMapModule } from '@syncfusion/ej2-angular-treemap';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { BreadcrumbComponent, TabModule } from '@syncfusion/ej2-angular-navigations';
import { HomeComponent } from './home/home.component';
import { CardComponent } from './views/card/card.component';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CreateFolderComponent } from './createFolder/createFolder.component';
import { EditFileComponent } from './editFile/editFile.component';
import { RolesComponent } from './roles/roles.component';
import { AddRoleComponent } from './addrole/addrole.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [                          
      // {
      //   path: '',
      //   component: HomeComponent
      // },
      {
        path: ':funcID',
        component: HomeComponent
      },           
      {
        path: '**',
        redirectTo: 'error/404',
      },
      // {
      //   path: '',
      //   redirectTo: 'home',
      //   pathMatch: 'full',
      // },
    ]
  }
];

const T_Component: Type<any>[] = [
  LayoutComponent,
  HomeComponent,
  CardComponent,
  CreateFolderComponent,
  EditFileComponent,
  RolesComponent,
  AddRoleComponent
]
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
    TreeMapModule,
    DatePickerModule,
    TabModule,
    FormsModule
  ],
  exports: [
    RouterModule
  ],
  declarations: T_Component,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})

export class CodxDmModule {
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
