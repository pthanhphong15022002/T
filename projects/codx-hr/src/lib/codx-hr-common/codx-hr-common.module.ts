import { NgModule, Type } from "@angular/core";
import { SelectScrollBarComponent } from "./components/select-scroll-bar/select-scroll-bar.component";
import { ScrollSpyDirective } from "./directives/scrollSpy/scroll-spy.directive";
import { CommonModule } from "@angular/common";
import { DirectivesModule } from "./directives/directives.module";
import { SeniorityPipe } from "./pipes/seniority-pipe.pipe";
import { GetHeaderTextPipe } from "./pipes/get-header-text.pipe";
import { TimeAgoPipe } from "./pipes/time-ago.pipe";
import { CodxCoreModule } from "codx-core";
import { CodxShareModule } from "projects/codx-share/src/public-api";
import { CodxCommonModule } from "projects/codx-common/src/public-api";
import { DatePipe } from "./pipes/date-time.pipe";
const COMPONENT: Type<any>[] = [
  SelectScrollBarComponent,
  SeniorityPipe,
  GetHeaderTextPipe,
  TimeAgoPipe,
  DatePipe
];

const MODULES: Type<any>[] = [
  CommonModule,
  DirectivesModule,
  CodxCoreModule,
  CodxShareModule,
  CodxCommonModule,
];

@NgModule({
  declarations: [COMPONENT],
  imports: [
    ...MODULES
  ],
  exports: [MODULES, ...COMPONENT],
})
export class CodxHRCommonModule { }
