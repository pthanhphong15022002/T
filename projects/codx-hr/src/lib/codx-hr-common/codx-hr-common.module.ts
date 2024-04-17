import { NgModule, Type } from "@angular/core";
import { SelectScrollBarComponent } from "./components/select-scroll-bar/select-scroll-bar.component";
import { ScrollSpyDirective } from "./directives/scrollSpy/scroll-spy.directive";
import { CommonModule } from "@angular/common";

const COMPONENT: Type<any>[] = [
  SelectScrollBarComponent,
  
];

const MODULES: Type<any>[] = [
  CommonModule
];
@NgModule({
  declarations: [COMPONENT],
  imports: [
    ...MODULES
  ],
  exports: [MODULES, ...COMPONENT],
})
export class CodxHRCommonModule { }
