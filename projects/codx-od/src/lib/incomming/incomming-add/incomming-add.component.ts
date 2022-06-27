
import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import { ApiHttpService, CallFuncService, DialogData, DialogRef, NotificationsService } from 'codx-core';

import { FormControl, FormGroup } from '@angular/forms';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { DispatchService } from '../../services/dispatch.service';
import { getJSONString } from '../../function/default.function';

@Component({
  selector: 'app-imcomming-add',
  templateUrl: './incomming-add.component.html',
  styleUrls: ['./incomming-add.component.scss'],
})
export class IncommingAddComponent implements OnInit {
  getJSONString =  getJSONString
  @ViewChild('attachment') attachment: AttachmentComponent
  @ViewChild('tmpagency') tmpagency: AnalyserNode;
  data: any = {};
  dialog: any;
  activeAngecy      = 1;
  showAgency        = false;
  idAgency          : any ;
  dispatch : any;
  headerText : any;
  gridViewSetup :any;
  type: any;
  formModel : any;
  fileCount : number = 0;
  files: any;
  hideThumb = false;
  dispatchForm = new FormGroup({
    agency: new FormControl(),
    title : new FormControl()
  });
  constructor(
    private api: ApiHttpService,
    private odService: DispatchService,
    private notifySvr: NotificationsService,
    private callfunc: CallFuncService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  {
    this.data = dt?.data;
    this.dialog = dialog;
  }
  public disEdit: any;
  ngOnInit(): void {
    this.headerText = this.data.headerText;
    if(this.data.data) this.dispatch = this.data.data;
    else this.dispatch = this.dialog.dataService.dataSelected;
    this.dispatch.status = '1';
    //this.dialog.dataService.apiSave = (t, data) = this.api.execSv<any>('TM', 'TM', 'TaskBusiness', 'TestApiBool', this.data);
   /*  this.dialog.dataService.apiUpdate = this.api.execSv<any>(
      'TM',
      'TM',
      'TaskBusiness',
      'TestApiBool',
      this.data
    ); */
    this.gridViewSetup = this.data["gridViewSetup"];
    this.headerText = this.data["headerText"];
    this.type = this.data["type"];
    this.formModel = this.data["formModel"];
    if(this.type == "edit")
      {
        this.odService.getDetailDispatch(this.data.data.recID).subscribe(item=>{
          this.files = item.files;
        })
      }
  }

  fileAdded(event:any) { 
    if(event?.data) this.hideThumb = true  
  }

 //Mở form thêm mới đơn vị / phòng ban
 openFormAgency(action:any) 
 {
   if(action == "agency")
   {
      this.callfunc.openForm(this.tmpagency,null,500,600);  
    /*  this.callfc.openForm(DepartmentComponent, "Thêm mới phòng ban", 500, 700, null, this.idAgency).subscribe((dialog: any) => {
       dialog.close = this.closeDept;
     }); */
   }
   else {
     /* this.callfc.openForm(AgencyComponent, "Thêm đơn vị nhận", 500, 700, null, null).subscribe((dialog: any) => {
       dialog.close = this.closeAgency;
     }); */
   }
 }

  valueChange(evt: any) {
    this.data[evt.field] = evt.data;
  }

  saveForm() {
    this.dialog.dataService.save().subscribe();
  }

  save2() {
    this.api
      .execSv<any>('TM', 'TM', 'TaskBusiness', 'TestApiAsync')
      .subscribe((res) => {
        this.dialog.dataService.add(res).subscribe();
      });
  }

  hideDept()
  {
    this.showAgency = false;
    this.idAgency = null;
  }

  changeValueDept(event: any) {
    this.dispatch.agencyID = event[0];
  }
    //Lưu văn bản
  changeValueAgencyText(event: any) {
    this.dispatch.agencyName = event.data
  }
  changeValueCategory(event: any) {
    this.dispatch.category = event
  }
  changeValueSource(event: any) {
    this.dispatch.source = event
  }
  // Số văn bản
  changeValueRefNo(event: any) {
    this.dispatch.refNo = event.data;
  }
   //Ngày văn bản
   changeValueRefDate(event: any) {
    this.dispatch.refDate = event?.data?.fromDate
  }
  //Số trang
  changeValuePage(event: any) {
    this.dispatch.rages = event.data.value;
  }
  changeValueCopies(event: any) {
   this.dispatch.copies = event.data.value
  }
  
  changeValueTags(event: any) {
    if(event.data.value)
      this.dispatch.title = event.data.value
    else this.dispatch.title = event.data
  }
  changeValueUrgency(event: any) {
    this.dispatch.urgency = event
  }
  changeValueSecurity(event: any) {
    this.dispatch.security = event
  }
  //Hình thức nhận
  changeValueSendMode(event: any) {
    this.dispatch.sendMode = event
  }
  //Ngày nhận
  changeValueDispatchOn(event: any) {
    this.dispatch.dispatchOn = event?.data?.fromDate
  }
  //Ngày đến hạn
  changeValueDeadLine(event: any) {
    this.dispatch.deadline = event?.data?.fromDate
  }
  
  //Người chịu trách nhiệm
  changeValueOwner(event: any) {
    debugger;
    this.dispatch.owner = event.data[0]
  }
  //Nơi nhận
  changeValueBUID(event: any, component: any = null) {
    debugger;
    this.dispatch.deptID = event.data[0];
    if (event.data[0] != "" && event.data[0] != null) {
     this.api.execSv("HR", "ERM.Business.HR", "OrganizationUnitsBusiness", "GetUserByDept", [event.data[0], null, null]).subscribe((item: any) => {
        if (item != null && item.length > 0) {
          this.dispatch.owner = item[0].domainUser;
        }
        else {
          this.dispatch.Owner = "";
        }
      })
    } 

  }
  openFormUploadFile()
  {
    // var obj = new dispatch;
    // obj.DeptID = "1";
    // this.odService.SaveAgency1(obj).subscribe(item => {
    //   console.log(item);
    // });
    this.attachment.uploadFile();
  }
   //Các hàm value change 
   changeValueAgency(event: any) 
   {
    if(event.component.itemsSelected!=null && event.component.itemsSelected.length >0)
    {
      this.dispatch.agencyID = event.component.itemsSelected[0].AgencyID;
      this.dispatch.agencyName = event.component.itemsSelected[0].AgencyName;
      if(this.dispatch.agencyID != this.dispatch.agencyName) this.showAgency = true;
    }
  }

  /////// lưu/câp nhật công văn
  onSaveDispatch() {
    this.dispatch.Status = "1",
    this.dispatch.ApproveStatus = "1",
    this.dispatch.DispatchType = "1";
    delete this.dispatch.isNew;
    delete this.dispatch.__loading;
    delete this.dispatch._uuid;
    //this.dispatch.Title = this.dispatchForm.value.title;
    if(this.dispatch.dispatchOn == undefined) this.dispatch.dispatchOn = new Date();
    // this.dispatch.RecID = this.dialog.dataService.dataSelected._uuid;
    //this.dialog.dataService.dataSelected = this.dispatch;
    //this.dialog.dataService.save().subscribe();
    if(this.type == "add" || this.type == "copy")
    {
      if(this.fileCount > 0)
      {
        if(this.type == "copy")
        {
          this.dispatch.relations= null;
          this.dispatch.permissions = null;
          delete this.dispatch.id
        }
        this.odService.saveDispatch(this.dispatch).subscribe((item) => {
          if (item.status == 0) {
            //this.listview.addHandler(item.data, true, "recID");
            /* if(this.fileAdd!= undefined && this.fileAdd!= null && this.fileAdd.length >0)
            {
              this.fileAdd.forEach((elm)=>{
                this.fileService.updateFileByObjectIDType(elm.objectId,item.data.recID,"OD_Dispatches").subscribe((item)=>{
                  //console.log(item);
                })
              })
            }
            this.fileAdd = null; 
            //this.dialog.dataService.add(item,0,true).subscribe();*/
            //this.attachment.saveFiles();
            //this.dialog.dataService.setDataSelected(item.data);
            this.attachment.objectId = item.data.recID;
            this.attachment.saveFiles();
            this.dialog.close(item.data);
          }
          this.notifySvr.notify(item.message); 
        })
      }
      else this.notifySvr.notifyCode("DM001");
     
    }
    if(this.type == "edit")
    {
      let dltDis = true;
      if(this.fileCount == 0) dltDis = false; 
      this.odService.updateDispatch(this.dispatch , dltDis).subscribe((item) => {
        if (item.status == 0) {
          this.attachment.objectId = item.data.recID;
          if(dltDis) this.attachment.saveFiles();
          this.dialog.close(item.data);
        }
        this.notifySvr.notify(item.message); 
      })
    } 
  }
  getfileCount(e:any)
  {
    this.fileCount = e;
  }
 
}
