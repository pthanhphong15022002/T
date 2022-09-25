import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Optional,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  AlertConfirmInputConfig,
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  DataRequest,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  SidebarModel,
  Util,
  ViewsComponent,
} from 'codx-core';
import { ES_SignFile, File } from 'projects/codx-es/src/lib/codx-es.model';
import { PopupAddSignFileComponent } from 'projects/codx-es/src/lib/sign-file/popup-add-sign-file/popup-add-sign-file.component';
import { AssignInfoComponent } from 'projects/codx-share/src/lib/components/assign-info/assign-info.component';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { CodxImportComponent } from 'projects/codx-share/src/lib/components/codx-import/codx-import.component';
import { TM_Tasks } from 'projects/codx-tm/src/lib/models/TM_Tasks.model';
import {
  convertHtmlAgency2,
  extractContent,
  formatDtDis,
  getListImg,
} from '../../function/default.function';
import { DispatchService } from '../../services/dispatch.service';
import { AddLinkComponent } from '../addlink/addlink.component';
import { CompletedComponent } from '../completed/completed.component';
import { ForwardComponent } from '../forward/forward.component';
import { IncommingAddComponent } from '../incomming-add/incomming-add.component';
import { SendEmailComponent } from '../sendemail/sendemail.component';
import { SharingComponent } from '../sharing/sharing.component';
import { UpdateExtendComponent } from '../update/update.component';

