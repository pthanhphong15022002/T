import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InlineSVGModule } from 'ng-inline-svg';
import { EventComponent } from './event.component';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: EventComponent
      },
    ]),
    InlineSVGModule,
  ],
})
export class EventModule { }