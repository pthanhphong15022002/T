import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CallFuncService,
  DataRequest,
  DialogData,
  DialogRef,
  NotificationsService,
} from 'codx-core';

import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { DispatchService } from '../../services/dispatch.service';
import {
  capitalizeFirstLetter,
  getDifference,
  getJSONString,
} from '../../function/default.function';
import { FileService } from '@shared/services/file.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-imcomming-add',
  templateUrl: './incomming-add.component.html',
  styleUrls: ['./incomming-add.component.scss'],
})
export class IncommingAddComponent implements OnInit {
  getJSONString = getJSONString;
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('tmpagency') tmpagency: any;
  @ViewChild('tmpdept') tmpdept: any;
  @ViewChild('form') myForm: any;
  submitted = false;
  checkAgenciesErrors = false;
  dltDis = false;
  change = 'ADMIN';
  data: any = {};
  dialog: any;
  activeAngecy = 1;
  showAgency = false;
  idAgency: any;
  dispatch: any ;
  headerText: any;
  subHeaderText: any;
  gridViewSetup: any;
  type: any;
  formModel: any;
  fileCount: number = 0;
  files: any;
  hideThumb = false;
  hidepb = true;
  activeDiv: any;
  dataRq = new DataRequest();
  objRequied = [];
  fileDelete:any
  constructor(
    private api: ApiHttpService,
    private odService: DispatchService,
    private notifySvr: NotificationsService,
    private callfunc: CallFuncService,
    private ref: ChangeDetectorRef,
    private fileService: FileService,
    private auth: AuthStore,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data;
    this.dialog = dialog;
  }
  public disEdit: any;
  ngOnInit(): void {
    if (this.data.data) this.dispatch = this.data.data;
    else this.dispatch = this.dialog.dataService.dataSelected;

    var user = this.auth.get();
    if (user?.userID) this.dispatch.createdBy = user?.userID;

    this.gridViewSetup = this.data?.gridViewSetup;
    this.headerText = this.data?.headerText;
    this.subHeaderText = this.data?.subHeaderText;
    this.type = this.data?.type;
    this.formModel = this.data?.formModel;

    this.dataRq.entityName = this.formModel?.entityName;
    this.dataRq.formName = this.formModel?.formName;
    this.dataRq.funcID = this.formModel?.funcID;

    if (this.type == 'add' || this.type == 'copy') 
    {
      this.dispatch.copies = 1;
      this.dispatch.refDate = new Date();
      this.dispatch.dispatchOn = new Date();
      if (this.type == 'add') {
        this.dispatch.dispatchType = this.data?.dispatchType;
        this.dispatch.agencyName = null;
        // this.dispatch.departmentID = "BGĐ"
        // this.getDispathOwner("BGĐ");
        if(this.formModel?.funcID == "ODT41") this.dispatch.owner = user?.userID
      }
      this.dispatch.createdOn = new Date();
    } 
    else if (this.type == 'edit') 
    {
      this.dispatch.agencyName = this.dispatch.agencyName.toString();
      if(this.dispatch.deptName) 
      {
        this.activeDiv = "dv"
        this.hidepb = false
      }
    }

    this.getKeyRequied();
  }
  fileAdded(event: any) {
    if (event?.data) this.hideThumb = true;
    this.dltDis = false;
  }

  //Mở form thêm mới đơn vị / phòng ban
  openFormAgency(action: any) {
    if (action == 'agency') {
      this.callfunc.openForm(this.tmpagency, null, 500, 700);
      /*  this.callfc.openForm(DepartmentComponent, "Thêm mới phòng ban", 500, 700, null, this.idAgency).subscribe((dialog: any) => {
       dialog.close = this.closeDept;
     }); */
    } else {
      this.callfunc.openForm(this.tmpdept, null, 500, 800);
      /* this.callfc.openForm(AgencyComponent, "Thêm đơn vị nhận", 500, 700, null, null).subscribe((dialog: any) => {
       dialog.close = this.closeAgency;
     }); */
    }
  }

