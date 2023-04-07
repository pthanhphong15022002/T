import { NgModule, Type } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DynamicSettingComponent } from './dynamic-setting.component';
import { CatagoryComponent } from './catagory/catagory.component';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { CodxCoreModule } from 'codx-core';
import { GroupPipe } from './pipes/group-filter.pipe';
import { FormatPipe } from './pipes/format-string.pipe';
import { SubCategoryComponent } from './sub-category/sub-category.component';
import { InputTypePipe } from './pipes/input-type.pipe';
import { ShareSettingPipe } from './pipes/shareSetting.pipe';
import { BindValuePipe } from './pipes/bind-value.pipe';

export const routes: Routes = [
  {
    path: '',
    component: DynamicSettingComponent,

    children: [
      {
        path: ':catagory',
        component: CatagoryComponent,
        //data: { noReuse: true },
      },
      {
        path: ':catagory/detail',
        component: CatagoryComponent,
      },
    ],
  },
];

const T_Component: Type<any>[] = [CatagoryComponent, SubCategoryComponent];

const T_Pipe: Type<any>[] = [
  GroupPipe,
  FormatPipe,
  InputTypePipe,
  ShareSettingPipe,
  BindValuePipe,
];

@NgModule({
  declarations: [T_Component, T_Pipe],
  imports: [
    CommonModule,
    NgbModule,
    FormsModule,
    SharedModule,
    CodxCoreModule,
    RouterModule.forChild(routes),
  ],
  exports: [T_Component, T_Pipe],
})
export class DynamicSettingModule {}
