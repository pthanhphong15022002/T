import { NgModule, Type } from "@angular/core";
import { SelectScrollBarComponent } from "./components/select-scroll-bar/select-scroll-bar.component";
import { ScrollSpyDirective } from "./directives/scrollSpy/scroll-spy.directive";
import { CommonModule } from "@angular/common";
import { DirectivesModule } from "./directives/directives.module";
import { SeniorityPipe } from "./pipes/seniority-pipe.pipe";

const COMPONENT: Type<any>[] = [
  SelectScrollBarComponent,
  SeniorityPipe
  
];

const MODULES: Type<any>[] = [
  CommonModule,
  DirectivesModule
];
@NgModule({
  declarations: [COMPONENT],
  imports: [
    ...MODULES
  ],
  exports: [MODULES, ...COMPONENT],
})
export class CodxHRCommonModule { }