  hideDept(action: any) {
    this.activeDiv = action;
    if (action == 'dv') {
      //this.hidepb = true;
      this.showAgency = false;
    } else if (action == 'pb') {
      this.showAgency = true;
    }
    //this.dispatchForm.value.deptID = '';
    //this.dispatch.controls.agencyID.setValue(null)
  }

  changeValueDept(event: any) {
    
    this.dispatch.deptName = event?.data;
    if(event?.component?.itemsSelected[0]?.AgencyID)
      this.dispatch.deptID = event?.component?.itemsSelected[0]?.AgencyID;
  }

  //Người chịu trách nhiệm
  changeValueOwner(event: any) {
    this.dispatch.owner = event.data?.value[0];
    if(event.data?.value[0])
    {
      this.getInforByUser(event.data?.value[0]).subscribe(item=>{
        if(item) this.dispatch.orgUnitID = item.organizationID
      })
    }
  }
  //Nơi nhận
  changeValueBUID(event: any) {
    this.dispatch.departmentID = event?.data?.value[0];
    if (event.data?.value[0]) this.getDispathOwner(event.data?.value[0]);
  }
  getDispathOwner(data:any)
  {
    this.api
        .execSv(
          'HR',
          'ERM.Business.HR',
          'OrganizationUnitsBusiness',
          'GetUserByDept',
          [data, null, null]
        )
        .subscribe((item: any) => {
          if (item != null && item.length > 0) {
            this.dispatch.owner = item[0].domainUser;
            this.change = this.dispatch.owner;
            this.getInforByUser(item[0].domainUser).subscribe(item=>{
              if(item) this.dispatch.orgUnitID = item.organizationID
            })
            this.ref.detectChanges();
          } else {
            this.dispatch.owner = '';
          }
        });
  }
  getInforByUser(id:any) : Observable<any>
  {
    return this.api
    .execSv(
      'HR',
      'ERM.Business.HR',
      'EmployeesBusiness',
      'GetOneByDomainUserAsync',
      id
    );
  }
  openFormUploadFile() {
    this.attachment.uploadFile();
  }
  //Các hàm value change
  changeValueAgency(event: any) {
    //ktra nếu giá trị trả vô = giá trị trả ra return null
    //if(this.dispatch.agencyName == event.data[0]) return;
    if (!event.data) return;

    if (event.data.length == 0) {
      this.hidepb = true;
      this.dispatch.agencyID = null;
      this.dispatch.agencyName = null;
      this.activeDiv = null;
    } else if (
      event.component.itemsSelected != null &&
      event.component.itemsSelected.length > 0
    ) {
      if (event.component.itemsSelected[0].AgencyID) {
        var data = event.component.itemsSelected[0];
        this.dispatch.agencyID = data.AgencyID;
        this.dispatch.agencyName = data.AgencyName;
        //this.dispatchForm.controls.agencyName.setValue(data.AgencyName)
      } else if (event.component.itemsSelected[0][0].AgencyID) {
        var data = event.component.itemsSelected[0][0];
        this.dispatch.agencyID = data.AgencyID;
        this.dispatch.agencyName = data.AgencyName;
        //this.dispatchForm.controls.agencyID.setValue(data.AgencyID)
        //this.dispatchForm.controls.agencyName.setValue(data.AgencyName)
      }
      if (
        this.dispatch.agencyID != this.dispatch.agencyName &&
        this.dispatch.agencyName.length > 0
      ) {
        this.hidepb = false;
        this.activeDiv = 'dv';
        this.myForm?.formGroup.patchValue({deptName: null})
        //this.ref.detectChanges()
        //this.showAgency = true;
        //this.checkAgenciesErrors = false;
      }
    }
    this.dispatch.agencyName = this.dispatch.agencyName.toString();
  }
  valueChangeDate(event: any) {
    this.dispatch[event?.field] = event?.data.fromDate;
  }
  /////// lưu/câp nhật công văn
  async onSave() {
    if (!this.checkIsRequired()) return;
    /*  this.submitted = true;
    if(this.dispatchForm.value.agencyID == null)  this.checkAgenciesErrors = true;
    if(this.dispatchForm.invalid || this.checkAgenciesErrors) return; */
    /////////////////////////////////////////////////////////
    this.dispatch.agencyName = this.dispatch.agencyName.toString();
    if (this.type == 'add' || this.type == 'copy') {
      if(this.dispatch.owner != this.dispatch.createdBy) this.dispatch.status = '3';
      else this.dispatch.status = '1';
      this.dispatch.approveStatus = '1';
      if (this.type == 'copy') 
      {
        delete this.dispatch.id;
        this.dispatch.relations = null;
        this.dispatch.updates = null;
        this.dispatch.permissions = null;
        this.dispatch.links = null;
        this.dispatch.extends = null;
        this.dispatch.bookmarks = null;
        this.dispatch.views = null;
        this.dispatch.percentage = 0;
      }
      if (this.type == 'add')
        this.dispatch.recID =  this.dialog.dataService.dataSelected.recID;
      this.dispatch.approveStatus = '1';
      this.attachment.objectId = this.dispatch.recID;
      (await this.attachment.saveFilesObservable()).subscribe(
        (item2: any) => {
          if (item2?.status == 0) {
            this.odService
            .saveDispatch(this.dataRq, this.dispatch)
            .subscribe(async (item) => {
              if (item.status == 0) {
                this.data = item;
                this.dialog.close(item.data);
                this.notifySvr.notify(item.message);
              } else this.notifySvr.notify(item.message);
            });
          } else this.notifySvr.notify(item2.message);
        }
      );
      
    } else if (this.type == 'edit') {
      this.odService
        .updateDispatch(this.dispatch, false)
        .subscribe(async (item) => {
          if (item.status == 0) {
            if(this.fileDelete && this.fileDelete.length > 0)
            {
              for(var i =0 ; i<this.fileDelete.length ; i++)
              {
                this.fileService.deleteFileToTrash(this.fileDelete[i].recID, "", true).subscribe();
              }
            }
            if (this.attachment.fileUploadList && this.attachment.fileUploadList.length>0) {
              this.attachment.objectId = item.data.recID;
              (await this.attachment.saveFilesObservable()).subscribe(
                (item2: any) => {
                  if (item2?.status == 0) {
                    this.dialog.close(item.data);
                    this.notifySvr.notify(item.message);
                  } else this.notifySvr.notify(item2.message);
                }
              );
            } else {
              this.dialog.close(item.data);
              this.notifySvr.notify(item.message);
            }
          } else this.notifySvr.notify(item.message);
        });
    }
  }
  getfileCount(e: any) {
    if (e && e?.data) this.fileCount = e.data.length;
    else if (typeof e == 'number') this.fileCount = e;
    else this.fileCount = e.length;

    if (this.fileCount == 0) this.dltDis = true;
  }
  changeFormAgency(val: any) {
    this.showAgency = true;
    if (val == 'dv') this.showAgency = false;
  }
  getKeyRequied() {
    var objKey = Object.keys(this.gridViewSetup);
    for (var i = 0; i < objKey.length; i++) {
      if (this.gridViewSetup[objKey[i]].isRequire)
        this.objRequied.push(objKey[i]);
    }
  }
  checkIsRequired() {
    var arr = [];
    for (var i = 0; i < this.objRequied.length; i++) {
      var field = capitalizeFirstLetter(this.objRequied[i]);
      var data = this.dispatch[field];
      if(!data)
        arr.push(this.gridViewSetup[this.objRequied[i]].headerText);
    }
    if(arr.length>0)
    {
      var name = arr.join(" , ");
      return this.notifySvr.notifyCode('SYS009', 0, name);
    }
    debugger;
    if (!this.fileCount || this.fileCount == 0)
      return this.notifySvr.notifyCode('OD022');
    return true;
  }
  handleDelete(e:any)
  {
    this.fileDelete = e;
  }
  changeCbb(e:any)
  {
    var data = e?.component?.itemsSelected;
    if(data && data[0]) this.dispatch.category = data[0].CategoryName;
  }
}
