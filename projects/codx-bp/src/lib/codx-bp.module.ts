import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { CodxBpComponent } from './codx-bp.component';
import { TesthtmlComponent } from './testhtml/testhtml.component';
import { LayoutComponent } from './_layout/layout.component';
import { ProcessesComponent } from './processes/processes.component';
import { PopAddProcessesComponent } from './processes/pop-add-processes/pop-add-processes.component';
import { ViewListProcessesComponent } from './processes/view-list-processes/view-list-processes.component';
import { ProcessStepComponent } from './processstep/processstep.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'testhtml',
        component: TesthtmlComponent,
      },
      {
        path: 'processes/:funcID',
        component: ProcessesComponent,
      },
      {
        path: 'processstep/:funcID',
        component: ProcessStepComponent,
      }
    ]
  }
]

@NgModule({
  declarations: [
    CodxBpComponent,
    TesthtmlComponent,
    LayoutComponent,
    ProcessesComponent,
    PopAddProcessesComponent,
    ViewListProcessesComponent,
    ProcessStepComponent,

  ],
  imports: [
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    CodxShareModule
  ],
  exports: [
    CodxBpComponent
  ]
})
export class CodxBpModule { }
