import { PopupAddCarsComponent } from './../cars/popup-add-cars/popup-add-cars.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/shared';
import { LayoutComponent } from './layout.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { CarResourceComponent } from '../cars/cars.component';
import { RoomsComponent } from '../rooms/rooms.component';
import { DialogDriverResourceComponent } from '../drivers/dialog/editor.component';
import { DriverResourceComponent } from '../drivers/drivers.component';
import { PopupAddRoomsComponent } from '../rooms/popup-add-rooms/popup-add-rooms.component';

@NgModule({
  declarations: [
    LayoutComponent,
    CarResourceComponent,
    PopupAddCarsComponent,
    RoomsComponent,
    PopupAddRoomsComponent,
    DialogDriverResourceComponent,
    DriverResourceComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    TabModule,
  ],
  exports: [RouterModule],
})
export class LayoutModule {}
