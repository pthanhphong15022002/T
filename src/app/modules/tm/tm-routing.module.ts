import { TestKanbanComponent } from './kanban/kanban.component';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CodxCoreModule } from 'codx-core';
import { environment } from 'src/environments/environment';
import { LayoutComponent } from './_layout/layout.component';
import { TmComponent } from './tm.component';
import { FormsModule } from '@angular/forms';
import { ViewListDetailsComponent } from './view-list-details/view-list-details.component';
import { CommonModule } from '@angular/common';
import { ListTasksComponent } from './list-tasks/list-tasks.component';
import { SharedModule } from '@shared/shared.module';
import { MoreFuntionComponent } from './more-funtion/more-funtion.component';
import { ScheduleComponent } from './schedule/schedule.component';

const routes: Routes = [
  { 
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        component: TmComponent,
      },
      {
        path: 'home',
        component: HomeComponent,
      },
      {
        path: 'subhome',
        component: HomeComponent,
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'error/404',
      },
    ],
  },
];

@NgModule({
  declarations: [HomeComponent, TestKanbanComponent, TmComponent,ViewListDetailsComponent, ListTasksComponent, MoreFuntionComponent, ScheduleComponent],
  imports: [
    RouterModule.forChild(routes),
    FormsModule,
    CodxCoreModule.forRoot({ environment }),
    CommonModule,
    SharedModule
  ],
  exports: [RouterModule],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class TmModule {}
