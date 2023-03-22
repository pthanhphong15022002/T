import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'lib-codx-table',
  templateUrl: './codx-table.component.html',
  styleUrls: ['./codx-table.component.css']
})
export class CodxTableComponent implements OnInit {

  tabControl = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Comment', textDefault: 'Bình luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'References', textDefault: 'Liên kết', isActive: false },
    { name: 'AssignTo', textDefault: 'Giao việc', isActive: false },
    { name: 'Approve', textDefault: 'Xét duyệt', isActive: false },
  ];
  constructor() { }

  ngOnInit(): void {
  }

}
