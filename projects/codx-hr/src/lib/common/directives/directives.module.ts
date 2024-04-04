import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SwiperClickingDirective } from './SwiperClicking/swiper-clicking.directive';

const COMPONENT: Type<any>[] = [
  SwiperClickingDirective,
];

const MODULES: Type<any>[] = [

];
@NgModule({
declarations: [COMPONENT],
imports: [
  CommonModule,
  ...MODULES
],
exports: [MODULES, ...COMPONENT],
})
export class DirectivesModule { }
