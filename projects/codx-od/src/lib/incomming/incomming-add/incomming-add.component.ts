
import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import { ApiHttpService, CallFuncService, DialogData, DialogRef, NotificationsService } from 'codx-core';

import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
  @ViewChild('tmpagency') tmpagency: any;
  @ViewChild('tmpdept') tmpdept: any;
  @ViewChild('myform') myForm :any;
  submitted = false;
  checkAgenciesErrors = false;
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
  dispatchForm : FormGroup;
  constructor(
    private api: ApiHttpService,
    private odService: DispatchService,
    private notifySvr: NotificationsService,
    private callfunc: CallFuncService,
    private formBuilder: FormBuilder,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  {
    this.data = dt?.data;
    this.dialog = dialog;
  }
  public disEdit: any;
  ngOnInit(): void {
    //////////////Form Group///////////////////
   
    
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
    this.dispatchForm = this.formBuilder.group(
      {
        agencyID: [this.dispatch?.agencyID, Validators.required],
        agencyName: this.dispatch?.agencyName,
        category: this.dispatch?.category,
        source  : this.dispatch?.source,
        refNo : this.dispatch?.refNo,
        refDate: this.dispatch?.refDate == null ? new Date(): this.dispatch?.refDate,
        pages : this.dispatch?.pages,
        copies : this.dispatch?.copies,
        title: [this.dispatch?.title , Validators.required],
        urgency: this.dispatch?.urgency,
        security: this.dispatch?.security,
        deptID: [this.dispatch?.deptID,Validators.required],
        sendMode: this.dispatch?.sendMode,
        dispatchOn: [this.dispatch?.dispatchOn == null ? new Date(): this.dispatch?.dispatchOn, Validators.required ],
        deadline: [this.dispatch?.deadline , Validators.required ],
        owner: this.dispatch?.owner,
      }
    );
  }

  get f(): { [key: string]: AbstractControl } {
    return this.dispatchForm.controls;
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
    this.callfunc.openForm(this.tmpdept,null,500,600);  
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
    //this.dispatchForm.value.deptID = '';
    this.dispatchForm.controls.agencyID.setValue(null)
  }

  changeValueDept(event: any) {
    //this.dispatch.agencyID = event[0];
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
    this.dispatchForm.controls.deptID.setValue(event.data[0]);
    if (event.data[0] != "" && event.data[0] != null) {
     this.api.execSv("HR", "ERM.Business.HR", "OrganizationUnitsBusiness", "GetUserByDept", [event.data[0], null, null]).subscribe((item: any) => {
        if (item != null && item.length > 0) {
          this.dispatchForm.patchValue({
            owner : item[0].domainUser
          })
          //this.dispatchForm.controls.owner.setValue(item[0].domainUser)
        }
        else {
          this.dispatchForm.controls.owner.setValue("");
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
      if(event.component.itemsSelected[0].AgencyID!= undefined)
      {
        var data = event.component.itemsSelected[0];
        this.dispatchForm.controls.agencyID.setValue(data.AgencyID)
        this.dispatchForm.controls.agencyName.setValue(data.AgencyName)
      }
      else if(event.component.itemsSelected[0][0].AgencyID!= undefined)
      {
        var data = event.component.itemsSelected[0][0];
        this.dispatchForm.controls.agencyID.setValue(data.AgencyID)
        this.dispatchForm.controls.agencyName.setValue(data.AgencyName)
      }
      if(this.dispatchForm.value.agencyID!= this.dispatchForm.value.agencyName) 
      {
        this.showAgency = true;
        this.checkAgenciesErrors = false;
      }
    }
  }

  /////// lưu/câp nhật công văn
  onSaveDispatch() {
    this.submitted = true;
    if(this.dispatchForm.value.agencyID == null)  this.checkAgenciesErrors = true;
    if(this.dispatchForm.invalid || this.checkAgenciesErrors) return;
    /////////////////////////////////////////////////////////
    this.dispatchForm.value.deptID = this.dispatchForm.value.deptID.toString()
    this.dispatchForm.value.owner = this.dispatchForm.value.owner.toString();
    this.dispatchForm.value.agencyID = this.dispatchForm.value.agencyID.toString();
    
    delete this.dispatch.isNew;
    delete this.dispatch.__loading;
    delete this.dispatch._uuid;
    this.data = this.dispatchForm.value;
    if(this.type == "add" || this.type == "copy")
    {
      this.dispatchForm.value.RecID = this.dialog.dataService.dataSelected.recID;
      this.dispatchForm.value.Status = "1",
      this.dispatchForm.value.ApproveStatus = "1",
      this.dispatchForm.value.DispatchType = "1";
      if(this.fileCount > 0)
      {
        if(this.type == "copy")
        {
          /* this.dispatch.relations= null;
          this.dispatch.permissions = null;
          delete this.dispatch.id */
        }
        this.odService.saveDispatch(this.dispatchForm.value).subscribe((item) => {
          if (item.status == 0) {
            this.data = item;
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
      this.dispatchForm.value.Id = this.dispatch.id;
      this.dispatchForm.value.RefID = this.dispatch.refID;
      this.dispatchForm.value.RecID = this.dispatch.recID;
      this.dispatchForm.value.relations = this.dispatch.relations;
      this.dispatchForm.value.permissions = this.dispatch.permissions;
      this.dispatchForm.value.positionID = this.dispatch.positionID;
      this.dispatchForm.value.DivisionID =  this.dispatch.divisionID;
      this.dispatchForm.value.CompanyID =  this.dispatch.companyID;
      this.dispatchForm.value.Status = this.dispatch.status,
      this.dispatchForm.value.ApproveStatus = this.dispatch.approveStatus,
      this.dispatchForm.value.DispatchType = this.dispatch.dispatchType;
      this.dispatchForm.value.CreatedBy = this.dispatch.createdBy;
      this.odService.updateDispatch( this.dispatchForm.value , dltDis).subscribe((item) => {
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
  aaaa(data:any)
  {
    //array
    console.log(data?.dataSelected?.dataSelected)
  }
}
