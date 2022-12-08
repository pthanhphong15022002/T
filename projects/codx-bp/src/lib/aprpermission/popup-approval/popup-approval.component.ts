import { BP_Processes, BP_ProcessPermissions } from './../../models/BP_Processes.model';
import { Component, OnInit, Optional } from '@angular/core';
import { AuthStore, DialogData, DialogRef, NotificationsService } from 'codx-core';
import { CodxBpService } from '../../codx-bp.service';

@Component({
  selector: 'lib-popup-approval',
  templateUrl: './popup-approval.component.html',
  styleUrls: ['./popup-approval.component.css'],
})
export class PopupApprovalComponent implements OnInit {
  dialog: any;
  title = 'Xét duyệt'; //Đang gắn cứng
  comment = '';
  statusDefault = '3';
  vllStatus = 'BP003';
  data: any;
  recIDProcess: any;
  user: any;
  funcID = '';
  entity = '';
  dg: any;
  permission = new BP_ProcessPermissions();
  process = new BP_Processes();
  constructor(
    private auth: AuthStore,
    private bpSv: CodxBpService,
    private noti: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef) {
    this.dialog = dialog;
    this.dg = dt?.data;
    this.data = JSON.parse(JSON.stringify(dt?.data.data));
    this.recIDProcess = this.data.recIDProcess;
    this.funcID = this.dg.formModel.funcID;
    this.entity = this.dg.formModel.entityName;
    this.permission = this.data;
    this.user = this.auth.get();
  }

  ngOnInit(): void {
    this.bpSv.loadProcess(this.recIDProcess).subscribe(res=>{
      if(res){
        this.process = res;
      }
    })
  }

  onSave() {
    debugger
    this.process.recID = this.recIDProcess;
    this.permission.approveStatus = '3';
    this.permission.approvedBy = this.user.userID;
    // this.process.permissions.push(this.permission);
    this.bpSv.setApproveStatus(this.recIDProcess, this.permission, this.funcID, this.entity).subscribe(res =>{
      if(res){
        this.dialog.close(res);
        this.noti.notifyCode('SYS034');
      }
    })
  }
  setComment(e) {
    this.permission.memo = e.data;
  }


}
