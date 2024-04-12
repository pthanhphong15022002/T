import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'lib-my-tem',
  templateUrl: './my-tem.component.html',
  styleUrls: ['./my-tem.component.scss'],
})
export class MyTemComponent {
  selectedTabs = 0; // 0: quản lý trực tiếp ; 1:Quản lý gián tiếp; 3:Team của tôi;

  @Input() mainContent_Id = 'maincontent';

  /* status : 1 - active, 2 - off, 3- busy */
  @Input() dataMyTeam = [
    {
      id: '1',
      name: 'Huỳnh Phước Hòa',
      job: 'Phát triển phần mềm',
      YOW: '15 năm 9 tháng 0 ngày',
      status: '1',
    },
    {
      id: '1',
      name: 'Huỳnh Phước Hòa',
      job: 'Phát triển phần mềm',
      YOW: '15 năm 9 tháng 0 ngày',
      status: '1',
    },
    {
      id: '1',
      name: 'Huỳnh Phước Hòa',
      job: 'Phát triển phần mềm',
      YOW: '15 năm 9 tháng 0 ngày',
      status: '1',
    },
    {
      id: '1',
      name: 'Huỳnh Phước Hòa',
      job: 'Phát triển phần mềm',
      YOW: '15 năm 9 tháng 0 ngày',
      status: '1',
    },
    {
      id: '1',
      name: 'Huỳnh Phước Hòa',
      job: 'Phát triển phần mềm',
      YOW: '15 năm 9 tháng 0 ngày',
      status: '1',
    },
    {
      id: '1',
      name: 'Huỳnh Phước Hòa',
      job: 'Phát triển phần mềm',
      YOW: '15 năm 9 tháng 0 ngày',
      status: '1',
    },
  ];
}
