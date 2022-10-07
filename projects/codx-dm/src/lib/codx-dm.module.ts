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
import { PhysicalComponent } from './createFolder/physical/physical.component';
import { SubFolderComponent } from './createFolder/subFolder/subFolder.component';
import { DetailComponent } from './views/detail/detail.component';
import { CopyComponent } from './copy/copy.component';
import { PropertiesComponent } from './properties/properties.component';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { CoreModule } from '@core/core.module';
import { MoveComponent } from './move/move.component';
import { VersionComponent } from './version/version.component';
import { UploaderModule } from '@syncfusion/ej2-angular-inputs';
import { ShareComponent } from './share/share.component';
import { ViewFileDialogComponent } from 'projects/codx-share/src/lib/components/viewFileDialog/viewFileDialog.component';
import { DragDropFileUploadDirective } from './directives/drag-drop-file-upload.directive';
import { DragDropFileFolderDirective } from './directives/drag-drop-file-folder.directive';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
//import { InfiniteScrollModule } from 'ngx-infinite-scroll';
//import { TooltipModule } from '@syncfusion/ej2-angular-popups';


export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      // {
      //   path: '',
      //   component: HomeComponent
      // },

      // {
      //   path: 'DMT02',
      //   component: HomeComponent
      // },  
      // {
      //   path: 'DMT03',
      //   component: HomeComponent
      // },  
      {
        path: ':funcID',
        component: HomeComponent
      },
      {
        path: ':funcID/:fileID',
        component: ViewFileDialogComponent
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
  DetailComponent,
  CreateFolderComponent,
  EditFileComponent,
  RolesComponent,
  AddRoleComponent,
  PhysicalComponent,
  SubFolderComponent,
  CopyComponent,
  PropertiesComponent,
  MoveComponent,
  VersionComponent,
  ShareComponent,
  DragDropFileUploadDirective,
  DragDropFileFolderDirective,
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
    FormsModule,
    NgbModule,
    CoreModule,
    UploaderModule,
    DialogModule
    //TooltipModule,
   // InfiniteScrollModule
  ],
  exports: [
    RouterModule
  ],
  declarations: T_Component,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})

// @NgModule({
//   imports: [BrowserModule, NgbModule, FormsModule, ReactiveFormsModule],
//   declarations: [NgbdRatingBasic],
//   exports: [NgbdRatingBasic],
//   bootstrap: [NgbdRatingBasic]
// })

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
