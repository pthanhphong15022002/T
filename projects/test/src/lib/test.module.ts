import { InlineSVGModule } from 'ng-inline-svg';














import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CodxCoreModule } from 'codx-core';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { TestComponent } from './test.component';
import { LayoutComponent } from './_layout/layout.component';

export const routes: Routes = [
  {
    path: '',                    //<-- để rỗng, khi chạy angular sẽ tự động vào routes này
    component: LayoutComponent,
    children: []
  }
]

@NgModule({
  declarations: [
    TestComponent,
    LayoutComponent,
  ],
  imports: [
    RouterModule.forChild(routes), //<-- import routes vừa tạo ở trên vào RouterModule
    CodxShareModule,
    CodxCoreModule,
    InlineSVGModule
  ],
  exports: [
    RouterModule  //<-- export để những nơi khác có thể sử dụng
  ]
})
export class TestModule { }




