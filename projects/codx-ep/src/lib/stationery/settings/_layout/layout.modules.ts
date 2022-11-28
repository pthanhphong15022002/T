import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/shared';
import { LayoutComponent } from './layout.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TabModule } from '@syncfusion/ej2-angular-navigations';

@NgModule({
  declarations: [
    LayoutComponent,
  ],
  imports: [FormsModule, ReactiveFormsModule, SharedModule, TabModule, CodxShareModule],
  exports: [RouterModule],
})
export class LayoutModule { }
