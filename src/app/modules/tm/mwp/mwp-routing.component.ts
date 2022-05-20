import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { SharedModule } from "@shared/shared.module";
import { DatePickerModule } from "@syncfusion/ej2-angular-calendars";
import { AccumulationChartAllModule, ChartAllModule } from "@syncfusion/ej2-angular-charts";
import { TabModule } from "@syncfusion/ej2-angular-navigations";
import { ProgressBarModule } from "@syncfusion/ej2-angular-progressbar";
import { CodxCoreModule } from "codx-core";
import { environment } from "src/environments/environment";
import { MwpComponent } from "./mwp.component";
import { ViewListDetailsComponent } from "./view-list-details/view-list-details.component";
import { LayoutComponent } from "./_layout/layout.component";

const routes: Routes = [
    {
      path: '',
      component: LayoutComponent,
      children: [
        {
          path: '',
          component: MwpComponent,
        },
        {
            path: 'assign',
            component: ViewListDetailsComponent,
          },
        {
          path: '**',
          redirectTo: 'error/404',
        },
      ],
    },
  ];
  @NgModule({
    declarations: [
        MwpComponent,
        ViewListDetailsComponent
    ],
    imports: [
      RouterModule.forChild(routes),
      FormsModule,
      CodxCoreModule.forRoot({ environment }),
      CommonModule,
      SharedModule,
      ChartAllModule,
      AccumulationChartAllModule,
      ProgressBarModule,
      DatePickerModule,TabModule
    ],
    exports: [RouterModule],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
  })
  export class MwpModule { }