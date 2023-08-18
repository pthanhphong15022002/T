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

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'mwp/workspace/:funcID',
        component: WorkspaceComponent,
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
    CodxWsHeaderComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CodxCoreModule.forRoot({ environment }),
    CodxShareModule
  ],
  exports: [RouterModule],
})
export class CodxWsModule { }
