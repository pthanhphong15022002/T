import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ViewModel, ViewType } from 'codx-core';

@Component({
  selector: 'lib-task-daily',
  templateUrl: './task-daily.component.html',
  styleUrls: ['./task-daily.component.css']
})
export class TaskDailyComponent implements OnInit {
  @ViewChild("itemDueDate", { static: true }) itemDueDate: TemplateRef<any>;
  @ViewChild("GiftIDCell", { static: true }) GiftIDCell: TemplateRef<any>;
  @ViewChild("itemCreate", { static: true }) itemCreate: TemplateRef<any>;
  @ViewChild("itemOwner", { static: true }) itemOwner: TemplateRef<any>;
  @ViewChild("itemStatusVll", { static: true }) itemStatusVll: TemplateRef<any>;
  @ViewChild("itemMemo", { static: true }) itemMemo: TemplateRef<any>;
  @ViewChild("itemCompletedOn", { static: true }) itemCompletedOn: TemplateRef<any>;
  @ViewChild("itemActive", { static: true }) itemActive: TemplateRef<any>;
  constructor() { }

  columnsGrid = [];
  views: Array<ViewModel> = [];

  ngOnInit(): void {
    this.columnsGrid = [
      { field: 'priority', headerText: '', template: this.GiftIDCell, width: 30 },
      { field: 'taskName', headerText: 'Tên công việc', width: 150 },
      { field: 'status', headerText: 'Tình trạng', template: this.itemStatusVll, width: 120 },
      { field: 'memo', headerText: 'Mổ tả công việc', template: this.itemMemo, width: 140 },
      { field: 'owner', headerText: 'Người thực hiện', template: this.itemOwner, width: 200 },
      { field: 'dueDate', headerText: 'Ngày hết hạn', template: this.itemDueDate, width: 140 },
      { field: 'completedOn', headerText: 'Ngày hoàn tất', template: this.itemCompletedOn, width: 140 },
      { field: 'taskGroupName', headerText: 'Nhóm công việc', width: 180 },
      { field: 'projectName', headerText: 'Dự án', width: 180 },
      { field: 'active', headerText: 'Hoạt động', template: this.itemActive, width: 150 },
      { field: 'buid', headerText: 'Bộ phận người thực hiện', width: 140 }
    ];
  }

  ngAfterViewInit(): void {
    this.views = [{
      type: ViewType.grid,
      sameData: true,
      active: true,
      model: {
        resources: this.columnsGrid,
      }
    }];
  }

  popoverList: any;
  popoverDetail: any;
  PopoverDetail(p: any, emp) {
    if (emp != null) {
      this.popoverList?.close();
      this.popoverDetail = emp;
      if (emp.memo != null || emp.memo2 != null)
        p.open();
    }
    else
      p.close();
  }
} 
