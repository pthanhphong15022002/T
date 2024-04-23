import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DialogDetailRegisterApproveComponent } from '../dialog-detail-register-approve/dialog-detail-register-approve.component';
import { Thickness } from 'ngx-basic-primitives';

@Component({
  selector: 'lib-dashboard-register-aprrove',
  templateUrl: './dashboard-register-aprrove.component.html',
  styleUrls: ['./dashboard-register-aprrove.component.scss']
})
export class DashboardRegisterAprroveComponent {
  @ViewChild('dialog') dialog: DialogDetailRegisterApproveComponent;

  @Output() handleRegisterApprove = new EventEmitter();
  @Output() handleReviewRegisterApprove = new EventEmitter();
  @Output() handleWaitingRegisterApprove = new EventEmitter();

  public primaryXAxis?: Object;
  public chartData?: Object[];
  public title?: string;
  primaryYAxis: any;
  public chartArea: Object = {
    border: {
      width: 0
    },

  }
  columnData: Object[]= [
    { date: '23/02', In: 20, Out: 10 },
    { date: '24/02', In: 5, Out: 20 },
    { date: '25/02', In: 10, Out: 15 },
    { date: '26/02', In: 15, Out: 15 },
    { date: '27/02', In: 10, Out: 14 },
    { date: '28/02', In: 5, Out: 8 },
    { date: '29/02', In: 10, Out: 7 },
  ];
  ngOnInit(): void {
    console.log(this.handleRegisterApprove)
    this.chartData = this.columnData;
    this.primaryXAxis = {
       valueType: 'Category',
       title: '',
       majorGridLines: { width: 0 },
       majorTickLines: { width: 0 },
       lineStyle: {width: 0}
    };
    this.primaryYAxis = {
        minimum: 0, maximum: 20,
        interval: 5, title: '',
        majorGridLines: { width: 0 },
        majorTickLines: { width: 0 },
        lineStyle: {width: 0}
    };
  }

  open(){
    this.handleRegisterApprove.emit(null)
    //this.dialog.onOpenDialog(event);
  }

  open2(){
    // this.handleRegisterApprove.emit(null)

    this.handleReviewRegisterApprove.emit(null)
  }

  open3(){
    // this.handleRegisterApprove.emit(null)

    this.handleWaitingRegisterApprove.emit(null)
  }

}
