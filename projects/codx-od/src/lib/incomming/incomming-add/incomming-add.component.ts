
import { ChangeDetectorRef, Component, OnInit, Optional, ViewChild } from '@angular/core';
import { ApiHttpService, CallFuncService, DataRequest, DialogData, DialogRef, NotificationsService } from 'codx-core';

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
  change = "ADMIN";
  data: any = {};
  dialog: any;
  activeAngecy      = 1;
  showAgency        = false;
  idAgency          : any ;
  dispatch : any;
  headerText : any;
  subHeaderText: any;
  gridViewSetup :any;
  type: any;
  formModel : any;
  fileCount : number = 0;
  files: any;
  hideThumb = false;
  hidepb = true;
  activeDiv: any;
  dataRq = new DataRequest;
  constructor(
    private api: ApiHttpService,
    private odService: DispatchService,
    private notifySvr: NotificationsService,
    private callfunc: CallFuncService,
    private ref: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  {
    this.data = dt?.data;
    this.dialog = dialog;
  }
  public disEdit: any;
  ngOnInit(): void 
  {
    if(this.data.data) this.dispatch = this.data.data;
    else this.dispatch = this.dialog.dataService.dataSelected;


    this.dispatch.status = '1';
    this.gridViewSetup = this.data?.gridViewSetup;
    this.headerText = this.data?.headerText;
    this.subHeaderText = this.data?.subHeaderText;
    this.type = this.data?.type;
    this.formModel = this.data?.formModel;
    
    this.dataRq.entityName = this.formModel?.entityName;
    this.dataRq.formName = this.formModel?.formName;
    this.dataRq.funcID =   this.formModel?.funcID;

    if(this.type == "add" || this.type == "copy")
    {
      this.dispatch.copies = 1;
      this.dispatch.refDate = new Date();
      this.dispatch.dispatchOn = new Date();
      this.dispatch.owner = null;
      if(this.type == "add")
      {
        this.dispatch.dispatchType = this.data?.dispatchType;
        this.dispatch.agencyName = null;
      }
      this.dispatch.createdOn = new Date();
    }
    else if(this.type == "edit")
    {
      this.dispatch.agencyName = this.dispatch.agencyName.toString();
    } 
  }
  fileAdded(event:any) { 
    if(event?.data) this.hideThumb = true ;
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

  hideDept(action:any)
  {
    this.activeDiv = action;
    if(action == "dv")
    {
      //this.hidepb = true;
      this.showAgency = false;
    }
    else if(action == "pb")
    {
      this.showAgency = true;
    }
    //this.dispatchForm.value.deptID = '';
    //this.dispatch.controls.agencyID.setValue(null)
  }

  changeValueDept(event: any) {
    this.dispatch.agencyID = event?.data;
  }
  
  //Người chịu trách nhiệm
  changeValueOwner(event: any) {
    this.dispatch.owner = event.data?.value[0]
  }
  //Nơi nhận
  changeValueBUID(event: any) {
    this.dispatch.deptID = event?.data?.value[0];
    if (event.data?.value[0]) {
      this.api.execSv("HR", "ERM.Business.HR", "OrganizationUnitsBusiness", "GetUserByDept", [event.data?.value[0], null, null]).subscribe((item: any) => {
         if (item != null && item.length > 0) {
           this.dispatch.owner = item[0].domainUser;
           this.change = this.dispatch.owner;
           this.ref.detectChanges();
         }
         else {
           this.dispatch.owner = "";
         }
       })
     } 
  }
  openFormUploadFile()
  {
    this.attachment.uploadFile();
  }
   //Các hàm value change 
   changeValueAgency(event: any) 
   {
    //ktra nếu giá trị trả vô = giá trị trả ra return null
    //if(this.dispatch.agencyName == event.data[0]) return;
    if(!event.data) return

    if(event.data.length == 0 )
    {
      this.hidepb = true;
      this.dispatch.agencyID = null;
      this.dispatch.agencyName = null;
      this.activeDiv = null;
    }
    else if(event.component.itemsSelected!=null && event.component.itemsSelected.length >0)
    {
      if(event.component.itemsSelected[0].AgencyID)
      {
        var data = event.component.itemsSelected[0];
        this.dispatch.agencyID = data.AgencyID;
        this.dispatch.agencyName = data.AgencyName;
        //this.dispatchForm.controls.agencyName.setValue(data.AgencyName)
      }
      else if(event.component.itemsSelected[0][0].AgencyID)
      {
        var data = event.component.itemsSelected[0][0];
        this.dispatch.agencyID = data.AgencyID;
        this.dispatch.agencyName = data.AgencyName;
        //this.dispatchForm.controls.agencyID.setValue(data.AgencyID)
        //this.dispatchForm.controls.agencyName.setValue(data.AgencyName)
      }
      if(this.dispatch.agencyID!= this.dispatch.agencyName && this.dispatch.agencyName.length >0) 
      {
        this.hidepb = false;
        this.activeDiv = 'dv';
        //this.showAgency = true;
        //this.checkAgenciesErrors = false;
      }
    }
    this.dispatch.agencyName = this.dispatch.agencyName.toString();
  }

  /////// lưu/câp nhật công văn
  onSave() {
   /*  this.submitted = true;
    if(this.dispatchForm.value.agencyID == null)  this.checkAgenciesErrors = true;
    if(this.dispatchForm.invalid || this.checkAgenciesErrors) return; */
    /////////////////////////////////////////////////////////
    this.dispatch.agencyName = this.dispatch.agencyName.toString();
    if(this.type == "add" || this.type == "copy")
    {
      if(this.type == "copy")
      {
        delete this.dispatch.id;
        this.dispatch.relations= null;
        this.dispatch.permissions = null;
      }
      if(this.fileCount > 0)
      {
        if(this.type == "add")
          this.dispatch.recID = this.dialog.dataService.dataSelected.recID;
        this.dispatch.status = "1",
        this.dispatch.approveStatus = "1",
        this.odService.saveDispatch(this.dataRq,this.dispatch).subscribe((item) => {
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
    this.fileCount = e.data.length;
  }
  changeFormAgency(val:any)
  {
    this.showAgency = true;
    if(val == "dv")
      this.showAgency = false;
  }
}
