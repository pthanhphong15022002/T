import { NgModule, Type } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DynamicSettingComponent } from './dynamic-setting.component';
import { CatagoryComponent } from './catagory/catagory.component';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { InlineSVGModule } from 'ng-inline-svg';
import { CodxCoreModule } from 'codx-core';
import { GroupPipe } from './pipes/group-filter.pipe';
import { DynamicSettingService } from './dynamic-setting.service';

export const routes: Routes = [
  {
    path: '',
    component: DynamicSettingComponent,
    children: [
      {
        path: ':catagory',
        component: CatagoryComponent,
      },
    ],
  },
];

const T_Component: Type<any>[] = [CatagoryComponent];

const T_Pipe: Type<any>[] = [GroupPipe];

@NgModule({
  declarations: [T_Component, T_Pipe],
  imports: [
    CommonModule,
    NgbModule,
    FormsModule,
    SharedModule,
    InlineSVGModule.forRoot(),
    CodxCoreModule,
    RouterModule.forChild(routes),
  ],
  exports: [T_Component, T_Pipe],
})
export class DynamicSettingModule {}
