import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  AlertConfirmInputConfig,
  AuthStore,
  DataRequest,
  DialogModel,
  DialogRef,
  NotificationsService,
  RequestOption,
  SidebarModel,
  Util,
  ViewsComponent,
  UIDetailComponent
} from 'codx-core';
import { ES_SignFile, File } from 'projects/codx-es/src/lib/codx-es.model';
import { PopupAddSignFileComponent } from 'projects/codx-es/src/lib/sign-file/popup-add-sign-file/popup-add-sign-file.component';
import { AssignInfoComponent } from 'projects/codx-share/src/lib/components/assign-info/assign-info.component';
import { CodxEmailComponent } from 'projects/codx-share/src/lib/components/codx-email/codx-email.component';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { CodxImportComponent } from 'projects/codx-share/src/lib/components/codx-import/codx-import.component';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { AssignTaskModel } from 'projects/codx-share/src/lib/models/assign-task.model';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { TM_Tasks } from 'projects/codx-tm/src/lib/models/TM_Tasks.model';
import { isObservable } from 'rxjs';
import { CodxOdService } from '../../codx-od.service';
import {
  convertHtmlAgency2,
  extractContent,
  formatDtDis,
  getIdUser,
  getListImg,
} from '../../function/default.function';
import { DispatchService } from '../../services/dispatch.service';
import { AddLinkComponent } from '../addlink/addlink.component';
import { CompletedComponent } from '../completed/completed.component';
import { ForwardComponent } from '../forward/forward.component';
import { IncommingAddComponent } from '../incomming-add/incomming-add.component';
import { RefuseComponent } from '../refuse/refuse.component';
import { SendEmailComponent } from '../sendemail/sendemail.component';
import { SharingComponent } from '../sharing/sharing.component';
import { UpdateExtendComponent } from '../update/update.component';
import { Permission } from '@shared/models/file.model';
import { UpdateVersionComponent } from '../updateversion/updateversion.component';
import { ApproveProcess } from 'projects/codx-share/src/lib/models/ApproveProcess.model';

