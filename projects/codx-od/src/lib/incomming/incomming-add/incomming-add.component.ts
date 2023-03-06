import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
  ViewEncapsulation,
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
import { Permission } from '@shared/models/file.model';
import { permissionDis } from '../../models/dispatch.model';

@Component({
  selector: 'app-imcomming-add',
  templateUrl: './incomming-add.component.html',
  styleUrls: ['./incomming-add.component.scss'],
  encapsulation: ViewEncapsulation.None,
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
  fileDelete:any;
  service:any;
  listPermission = [];
  relations :any;
  lrelations :any;
  user:any;
  agencyName:any;
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

    this.user = this.auth.get();
    if (this.user?.userID) this.dispatch.createdBy = this.user?.userID;

    this.gridViewSetup = this.data?.gridViewSetup;
    this.headerText = this.data?.headerText;
    this.subHeaderText = this.data?.subHeaderText;
    this.type = this.data?.type;
    this.formModel = this.data?.formModel;
    this.service = this.data?.service;
    this.dataRq.entityName = this.formModel?.entityName;
    this.dataRq.formName = this.formModel?.formName;
    this.dataRq.funcID = this.formModel?.funcID;

    if (this.type == 'add' || this.type == 'copy') 
    {
      this.dispatch.copies = 1;
      this.dispatch.status = '1';
      this.dispatch.refDate = new Date();
      this.dispatch.dispatchOn = new Date();
      if (this.type == 'add') {
    
        this.dispatch.dispatchType = this.data?.dispatchType;
        this.dispatch.agencyName = null;
        // this.dispatch.departmentID = "BGĐ"
        // this.getDispathOwner("BGĐ");
        if(this.formModel?.funcID == "ODT41") 
        {
          this.dispatch.owner = this.user?.userID;
          // this.getInforByUser(this.dispatch.owner).subscribe(item=>{
          //   if(item) this.dispatch.orgUnitID = item.orgUnitID
          // })
        }
      }
      if(this.type == "copy") this.dispatch.dispatchNo = null
      // if(!this.dispatch.dispatchNo)
      // {
      //   //kiểm tra xem nếu mã công văn tự động không có thì sinh thêm 
      //   this.odService.autoNumber(
      //     this.formModel.formName,
      //     this.formModel.funcID,
      //     this.formModel.entityName,
      //     "DispatchNo")
      //   .subscribe(item=>{
      //     if(item) {
      //       this.dispatch.dispatchNo = item;
      //       this.myForm.formGroup.patchValue({
      //         dispatchNo: this.dispatch.dispatchNo, 
      //       }); 
      //     }
      //   })
      // }
      this.dispatch.createdOn = new Date();
    } 
    else if (this.type == 'edit') 
    {
      this.dispatch.agencyName = this.dispatch.agencyName.toString();
      if(this.dispatch.relations && this.dispatch.relations.length>0)
      {
        this.lrelations = this.dispatch.relations.filter(x=>x.relationType == "6")
        if(this.lrelations) this.lrelations = this.lrelations.map(u=>u.userID).join(";")

      }
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
    this.dispatch.owner = event?.data;
    if(this.dispatch.owner)
    {
      this.getInforByUser(this.dispatch.owner).subscribe(item=>{
        if(item) {
          this.dispatch.departmentID = item.orgUnitID
          this.myForm.formGroup.patchValue({
            departmentID: this.dispatch.departmentID, 
          }); 
        }
      })
    }
  }

  //Người được chia sẻ
  changeDataShare(event: any)
  {
    debugger
    if(event?.data?.value) this.relations = event?.data?.value
  }
  //Nơi nhận
  changeValueBUID(event: any) {
    // this.dispatch.departmentID = event?.data?.value[0];
    // if (event.data?.value[0]) this.getDispathOwner(event.data?.value[0]);
    this.dispatch.departmentID = event?.data;
    if (event?.data) this.getDispathOwner(event.data);
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
            this.myForm.formGroup.patchValue({
              owner: this.dispatch.owner, 
            }); 
            
            this.change = this.dispatch.owner;
            // this.getInforByUser(item[0].domainUser).subscribe(item=>{
            //   if(item) this.dispatch.orgUnitID = item.orgUnitID
            // })
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
    if(this.dispatch.dispatchType == '1' || this.dispatch.dispatchType == '2')
    {
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
    }
    else
    {
      if( event.component.itemsSelected != null &&
        event.component.itemsSelected.length > 0)
        {
          var data = event.component.itemsSelected[0];
          this.dispatch.agencyID = data.OrgUnitID;
          this.dispatch.agencyName = data.OrgUnitName;
          this.agencyName = data.OrgUnitName;
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
    if(this.dispatch.dispatchType == "3" && this.agencyName)  this.dispatch.agencyName = this.agencyName
    this.addRelations();
    if (this.type == 'add' || this.type == 'copy') {
      // if(this.dispatch.owner != this.dispatch.createdBy) this.dispatch.status = '3';
      // else this.dispatch.status = '1';
     
      this.dispatch.status = '1';
      this.dispatch.approveStatus = '1';
      if (this.type == 'copy') 
      {
        delete this.dispatch.id;
        //this.dispatch.relations = null;
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
      this.attachment.objectId = this.dispatch.recID;
      this.addRelations();
      this.addPermission();
      this.odService
      .saveDispatch(this.dataRq, this.dispatch)
      .subscribe(async (item) => {
        if (item.status == 0) {
          this.data = item;
          this.attachment.dataSelected = item.data;
       
          (await this.attachment.saveFilesObservable()).subscribe(
            (item2: any) => {
              //Chưa xử lý Upload nhìu file
              // var countSusscess = 0;
              // var countError = 0;
              // if(Array.isArray(item2))
              // {
              //   var count =  item2.filter(x=>x.status == 0);
              //   if(count) countSusscess = count.length;
              //   countError = item2.length - countSusscess;
               
              // }
              if (item2?.status == 0 || Array.isArray(item2)) {
                //Lưu thông tin người chia sẻ
                if(this.dispatch.relations && this.dispatch.relations.length>0)
                {
                  var per = new permissionDis();
                  per.to = [];
                  for(var i =0 ; i < this.dispatch.relations.length ; i++)
                  {
                    per.to.push(this.dispatch.relations[i].userID);
                  }
                  per.recID = item?.data?.recID;
                  per.funcID = this.formModel?.funcID;
                  per.download = true;
                  per.share = true;
                  this.odService.shareDispatch(per).subscribe(item3=>{
                    if(item3)
                    {
                      item.data.relations = item3?.data[0].relations
                      this.notifySvr.notify(item.message);
                      this.dialog.close(item.data);
                    }
                    
                  });
                 
                }
                else
                {
                  this.notifySvr.notify(item.message);
                  this.dialog.close(item.data);
                }
              } 
              else {
                this.notifySvr.notify(item2.message);
                this.odService.deleteDispatch(this.dispatch.recID).subscribe();
                this.dialog.dataService.delete(this.dispatch).subscribe();
              }
            }
          );
         
        } 
        else this.notifySvr.notify(item.message);
      });
     
      
    } else if (this.type == 'edit') {
      this.odService
        .updateDispatch(this.dispatch,this.formModel?.funcID , false)
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
  addRelations()
  {
    if(this.relations && this.relations.length>0)
    {
      this.dispatch.relations = [];
      for(var i = 0 ; i < this.relations.length ; i++)
      {
        var obj = {
          relationType : "6",
          userID : this.relations[i],
          status : 1,
          createdBy : this.user?.userID
        }
        this.dispatch.relations.push(obj);
      }
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
  addPermission()
  {
    if(this.dispatch.owner)
    {
      var p = new Permission()
      p.read = true;
      p.share = true;
      p.download = true;
      p.objectID = this.dispatch.owner;
      p.objectType = "U";
      p.isActive = true
      this.listPermission.push(p);
    }
  }
}
