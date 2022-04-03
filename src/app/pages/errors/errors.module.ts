import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ErrorsRoutingModule } from './errors-routing.module';
import { ErrorsComponent } from '../errors/errors.component';
import { Error404Component } from './error404/error404.component';
import { Error500Component } from './error500/error500.component';
import { Error401Component } from './error401/error401.component';


@NgModule({
  declarations: [
    ErrorsComponent,
    Error401Component,
    Error404Component,
    Error500Component
  ],
  imports: [
    CommonModule,
    ErrorsRoutingModule
  ]
})
export class ErrorsModule { }
