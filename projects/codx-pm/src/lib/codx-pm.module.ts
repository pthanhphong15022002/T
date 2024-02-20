import { ModuleWithProviders, NgModule } from '@angular/core';
import { CodxPmComponent } from './codx-pm.component';
import { LayoutComponent } from './_layout/layout.component';
import { RouterModule, Routes } from '@angular/router';
import { CodxCoreModule, DatePipe, EnvironmentConfig } from 'codx-core';
import { environment } from 'src/environments/environment';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from '@core/core.module';
import { PinchZoomModule } from '@meddv/ngx-pinch-zoom';
import { NgbModule, NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '@shared/shared.module';
import { DiagramModule } from '@syncfusion/ej2-angular-diagrams';
// import { LinearGaugeModule  } from '@syncfusion/ej2-angular-lineargauge';
import { SplitterAllModule } from '@syncfusion/ej2-angular-layouts';
import {
  TabModule,
  AccordionModule,
} from '@syncfusion/ej2-angular-navigations';
import { DynamicSettingModule } from 'projects/codx-share/src/lib/components/dynamic-setting/dynamic-setting.module';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { ProjectsComponent } from './projects/pm-projects.component';
import { ProgressBarModule } from '@syncfusion/ej2-angular-progressbar';
import { PopupAddProjectComponent } from './projects/popup-add-project/popup-add-project.component';
import { PopupProjectDetailsComponent } from './projects/popup-project-details/popup-project-details.component';
import { ProjectTasksViewComponent } from './projects/lib-view-tasks/lib-view-tasks.component';
import { TaskExtendsComponent } from 'projects/codx-tm/src/lib/taskextends/taskextends.component';
import { TasksComponent } from 'projects/codx-tm/src/lib/tasks/tasks.component';
import { PopupAddTaskComponent } from './projects/popup-add-task/popup-add-task.component';
import { PopupSelectUserComponent } from './projects/popup-select-user/popup-select-user.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'projects/:funcID',
        component: ProjectsComponent,
        data: { noReuse: true },
      },
      {
        path: 'taskextends/:funcID',
        component: TaskExtendsComponent,
      },
      {
        path: 'tasks/:funcID',
        component: TasksComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [
    CodxPmComponent,
    LayoutComponent,
    ProjectsComponent,
    PopupAddProjectComponent,
    PopupProjectDetailsComponent,
    ProjectTasksViewComponent
  ],
  imports: [
    CodxCoreModule.forRoot({ environment }),
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    TabModule,
    CodxShareModule,
    NgbModule,
    CoreModule,
    HttpClientModule,
    OverlayModule,
    TabModule,
    CommonModule,
    AccordionModule,
    DragDropModule,
    CoreModule,
    PinchZoomModule,
    DiagramModule,
    SplitterAllModule,
    DynamicSettingModule,
    NgbAccordionModule,
    ProgressBarModule,
    // NgxImageZoomModule
  ],
  exports: [CodxPmComponent],
})
export class CodxPmModule {
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
