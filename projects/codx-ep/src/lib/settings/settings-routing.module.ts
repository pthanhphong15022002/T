import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard, CodxCoreModule } from 'codx-core';
import { environment } from 'src/environments/environment';
import { CarResourceComponent } from './cars/cars.component';
import { DriverResourceComponent } from './drivers/drivers.component';
import { RoomsComponent } from './rooms/rooms.component';
import { TypesComponent } from './types/types.component';
import { LayoutComponent } from './_layout/layout.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'drivers',
        component: DriverResourceComponent,
      },

      {
        path: 'type',
        component: TypesComponent,
      },
      {
        path: 'rooms',
        component: RoomsComponent,
      },
      {
        path: 'cars',
        component: CarResourceComponent,
      },
      {
        path: '',
        redirectTo: 'rooms',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'error/404',
      },
    ],
  },
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(routes),
    CodxCoreModule.forRoot({ environment }),
  ],
  exports: [RouterModule],
})
export class SettingsRoutingModule {}
