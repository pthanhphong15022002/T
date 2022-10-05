import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ModuleWithProviders,
  NgModule,
  Type,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CodxCoreModule, EnvironmentConfig } from 'codx-core';
import { InlineSVGModule } from 'ng-inline-svg';
import { LayoutComponent } from './_layout/layout.component';
import { EmployeeInfomationComponent } from './employeeinfomation/employee-infomation.component';
import { HomeComponent } from './home/home.component';
import { PersonalsComponent } from './personals/personals.component';
import { ImgComponent } from './personals/img/img.component';
import { VideoComponent } from './personals/video/video.component';
import { StorageComponent } from './personals/storage/storage.component';
import { AddUpdateStorageComponent } from './personals/storage/add-update-storage/add-update-storage.component';
import { NoteBooksComponent } from './personals/note-books/note-books.component';
import { AddUpdateNoteBookComponent } from './personals/note-books/add-update-note-book/add-update-note-book.component';
import { PostsComponent } from './personals/posts/posts.component';
import { PopupAddUpdate } from './personals/note-books/detail/popup-add-update/popup-add-update.component';
import {
  AccumulationChartModule,
  ChartAllModule,
  ChartModule,
} from '@syncfusion/ej2-angular-charts';
import { SliderModule } from '@syncfusion/ej2-angular-inputs';
import { SidebarModule, TabModule } from '@syncfusion/ej2-angular-navigations';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import {
  AreaSeriesService,
  LineSeriesService,
  ExportService,
  ColumnSeriesService,
  StackingColumnSeriesService,
  StackingAreaSeriesService,
  RangeColumnSeriesService,
  ScatterSeriesService,
  PolarSeriesService,
  CategoryService,
  RadarSeriesService,
  SplineSeriesService,
} from '@syncfusion/ej2-angular-charts';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EditInfoComponent } from './employeeinfomation/edit-info/edit-info.component';
import { EditHobbyComponent } from './employeeinfomation/edit-hobby/edit-hobby.component';
import { EditExperenceComponent } from './employeeinfomation/edit-experence/edit-experence.component';
import { EditRelationComponent } from './employeeinfomation/edit-relation/edit-relation.component';
import { EditSkillComponent } from './employeeinfomation/edit-skill/edit-skill.component';
import { PopAddSkillComponent } from './employeeinfomation/edit-skill/pop-add-skill/pop-add-skill.component';
import { DetailNoteBooksComponent } from './personals/note-books/detail/detail-note-books.component';
import { LayoutNoAsideComponent } from 'projects/codx-share/src/lib/_layout/_noAside/_noAside.component';
import { TasksComponent } from './tasks/tasks.component';
import { LayoutNoToolbarComponent } from './_noToolbar/_noToolbar.component';
import { NoSubAsideComponent } from './_noSubAside/_noSubAside.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'tasks/:funcID',
        component: TasksComponent,
      },
    ],
  },
  {
    path: '',
    component: LayoutNoAsideComponent,
    children: [
      {
        path: 'notedetails/:funcID',
        component: DetailNoteBooksComponent,
      },
    ],
  },
  {
    path: '',
    component: NoSubAsideComponent,
    children: [
      {
        path: 'personals/:funcID',
        component: PersonalsComponent,
      },
      // {
      //   path: 'tasks/:funcID',
      //   component: TasksComponent,
      // },
    ],
  },
  {
    path: '',
    component: LayoutNoToolbarComponent,
    children: [
      {
        path: 'employeeinfomation/:funcID',
        component: EmployeeInfomationComponent,
      },
    ],
  },
];

const Component: Type<any>[] = [
  LayoutComponent,
  LayoutNoToolbarComponent,
  NoSubAsideComponent,
  EmployeeInfomationComponent,
  HomeComponent,
  PersonalsComponent,
  ImgComponent,
  VideoComponent,
  StorageComponent,
  AddUpdateStorageComponent,
  NoteBooksComponent,
  AddUpdateNoteBookComponent,
  PopupAddUpdate,
  DetailNoteBooksComponent,
  PostsComponent,
  EditInfoComponent,
  EditHobbyComponent,
  EditExperenceComponent,
  EditRelationComponent,
  TasksComponent,
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
    CodxShareModule,
    SliderModule,
    ChartModule,
    ButtonModule,
    ChartAllModule,
    SidebarModule,
    AccumulationChartModule,
    TabModule,
    NgbModule,
  ],
  exports: [RouterModule],
  declarations: [Component, EditSkillComponent, PopAddSkillComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    AreaSeriesService,
    LineSeriesService,
    ExportService,
    ColumnSeriesService,
    StackingColumnSeriesService,
    StackingAreaSeriesService,
    RangeColumnSeriesService,
    ScatterSeriesService,
    PolarSeriesService,
    CategoryService,
    RadarSeriesService,
    SplineSeriesService,
  ],
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
