import { TestKanbanComponent } from './test-kanban/test-kanban.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CodxCoreModule } from 'codx-core';
import { environment } from 'src/environments/environment';
import { LayoutComponent } from './_layout/layout.component';
import { TmComponent } from './tm.component';
import { FormsModule } from '@angular/forms';
import { ViewListDetailsComponent } from './view-list-details/view-list-details.component';

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
  declarations: [HomeComponent, TestKanbanComponent, TmComponent,ViewListDetailsComponent],
  imports: [
    RouterModule.forChild(routes),
    FormsModule,
    CodxCoreModule.forRoot({ environment }),
  ],
  exports: [RouterModule],
})
export class TmModule {}
