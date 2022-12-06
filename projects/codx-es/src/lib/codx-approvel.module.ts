import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CodxApprovalComponent } from 'projects/codx-share/src/lib/components/codx-approval/codx-approval.component';
import { ODApprovelComponent } from 'projects/codx-od/src/lib/incomming/approvel/approvel.component';
import { ODTestDetailComponent } from 'projects/codx-od/src/lib/incomming/test/test.component';
import { ESApprovelComponent } from './sign-file/approval/approval.component';
import { BookingRoomViewDetailComponent } from 'projects/codx-ep/src/lib/room/booking/view-detail/booking-room-view-detail.component';
import { BookingCarViewDetailComponent } from 'projects/codx-ep/src/lib/car/booking/view-detail/booking-car-view-detail.component';
import { BookingStationeryViewDetailComponent } from 'projects/codx-ep/src/lib/stationery/booking/view-detail/view-detail.component';

const routes: Routes = [
  {
    path: '',
    component: CodxApprovalComponent,
    children: [
      {
        path: 'dispatches/:funcID/:id',
        component: ODApprovelComponent,
      },
      {
        path: 'tasks/:funcID/:id',
        component: ODTestDetailComponent,
      },
      {
        path: 'signfiles/:funcID/:id',
        component: ESApprovelComponent,
      },
      {
        path: 'bookingcars/:funcID/:id',
        component: BookingCarViewDetailComponent,
      },
      {
        path: 'bookingrooms/:funcID/:id',
        component: BookingRoomViewDetailComponent,
      },
      {
        path: 'bookingstationery/:funcID/:id',
        component: BookingStationeryViewDetailComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class ApprovelModule {}
