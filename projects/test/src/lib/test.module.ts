import { InlineSVGModule } from 'ng-inline-svg';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CodxCoreModule } from 'codx-core';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { TestComponent } from './test.component';
import { LayoutComponent } from './_layout/layout.component';
import { TaskComponent } from './task/task.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'task' }
    ]
  }
]

@NgModule({
  declarations: [
    TestComponent,
    LayoutComponent,
    TaskComponent, //<-- Khai báo component vừa tạo
  ],
  imports: [
    RouterModule.forChild(routes),
    CodxShareModule,
    CodxCoreModule,
    InlineSVGModule
  ],
  exports: [
    RouterModule
  ]
})
export class TestModule { }




