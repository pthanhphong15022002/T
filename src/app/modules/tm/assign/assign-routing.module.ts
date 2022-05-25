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
import { LayoutComponent } from "../_layout/layout.component";
import { AssignComponent } from "./assign.component";
import { HomeComponent } from "./home/home.component";
import { ViewListDetailsComponent } from "./view-list-details/view-list-details.component";


const routes: Routes = [
    {
      path: '',
      component: LayoutComponent,
      children: [
        {
          path: '',
          component: AssignComponent,
        },
        {
          path: 'home',
          component: HomeComponent,
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
        AssignComponent,
        ViewListDetailsComponent,HomeComponent
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
  export class AssignModule { }