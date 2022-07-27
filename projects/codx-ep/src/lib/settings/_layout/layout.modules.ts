import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { PopupAddCarsComponent } from './../cars/popup-add-cars/popup-add-cars.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/shared';
import { LayoutComponent } from './layout.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { PopupAddRoomsComponent } from '../rooms/popup-add-rooms/popup-add-rooms.component';

@NgModule({
  declarations: [
    LayoutComponent,
    PopupAddCarsComponent,
    PopupAddRoomsComponent,
  ],
  imports: [FormsModule, ReactiveFormsModule, SharedModule, TabModule, CodxShareModule],
  exports: [RouterModule],
})
export class LayoutModule { }
