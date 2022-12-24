import { AfterViewInit, Component, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApiHttpService, AuthStore, DialogData, DialogRef, FormModel } from 'codx-core';
import { share } from 'rxjs';
import { OMCONST } from '../../codx-om.constant';
import { CodxOmService } from '../../codx-om.service';

@Component({
  selector: 'lib-okr-add',
  templateUrl: './okr-add.component.html',
  styleUrls: ['./okr-add.component.css']
})
export class OkrAddComponent implements OnInit , AfterViewInit{

  dataOKR : any;
  data : any;
  dialog : any;
  headerText = "Thêm mới mục tiêu";
  type:any = "add";
  gridView: any;
  formModel: any;
  okrAddGroup: FormGroup;
  ops = ['q'];
  date = new Date();
  parentID: any;
  userID:any;
  objRequied = [];
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
    private auth: AuthStore,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    if(dt?.data[0]) this.gridView = dt?.data[0];
    if(dt?.data[1]) this.formModel = dt?.data[1];
    if(dt?.data[2]) this.type = dt?.data[2];
    if(dt?.data[3]) this.parentID = dt?.data[3];
    if(this.type == "edit") {
      this.headerText = "Chỉnh sửa mục tiêu"
      this.dataOKR =  dt?.data[4];
    }
   }
  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    this.userID = this.auth.get().userID;
    //Tạo formGroup
    this.okrAddGroup = this.formBuilder.group({
      shares: '9',
    });
    if(this.type == "add")
    {
     this.dataOKR = {
      okrName : "",
      note: "",
      owner: this.userID
     }
    }
    else
    {
      this.okrAddGroup.setValue({shares:this.dataOKR.visibility})
    }
    this.getKeyRequied();
  }

  changeCalendar(e:any)
  {
    this.dataOKR.periodID = e?.text;
  }

  getKeyRequied() {
    var objKey = Object.keys(this.gridView);
    for (var i = 0; i < objKey.length; i++) {
      if (this.gridView[objKey[i]].isRequire)
        this.objRequied.push(objKey[i]);
    }
  }

  onSaveForm(){
    this.dataOKR.visibility = this.okrAddGroup.value.shares;

    //Thêm
    if(this.type == "add")
    {
      if(this.formModel.functionID == OMCONST.FUNCID.Company)
        this.dataOKR.oKRLevel = "1";
      else if(this.formModel.functionID == OMCONST.FUNCID.Department)
        this.dataOKR.oKRLevel = "3";
      else if(this.formModel.functionID == OMCONST.FUNCID.Team)
        this.dataOKR.oKRLevel = "5";
      else if(this.formModel.functionID == OMCONST.FUNCID.Person)
        this.dataOKR.oKRLevel = "9";
      this.dataOKR.interval = "Q";
      this.dataOKR.parentID = this.parentID;
      this.codxOmService.addOKR(this.dataOKR).subscribe();
    }
    else
    {
      this.codxOmService.updateOKR(this.dataOKR).subscribe();
    }
  }
}