@Component({
  selector: 'app-view-detail',
  templateUrl: './view-detail.component.html',
  styleUrls: ['./view-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ViewDetailComponent implements OnInit, OnChanges {
  active = 1;
  checkUserPer: any;
  userID: any;
  @Input() pfuncID: any;
  @Input() data: any;
  @Input() gridViewSetup: any;
  @Input() view: ViewsComponent;
  @Input() getDataDispatch: Function;
  @Input() dataItem: any;
  @Input() hideMF = false;
  @Input() hideFooter = false;
  @Output() uploaded = new EventEmitter<string>();
  @ViewChild('tmpdeadline') tmpdeadline: any;
  @ViewChild('tmpFolderCopy') tmpFolderCopy: any;
  @ViewChild('tmpexport') tmpexport!: any;
  extractContent = extractContent;
  convertHtmlAgency = convertHtmlAgency2;
  dvlSecurity: any;
  dvlUrgency: any;
  dvlStatus: any;
  dvlCategory: any;
  dvlRelType: any;
  dvlStatusRel: any;
  dvlReCall: any;
  dvlStatusTM: any;
  formModel: any;
  dialog!: DialogRef;
  name: any;
  ms020: any;
  ms021: any;
  ms023: any;
  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
    private odService: DispatchService,
    private authStore: AuthStore,
    private notifySvr: NotificationsService,
    private callfunc: CallFuncService,
    private ref: ChangeDetectorRef
  ) {}
  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes?.data &&
      changes.data?.previousValue?.recID != changes.data?.currentValue?.recID
    ) {
      this.userID = this.authStore.get().userID;
      this.data = changes.data?.currentValue;
      if (!this.data) this.data = {};
      this.getDataValuelist();
      this.getPermission(this.data.recID);
      this.ref.detectChanges();
    }
    if (
      changes?.dataItem &&
      changes?.dataItem?.currentValue != changes?.dataItem?.previousValue
    )
      this.dataItem = changes?.dataItem?.currentValue;
    if (changes?.view?.currentValue != changes?.view?.previousValue)
      this.formModel = changes?.view?.currentValue?.formModel;
    if (changes?.pfuncID?.currentValue != changes?.pfuncID?.previousValue) {
      this.pfuncID = changes?.pfuncID?.currentValue;
      if (this.pfuncID) this.getGridViewSetup(this.pfuncID);
    }
    if (
      changes?.gridViewSetup?.currentValue !=
      changes?.gridViewSetup?.previousValue
    )
      this.gridViewSetup = changes?.gridViewSetup?.currentValue;
    this.active = 1;
    this.setHeight();
  }
  ngOnInit(): void {
    this.active = 1;
    this.formModel = this.view.formModel;
    //this.data = this.view.dataService.dataSelected;
    this.userID = this.authStore.get().userID;
    this.getDataValuelist();
  }
  setHeight() {
    let main, header = 0;
    let ele = document.getElementsByClassName(
      'codx-detail-main'
    ) as HTMLCollectionOf<HTMLElement>;
    if (ele) {
      main = Array.from(ele)[0]?.offsetHeight;
    }

    let eleheader = document.getElementsByClassName(
      'codx-detail-header'
    ) as HTMLCollectionOf<HTMLElement>;
    if (ele) {
      header = Array.from(eleheader)[0]?.offsetHeight;
    }

    let nodes = document.getElementsByClassName(
      'codx-detail-body'
    ) as HTMLCollectionOf<HTMLElement>;
    if (nodes.length > 0) {
      Array.from(
        document.getElementsByClassName(
          'codx-detail-body'
        ) as HTMLCollectionOf<HTMLElement>
      )[0].style.height = main - header - 27 + 'px';
    }
  }
  getGridViewSetup(funcID: any) {
    this.cache.functionList(funcID).subscribe((fuc) => {
      this.formModel = {
        entityName: fuc?.entityName,
        formName: fuc?.formName,
        funcID: funcID,
        gridViewName: fuc?.gridViewName,
      };
      this.cache
        .gridViewSetup(fuc?.formName, fuc?.gridViewName)
        .subscribe((grd) => {
          this.gridViewSetup = grd;
        });
    });
    this.cache.message('OD020').subscribe((item) => {
      this.ms020 = item;
    });
    this.cache.message('OD021').subscribe((item) => {
      this.ms021 = item;
    });
    this.cache.message('OD023').subscribe((item) => {
      this.ms023 = item;
    });
    this.cache.valueList('OD008').subscribe((item) => {
      this.dvlRelType = item;
    });
  }
  ///////////////Các function format valuelist///////////////////////
  fmTextValuelist(val: any, type: any) {
    var name = '';
    try {
      switch (type) {
        //Security
        case '1': {
          var data = this.dvlSecurity?.datas.filter(function (el: any) {
            return el.value == val;
          });
          return data[0].text;
        }
        // Mức độ khẩn
        case '2': {
          var data = this.dvlUrgency?.datas.filter(function (el: any) {
            return el.value == val;
          });
          return data[0].text;
        }
        // Trạng thái
        case '3': {
          var data = this.dvlStatus?.datas.filter(function (el: any) {
            return el.value == val;
          });
          return data[0].text;
        }
        // Phân loại
        case '4': {
          var data = this.dvlCategory?.datas.filter(function (el: any) {
            return el.value == val;
          });
          return data[0].text;
        }
        // Trạng thái Status
        case '5': {
          var data = this.dvlStatusRel?.datas.filter(function (el: any) {
            return el.value == val;
          });
          return data[0].text;
        }
        // Trạng thái RelationType
        case '6': {
          var data = this.dvlRelType?.datas.filter(function (el: any) {
            return el.value == val;
          });
          return data[0].text;
        }
        // Trạng thái Status "TM"
        case '7': {
          if (val == true) val = '1';
          var data = this.dvlStatusTM?.datas.filter(function (el: any) {
            return el.value == val;
          });
          return data[0].text;
        }
      }
      return name;
    } catch (ex) {
      return '';
    }
  }
  getDataValuelist() {
    if (this.gridViewSetup['Security']['referedValue'])
      this.cache
        .valueList(this.gridViewSetup['Security']['referedValue'])
        .subscribe((item) => {
          this.dvlSecurity = item;
        });
    if (this.gridViewSetup['Urgency']['referedValue'])
      this.cache
        .valueList(this.gridViewSetup['Urgency']['referedValue'])
        .subscribe((item) => {
          this.dvlUrgency = item;
          //this.ref.detectChanges();
        });
    if (this.gridViewSetup['Status']['referedValue'])
      this.cache
        .valueList(this.gridViewSetup['Status']['referedValue'])
        .subscribe((item) => {
          this.dvlStatus = item;
          console.log(this.dvlStatus);
          //this.ref.detectChanges();
        });
    if (this.gridViewSetup['Category']['referedValue'])
      this.cache
        .valueList(this.gridViewSetup['Category']['referedValue'])
        .subscribe((item) => {
          this.dvlCategory = item;
          //this.ref.detectChanges();
        });
    this.cache.valueList('OD008').subscribe((item) => {
      this.dvlRelType = item;
    });
    this.cache.valueList('OD009').subscribe((item) => {
      this.dvlStatusRel = item;
    });
    this.cache.valueList('OD010').subscribe((item) => {
      this.dvlReCall = item;
    });
    this.cache.valueList('L0614').subscribe((item) => {
      this.dvlStatusTM = item;
    });
    this.cache.message('OD020').subscribe((item) => {
      this.ms020 = item;
    });
    this.cache.message('OD021').subscribe((item) => {
      this.ms021 = item;
    });
  }
  getTextColor(val: any, type: any) {
    try {
      switch (type) {
        //Security
        case '1': {
          var data = this.dvlSecurity?.datas.filter(function (el) {
            return el.value == val;
          });
          if (data[0].textColor == null) return 'gray';
          return data[0].textColor;
        }
        //Mức độ khẩn
        case '2': {
          var data = this.dvlUrgency?.datas.filter(function (el) {
            return el.value == val;
          });
          if (data[0].textColor == null) return 'gray';
          return data[0].textColor;
        }
        //Trạng thái
        case '3': {
          var data = this.dvlStatus?.datas.filter(function (el) {
            return el.value == val;
          });
          if (data[0].textColor == null) return 'black';
          return data[0].textColor;
        }
        // Trạng thái Status
        case '4': {
          var data = this.dvlStatusRel?.datas.filter(function (el) {
            return el.value == val;
          });
          if (data[0].textColor == null) return 'black';
          return data[0].textColor;
        }
        // Trạng thái Status "TM"
        case '5': {
          var data = this.dvlStatusTM?.datas.filter(function (el: any) {
            return el.value == val;
          });
          if (data[0].textColor == null) return 'black';
          return data[0].textColor;
        }
        // Trạng thái Status "TM"
        case '6': {
          var data = this.dvlReCall?.datas.filter(function (el: any) {
            return el.value == val;
          });
          if (data[0].textColor == null) return '#B2862D';
          return data[0].textColor;
        }
      }
    } catch (ex) {
      return 'gray';
    }
  }
  getBgColor(val: any, type: any) {
    try {
      switch (type) {
        //Trạng thái
        case '3': {
          var data = this.dvlStatus?.datas.filter(function (el) {
            return el.value == val;
          });
          if (data[0].color == null) return 'black';
          return data[0].color;
        }
        // Trạng thái Status
        case '4': {
          var data = this.dvlStatusRel?.datas.filter(function (el) {
            return el.value == val;
          });
          if (data[0].color == null) return 'black';
          return data[0].color;
        }
        // Trạng thái Status
        case '5': {
          if (val == true) val = '1';
          var data = this.dvlReCall?.datas.filter(function (el) {
            return el.value == val;
          });
          if (data[0].color == null) return '#F2CB7C';
          return data[0].color;
        }
      }
    } catch (ex) {
      return 'white';
    }
  }
  getPermission(recID: any) {
    this.odService.checkUserPermiss(recID, this.userID).subscribe((item) => {
      if (item.status == 0) this.checkUserPer = item.data;
    });
  }
  openFormFuncID(val: any, datas: any = null) {
    var funcID = val?.functionID;
    if (!datas) datas = this.data;
    else {
      var index = this.view.dataService.data.findIndex((object) => {
        return object.recID === datas.recID;
      });
      datas = this.view.dataService.data[index];
    }
    if (funcID != 'recallUser' && funcID != 'ODT201' && funcID != "SYS02")
      this.view.dataService.onAction.next({ type: 'update', data: datas });
    delete datas._uuid;
    delete datas.__loading;
    delete datas.isNew;
    delete datas.hasChildren;
    delete datas.includeTables;
    switch (funcID) {
      //Sửa
      case 'SYS03': {
        this.view.dataService.edit(datas).subscribe((res: any) => {
          let option = new SidebarModel();
          option.DataService = this.view?.currentView?.dataService;
          this.dialog = this.callfunc.openSide(
            IncommingAddComponent,
            {
              gridViewSetup: this.gridViewSetup,
              headerText: 'Chỉnh sửa công văn đến',
              formModel: this.formModel,
              type: 'edit',
              data: datas,
            },
            option
          );
          this.dialog.closed.subscribe((x) => {
            if (x.event) {
              //this.ref.detectChanges();
              //var index = this.view.dataService.data.findIndex(i => i.recID === x.event.recID);
              //this.view.dataService.update(x.event).subscribe();
              //this.view.dataService.add(x.event,index,true).subscribe((index)=>{
              //this.view.dataService.update(x.event).subscribe();

              this.odService
                .getDetailDispatch(x.event.recID)
                .subscribe((item) => {
                  this.data = item;
                  this.data.lstUserID = getListImg(item.relations);
                  /*  var foundIndex = this.view.dataService.data.findIndex((a: { recID: string }) => a.recID == x.event.recID);
                    this.view.dataService.setDataSelected(x.event); */
                });
              /*  if(x.event.recID == this.view.dataService.dataSelected.recID)
                    this.odService.getDetailDispatch(x.event.recID).subscribe(item => {
                      this.data = item;
                      this.data.lstUserID = getListImg(item.relations);
                    }); */
              //});
            }
          });
        });
        break;
      }
      //Xóa
      case 'SYS02': {
        this.view.dataService.dataSelected = datas;
        this.view.dataService
          .delete([datas], true, (opt) => this.beforeDel(opt))
          .subscribe((item: any) => {
            if (item.status == 0) {
              this.odService
                .getDetailDispatch(this.view.dataService.data[0].recID)
                .subscribe((item) => {
                  this.data = formatDtDis(item);
                  this.view.dataService.setDataSelected(this.data);
                  this.data.lstUserID = getListImg(this.data.relations);
                });
            }
          });
        break;
      }
      //Copy
      case 'SYS04': {
        this.view.dataService.dataSelected = datas;
        this.view.dataService.copy(0).subscribe((res: any) => {
          let option = new SidebarModel();
          option.DataService = this.view?.currentView?.dataService;
          this.dialog = this.callfunc.openSide(
            IncommingAddComponent,
            {
              gridViewSetup: this.gridViewSetup,
              headerText: 'Sao chép công văn đến',
              type: 'copy',
              formModel: this.formModel,
            },
            option
          );
          this.dialog.closed.subscribe((x) => {
            if (x.event == null) {
              //this.view.dataService.delete([this.view.dataService.dataSelected]).subscribe();
              this.view.dataService
                .remove(this.view.dataService.dataSelected)
                .subscribe();
            } else this.view.dataService.add(x.event, 0).subscribe();
          });
        });
        break;
      }
      //Chuyển
      case 'ODT101': {
        /* if(this.checkOpenForm(funcID))
          {
            /*
          } */
        var data = datas;
        let option = new SidebarModel();
        option.DataService = this.view?.currentView?.dataService;
        this.dialog = this.callfunc.openSide(
          ForwardComponent,
          {
            gridViewSetup: this.gridViewSetup,
            files: this.data?.files,
          },
          option
        );
        this.dialog.closed.subscribe((x) => {
          if (x.event) {
            this.data.owner = x.event[0].owner;
            this.data.lstUserID = getListImg(x.event[0].relations);
            this.data.listInformationRel = this.data.listInformationRel.concat(
              x.event[1]
            );
            this.view.dataService.update(x.event[0]).subscribe();
          }
        });
        break;
      }
      //Giao việc
      case 'ODT102': {
        if (this.checkOpenForm(funcID)) {
        }
        var task = new TM_Tasks();
        task.refID = datas?.recID;
        task.refType = this.view?.formModel.entityName;
        var vllControlShare = 'TM003';
        var vllRose = 'TM002';
        var title = val?.data.customName;
        let option = new SidebarModel();
        option.DataService = this.view?.dataService;
        option.FormModel = this.view?.formModel;
        option.Width = '550px';
        this.dialog = this.callfunc.openSide(
          AssignInfoComponent,
          [task, vllControlShare, vllRose, title],
          option
        );
        this.dialog.closed.subscribe((e) => {
          if (e?.event && e?.event[0]) {
            datas.status = '3';
            this.odService.updateDispatch(datas, false).subscribe((item) => {
              if (item.status == 0) {
                this.view.dataService.update(datas).subscribe();
              } else this.notifySvr.notify(item.message);
            });
          }
        });
        break;
      }
      //Cập nhật
      case 'ODT103':
      case 'ODT202': {
        //if(this.checkOpenForm(funcID))
        var option = new DialogModel();
        option.FormModel = this.formModel;
        this.callfunc
          .openForm(
            UpdateExtendComponent,
            null,
            600,
            400,
            null,
            { data: datas },
            '',
            option
          )
          .closed.subscribe((x) => {
            if (x.event) this.view.dataService.update(x.event).subscribe();
          });
        break;
      }
      //Chia sẻ
      case 'ODT104':
      case 'ODT203': {
        if (this.checkOpenForm(funcID)) {
        }
        let option = new SidebarModel();
        option.DataService = this.view?.currentView?.dataService;
        option.FormModel = this.view?.formModel;

        this.dialog = this.callfunc.openSide(
          SharingComponent,
          {
            gridViewSetup: this.gridViewSetup,
            option: option,
            files: this.data?.files,
          },
          option
        );
        this.dialog.closed.subscribe((x) => {
          if (x.event) {
            this.data.lstUserID = getListImg(x.event[0].relations);
            this.data.listInformationRel = this.data.listInformationRel.concat(
              x.event[1]
            );
          }
        });
        break;
      }
      //Thu hồi
      case 'ODT105':
      case 'ODT204': {
        var config = new AlertConfirmInputConfig();
        config.type = 'YesNo';
        this.notifySvr
          .alert('Thông báo', 'Bạn có chắc chắn muốn thu hồi?', config)
          .closed.subscribe((x) => {
            if (x.event.status == 'Y') this.recall(datas.recID);
          });
        break;
      }
      //liên kết văn bản
      case 'ODT106':
      case 'ODT205': {
        /* if(this.checkOpenForm(funcID))
          {

          } */
        let option = new SidebarModel();
        option.DataService = this.view?.currentView?.dataService;
        option.FormModel = this.view?.formModel;
        option.Width = '550px';
        this.dialog = this.callfunc.openSide(
          AddLinkComponent,
          {
            gridViewSetup: this.gridViewSetup,
            option: option,
          },
          option
        );
        this.dialog.closed.subscribe((x) => {
          if (x.event) {
            /*  this.data.lstUserID = getListImg(x.event[0].relations);
              this.data.listInformationRel = this.data.listInformationRel.concat(x.event[1]); */
          }
        });
        break;
      }
      //Gia hạn
      case 'ODT107':
      case 'ODT206': {
        if (this.checkOpenForm(funcID)) {
        }
        this.callfunc
          .openForm(this.tmpdeadline, null, 600, 400)
          .closed.subscribe((x) => {
            if (x.event) {
              this.data.deadline = x.event?.deadline;
              this.updateNotCallFuntion(x.event);
            }
          });
        break;
      }
      //Quản lý phiên bản
      case 'ODT108':
      case 'ODT207': {
        if (this.checkOpenForm(funcID)) {
        }
        break;
      }
      //Chuyển vào thư mục
      case 'ODT109':
      case 'ODT208': {
        //  if(this.checkOpenForm(funcID))
        // {
        // this.callfunc.openForm(FolderComponent, null, 600, 400);
        this.callfunc.openForm(this.tmpFolderCopy, null, 600, 400);
        //}
        break;
      }
      //Bookmark
      case 'ODT110':
      case 'ODT209':
      case 'ODT111':
      case 'ODT210': {
        this.odService.bookMark(datas.recID).subscribe((item) => {
          if (item.status == 0) {
            this.view.dataService.update(item.data).subscribe();
          }
          this.notifySvr.notify(item.message);
        });
        break;
      }
      //Gửi email
      case 'SYS004': {
        let option = new SidebarModel();
        option.DataService = this.view?.currentView?.dataService;
        this.dialog = this.callfunc.openSide(
          SendEmailComponent,
          {
            gridViewSetup: this.gridViewSetup,
          },
          option
        );
        this.dialog.closed.subscribe((x) => {
          if (x.event != null) {
            this.data = x.event[0];
            this.data.lstUserID = getListImg(x.event[0].relations);
            this.data.listInformationRel = x.event[1];
          }
        });
        break;
      }
      case 'recallUser': {
        var config = new AlertConfirmInputConfig();
        config.type = 'YesNo';
        this.notifySvr
          .alert(
            'Thông báo',
            'Hệ thống sẽ thu hồi quyền đã chia sẻ của người này bạn có muốn xác nhận hay không ?',
            config
          )
          .closed.subscribe((x) => {
            if (x.event.status == 'Y') {
              this.odService
                .recallSharing(
                  this.view.dataService.dataSelected.recID,
                  val?.relID
                )
                .subscribe((item) => {
                  if (item.status == 0) {
                    this.data.relations = item.data[0].relations;
                    this.data.lstUserID = getListImg(item.data[0].relations);
                    var index = this.data.listInformationRel.findIndex(
                      (x) => x.userID == item.data[1]
                    );
                    this.data.listInformationRel[index].reCall = true;
                    this.ref.detectChanges();
                    //this.data.listInformationRel = item.data[1];
                  }
                  this.notifySvr.notify(item.message);
                });
            }
          });
        break;
      }
      //Import file
      case 'SYS001': {
        this.callfunc.openForm(
          CodxImportComponent,
          null,
          900,
          800,
          '',
          this.formModel,
          null
        );
        break;
      }
      //Export file
      case 'SYS002': {
        var gridModel = new DataRequest();
        gridModel.formName = this.formModel.formName;
        gridModel.entityName = this.formModel.entityName;
        gridModel.funcID = this.formModel.funcID;
        gridModel.gridViewName = this.formModel.gridViewName;
        gridModel.page = this.view.dataService.request.page;
        gridModel.pageSize = this.view.dataService.request.pageSize;
        gridModel.predicate = this.view.dataService.request.predicates;
        gridModel.dataValue = this.view.dataService.request.dataValues;
        gridModel.entityPermission = this.formModel.entityPer;
        //Chưa có group
        gridModel.groupFields = 'createdBy';
        this.callfunc.openForm(
          CodxExportComponent,
          null,
          900,
          700,
          '',
          [gridModel, datas.recID],
          null
        );
        break;
      }
      //Gửi duyệt
      case 'ODT201': {
        this.api
          .execSv(
            'ES',
            'ES',
            'ApprovalTransBusiness',
            'GetCategoryByProcessIDAsync',
            '350d611b-1de0-11ed-9448-00155d035517'
          )
          .subscribe((res2: any) => {
            let dialogModel = new DialogModel();
            dialogModel.IsFull = true;

            //trình ký
            if (res2?.eSign == true) {
              let signFile = new ES_SignFile();
              signFile.recID = datas.recID;
              signFile.title = datas.title;
              signFile.categoryID = res2?.categoryID;
              signFile.refId = datas.recID;
              signFile.refDate = datas.refDate;
              signFile.refNo = datas.refNo;
              signFile.priority = datas.urgency;
              signFile.files = [];
              if (this.data?.files) {
                for (var i = 0; i < this.data?.files.length; i++) {
                  var file = new File();
                  file.fileID = this.data?.files[i].recID;
                  file.fileName = this.data?.files[i].fileName;
                  signFile.files.push(file);
                }
              }
              let dialogApprove = this.callfunc.openForm(
                PopupAddSignFileComponent,
                'Chỉnh sửa',
                700,
                650,
                '',
                {
                  oSignFile: signFile,
                  files: this.data?.files,
                  formModel: this.view?.currentView?.formModel,
                },
                '',
                dialogModel
              );
              dialogApprove.closed.subscribe((res) => {
                if (res.event && res.event?.approved == true) {
                  datas.status = '3';
                  datas.approveStatus = '3';
                  this.odService
                    .updateDispatch(datas, false)
                    .subscribe((item) => {
                      if (item.status == 0) {
                        this.view.dataService.update(item?.data).subscribe();
                      } else this.notifySvr.notify(item.message);
                    });
                }
              });
              //this.callfunc.openForm();
            } else if (res2?.eSign == false)
              //xét duyệt
              this.release(datas);
          });
        break;
      }
      //Hoàn tất
      case 'ODT112':
      case 'ODT211': {
        var option = new DialogModel();
        option.FormModel = this.formModel;
        this.callfunc
          .openForm(
            CompletedComponent,
            null,
            600,
            400,
            null,
            { data: datas },
            '',
            option
          )
          .closed.subscribe((x) => {
            if (x?.event == 0) {
              datas.status = '7';
              this.view.dataService.update(datas).subscribe();
            }
          });
        break;
      }
    }
  }
  beforeDel(opt: RequestOption) {
    opt.methodName = 'DeleteDispatchByIDAsync';
    opt.data = this.view.dataService.dataSelected;
    return true;
  }
  checkOpenForm(val: any) {
    if (val == 'ODT108' && this.checkUserPer?.created) return true;
    else if ((val == 'ODT109' || val == 'ODT110') && this.checkUserPer?.read)
      return true;
    else if (this.checkUserPer?.created || this.checkUserPer?.owner)
      return true;
    else this.notifySvr.notify('Bạn không có quyền thực hiện chức năng này.');
    return false;
  }
  //Thu hồi quyền
  recall(id: any) {
    this.odService.recallRelation(id).subscribe((item) => {
      if (item.status == 0) {
        //this.data = item.data[0];
        this.data.lstUserID = getListImg(item.data[0].relations);
        for (var i = 0; i < this.data.listInformationRel.length; i++) {
          if (
            this.data.listInformationRel[i].userID != this.data?.owner &&
            this.data.listInformationRel[i].relationType != '1'
          )
            this.data.listInformationRel[i].reCall = true;
        }
        //this.data.listInformationRel = item.data[1];
      }
      this.notifySvr.notify(item.message);
    });
  }
  getJSONString(data) {
    return JSON.stringify(data);
  }
  getSubTitle(relationType: any, agencyName: any, shareBy: any) {
    if (relationType == '1') {
      if (this.formModel.funcID == 'ODT31') {
        return Util.stringFormat(
          this.ms020?.customName,
          this.fmTextValuelist(relationType, '6'),
          agencyName
        );
      } else {
        return 'Gửi đến ' + agencyName;
        /* return Util.stringFormat(
          this.ms023?.customName,
          this.fmTextValuelist(relationType, '6'),
          agencyName
        ); */
      }
    }

    return Util.stringFormat(
      this.ms021?.customName,
      this.fmTextValuelist(relationType, '6'),
      shareBy
    );
  }
  updateNotCallFuntion(data: any) {
    const index = this.view.dataService.data.findIndex((object) => {
      return object.recID == data?.recID;
    });
    this.view.dataService.data[index] = data;
  }
  changeDataMF(e: any, data: any) {
    var bm = e.filter(
      (x: { functionID: string }) =>
        x.functionID == 'ODT110' || x.functionID == 'ODT209'
    );
    var unbm = e.filter(
      (x: { functionID: string }) =>
        x.functionID == 'ODT111' || x.functionID == 'ODT210'
    );
    if (data?.isBookmark) {
      bm[0].disabled = true;
      unbm[0].disabled = false;
    } else {
      unbm[0].disabled = true;
      bm[0].disabled = false;
    }
    if (
      this.formModel.funcID == 'ODT41' &&
      data?.status != '1' &&
      data?.status != '2'
    ) {
      var approvel = e.filter(
        (x: { functionID: string }) => x.functionID == 'ODT201'
      );
      approvel[0].disabled = true;
    }
    if (data?.status == '7') {
      var completed = e.filter(
        (x: { functionID: string }) =>
          x.functionID == 'ODT211' ||
          x.functionID == 'ODT112' ||
          x.functionID == 'SYS02' ||
          x.functionID == 'SYS03'
      );
      for (var i = 0; i < completed.length; i++) {
        completed[i].disabled = true;
      }
    }
    if (data?.status == '3') {
      var completed = e.filter(
        (x: { functionID: string }) =>
          x.functionID == 'SYS02' || x.functionID == 'ODT101'
      );
      completed.forEach((elm) => {
        elm.disabled = true;
      });
    }
    //data?.isblur = true
  }
  //Gửi duyệt
  release(data: any) {
    this.api
      .execSv(
        this.view.service,
        'ERM.Business.CM',
        'DataBusiness',
        'ReleaseAsync',
        [
          data?.recID,
          '3B7EEF22-780C-4EF7-ABA9-BFF0EA7FE9D3',
          this.view.formModel.entityName,
          this.formModel.funcID,
          '<div>' + data?.title + '</div>',
        ]
      )
      .subscribe((res2: any) => {
        if (res2?.msgCodeError) this.notifySvr.notify(res2?.msgCodeError);
        else {
          data.status = '3';
          data.approveStatus = '3';
          this.odService.updateDispatch(data, false).subscribe((item) => {
            if (item.status == 0) {
              this.view.dataService.update(item?.data).subscribe();
            } else this.notifySvr.notify(item.message);
          });
        }
        //this.notifySvr.notify(res2?.msgCodeError)
      });
  }
  handleViewFile(e: any) {
    if (e == true) {
      var index = this.data.listInformationRel.findIndex(
        (x) => x.userID == this.userID
      );
      this.data.listInformationRel[index].view = '3';
    }
  }
}
