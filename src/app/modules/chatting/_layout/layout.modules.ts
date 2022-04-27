import { SharedModule } from './../../../../shared/shared.module';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PagesRoutingModule } from '../chatting-routing.module';
import { LayoutComponent } from './layout.component';


@NgModule({
  declarations: [
    LayoutComponent,
  ],
  imports: [
    SharedModule,
    PagesRoutingModule,
  ],
  exports: [RouterModule],
})
export class LayoutModule { }
