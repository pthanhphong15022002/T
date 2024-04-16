import { NgModule, Type } from "@angular/core";

const COMPONENT: Type<any>[] = [

];

const MODULES: Type<any>[] = [
];
@NgModule({
  declarations: [COMPONENT],
  imports: [
    ...MODULES
  ],
  exports: [MODULES, ...COMPONENT],
})
export class CodxHRCommonModule { }
