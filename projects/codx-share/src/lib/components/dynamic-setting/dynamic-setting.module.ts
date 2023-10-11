import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DynamicSettingComponent } from './dynamic-setting.component';
import { CatagoryComponent } from './catagory/catagory.component';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { CodxCoreModule, EnvironmentConfig } from 'codx-core';
import { GroupPipe } from './pipes/group-filter.pipe';
import { FormatPipe } from './pipes/format-string.pipe';
import { SubCategoryComponent } from './sub-category/sub-category.component';
import { InputTypePipe } from './pipes/input-type.pipe';
import { ShareSettingPipe } from './pipes/shareSetting.pipe';
import { BindValuePipe } from './pipes/bind-value.pipe';
import { PatternComponent } from '../../../../../codx-fd//src/lib/setting/feedback-message/pattern/pattern.component';
import { EditPatternComponent } from '../../../../../codx-fd//src/lib/setting/feedback-message/pattern/edit-pattern/edit-pattern.component';
import { CodxShareModule } from '../../codx-share.module';
import { HttpClientModule } from '@angular/common/http';
//import { PatternComponent } from 'projects/codx-fd/src/lib/setting/feedback-message/pattern/pattern.component';
//import { EditPatternComponent } from 'projects/codx-fd/src/lib/setting/feedback-message/pattern/edit-pattern/edit-pattern.component';

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

const T_Component: Type<any>[] = [
  CatagoryComponent,
  SubCategoryComponent,
  PatternComponent,
  EditPatternComponent,
];

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
    CodxShareModule,
    CodxCoreModule,
    RouterModule.forChild(routes),
  ],
  exports: [T_Component, T_Pipe],
})
export class DynamicSettingModule {
  public static forRoot(
    config?: EnvironmentConfig
  ): ModuleWithProviders<CodxCoreModule> {
    return {
      ngModule: CodxCoreModule,
      providers: [
        HttpClientModule,
        { provide: EnvironmentConfig, useValue: config },
      ],
    };
  }
}
