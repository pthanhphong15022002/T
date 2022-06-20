import { ViewFileDialogComponent } from './components/viewFileDialog/viewFileDialog.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CodxCoreModule } from 'codx-core';

import { BreadcumbComponent } from './components/breadcumb/breadcumb.component';
import { AttachmentComponent } from './components/attachment/attachment.component';
import { AssignInfoComponent } from './components/assign-info/assign-info.component';

import { NgModule, Type } from '@angular/core';
import { SelectweekComponent } from './components/selectweek/selectweek.component';

const T_Component: Type<any>[] = [
  AssignInfoComponent,
  AttachmentComponent,
  BreadcumbComponent,
  SelectweekComponent,
  ViewFileDialogComponent
]

@NgModule({
  declarations: T_Component,
  imports: [
    CommonModule,
    FormsModule,
    CodxCoreModule,
  ],
  exports: [T_Component]
})
export class CodxShareModule { }
