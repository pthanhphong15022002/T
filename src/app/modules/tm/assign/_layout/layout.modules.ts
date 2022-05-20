
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/shared';
import { AssignModule } from '../assign-routing.component';
import { LayoutComponent } from './layout.component';

@NgModule({
  declarations: [
    LayoutComponent,
  ],
  imports: [
    AssignModule,
    SharedModule
  ],
  exports: [RouterModule],
})
export class LayoutModule { }
