import { PopupAddCarsComponent } from './../cars/popup-add-cars/popup-add-cars.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/shared';
import { LayoutComponent } from './layout.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TabComponent } from '@syncfusion/ej2-angular-navigations';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { SettingsRoutingModule } from '../settings-routing.module';
import { CarResourceComponent } from '../cars/cars.component';
import { DialogRoomResourceComponent } from '../rooms/dialog/editor.component';
import { RoomsComponent } from '../rooms/rooms.component';
import { DialogDriverResourceComponent } from '../drivers/dialog/editor.component';
import { DriverResourceComponent } from '../drivers/drivers.component';
import { TypesComponent } from '../types/types.component';
import { DialogTypeResourceComponent } from '../types/dialog/dialog.component';

// import { EditRoomComponent } from '../room/edit-room/edit-room.component';

@NgModule({
  declarations: [
    LayoutComponent,
    CarResourceComponent,
    PopupAddCarsComponent,
    RoomsComponent,
    DialogRoomResourceComponent,
    DialogDriverResourceComponent,
    DriverResourceComponent,
    TypesComponent,
    DialogTypeResourceComponent,
  ],
  imports: [
    SettingsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    TabModule,
  ],
  exports: [RouterModule],
})
export class LayoutModule {}
