
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
    this.gridViewSetup = this.data["gridViewSetup"];
    this.headerText = this.data["headerText"];
    this.type = this.data["type"];
    this.formModel = this.data["formModel"];
    if(this.type == "add")
    {
      this.dispatch.refDate = new Date();
      this.dispatch.dispatchOn = new Date();
    }
    else if(this.type == "edit")
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


  hideDept()
  {
    this.showAgency = false;
    //this.dispatchForm.value.deptID = '';
    //this.dispatch.controls.agencyID.setValue(null)
  }

  changeValueDept(event: any) {
    this.dispatch.agencyID = event[0];
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
    this.dispatch.owner = event.data[0]
  }
  //Nơi nhận
  changeValueBUID(event: any, component: any = null) {
    /* this.dispatchForm.controls.deptID.setValue(event.data[0]);
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
    }  */
    
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
        //this.dispatchForm.controls.agencyID.setValue(data.AgencyID)
        //this.dispatchForm.controls.agencyName.setValue(data.AgencyName)
      }
      else if(event.component.itemsSelected[0][0].AgencyID!= undefined)
      {
        var data = event.component.itemsSelected[0][0];
        //this.dispatchForm.controls.agencyID.setValue(data.AgencyID)
        //this.dispatchForm.controls.agencyName.setValue(data.AgencyName)
      }
      /* if(this.dispatchForm.value.agencyID!= this.dispatchForm.value.agencyName) 
      {
        this.showAgency = true;
        this.checkAgenciesErrors = false;
      } */
    }
  }

  /////// lưu/câp nhật công văn
  onSave() {
   /*  this.submitted = true;
    if(this.dispatchForm.value.agencyID == null)  this.checkAgenciesErrors = true;
    if(this.dispatchForm.invalid || this.checkAgenciesErrors) return; */
    /////////////////////////////////////////////////////////
    if(this.type == "add" || this.type == "copy")
    {
      if(this.type == "copy")
      {
        this.dispatch.relations= null;
        this.dispatch.permissions = null;
      }
      if(this.fileCount > 0)
      {
        this.dispatch.RecID = this.dialog.dataService.dataSelected.recID;
        this.dispatch.Status = "1",
        this.dispatch.ApproveStatus = "1",
        this.dispatch.DispatchType = "1";
        this.odService.saveDispatch(this.dispatch).subscribe((item) => {
          if (item.status == 0) 
          {
            this.data = item;
            this.attachment.objectId = item.data.recID;
            this.attachment.saveFiles();

            this.dialog.close(item.data);
          }
          this.notifySvr.notify(item.message); 
        });
      }
      else this.notifySvr.notifyCode("DM001");
    }
    else if(this.type=="edit")
    {
      
      let dltDis = true;
      if(this.fileCount == 0) dltDis = false;
      this.odService.updateDispatch( this.dispatch , dltDis).subscribe((item) => {
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
  aaaa(a:any)
  {
    //array
    //console.log(data?.dataSelected?.dataSelected)
  }
}
