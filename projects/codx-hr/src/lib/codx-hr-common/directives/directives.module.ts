import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SwiperClickingDirective } from './SwiperClicking/swiper-clicking.directive';
import { SidebarToggleDirective } from './SidebarToggle/sidebar-toggle.directive';
import { ScrollSpyDirective } from './scrollSpy/scroll-spy.directive';

const COMPONENT: Type<any>[] = [
  SwiperClickingDirective,
  SidebarToggleDirective,
  ScrollSpyDirective
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
