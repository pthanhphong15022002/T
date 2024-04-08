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
  CacheService,
  CallFuncService,
  DataRequest,
  DialogData,
  DialogRef,
  NotificationsService,
  Util,
} from 'codx-core';

import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { DispatchService } from '../../services/dispatch.service';
import {
  capitalizeFirstLetter,
  getDifference,
  getJSONString,
} from '../../function/default.function';
import { FileService } from '@shared/services/file.service';
import { Observable, from, isObservable, of } from 'rxjs';
import { Permission } from '@shared/models/file.model';
import { permissionDis } from '../../models/dispatch.model';
import { CodxOdService } from '../../codx-od.service';
import axios from 'axios';

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

  disableSave = false;
  submitted = false;
  checkAgenciesErrors = false;
  dltDis = false;
  change = 'ADMIN';
  data: any = {};
  dialog: any;
  activeAngecy = 1;
  showAgency = false;
  idAgency: any;
  dispatch: any;
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
  fileDelete: any;
  service: any;
  listPermission = [];
  relations: any;
  lrelations: any;
  user: any;
  agencyName: any;
  referType = 'source';
  keyField = false; //Kiểm tra số công văn tự động
  fileModule: any;
  crrAgencies: any = '';
  employees: any;
  organizationUnits: any;
  defaultValue: any;
  readOnly = false;
  isAI = false;
  addAI = false;
  constructor(
    private api: ApiHttpService,
    private dispatchService: DispatchService,
    private odService: CodxOdService,
    private notifySvr: NotificationsService,
    private callfunc: CallFuncService,
    private ref: ChangeDetectorRef,
    private fileService: FileService,
    private cache: CacheService,
    private auth: AuthStore,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data//JSON.parse(JSON.stringify(dt?.data));
    this.dialog = dialog;
  }
  public disEdit: any;
  ngOnInit(): void {
    this.type = this.data?.type;

    if (this.data.data) this.dispatch = this.data.data;
    else this.dispatch = this.dialog.dataService.dataSelected;

    this.user = this.auth.get();

    if (this.dialog?.dataService?.keyField || this.type == 'edit')
      this.keyField = true;
    this.defaultValue = this.data?.defaultValue;
    this.gridViewSetup = this.data?.gridViewSetup;
    this.headerText = this.data?.headerText;
    this.subHeaderText = this.data?.subHeaderText;
    this.formModel = this.data?.formModel;
    this.service = this.data?.service;
    this.dataRq.entityName = this.formModel?.entityName;
    this.dataRq.formName = this.formModel?.formName;
    this.dataRq.funcID = this.formModel?.funcID;

    if (this.type == 'add' || this.type == 'copy') {
      this.dispatch.copies = 1;
      this.dispatch.status = '1';
      this.dispatch.refDate = new Date();
      this.dispatch.dispatchOn = new Date();
      if (this.user?.userID) this.dispatch.createdBy = this.user?.userID;
      if (this.type == 'add') {
        this.dispatch.dispatchType = this.data?.dispatchType;
        this.dispatch.agencyName = null;
        // this.dispatch.departmentID = "BGĐ"
        // this.getDispathOwner("BGĐ");
        if (this.defaultValue == '2') {
          this.dispatch.owner = this.user?.userID;
          // this.getInforByUser(this.dispatch.owner).subscribe(item=>{
          //   if(item) this.dispatch.orgUnitID = item.orgUnitID
          // })
        }
      }
      if (this.type == 'copy') {
        this.dispatch.dispatchNo = null;
        this.dispatch.isBookmark = false;
      }

      this.dispatch.createdOn = new Date();
    } else if (this.type == 'edit') {
      if (this.user?.userID) this.dispatch.modifiedBy = this.user?.userID;
      if (this.dispatch.agencyName)
        this.dispatch.agencyName = this.dispatch.agencyName?.toString();
      if (this.defaultValue == '2') {
        if (this.dispatch.agencies && this.dispatch.agencies.length > 0) {
          if ('agencyID' in this.dispatch.agencies[0])
            this.crrAgencies = this.dispatch.agencies
              .map((u) => u.agencyName)
              .join(';');
          else
            this.crrAgencies = this.dispatch.agencies
              .map((u) => u.AgencyName)
              .join(';');
        } else {
          this.dispatch.agencies = [
            {
              agencyID: this.dispatch.agencyID,
              agencyName: this.dispatch.agencyName,
            },
          ];
          this.crrAgencies = this.dispatch.agencyID;
          this.dispatch.agencyID = '';
          this.dispatch.agencyName = '';
        }
      }

      if (this.dispatch.relations && this.dispatch.relations.length > 0) {
        this.lrelations = this.dispatch.relations.filter(
          (x) => x.relationType == '6'
        );
        if (this.lrelations)
          this.lrelations = this.lrelations.map((u) => u.userID).join(';');
      }
      if (this.dispatch.deptName) {
        this.activeDiv = 'dv';
        this.hidepb = false;
      }
    } else if (this.type == 'read') this.disableSave = true;

    this.getKeyRequied();
    this.getPara();
  }


  getPara()
  {
    this.cache.viewSettingValues('ODParameters').subscribe((res) => {
      if(res)
      {
        var dt = res.filter(x=>x.category == "1");
        if(dt && dt[0])
        {
          var dtValue = JSON.parse(dt[0].dataValue);
          if(dtValue?.SuggestAI == "1") this.addAI = true;
        }
      }
    })
  }

  fileAdded(event: any) {
    if (event?.data) this.hideThumb = true;
    this.dltDis = false;
    if(this.type == 'add' && this.addAI)
    {
      this.isAI = true;
      this.readFileAI(event?.data[0]?.item.rawFile)
    }
  }

  readFileAI(dataFile:any)
  {
    this.fetchAI(dataFile).subscribe(res=>{
      this.isAI = false;
      if(res)
      {
        this.dispatch.refDate = new Date(res.dispatchDate);
         if (this.defaultValue == '2') 
        {
          this.dispatch.agencies = [];
          if(res.listAgencyName.length > 0)
          {
            res.listAgencyName.forEach(elm => {
              this.dispatch.agencies.push({
                agencyID: Util.uid(),
                agencyName: elm
              });
            });
          }
          this.crrAgencies = this.dispatch.agencies
          .map((u) => u.agencyName)
          .join(';');
        }

        this.myForm.formGroup.patchValue({
          title: res.title,
          agencyName: res.agencyName,
          refNo: res.dispatchNumber,
          refDate: new Date(res.dispatchDate),
          agencies: this.dispatch.agencies,
          pages: res.numberPage
        });
      }
    })
  }
  fetchAI(data:any)
  {
    if(data)
    {
      let url = "https://apibot.trogiupluat.vn/api/v2.0/NLP/get-information-extract";
      var form = new FormData();
      form.append("prompt", `
      Hãy trích xuất thông tin công văn với định dạng JSON như sau:
      {
        "title": "",
        "agencyName": "",
        "dispatchNumber": "",
        "dispatchDate": "",
        "listAgencyName": "",
        "numberPage":""
      }
      Lưu ý: Nếu thông tin không tìm thấy hãy để trống , dispatchDate định dạng kiểu dd/MM/yyy , listAgencyName là danh sách nơi gửi đến theo dạng mảng`);
      form.append("sourceFile", data); 
      return from(axios.post(url, form)
      .then((res:any) => {
        var result = JSON.parse(res.data.Data.JsonResult); 
        result.fileName = res.data.Data?.FileName; 
        return result
      })
      .catch(() => {return null}));
    }
    else
    {
      return of(null);
    }
  }

  //Mở form thêm mới đơn vị / phòng ban
  openFormAgency(action: any) {
    if (action == 'agency') {
      this.callfunc.openForm(this.tmpagency, null, 500, 700);
      /*  this.callfc.openForm(DepartmentComponent, "Thêm mới phòng ban", 500, 700, null, this.idAgency).subscribe((dialog: any) => {
       dialog.close = this.closeDept;
     }); */
    } else {
      this.callfunc.openForm(this.tmpdept, null, 500, 600);
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
    if (event?.component?.itemsSelected[0]?.AgencyID)
      this.dispatch.deptID = event?.component?.itemsSelected[0]?.AgencyID;
  }

  //Người chịu trách nhiệm
  changeValueOwner(event: any) {
    if (event?.data) {
      this.getInforByUser(event?.data).subscribe((item) => {
        if (item) {
          this.dispatch.departmentID = item.orgUnitID;
          if (
            !this.organizationUnits ||
            (this.organizationUnits &&
              this.organizationUnits.orgUnitID != item.orgUnitID)
          )
            this.myForm.formGroup.patchValue({
              departmentID: item.orgUnitID,
            });
          this.employees = item;
        }
        this.dispatch.owner = event?.data;
      });
    }
  }

  //Người được chia sẻ
  changeDataShare(event: any) {
    if (event?.data?.value) this.relations = event?.data?.value;
  }
  //Nơi nhận
  changeValueBUID(event: any) {
    // this.dispatch.departmentID = event?.data?.value[0];
    // if (event.data?.value[0]) this.getDispathOwner(event.data?.value[0]);

    if (event?.data) this.getDispathOwner(event.data);
  }

  getDispathOwner(data: any) {
    this.api
      .execSv(
        'HR',
        'ERM.Business.HR',
        'OrganizationUnitsBusiness_Old',
        'GetUserByDept',
        [data, null, null]
      )
      .subscribe((item: any) => {
        if (item != null && item.length > 0) {
          this.organizationUnits = item[0];
          if (
            !this.employees ||
            (this.employees && this.employees?.orgUnitID != item[0].orgUnitID)
          ) {
            this.dispatch.owner = item[0].domainUser;
            this.myForm.formGroup.patchValue({
              owner: this.dispatch.owner,
            });
            this.change = this.dispatch.owner;
          }
          // this.getInforByUser(item[0].domainUser).subscribe(item=>{
          //   if(item) this.dispatch.orgUnitID = item.orgUnitID
          // })
          this.ref.detectChanges();
        } else {
          this.dispatch.owner = '';
        }
        this.dispatch.departmentID = data;
      });
  }

  getInforByUser(id: any): Observable<any> {
    return this.api.execSv(
      'HR',
      'ERM.Business.HR',
      'EmployeesBusiness_Old',
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
    if (
      this.dispatch.dispatchType == '1' ||
      this.dispatch.dispatchType == '2'
    ) {
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
        } else if (event.component.itemsSelected[0].AgencyID) {
          var data = event.component.itemsSelected[0];
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
          this.myForm?.formGroup.patchValue({ deptName: null });
          //this.ref.detectChanges()
          //this.showAgency = true;
          //this.checkAgenciesErrors = false;
        }
      }
    } else {
      if (
        event.component.itemsSelected != null &&
        event.component.itemsSelected.length > 0
      ) {
        var data = event.component.itemsSelected[0];
        this.dispatch.agencyID = data.OrgUnitID;
        this.dispatch.agencyName = data.OrgUnitName;
        this.agencyName = data.OrgUnitName;
      }
    }
    this.dispatch.agencyName = this.dispatch.agencyName?.toString();
  }

  changeValueAgencies(e: any) {
    if (this.gridViewSetup['Agencies']['referedType'] == 'P') {
      if (e?.component?.dataSelected && e?.component?.dataSelected.length > 0) {
        var arr = [];
        e?.component?.dataSelected.forEach((elm) => {
          var obj = {
            agencyID: elm?.dataSelected?.AgencyID,
            agencyName: elm?.dataSelected?.AgencyName,
          };
          arr.push(obj);
        });
        this.dispatch.agencies = arr;
      }
    } else {
      if (
        e?.component?.itemsSelected &&
        e?.component?.itemsSelected.length > 0
      ) {
        var arr = [];
        e?.component?.itemsSelected.forEach((elm) => {
          var obj = {
            agencyID: elm?.AgencyID || elm?.agencyID,
            agencyName: elm?.AgencyName || elm?.agencyName,
          };
          arr.push(obj);
        });
        this.dispatch.agencies = arr;
      }
    }
  }

  valueChangeDate(event: any) {
    this.dispatch[event?.field] = event?.data.fromDate;
  }
  valueChangeTags(e) {
    this.dispatch.tags = e.data;
  }
  /////// lưu/câp nhật công văn
  async onSave() {
    //chế độ chỉ xem
    if (this.type == 'read') return;

    this.disableSave = true;

    if (!this.checkIsRequired()) {
      this.disableSave = false;
      return;
    }
    /*  this.submitted = true;
    if(this.dispatchForm.value.agencyID == null)  this.checkAgenciesErrors = true;
    if(this.dispatchForm.invalid || this.checkAgenciesErrors) return; */
    /////////////////////////////////////////////////////////
    this.dispatch.agencyName = this.dispatch.agencyName
      ? this.dispatch.agencyName.toString()
      : '';
    if (this.dispatch.dispatchType == '3' && this.agencyName)
      this.dispatch.agencyName = this.agencyName;
    this.addRelations();
    if (this.type == 'add' || this.type == 'copy') {
      // if(this.dispatch.owner != this.dispatch.createdBy) this.dispatch.status = '3';
      // else this.dispatch.status = '1';

      this.dispatch.status = '1';
      this.dispatch.approveStatus = '1';
      if (this.type == 'copy') {
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
        this.dispatch.recID = this.dialog.dataService.dataSelected.recID;
      this.addRelations();
      this.addPermission();
      this.dispatchService
        .saveDispatch(this.dataRq, this.dispatch, this.keyField)
        .subscribe(async (item) => {
          if (item.status == 0) {
            this.data = item.data;
            this.attachment.dataSelected = item.data;
            this.attachment.objectId = item.data.recID;
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
                  if (this.data.owner != this.data.createdBy)
                    //Gửi mail
                    this.dispatchService
                      .sendMail2(this.dataRq, this.data.recID)
                      .subscribe();

                  //Lưu thông tin người chia sẻ
                  if (
                    this.dispatch.relations &&
                    this.dispatch.relations.length > 0
                  ) {
                    var emailTemplate = this.odService.loadEmailTempType(
                      'OD_Share'
                    ) as any;
                    if (isObservable(emailTemplate)) {
                      emailTemplate.subscribe((itemEmailTmp: any) => {
                        this.beforeSaveSendEmail(item, itemEmailTmp);
                      });
                    } else this.beforeSaveSendEmail(item, emailTemplate);
                  } else {
                    this.disableSave = false;
                    this.notifySvr.notify(item.message);
                    this.dialog.close(item.data);
                  }
                } else {
                  this.disableSave = false;
                  this.notifySvr.notify(item2.message);
                  this.dispatchService
                    .deleteDispatch(this.dispatch.recID)
                    .subscribe();
                  this.dialog.dataService.delete(this.dispatch).subscribe();
                }
              }
            );
          } else this.notifySvr.notify(item.message);
        });
    } else if (this.type == 'edit') {
      this.dispatchService
        .updateDispatch(
          this.dispatch,
          this.formModel?.funcID,
          false,
          this.referType,
          this.formModel?.entityName
        )
        .subscribe(async (item) => {
          if (item.status == 0) {
            if (this.fileDelete && this.fileDelete.length > 0) {
              for (var i = 0; i < this.fileDelete.length; i++) {
                this.fileService
                  .deleteFileToTrash(this.fileDelete[i].recID, '', true)
                  .subscribe();
              }
            }
            if (
              this.attachment.fileUploadList &&
              this.attachment.fileUploadList.length > 0
            ) {
              this.addPermission();
              this.attachment.objectId = item.data.recID;
              (await this.attachment.saveFilesObservable()).subscribe(
                (item2: any) => {
                  if (item2?.status == 0) {
                    this.disableSave = false;
                    this.dialog.close(item.data);
                    this.notifySvr.notify(item.message);
                  } else this.notifySvr.notify(item2.message);
                }
              );
            } else {
              this.disableSave = false;
              this.dialog.close(item.data);
              this.notifySvr.notify(item.message);
            }
          } else this.notifySvr.notify(item.message);
        });
    }
  }

  beforeSaveSendEmail(item: any, emailTemplate: any) {
    var per = new permissionDis();
    per.to = [];
    for (var i = 0; i < this.dispatch.relations.length; i++) {
      per.to.push(this.dispatch.relations[i].userID);
    }
    per.recID = item?.data?.recID;
    per.funcID = 'ODT81';
    per.download = true;
    per.share = true;
    per.sendMail = true;
    (per.desc = emailTemplate?.message), (per.emailTemplates = emailTemplate);
    this.dispatchService
      .shareDispatch(per, this.referType, this.formModel?.entityName)
      .subscribe((item3) => {
        if (item3) {
          this.disableSave = false;
          item.data.relations = item3?.data[0].relations;
          this.notifySvr.notify(item.message);
          this.dialog.close(item.data);
        }
      });
  }
  addRelations() {
    if (this.relations && this.relations.length > 0) {
      this.dispatch.relations = [];
      for (var i = 0; i < this.relations.length; i++) {
        var obj = {
          relationType: '6',
          userID: this.relations[i],
          status: 1,
          createdBy: this.user?.userID,
        };
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
      if (
        !data &&
        (((this.defaultValue == '1' ||
          this.defaultValue == '3' ||
          this.defaultValue == '4') &&
          field != 'agencies') ||
          (this.defaultValue == '2' && field != 'agencyName'))
      )
        arr.push(this.gridViewSetup[this.objRequied[i]].headerText);
    }

    //Kiểm tra số tự động
    if (!this.keyField && !this.dispatch.dispatchNo)
      arr.push(this.gridViewSetup['DispatchNo'].headerText);

    if (arr.length > 0) {
      var name = arr.join(' , ');
      return this.notifySvr.notifyCode('SYS009', 0, name);
    }
    if (!this.fileCount || this.fileCount == 0)
      return this.notifySvr.notifyCode('OD022');
    return true;
  }
  handleDelete(e: any) {
    this.fileDelete = e;
  }
  changeCbb(e: any) {
    var data = e?.component?.itemsSelected;
    if (data && data[0]) this.dispatch.category = data[0].CategoryName;
  }
  addPermission() {
    if (this.dispatch.owner) {
      var p = new Permission();
      p.read = true;
      p.share = true;
      p.download = true;
      p.objectID = this.dispatch.owner;
      p.objectType = 'U';
      p.isActive = true;
      this.listPermission.push(p);
    }
  }
  close() {
    this.dialog.close();
  }
}
