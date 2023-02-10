import { Component, OnInit, Optional } from '@angular/core';
import { CacheService, DialogData, DialogRef } from 'codx-core';
import { CodxDpService } from '../../codx-dp.service';
import { DP_Instances, DP_Instances_Steps, DP_Steps_Reasons } from '../../models/models';

@Component({
  selector: 'lib-popup-move-reason',
  templateUrl: './popup-move-reason.component.html',
  styleUrls: ['./popup-move-reason.component.css']
})
export class PopupMoveReasonComponent implements OnInit {

  dialog: any;
  formModel:any;
  listCbxProccess:any;
  stepReason:any;

  headerText: string = '';
  instancesName: string = '';
  viewKanban: string = 'kanban';
  viewClick: string = '';
  titleReasonClick: string = '';

  listReason: DP_Steps_Reasons[]=[];



  instanceStep = new DP_Instances_Steps;
  instance = new DP_Instances;

  readonly fieldCbxProccess = { text: 'processName', value: 'recID' };
  readonly guidEmpty: string ='00000000-0000-0000-0000-000000000000'; // for save BE

  constructor(
    private cache: CacheService,
    private dpService: CodxDpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef,


  ) {

    this.dialog = dialog;
    this.formModel = dt?.data.formModel;
    this.instancesName = dt?.data.instancesName;
    this.headerText = dt?.data.dataMore.description;
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
  loadCbxProccess() {
    this.cache.valueList('DP031').subscribe((data) => {
      this.dpService.getlistCbxProccess().subscribe((res) => {
        if (res) {
          this.listCbxProccess = res[0];
          var obj = {
            recID: this.guidEmpty,
            processName: data.datas[0].default
             // 'Không chuyển đến quy trình khác'
          };
          this.listCbxProccess.unshift(obj);
        }
      });
    });

  }

  onSave(){

  }

  valueChange($event){

  }

  changeTime($event){

  }

  cbxChange($event) {
    // if($event){
    //   this.stepReason.newProcessID = $event;
    // }

  }
}

