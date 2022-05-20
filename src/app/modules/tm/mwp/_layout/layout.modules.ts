
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AssignModule } from '@modules/tm/assign/assign-routing.component';
import { SharedModule } from 'src/shared';
import { MwpModule } from '../mwp-routing.component';
import { LayoutComponent } from './layout.component';

@NgModule({
  declarations: [
    LayoutComponent,
  ],
  imports: [
    MwpModule,
    SharedModule,
  ],
  exports: [RouterModule],
})
export class LayoutModule { }
