import { Component } from '@angular/core';

@Component({
  selector: 'lib-profile-dashboard-leave',
  templateUrl: './profile-dashboard-leave.component.html',
  styleUrls: ['./profile-dashboard-leave.component.scss'],
})
export class ProfileDashboardLeaveComponent {
  lstOfLeaves = [
    {
      color: '#005DC7',
      Name: 'Tiêu chuẩn năm',
      Day: 12,
    },
    {
      color: '#F64E60',
      Name: 'Còn năm trước',
      Day: 4,
    },
    {
      color: '#FFA800',
      Name: 'Còn năm nay',
      Day: 12,
    },
    {
      color: '#1BC5BD',
      Name: 'Số ngày đã nghỉ',
      Day: 2,
    },
  ];
}