@Component({
  selector: 'app-view-detail',
  templateUrl: './view-detail.component.html',
  styleUrls: ['./view-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ViewDetailComponent extends  UIDetailComponent implements OnChanges, AfterViewInit {
  @ViewChild('reference') reference: TemplateRef<ElementRef>;
  @Input() data: any = { category: 'Phân loại công văn' };
  @Input() gridViewSetup: any;
  @Input() view: ViewsComponent;
  @Input() getDataDispatch: Function;
  @Input() dataItem: any;
  @Input() hideMF = false;
  @Input() hideFooter = false;
  @Input() xd = false;
  @Output() uploaded = new EventEmitter<string>();
  @ViewChild('tmpdeadline') tmpdeadline: any;
  @ViewChild('tmpFolderCopy') tmpFolderCopy: any;
  @ViewChild('tmpexport') tmpexport!: any;

  extractContent = extractContent;
  convertHtmlAgency = convertHtmlAgency2;
  getIdUser = getIdUser;

  tabControl: TabModel[] = [];
  active = 1;
  checkUserPer: any;
  userID: any;
  referType = 'source';
  dvlSecurity: any;
  dvlUrgency: any;
  dvlStatus: any;
  dvlCategory: any;
  dvlRelType: any;
  dvlStatusRel: any;
  dvlReCall: any;
  dvlStatusTM: any;
  formModel: any;
  formModels: any;
  dialog!: DialogRef;
  name: any;
  ms020: any;
  ms021: any;
  ms023: any;
  vllStatus = 'TM004';
  vllStatusAssign = 'TM007';
  funcList: any;
  dataRq = new DataRequest();
  listPermission = [];
  constructor(
    inject: Injector,
    private odService: DispatchService,
    private authStore: AuthStore,
    private notifySvr: NotificationsService,
    private codxODService: CodxOdService,
    private shareService: CodxShareService
  ) {
    super(inject);
  }

  override onInit(): void {
    this.active = 1;
    this.formModel = this.view?.formModel;
    //this.data = this.view.dataService.dataSelected;
    this.userID = this.authStore.get().userID;
    this.dataRq.entityName = this.formModel?.entityName;
    this.dataRq.formName = this.formModel?.formName;
    this.dataRq.funcID = this.formModel?.funcID;
    this.getGridViewSetup(this.funcID);
  }

  ngAfterViewInit(): void {
    this.tabControl = [
      {
        name: 'History',
        textDefault: 'Lịch sử',
        isActive: true,
        icon: 'icon-i-clock-history',
      },
      {
        name: 'Attachment',
        textDefault: 'Đính kèm',
        isActive: false,
        icon: 'icon-i-paperclip',
      },
      {
        name: 'Comment',
        textDefault: 'Bình luận',
        isActive: false,
        icon: 'icon-i-chat-right',
      },
    ];
    if (
      this.funcList?.defaultValue == '2' ||
      (this.funcList?.defaultValue == '3' && this.dataItem?.dispatchType == '3') ||
      this.xd
    )
      this.tabControl.push({
        name: 'Approve',
        textDefault: 'Xét duyệt',
        isActive: false,
      });

    if (this.funcList?.defaultValue != '2' && this.funcList?.defaultValue != '3') {
      this.tabControl.push({
        name: 'AssignTo',
        textDefault: 'Giao việc',
        isActive: false,
        icon: 'icon-i-clipboard-check',
      });
    }
    this.setHeight();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes?.dataItem &&
      changes?.dataItem?.currentValue != changes?.dataItem?.previousValue
    )
      this.dataItem = changes?.dataItem?.currentValue;
    if (
      changes?.recID &&
      changes.recID?.previousValue != changes.recID?.currentValue
    ) {
      this.userID = this.authStore.get().userID;
      this.recID = changes.recID?.currentValue;
      if (!this.data) this.data = {};

      this.getDtDis(this.recID)
      this.getPermission(this.recID);

      this.detectorRef.detectChanges();
    }
    if (changes?.view?.currentValue != changes?.view?.previousValue)
      this.formModel = changes?.view?.currentValue?.formModel;
    if (changes?.funcID?.currentValue != changes?.funcID?.previousValue) {
      this.funcID = changes?.funcID?.currentValue;
      if (this.funcID) this.getGridViewSetup(this.funcID);
    }
    if (
      changes?.gridViewSetup?.currentValue !=
      changes?.gridViewSetup?.previousValue
    )
      this.gridViewSetup = changes?.gridViewSetup?.currentValue;
    this.active = 1;
    this.setHeight();
    this.addPermission();
  }


  //Hàm lấy thông tin chi tiết của công văn
  getDtDis(id: any) {
    this.data = null;
    if (id) {
      this.odService
        .getDetailDispatch(id, this.formModel.entityName , this.referType , false , this.funcID)
        .subscribe((item) => {
          if (item) {
            this.data = formatDtDis(item);
          }
        });
    }
  }
  setHeight() {
    let main = 0,
      header = 0;
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
      header = (!header || header< 220) ? 220 : header;
    }

    let nodes = document.getElementsByClassName(
      'codx-detail-body'
    ) as HTMLCollectionOf<HTMLElement>;
    if (nodes.length > 0) {
      var a = 0;
      if (this.view?.formModel?.funcID.includes('ODT8')) a = 70;
      Array.from(
        document.getElementsByClassName(
          'codx-detail-body'
        ) as HTMLCollectionOf<HTMLElement>
      )[0].style.height = main - header - 65 - a + 'px';
    }
  }

  getGridViewSetup(funcID: any) {
    var funcList = this.codxODService.loadFunctionList(funcID);

    if (isObservable(funcList)) {
      funcList.subscribe((fuc) => {
        this.funcList = fuc;
        this.formModels = {
          entityName: this.funcList?.entityName,
          formName: this.funcList?.formName,
          funcID: funcID,
          gridViewName: this.funcList?.gridViewName,
        };
        if (!this.formModel) this.formModel = this.formModels;
        var gw = this.codxODService.loadGridView(
          this.funcList?.formName,
          this.funcList?.gridViewName
        );
        if (isObservable(gw)) {
          gw.subscribe((grd) => {
            this.gridViewSetup = grd;
            this.getDataValuelist();
          });
        } else {
          this.gridViewSetup = gw;
          this.getDataValuelist();
        }
        this.getDtDis(this.recID)
      });
    } else {
      this.funcList = funcList;
      this.formModels = {
        entityName: this.funcList?.entityName,
        formName: this.funcList?.formName,
        funcID: funcID,
        gridViewName: this.funcList?.gridViewName,
      };
      if (!this.formModel) this.formModel = this.formModels;
      this.getDtDis(this.recID)
      var gw = this.codxODService.loadGridView(
        this.funcList?.formName,
        this.funcList?.gridViewName
      );

      if (isObservable(gw)) {
        gw.subscribe((grd) => {
          this.gridViewSetup = grd;
          this.getDataValuelist();
        });
      } else {
        this.gridViewSetup = gw;
        this.getDataValuelist();
      }
    }

    var ms020 = this.codxODService.loadMessage('OD020');
    if (isObservable(ms020)) {
      ms020.subscribe((item) => {
        this.ms020 = item;
      });
    } else this.ms020 = ms020;

    var ms021 = this.codxODService.loadMessage('OD021');
    if (isObservable(ms021)) {
      ms021.subscribe((item) => {
        this.ms021 = item;
      });
    } else this.ms021 = ms021;

    var ms023 = this.codxODService.loadMessage('OD023');
    if (isObservable(ms023)) {
      ms023.subscribe((item) => {
        this.ms023 = item;
      });
    } else this.ms023 = ms023;

    var dvlRelType = this.codxODService.loadValuelist('OD008');
    if (isObservable(dvlRelType)) {
      dvlRelType.subscribe((item) => {
        this.dvlRelType = item;
      });
    } else this.dvlRelType = dvlRelType;
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
    if (this.gridViewSetup['Security']['referedValue']) {
      var vll = this.codxODService.loadValuelist(
        this.gridViewSetup['Security']['referedValue']
      );
      if (isObservable(vll)) {
        vll.subscribe((item) => {
          this.dvlSecurity = item;
        });
      } else this.dvlSecurity = vll;
    }
    if (this.gridViewSetup['Urgency']['referedValue']) {
      var vll = this.codxODService.loadValuelist(
        this.gridViewSetup['Urgency']['referedValue']
      );
      if (isObservable(vll)) {
        vll.subscribe((item) => {
          this.dvlUrgency = item;
        });
      } else this.dvlUrgency = vll;
    }
    if (this.gridViewSetup['Status']['referedValue']) {
      var vll = this.codxODService.loadValuelist(
        this.gridViewSetup['Status']['referedValue']
      );
      if (isObservable(vll)) {
        vll.subscribe((item) => {
          this.dvlStatus = item;
        });
      } else this.dvlStatus = vll;
    }
    if (this.gridViewSetup['Category']['referedValue']) {
      var vll = this.codxODService.loadValuelist(
        this.gridViewSetup['Category']['referedValue']
      );
      if (isObservable(vll)) {
        vll.subscribe((item) => {
          this.dvlCategory = item;
        });
      } else this.dvlCategory = vll;
    }

    var vllRelType = this.codxODService.loadValuelist('OD008');
    if (isObservable(vllRelType)) {
      vllRelType.subscribe((item) => {
        this.dvlRelType = item;
      });
    } else this.dvlRelType = vllRelType;

    var vllStatusRel = this.codxODService.loadValuelist('OD009');
    if (isObservable(vllStatusRel)) {
      vllStatusRel.subscribe((item) => {
        this.dvlStatusRel = item;
      });
    } else this.dvlStatusRel = vllStatusRel;

    var vllReCall = this.codxODService.loadValuelist('OD010');
    if (isObservable(vllReCall)) {
      vllReCall.subscribe((item) => {
        this.dvlReCall = item;
      });
    } else this.dvlReCall = vllReCall;

    var vllStatusTM = this.codxODService.loadValuelist('L0614');
    if (isObservable(vllStatusTM)) {
      vllStatusTM.subscribe((item) => {
        this.dvlStatusTM = item;
      });
    } else this.dvlStatusTM = vllStatusTM;

    var ms020 = this.codxODService.loadMessage('OD020');
    if (isObservable(ms020)) {
      ms020.subscribe((item) => {
        this.ms020 = item;
      });
    } else this.ms020 = ms020;

    var ms021 = this.codxODService.loadMessage('OD021');
    if (isObservable(ms021)) {
      ms021.subscribe((item) => {
        this.ms021 = item;
      });
    } else this.ms021 = ms021;
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

  openFormFuncID(val: any, datas: any = null, isData = false) {
    let that = this;
    var funcID = val?.functionID;
    if (!datas) datas = this.data;
    else {
      var index = this.view.dataService.data.findIndex((object) => {
        return object.recID === datas.recID;
      });
      datas = this.view.dataService.data[index];
    }
    if (
      funcID != 'recallUser' &&
      funcID != 'ODT201' &&
      funcID != 'SYS02' &&
      this.view.dataService.dataSelected.recID != datas.recID
    )
      this.view.dataService.onAction.next({ type: 'update', data: datas });
    delete datas._uuid;
    delete datas.__loading;
    delete datas.isNew;
    delete datas.hasChildren;
    delete datas.includeTables;
    switch (funcID) {
      //chỉ xem
      case 'read':
        {
          let option = new SidebarModel();
          option.DataService = this.view?.currentView?.dataService;
          datas.relations = this.data.relations
          this.dialog = this.callfc.openSide(
            IncommingAddComponent,
            {
              gridViewSetup: this.gridViewSetup,
              headerText:
                val?.data?.customName +
                ' ' +
                (this.funcList?.customName).toLowerCase(),
              formModel: this.formModel,
              type: 'read',
              data: datas,
            },
            option
          );
          break;
        }
      //Sửa
      case 'SYS03': {
        this.view.dataService.edit(datas).subscribe((res: any) => {
          let option = new SidebarModel();
          option.DataService = this.view?.currentView?.dataService;
          datas.relations = this.data.relations
          this.dialog = this.callfc.openSide(
            IncommingAddComponent,
            {
              gridViewSetup: this.gridViewSetup,
              headerText:
                val?.data?.customName +
                ' ' +
                (this.funcList?.customName).toLowerCase(),
              formModel: this.formModel,
              type: 'edit',
              data: datas,
            },
            option
          );
          this.dialog.closed.subscribe((x) => {
            if (x.event) {
              //this.detectorRef.detectChanges();
              //var index = this.view.dataService.data.findIndex(i => i.recID === x.event.recID);
              //this.view.dataService.update(x.event).subscribe();
              //this.view.dataService.add(x.event,index,true).subscribe((index)=>{
              //this.view.dataService.update(x.event).subscribe();

              this.odService
                .getDetailDispatch(
                  x.event.recID,
                  this.formModel?.entityName,
                  this.referType
                )
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
                .getDetailDispatch(
                  this.view.dataService.data[0].recID,
                  this.view.formModel.entityName,
                  this.referType
                )
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
        this.view.dataService.copy().subscribe((res: any) => {
          this.view.dataService.dataSelected.recID = res?.recID;
          this.view.dataService.dataSelected.dispatchNo = res?.dispatchNo;
          this.view.dataService.dataSelected.owner = res?.owner;
          this.view.dataService.dataSelected.departmentID = res?.departmentID;
          let option = new SidebarModel();
          option.DataService = this.view?.currentView?.dataService;
          this.dialog = this.callfc.openSide(
            IncommingAddComponent,
            {
              gridViewSetup: this.gridViewSetup,
              headerText:
                val?.data?.customName +
                ' ' +
                (this.funcList?.customName).toLowerCase(),
              type: 'copy',
              formModel: this.formModel,
            },
            option
          );
          this.dialog.closed.subscribe((x) => {
            if (x.event) {
              this.view.dataService.add(x.event, 0).subscribe((item) => {
                this.view.dataService.onAction.next({
                  type: 'update',
                  data: x.event,
                });
              });
            }
          });
        });
        break;
      }
      //Chuyển
      case 'ODT101':
      case 'ODT5213': {
        /* if(this.checkOpenForm(funcID))
          {
            /*
          } */
        var data = datas;
        let option = new SidebarModel();
        option.DataService = this.view?.currentView?.dataService;
        this.dialog = this.callfc.openSide(
          ForwardComponent,
          {
            gridViewSetup: this.gridViewSetup,
            files: this.data?.files,
            formModel: this.formModel,
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
      //Cập nhật
      case 'ODT103':
      case 'ODT202':
      case 'ODT3002':
      case 'ODT5102':
      case 'ODT5203': {
        //if(this.checkOpenForm(funcID))
        var option = new DialogModel();
        option.FormModel = this.formModel;
        this.callfc
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
            if (x.event) {
              this.data = x.event;
              this.view.dataService.update(x.event).subscribe();
            }
          });
        break;
      }
      //Chia sẻ
      case 'ODT104':
      case 'ODT203':
      case 'ODT3003':
      case 'ODT5103':
      case 'ODT5204': {
        // if (this.checkOpenForm(funcID)) {
        // }
        let option = new SidebarModel();
        option.DataService = this.view?.currentView?.dataService;
        option.FormModel = this.view?.formModel;

        this.dialog = this.callfc.openSide(
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
            this.data.relations = x.event[0].relations;
            this.data.listInformationRel = this.data.listInformationRel.concat(
              x.event[1]
            );
          }
        });
        break;
      }
      //Thu hồi
      case 'ODT105':
      case 'ODT204':
      case 'ODT3004':
      case 'ODT5104':
      case 'ODT5205': {
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
      case 'ODT205':
      case 'ODT3005':
      case 'ODT5105':
      case 'ODT5206': {
        let option = new SidebarModel();
        option.DataService = this.view?.currentView?.dataService;
        option.FormModel = this.view?.formModel;
        option.Width = '850px';
        this.dialog = this.callfc.openSide(
          AddLinkComponent,
          {
            headerText: val?.data?.customName,
            gridViewSetup: this.gridViewSetup,
            option: option,
            data: datas,
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
      case 'ODT206':
      case 'ODT3006': {
        // if (this.checkOpenForm(funcID)) {
        // }
        this.callfc
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
      case 'ODT207':
      case 'ODT3007':
      case 'ODT5107':
      case 'ODT5208': {
        this.api
          .execSv('DM', 'DM', 'FileBussiness', 'GetFilesForOutsideAsync', [
            '',
            datas?.recID,
            this.formModel.entityName,
            'source',
          ])
          .subscribe((item: any) => {
            if (item && item.length > 0) {
              this.dialog = this.callfc.openForm(
                UpdateVersionComponent,
                '',
                800,
                600,
                '',
                [this.formModel, item]
              );
              this.dialog.closed.subscribe((x) => {
                if (x.event) {
                  var index = this.data.files.findIndex(a=>a.recID == x.event.recID);
                  if(index >=0 ) this.data.files[index] = x.event;
                }
              });
            }
          });
        break;
      }
      //Chuyển vào thư mục
      case 'ODT109':
      case 'ODT208':
      case 'ODT3008':
      case 'ODT5108':
      case 'ODT5209': {
        //  if(this.checkOpenForm(funcID))
        // {
        // this.callfc.openForm(FolderComponent, null, 600, 400);
        this.callfc.openForm(this.tmpFolderCopy, null, 600, 400);
        //}
        break;
      }
      //Bookmark
      case 'ODT110':
      case 'ODT209':
      case 'ODT111':
      case 'ODT210':
      case 'ODT3009':
      case 'ODT3010':
      case 'ODT5109':
      case 'ODT5210':
      case 'ODT5110':
      case 'ODT5211': {
        this.odService.bookMark(datas.recID).subscribe((item) => {
          if (item.status == 0) {
            this.view.dataService.onAction.next({
              type: 'update',
              data: item.data,
            });
            this.view.dataService.update(item.data).subscribe((item) => {
              //this.view.dataService.setDataSelected(datas);
            });
          }
          this.notifySvr.notify(item.message);
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
                      (x) => x.recID == item.data[1]
                    );
                    this.data.listInformationRel[index].reCall = true;
                    this.detectorRef.detectChanges();
                    //this.data.listInformationRel = item.data[1];
                  }
                  this.notifySvr.notify(item.message);
                });
            }
          });
        break;
      }

      //Gửi duyệt
      case 'ODT201':
      case 'ODT3001':
      case 'ODT5101': {
        if (isData) {
          this.odService
            .getDetailDispatch(
              datas.recID,
              this.formModel.entityName,
              this.referType
            )
            .subscribe((item) => {
              if (item) {
                this.documentApproval(item);
              }
            });
        } else this.documentApproval(datas);
        break;
      }
      //Hủy xét duyệt
      case 'ODT212':
      case 'ODT3012':
      case 'ODT5112': {
        var config = new AlertConfirmInputConfig();
        config.type = 'YesNo';
        this.notifySvr
          .alert(
            'Thông báo',
            'Bạn có chắc chắn muốn hủy yêu cầu xét duyệt?',
            config
          )
          .closed.subscribe((x) => {
            if (x.event.status == 'Y') {
              this.odService
                .getDetailDispatch(
                  datas.recID,
                  this.formModel.entityName,
                  this.referType
                )
                .subscribe((item) => {
                  //this.getChildTask(id);
                  //Có thiết lập bước duyệt
                  if (item.bsCategory.approval) {
                    this.api
                      .execSv(
                        'ES',
                        'ES',
                        'CategoriesBusiness',
                        'GetByCategoryIDAsync',
                        item.bsCategory.categoryID
                      )
                      .subscribe((item2: any) => {
                        if (item2) {
                          this.api
                            .execSv(
                              'ES',
                              'ES',
                              'ApprovalTransBusiness',
                              'GetCategoryByProcessIDAsync',
                              item2?.processID
                            )
                            .subscribe((res2: any) => {
                              //trình ký
                              if (res2?.eSign == true) {
                                this.cancelAproval(item);
                                //this.callfc.openForm();
                              } else if (res2?.eSign == false) {
                                this.shareService
                                  .codxCancel(
                                    'OD',
                                    item?.recID,
                                    this.formModel.entityName,
                                    null,
                                    null
                                  )
                                  .subscribe((res3) => {
                                    if (res3) {
                                      this.data.status = '3';
                                      this.data.approveStatus = '1';
                                      this.odService
                                        .updateDispatch(
                                          this.data,
                                          this.formModel.funcID,
                                          false,
                                          this.referType,
                                          this.formModel?.entityName
                                        )
                                        .subscribe((res4) => {
                                          if (res4.status == 0) {
                                            this.view.dataService
                                              .update(this.data)
                                              .subscribe();
                                            this.notifySvr.notify(
                                              'Hủy yêu cầu xét duyệt thành công.'
                                            );
                                          } else
                                            this.notifySvr.notify(
                                              'Hủy yêu cầu xét duyệt không thành công.'
                                            );
                                        });
                                    } else
                                      this.notifySvr.notify(
                                        'Hủy yêu cầu xét duyệt không thành công.'
                                      );
                                  });
                              }
                            });
                        }
                      });
                  } else {
                    this.data.approveStatus = '1';
                    this.data.status = '3';
                    this.odService
                      .updateDispatch(
                        this.data,
                        this.formModel.funcID,
                        false,
                        this.referType,
                        this.formModel?.entityName
                      )
                      .subscribe((res4) => {
                        if (res4.status == 0) {
                          this.view.dataService.update(this.data).subscribe();
                          this.notifySvr.notify(
                            'Hủy yêu cầu xét duyệt thành công.'
                          );
                        } else
                          this.notifySvr.notify(
                            'Hủy yêu cầu xét duyệt không thành công.'
                          );
                      });
                  }
                });
            }
          });
        break;
      }
      //Hoàn tất
      case 'ODT112':
      case 'ODT211':
      case 'ODT3011':
      case 'ODT5111':
      case 'ODT5212': {
        var option = new DialogModel();
        option.FormModel = this.formModel;
        this.callfc
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
              this.data.status = "7";
              this.view.dataService.update(datas).subscribe();
            }
          });
        break;
      }
      //Trả lại
      case 'ODT113':
      case 'ODT5213': {
        var option = new DialogModel();
        option.FormModel = this.formModel;
        this.callfc
          .openForm(
            RefuseComponent,
            null,
            600,
            400,
            null,
            {
              data: datas,
              headerText: 'Trả lại',
              status: '4',
              funcID: this.formModel.funcID,
            },
            '',
            option
          )
          .closed.subscribe((x) => {
            if (x.event) this.view.dataService.update(x.event).subscribe();
          });
        // this.refuse(datas);
        break;
      }
      //Chuyển lại
      case 'ODT114':
      case 'ODT5214': {
        var option = new DialogModel();
        option.FormModel = this.formModel;
        this.callfc
          .openForm(
            RefuseComponent,
            null,
            600,
            400,
            null,
            {
              data: datas,
              headerText: 'Chuyển lại',
              status: '3',
              funcID: this.formModel.funcID,
            },
            '',
            option
          )
          .closed.subscribe((x) => {
            if (x.event) this.view.dataService.update(x.event).subscribe();
          });
        // this.refuse(datas);
        break;
      }
      //Tạo công văn đi
      case 'ODT115': {
        this.view.dataService.addNew().subscribe((res: any) => {
          var obj = {
            dataSelected: res,
          };
          res.agencyID = datas?.agencyID;
          res.agencyName = datas?.agencyName;
          res.departmentID = datas?.departmentID;
          res.dispatchType = '2';
          let option = new SidebarModel();
          option.DataService = obj;
          this.dialog = this.callfc.openSide(
            IncommingAddComponent,
            {
              gridViewSetup: this.gridViewSetup,
              headerText: 'Tạo công văn đi',
              type: 'copy',
              formModel: this.formModel,
            },
            option
          );
          this.dialog.closed.subscribe((x) => {
            if (x.event) {
              this.odService
                .addLink(datas.recID, x.event.recID, '', '')
                .subscribe((item2) => {});
            }
          });
        });
        break;
      }
      //Giao việc
      case 'ODT1013':
      case 'ODT52013':
      case 'ODT3013':
      case 'ODT52013': {
        var task = new TM_Tasks();
        task.refID = datas?.recID;
        task.refType = this.formModel.entityName;

        let option = new SidebarModel();
        let assignModel: AssignTaskModel = {
          vllRole: 'TM002',
          title: val?.data.customName,
          vllShare: 'TM003',
          task: task,
          referedData: datas,
          referedFunction: val.data,
        };
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.Width = '550px';
        let dialog = this.callfc.openSide(
          AssignInfoComponent,
          assignModel,
          option
        );
        dialog.closed.subscribe((e) => {
          if (e?.event && e?.event[0]) {
            datas.status = '3';
            that.odService
              .updateDispatch(
                datas,
                '',
                false,
                this.referType,
                this.formModel?.entityName
              )
              .subscribe((item) => {
                if (item.status == 0) {
                  this.data.tasks = e?.event[1];
                  this.data.status = "3";
                  e.data.tasks = e?.event[1];
                  that.view.dataService.update(e.data).subscribe();
                } else that.notifySvr.notify(item.message);
              });
          }
        });
        break;
      }
      default: {

        //Biến động , tự custom
        var customData = 
        {
          refID : "",
          refType : this.formModel?.entityName,
          dataSource: datas,
          addPermissions: this.listPermission
        }

        this.shareService.defaultMoreFunc(
          val,
          datas,
          this.afterSave,
          this.formModel,
          this.view.dataService,
          this,
          customData
        );
        // this.shareService.defaultMoreFunc(
        //   val,
        //   datas,
        //   this.afterSaveTask,
        //   this.view.formModel,
        //   this.view.dataService,
        //   that
        // );
        break;
      }
    }
  }
  beforeDel(opt: RequestOption) {
    opt.methodName = 'DeleteDispatchByIDAsync';
    opt.data = [
      this.view.dataService.dataSelected,
      this.view.formModel.entityName,
    ];
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

  //Hủy yêu cầu xét duyệt
  cancelAproval(data: any) {
    //Có thiết lập duyệt
    if (data.bsCategory) {
      this.api
        .execSv(
          'ES',
          'ES',
          'SignFilesBusiness',
          'CancelSignfileAsync',
          data.recID
        )
        .subscribe((item) => {
          if (item) {
            data.approveStatus = '1';
            this.odService
              .updateDispatch(
                data,
                '',
                false,
                this.referType,
                this.formModel?.entityName
              )
              .subscribe((item) => {
                if (item.status == 0) {
                  this.view.dataService.update(item?.data).subscribe();
                } else this.notifySvr.notify(item.message);
              });
            this.notifySvr.notify('Hủy yêu cầu duyệt thành công');
          } else this.notifySvr.notify('Hủy yêu cầu duyệt không thành công');
        });
    }
  }

  //Duyệt công văn
  documentApproval(datas: any) {
    
    if (datas.bsCategory) {
      //Có thiết lập bước duyệt
      if (datas.bsCategory.approval) {
        this.api
          .execSv(
            'ES',
            'ES',
            'CategoriesBusiness',
            'GetByCategoryIDAsync',
            datas.bsCategory.categoryID
          )
          .subscribe((item: any) => {
            if (item) {
              this.approvalTrans(item?.processID, datas);
            } else {
            }
          });
      }
      //Chưa thiết lập bước duyệt
      else {
        var config = new AlertConfirmInputConfig();
        config.type = 'YesNo';
        this.notifySvr.alertCode('OD024', config).subscribe((item) => {
          if (item.event.status == 'Y') {
            //Lấy processID mặc định theo entity
            this.api
              .execSv(
                'ES',
                'ES',
                'CategoriesBusiness',
                'GetDefaulProcessIDAsync',
                this.formModel.entityName
              )
              .subscribe((item: any) => {
                if (item) {
                  this.approvalTrans(item?.processID, datas);
                }
              });
          }
        });
      }
    }
  }

  afterSave(e?: any, that: any = null) {
    // Chú thích
    // e:{
    //   funcID: Mã moreFunc ,
    //   result : kết quả trả về sau khi thực hiện,
    //   data: data truyền vào
    // }
    switch (e?.funcID) {
      //Giao việc
      case 'ODT1013': {
        if (e?.result && e?.result[0]) {
          e.data.status = '3';
          // debugger;
          // that.odService.getTaskByRefID(e.data.recID).subscribe(item=>{
          //   if(item) that.data.tasks= item;
          // })
          that.odService
            .updateDispatch(e.data, '', false, this.referType)
            .subscribe((item) => {
              if (item.status == 0) {
                that.view.dataService.update(e.data).subscribe();
              } else that.notifySvr.notify(item.message);
            });
        }
        break;
      }
      //Gửi mail
      case "SYS004":
      {
        this.data = e?.result[0];
        this.data.lstUserID = getListImg(e?.result[0].relations);
        this.data.listInformationRel = e?.result[1];
        break; 
      }
    }
  }
  getJSONString(data) {
    return JSON.stringify(data);
  }
  getSubTitle(
    relationType: any,
    agencyName: any,
    shareBy: any,
    agencies = null
  ) {
    if (relationType == '1' || (this.funcList?.defaultValue == '2' && relationType == '2')) 
    {
      if (this.funcList?.defaultValue == '1') {
        var text = this.ms020?.customName;
        if (!text) text = '';

        return Util.stringFormat(
          text,
          this.fmTextValuelist(relationType, '6'),
          agencyName
        );
      } else {
        var name = agencyName;

        if (agencies && agencies.length > 0)
          name = agencies.map((u) => u.agencyName).join(' , ');
        return 'Gửi đến ' + name;
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
    var funcList = this.codxODService.loadFunctionList(
      this.funcID
    );
    if (isObservable(funcList)) {
      funcList.subscribe((fc) => {
        this.changeDataMFBefore(e, data, fc);
      });
    } else this.changeDataMFBefore(e, data, funcList);
  }
  changeDataMFBefore(e: any, data: any, fc: any) {
    if (fc.runMode == '1') {
      debugger
      this.shareService.changeMFApproval(e, data.unbounds);
    } else {
      //Bookmark
      var bm = e.filter(
        (x: { functionID: string }) =>
          x.functionID == 'ODT110' ||
          x.functionID == 'ODT209' ||
          x.functionID == 'ODT3009' ||
          x.functionID == 'ODT5109' ||
          x.functionID == 'ODT5210'
      );
      //Unbookmark
      var unbm = e.filter(
        (x: { functionID: string }) =>
          x.functionID == 'ODT111' ||
          x.functionID == 'ODT210' ||
          x.functionID == 'ODT3010' ||
          x.functionID == 'ODT5110' ||
          x.functionID == 'ODT5211'
      );

      if (data?.isBookmark) {
        if (bm[0]) bm[0].disabled = true;
        if (unbm[0]) unbm[0].disabled = false;
      } else {
        if (unbm[0]) unbm[0].disabled = true;
        if (bm[0]) bm[0].disabled = false;
      }
      if (
        (this.funcList?.defaultValue == '2' ||
        this.funcList?.defaultValue == '3') &&
        data?.status != '1' &&
        data?.status != '2' &&
        data?.approveStatus != '2' &&
        data?.status == '3' &&
        data?.approveStatus != '1'
      ) {
      }

      if (
        this.funcList?.defaultValue == '2' ||
        this.funcList?.defaultValue == '3'
      ) {
        if (
          data?.status != '1' &&
          data?.status != '2' &&
          data?.approveStatus != '2'
        ) {
          //Chức năng Gửi duyệt
          var approvel = e.filter(
            (x: { functionID: string }) =>
              x.functionID == 'ODT201' || x.functionID == 'ODT5101'
          );
          if (approvel[0]) approvel[0].disabled = true;
        }

        //Chức năng hủy yêu cầu duyệt
        var approvel = e.filter(
          (x: { functionID: string }) =>
            x.functionID == 'ODT212' ||
            x.functionID == 'ODT3012' ||
            x.functionID == 'ODT5112'
        );
        for (var i = 0; i < approvel.length; i++) {
          approvel[i].disabled = true;
        }

        if (data?.approveStatus == '3' && data?.createdBy == this.userID) {
          var approvel = e.filter(
            (x: { functionID: string }) =>
              x.functionID == 'ODT212' ||
              x.functionID == 'ODT3012' ||
              x.functionID == 'ODT5112'
          );
          for (var i = 0; i < approvel.length; i++) {
            approvel[i].disabled = false;
          }
        }

        //Hiện thị chức năng gửi duyệt khi xét duyệt
        if (data?.approveStatus == '1' && data?.status == '3') {
          //Chức năng Gửi duyệt
          var approvel = e.filter(
            (x: { functionID: string }) =>
              x.functionID == 'ODT201' || x.functionID == 'ODT5101'
          );
          if (approvel[0]) approvel[0].disabled = false;
        }
      }
      //data?.isblur = true
      // var returns = e.filter(
      //   (x: { functionID: string }) =>
      //     x.functionID == 'ODT113' || x.functionID == 'ODT5213'
      // );

      // returns[0].disabled = true
      // if(this.formModel.funcID == 'ODT41' || (this.formModel.funcID == 'ODT51' && data?.dispatchType == '3'))
      // {
      //   returns[0].disabled = false;
      // }
      if (data?.status == '7') {
        var completed = e.filter(
          (x: { functionID: string }) =>
            x.functionID == 'ODT211' ||
            x.functionID == 'ODT112' ||
            x.functionID == 'SYS02' ||
            x.functionID == 'SYS03' ||
            x.functionID == 'ODT103' ||
            x.functionID == 'ODT202' ||
            x.functionID == 'ODT101' ||
            x.functionID == 'ODT113'
        );
        for (var i = 0; i < completed.length; i++) {
          completed[i].disabled = true;
        }
      }
      //Từ chối , Bị đóng
      if (data?.status == '9' || data?.approveStatus == '4') {
        var approvel = e.filter(
          (x: { functionID: string }) =>
            x.functionID == 'ODT112' ||
            x.functionID == 'ODT211' ||
            x.functionID == 'ODT103' ||
            x.functionID == 'ODT202' ||
            x.functionID == 'SYS03' ||
            x.functionID == 'ODT103' ||
            x.functionID == 'ODT202'
        );
        if (approvel && approvel.length > 0)
          for (var i = 0; i < approvel.length; i++) {
            approvel[i].disabled = true;
          }
      }
      if (data?.status == '3') {
        var completed = e.filter(
          (x: { functionID: string }) => x.functionID == 'SYS02'
        );
        completed.forEach((elm) => {
          elm.disabled = true;
        });
      }
      var approvelCL = e.filter(
        (x: { functionID: string }) =>
          x.functionID == 'ODT114' || x.functionID == 'ODT5214'
      );
      if (approvelCL[0]) approvelCL[0].disabled = true;
      //Trả lại
      if (data?.status == '4') {
        var approvel = e.filter(
          (x: { functionID: string }) =>
            x.functionID == 'ODT113' || x.functionID == 'ODT5213'
        );
        if (approvel[0]) approvel[0].disabled = true;
        if (approvelCL[0]) approvelCL[0].disabled = false;
      }
    }
  }
  //Gửi duyệt
  release(data: any, processID: any) {
    this.shareService
      .codxRelease(
        this.view.service,
        data?.recID,
        processID,
        this.view.formModel.entityName,
        this.formModel.funcID,
        '',
        '<div>' + data?.title + '</div>',
        ''
      )
      .subscribe((res2: any) => {
        if (res2?.msgCodeError) this.notifySvr.notify(res2?.msgCodeError);
        else {
          data.status = '3';
          data.approveStatus = '3';
          this.notifySvr.notifyCode('ES007');
          this.odService
            .updateDispatch(
              data,
              '',
              false,
              this.referType,
              this.formModel?.entityName
            )
            .subscribe((item) => {
              if (item.status == 0) {
                this.view.dataService.update(item?.data).subscribe();
              } else this.notifySvr.notify(item.message);
            });
          //add công văn nội bộ đến khi duyệt thành công công văn nội bộ đi
          if (data.dispatchType == '3') {
            this.addInternalIncoming(data);
          }
        }
        //this.notifySvr.notify(res2?.msgCodeError)
      });
  }

  //new công văn nội bộ đến
  addInternalIncoming(datas: any) {
    let dataSave = datas;
    let departmentID = datas.agencyID;
    dataSave.dispatchType = '4';
    dataSave.status = '1';
    dataSave.approveStatus = '1';
    dataSave.agencyID = dataSave.departmentID;
    dataSave.agencyName = '';
    dataSave.departmentID = departmentID;
    this.odService.saveDispatch(this.dataRq, dataSave, true).subscribe();
  }
  //Xét duyệt
  approvalTrans(processID: any, datas: any) {
    this.api
      .execSv(
        'ES',
        'ES',
        'ApprovalTransBusiness',
        'GetCategoryByProcessIDAsync',
        processID
      )
      .subscribe((res2: any) => {
        let category = res2;
        let dialogModel = new DialogModel();
        dialogModel.IsFull = true;
        //trình ký
        if (res2?.eSign == true) {
          let signFile = new ES_SignFile();
          signFile.recID = datas.recID;
          signFile.title = datas.title;
          signFile.categoryID = res2?.categoryID;
          signFile.refID = datas.recID;
          signFile.refDate = datas.refDate;
          signFile.refNo = datas.refNo;
          signFile.priority = datas.urgency;
          signFile.refType = this.formModel?.entityName;
          signFile.files = [];
          if (this.data?.files) {
            for (var i = 0; i < this.data?.files.length; i++) {
              var file = new File();
              file.fileID = this.data?.files[i].recID;
              file.fileName = this.data?.files[i].fileName;
              file.eSign = true;
              signFile.files.push(file);
            }
          }
          let ap= new ApproveProcess();
          ap.funcID= this.view?.formModel?.funcID;
          ap.entityName= this.view?.formModel?.entityName;
          ap.module= 'OD';
          let dialogApprove = this.callfc.openForm(
            PopupAddSignFileComponent,
            'Chỉnh sửa',
            700,
            650,
            '',
            {
              oSignFile: signFile,
              files: this.data?.files,
              cbxCategory: this.gridViewSetup['CategoryID']?.referedValue,
              disableCateID: true,
              refType: this.formModel?.entityName,
              refID: datas.recID,
              //formModel: this.view?.currentView?.formModel,
              approverProcess:ap,// thêm điều kiện
            },
            '',
            dialogModel
          );
          dialogApprove.closed.subscribe((res) => {
            if (res.event && res.event?.approved == true) {
              datas.status = '3';
              datas.approveStatus = '3';
              this.odService
                .updateDispatch(
                  datas,
                  '',
                  false,
                  this.referType,
                  this.formModel?.entityName
                )
                .subscribe((item) => {
                  if (item.status == 0) {
                    this.view.dataService.update(item?.data).subscribe();
                  } else this.notifySvr.notify(item.message);
                });
              //add công văn nội bộ đến khi duyệt thành công công văn nội bộ đi
              this.addInternalIncoming(datas);
            }
          });
          //this.callfc.openForm();
        } 
        if (res2?.eSign == false)
        //xét duyệt
        this.release(datas, processID);
        // else
        //   this.shareService
        //     .codxReleaseDynamic(
        //       this.view.service,
        //       datas,
        //       category,
        //       this.view.formModel.entityName,
        //       this.formModel.funcID,
        //       datas?.title ,
        //       (res2: any) => {
        //         if (res2?.msgCodeError) this.notifySvr.notify(res2?.msgCodeError);
        //         else {
        //           datas.status = '3';
        //           debugger
        //           this.notifySvr.notifyCode('ES007');
        //           // this.odService
        //           //   .updateDispatch(
        //           //     datas,
        //           //     '',
        //           //     false,
        //           //     this.referType,
        //           //     this.formModel?.entityName
        //           //   )
        //           //   .subscribe((item) => {
        //           //     if (item.status == 0) {
        //           //       this.view.dataService.update(item?.data).subscribe();
        //           //     } else this.notifySvr.notify(item.message);
        //           //   });
        //           //add công văn nội bộ đến khi duyệt thành công công văn nội bộ đi
        //           if (datas.dispatchType == '3') {
        //             this.addInternalIncoming(datas);
        //           }
        //         }
        //         //this.notifySvr.notify(res2?.msgCodeError)
        //       }
        //     )
      });
  }
  handleViewFile(e: any) {
    if (e == true) {
      var index = this.data.listInformationRel.findIndex(
        (x) => x.userID == this.userID && x.relationType != '1'
      );
      if (index >= 0) this.data.listInformationRel[index].view = '3';
    }
  }

  clickTemp(e) {
    e.stopPropagation();
  }

  checkDeadLine(time: any) {
    if (new Date(time).getTime() < new Date().getTime() || !time) {
      return 'icon-access_alarm';
    }
    return '';
  }
  //Từ chối
  refuse(datas: any) {
    //datas = this.
  }

  addPermission() {
    this.listPermission = [];
    if (this.dataItem?.relations && this.dataItem?.relations.length > 0) {
      this.dataItem.relations.forEach((elm) => {
        if (elm.userID != this.userID) {
          var p = new Permission();
          p.read = true;
          p.share = true;
          p.download = true;
          p.objectID = elm.userID;
          p.objectType = 'U';
          p.isActive = true;
          this.listPermission.push(p);
        }
      });
    }
  }
}
