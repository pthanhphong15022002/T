import { TmModule } from '../tm-routing.module';
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/shared';
import { LayoutComponent } from './layout.component';


@NgModule({
  declarations: [
    LayoutComponent,
  ],
  imports: [
    TmModule,
    SharedModule
  ],
  exports: [RouterModule],
})
export class LayoutModule { }
