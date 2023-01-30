import { Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';
import { DP_Instances, DP_Instances_Steps, DP_Steps_Reasons } from '../../models/models';

@Component({
  selector: 'lib-popup-move-reason',
  templateUrl: './popup-move-reason.component.html',
  styleUrls: ['./popup-move-reason.component.css']
})
export class PopupMoveReasonComponent implements OnInit {

  dialog: any;
  formModel:any;

  headerText: string = '';
  instancesName: string = '';
  viewKanban: string = 'kanban';
  viewClick: string = '';
  titleReasonClick: string = '';

  listReason: DP_Steps_Reasons[]=[];


  instanceStep = new DP_Instances_Steps;
  instance = new DP_Instances;

  constructor(

    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef

  ) {

    this.dialog = dialog;
    this.formModel = dt?.data.formModel;
    this.instancesName = dt?.data.instancesName;
    this.headerText = dt?.data.isReason? 'Đánh dấu thành công': 'Đánh dấu thất bại';
    this.titleReasonClick = dt?.data.isReason? 'Chọn lý do thành công': 'Chọn lý do thất bại';
    this.viewClick = this.viewKanban;


  }

  ngOnInit(): void {
    let test = new DP_Steps_Reasons();
    test.reasonName = 'Khách hàng thích sản phẩm mà công ty cung cấp';
    this.listReason.push(test);
    let test1 = new DP_Steps_Reasons();
    test1.reasonName = 'Khách hàng không cobnf lựa chọn nào khác';
    this.listReason.push(test1);
    let test2 = new DP_Steps_Reasons();
    test2.reasonName = 'Sản phẩm cônh ty cung cấp vượt mức mong đợi của khách hàng';
    this.listReason.push(test2);
    let test3 = new DP_Steps_Reasons();
    test3.reasonName = 'Khác';
    this.listReason.push(test3);
    console.log(this.listReason);

  }


  onSave(){

  }

  valueChange($event){

  }

  changeTime($event){

  }
}

