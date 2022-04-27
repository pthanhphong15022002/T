import { CalendarModule } from '@syncfusion/ej2-angular-calendars';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { InlineSVGModule } from 'ng-inline-svg';
import { CodxCoreModule } from 'codx-core';
import { environment } from 'src/environments/environment';

@NgModule({
  declarations: [
    HomeComponent,
  ],
  imports: [
    CommonModule,
    CalendarModule,
    CodxCoreModule.forRoot({ environment }),
    RouterModule.forChild([
      {
        path: '',
        component: HomeComponent,
      },
      {
        path: 'wp',
        loadChildren: () =>
          import('../../modules/wp/_layout/layout.modules').then((m) => m.LayoutModule),
      },
    ]),
    InlineSVGModule,
  ],
})
export class HomeModule { }
