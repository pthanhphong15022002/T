import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  DialogData,
  DialogRef,
  ImageViewerComponent,
  NotificationsService,
  UploadFile,
  ViewsComponent,
} from 'codx-core';
import { AttachmentService } from 'projects/codx-share/src/lib/components/attachment/attachment.service';
import { Observable } from 'rxjs';
import { CodxTMService } from '../../codx-tm.service';
import { TM_Sprints } from '../../models/TM_Sprints.model';

@Component({
  selector: 'lib-popup-add-sprints',
  templateUrl: './popup-add-sprints.component.html',
  styleUrls: ['./popup-add-sprints.component.css'],
})
export class PopupAddSprintsComponent implements OnInit {
  master: any;
  title = 'Thêm Task Board';
  readOnly = false;
  listUserDetail = [];
  resources = '';
  action: string = '';
  dialog: DialogRef;
  user: any;
  funcID: string = '';
  sprintDefaut = new TM_Sprints();
  dataDefault = [];
  dataOnLoad = [];
  vllShare = 'TM003';
  isUploadImg = false;
  gridViewSetup : any
  imageUpload: UploadFile = new UploadFile();
  @ViewChild('imageAvatar') imageAvatar: ImageViewerComponent;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private authStore: AuthStore,
    private tmSv: CodxTMService,
    private cache: CacheService,
    private notiService: NotificationsService,
    private callfc: CallFuncService,
    public atSV: AttachmentService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    
    this.master = dialog.dataService!.dataSelected;
    this.action = dt?.data[1];
    this.gridViewSetup = dt?.data?.gridViewSetup ;
    this.dialog = dialog;
    this.user = this.authStore.get();
    this.funcID = this.dialog.formModel.funcID;
    this.sprintDefaut = this.dialog.dataService.data[0];
    this.dataDefault.push(this.sprintDefaut);
    this.dataOnLoad = this.dialog.dataService.data;
  }

  //#region init
  ngOnInit(): void {
    if (this.action == 'add') {
      this.master.viewMode = '1';
    } else {
      if (this.action == 'copy')
        this.getSprintsCoppied(this.master.iterationID);
      else this.openInfo(this.master.iterationID, this.action);
    }
  }
  //#endregion

  //#region CRUD
  saveData(id) {
    if (
      this.master.iterationName == null ||
      this.master.iterationName.trim() == ''
    )
      return this.notiService.notifyCode('TM035');
    if (this.master.projectID && Array.isArray(this.master.projectID))
      this.master.projectID = this.master.projectID[0];
    if (!this.master.isShared) this.master.resources = null;
    if (this.resources == '') this.master.resources = null;
    else this.master.resources = this.resources;
    var isAdd = this.action == 'edit' ? false : true;
    this.saveMaster(isAdd);
  }

  saveMaster(isAdd: boolean) {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option, isAdd)) //Hảo code mới
      .subscribe((res) => {
        if (res) {
          this.imageAvatar.updateFileDirectReload(this.master.iterationID);
          if (isAdd && this.funcID !='TMT0301') {
            var dataNew = this.dialog.dataService.data[0];
            this.dialog.dataService.data[0] = this.dialog.dataService.data[1];
            this.dialog.dataService.data[1] = dataNew;
          }
          this.dialog.close();
        }
      });
    // this.tmSv.addTaskBoard([this.master, isAdd]).subscribe((res) => {
    //   if (res) {
    //     if(isAdd){
    //       this.dataOnLoad[0]= res;
    //       this.dataOnLoad=this.dataDefault.concat(this.dataOnLoad);
    //       this.dialog.dataService.data =  this.dataOnLoad
    //      // this.notiService.notifyCode('TM005');
    //     }else{
    //       this.dialog.dataService.update(res).subscribe();
    //       //  var index = this.dialog.dataService.data.findIndex(x=>x.iterationID==res.iterationID)
    //       //  this.dialog.dataService.data[index] = res;
    //      // this.notiService.notifyCode('E0528');
    //     }
    //     this.dialog.close();
    //   }
    // });
  }

  //#endregion

  //#region Event Method
  beforeSave(op: any, isAdd) {
    this.master = this.dialog.dataService.dataSelected;
    op.method = 'AddEditSprintAsync';
    op.data = [this.master, isAdd];
    return true;
  }

  closeTaskBoard() {
    this.listUserDetail = [];
    this.master = {};
  }

  getListUser(listUser) {
    while (listUser.includes(' ')) {
      listUser = listUser.replace(' ', '');
    }
    if (this.resources == '') this.resources = listUser;
    else this.resources += ';' + listUser;
    this.api
      .execSv<any>(
        'TM',
        'ERM.Business.TM',
        'TaskBusiness',
        'GetListUserDetailAsync',
        listUser
      )
      .subscribe((res) => {
        this.listUserDetail = this.listUserDetail.concat(res);
      });
  }

  onDeleteUser(userID) {
    var listUserDetail = [];
    for (var i = 0; i < this.listUserDetail.length; i++) {
      if (this.listUserDetail[i].userID != userID) {
        listUserDetail.push(this.listUserDetail[i]);
      }
    }
    this.listUserDetail = listUserDetail;
    var resources = '';
    if (listUserDetail.length > 0) {
      listUserDetail.forEach((user) => {
        resources += user.userID + ';';
      });
      resources = resources.slice(0, -1);
      this.resources = resources;
    } else this.resources = '';
  }

  openInfo(interationID, action) {
    // this.taskBoard = new TM_Sprints();

    this.readOnly = false;
    this.title = 'Chỉnh sửa task board';
    this.tmSv.getSprints(interationID).subscribe((res) => {
      if (res) {
        this.master = res;
        if (this.master.resources) this.getListUser(this.master.resources);
        else this.listUserDetail = [];
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  getSprintsCoppied(interationID) {
    this.title = 'Copy task boads';
    this.readOnly = false;
    this.listUserDetail = [];
    this.tmSv.getSprints(interationID).subscribe((res) => {
      if (res) {
        this.master.projectID = res.projectID;
        this.master.iterationName = res.iterationName;
        this.master.viewMode = res.viewMode;
        this.master.memo = res.memo;
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  valueChangeSharedResource(e) {
    this.master.isShared = e.data;
    if (!this.master.isShared) {
      this.master.resources = null;
      this.listUserDetail = [];
    }
  }

  eventApply(e: any) {
    var resources = '';
    var listDepartmentID = '';
    var listUserID = '';

    e?.data?.forEach((obj) => {
      // if (obj?.data && obj?.data != '') {
      switch (obj.objectType) {
        case 'U':
          listUserID += obj.id + ';';
          break;
        case 'O':
        case 'D':
          listDepartmentID += obj.id + ';';
          break;
      }
      //  }
    });
    if (listUserID != '')
      listUserID = listUserID.substring(0, listUserID.length - 1);
    if (listDepartmentID != '')
      listDepartmentID = listDepartmentID.substring(
        0,
        listDepartmentID.length - 1
      );
    if (listDepartmentID != '') {
      this.tmSv.getUserByListDepartmentID(listDepartmentID).subscribe((res) => {
        if (res) {
          resources += res;
          if (listUserID != '') resources += ';' + listUserID;
          this.valueSelectUser(resources);
        }
      });
    } else this.valueSelectUser(listUserID);
  }

  valueSelectUser(resources) {
    if (resources != '') {
      if (this.master.resources && this.master.resources != '') {
        var arrAssign = resources.split(';');
        var arrNew = [];
        arrAssign.forEach((e) => {
          if (!this.master.resources.includes(e)) {
            arrNew.push(e);
          }
        });
        if (arrNew.length > 0) {
          resources = arrNew.join(';');
          this.master.resources += ';' + resources;
          this.getListUser(resources);
        }
      } else {
        this.master.resources = resources;
        this.getListUser(resources);
      }
    }
    this.changeDetectorRef.detectChanges();
  }
  //#endregion

  changeMemo(e) {
    this.master.memo = e?.data;
  }

  changeUser(e){
   if(e?.data?.value.length >0){
    var arrResources = e?.data?.value ;
    this.valueSelectUserCombobox(arrResources)
   }
  }

  valueSelectUserCombobox(arrResources: any[]) {
    var resources ='' ;
    if (arrResources.length>0) {
      if (this.master.resources && this.master.resources != '') {
        var arrNew = [];
        arrResources.forEach((e) => {
          if (!this.master.resources.includes(e)) {
            arrNew.push(e);
          }
        });
        if (arrNew.length > 0) {
          resources = arrNew.join(';');
          this.master.resources += ';' + resources;
          this.getListUser(resources);
        }
      } else {
         resources = arrResources.join(';');
        this.master.resources = resources;
        this.getListUser(resources);
      }
    }
    this.changeDetectorRef.detectChanges();
  }
}
