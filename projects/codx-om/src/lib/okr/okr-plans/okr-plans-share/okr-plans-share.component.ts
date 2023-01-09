import { AfterViewInit, Component, OnInit, Optional } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import {  AuthStore, DialogData, DialogRef, NotificationsService } from 'codx-core';
import { OMCONST } from '../../../codx-om.constant';
import { CodxOmService } from '../../../codx-om.service';

@Component({
  selector: 'lib-okr-plans-share',
  templateUrl: './okr-plans-share.component.html',
  styleUrls: ['./okr-plans-share.component.css']
})
export class OkrPlanShareComponent implements OnInit , AfterViewInit{

  dialog : any;
  headerText = "Chia sẻ bộ mục tiêu";
  type:any = "add";
  gridView: any;
  formModel: any;
  okrPlans: any;
  userID:any;
  objRequied = [];
  shareGroup : FormGroup
  data =
  {
    from : [],
    to : []
  }
  //Chờ c thương thiết lập vll
  //Giả lập vll
  //OM003
  vll={
    datas : [
      {
        value: "9",
        text: "Tất cả",
        icon: "All.svg"
      },
      {
        value: "4;P",
        text: "Phòng & Quản lý của tôi",
        icon: "MyDeptManagement.svg"
      },
      {
        value: "4",
        text: "Phòng của tôi",
        icon: "MyDept.svg"
      },
      {
        value: "P",
        text: "Quản lý của tôi",
        icon: "MyManagement.svg"
      }
    ]
  }
  constructor(
    private codxOmService: CodxOmService,
    private formBuilder: FormBuilder,
    private notifySvr: NotificationsService,
    private auth: AuthStore,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    debugger;
    this.dialog = dialog;
    if(dt?.data[0]) this.gridView = dt?.data[0];
    if(dt?.data[1]) this.formModel = dt?.data[1];
    if(dt?.data[2]) this.okrPlans = dt?.data[2];
   }
  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    this.userID = this.auth.get().userID;
    //this.getKeyRequied();
    this.shareGroup = this.formBuilder.group({
      note:'',
      write: false,
      share: false,
      startedOn: null,
      expiredOn: null
    });
  }
 

  changeInput(value:any ,type:any)
  {
    debugger;
    if(!value?.data) return;
    if(type=='from') this.data.from = value?.data; 
    else this.data.to = value?.data
  }
  getKeyRequied() {
    var objKey = Object.keys(this.gridView);
    for (var i = 0; i < objKey.length; i++) {
      if (this.gridView[objKey[i]].isRequire)
        this.objRequied.push(objKey[i]);
    }
  }

  checkRequied()
  {
    var arr = [];
    if(this.data.from.length == 0) arr.push('đến');
    if(!this.shareGroup.value.note) arr.push('nội dung');

    if(arr.length > 0)
    {
      var txt = arr.join(" , ");
      this.notifySvr.notifyCode('SYS009', 0, txt);
      return true;
    }
    return false;
  }

  onSaveForm(){
    if(this.checkRequied()) return;
    var listUser = this.data.from.concat(this.data.to) as any[];
    var okrsShares = [];
    for(var i = 0 ; i< listUser.length ; i++)
    {
      var o = {
        objectType : listUser[i].objectType,
        objectID : listUser[i].id,
        permission: "2", //readonly
        read: 1,
        write: this.shareGroup.value.write ? 1 : 0,
        share: this.shareGroup.value.share ? 1 : 0,
        startedOn: this.shareGroup.value.startedOn,
        expiredOn: this.shareGroup.value.expiredOn,
        note: this.shareGroup.value.note
      }
      okrsShares.push(o);
    }
    this.codxOmService.shareOKRPlans(this.okrPlans.recID,okrsShares).subscribe(item=>{
      var mess = "SYS016"
      if(item) mess = "SYS015"
      this.notifySvr.notifyCode(mess);
    })
  }

 
}
