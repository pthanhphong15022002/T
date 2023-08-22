import { NgModule } from '@angular/core';
import { CodxWsComponent } from './codx-ws.component';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './_layout/layout.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { CodxCoreModule } from 'codx-core';
import { environment } from 'src/environments/environment';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { ProgressAnnotationService } from '@syncfusion/ej2-angular-progressbar';
import { CodxWsHeaderComponent } from './_layout/codx-ws-header/codx-ws-header.component';
import { CalendarComponent } from './calendar/calendar.component';
import { WpBreadcumComponent } from './workspace/wp-breadcum/wp-breadcum.component';
import { HeaderComponent } from './workspace/header/header.component';
import { PersonalComponent } from './personal/personal.component';
import { MenuListComponent } from './personal/menu-list/menu-list.component';
import { MasterDetailComponent } from './personal/master-detail/master-detail.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'workspace/:funcID',
        component: WorkspaceComponent,
      },
      {
        path: 'calendar/:funcID',
        component: CalendarComponent,
      },
      {
        path: 'personal/:funcID',
        component: PersonalComponent,
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
  declarations: [
    CodxWsComponent,
    LayoutComponent,
    CodxWsHeaderComponent,
    WpBreadcumComponent,
    WorkspaceComponent,
    HeaderComponent,
    PersonalComponent,
    MenuListComponent,
    MasterDetailComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CodxCoreModule.forRoot({ environment }),
    CodxShareModule
  ],
  exports: [RouterModule],
})
export class CodxWsModule { }
