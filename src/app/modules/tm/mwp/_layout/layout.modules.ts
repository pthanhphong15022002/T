
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/shared';
import { MwpModule } from '../mwp-routing.component';
import { LayoutComponent } from './layout.component';

@NgModule({
  declarations: [
    LayoutComponent,
  ],
  imports: [
    MwpModule,
    SharedModule
  ],
  exports: [RouterModule],
})
export class LayoutModule { }
