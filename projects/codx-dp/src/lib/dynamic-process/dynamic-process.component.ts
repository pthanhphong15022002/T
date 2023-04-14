import { paste } from '@syncfusion/ej2-angular-richtexteditor';
import { dialog } from '@syncfusion/ej2-angular-spreadsheet';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  inject,
  Injector,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { PopupAddDynamicProcessComponent } from './popup-add-dynamic-process/popup-add-dynamic-process.component';
import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  ButtonModel,
  NotificationsService,
  UIComponent,
  ViewModel,
  ViewType,
  DialogModel,
  SidebarModel,
  CallFuncService,
  Util,
  RequestOption,
  DialogRef,
  CodxCardImgComponent,
  FormModel,
  CRUDService,
} from 'codx-core';
import { CodxDpService } from '../codx-dp.service';
import { DP_Processes, DP_Processes_Permission } from '../models/models';
import { PopupViewsDetailsProcessComponent } from './popup-views-details-process/popup-views-details-process.component';
import { PopupRolesDynamicComponent } from './popup-roles-dynamic/popup-roles-dynamic.component';
import { environment } from 'src/environments/environment';
import { PopupPropertiesComponent } from './popup-properties/popup-properties.component';
import {
  AccordionComponent,
  ExpandEventArgs,
} from '@syncfusion/ej2-angular-navigations';
import { CheckBoxComponent } from '@syncfusion/ej2-angular-buttons';
import { closest } from '@syncfusion/ej2-base';
import { firstValueFrom } from 'rxjs';
import { LayoutComponent } from '../_layout/layout.component';

@Component({
  selector: 'lib-dynamic-process',
  templateUrl: './dynamic-process.component.html',
  styleUrls: ['./dynamic-process.component.css'],
})
export class DynamicProcessComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  // View
  views: Array<ViewModel> = [];
  moreFuncs: Array<ButtonModel> = [];
  button?: ButtonModel;

  // view child
  @ViewChild('templateViewCard', { static: true })
  templateViewCard: TemplateRef<any>;
  @ViewChild('editNameProcess') editNameProcess: TemplateRef<any>;
  @ViewChild('headerTemplate') headerTemplate: TemplateRef<any>;
  @ViewChild('footerButton') footerButton: TemplateRef<any>;

  @ViewChild('popUpQuestionCopy', { static: true }) popUpQuestionCopy;
  // Input
  @Input() dataObj?: any;
  @Input() showButtonAdd = true;
  dialog!: DialogRef;
  dialogQuestionCopy: DialogRef;
  // create variables
  crrFunID: string = '';
  funcID: string = '';
  gridViewSetup: any;
  showID = false;
  processNo: any;
  instanceNo: any;
  // const set value
  readonly btnAdd: string = 'btnAdd';

  heightWin: any;
  widthWin: any;
  itemSelected: any;
  titleAction: any;
  moreFunc: any;

  // create variables for list
  listDynamicProcess: DP_Processes[] = [];
  listUserInUse: DP_Processes_Permission[] = [];

  // create variables is any;
  listAppyFor: any; // list Apply For
  listSelectCoppy: any; // list value list for copy proccess
  listSelectStepCoppy: any; // list value list for copy proccess
  listClickedCoppy: any;
  // value
  nameAppyFor: string = '';

  //test chưa có api
  popoverDetail: any;
  popupOld: any;
  popoverList: any;
  linkAvt = '';
  TITLENAME = 'Thay đổi tên quy trình';
  popupEditName: DialogRef;
  processRename: DP_Processes;
  processName = '';
  processNameBefore = '';
  user;
  isCopy: boolean = false;
  dataCopy: any;
  oldIdProccess: any;
  // Call API Dynamic Proccess
  readonly service = 'DP';
  readonly assemblyName = 'ERM.Business.DP';
  readonly entityName = 'DP_Processes';
  readonly className = 'ProcessesBusiness';

  // Method API dynamic proccess
  readonly methodGetList = 'GetListProcessesAsync';

  // Get idField
  readonly idField = 'recID';
  grvSetup :any
  isChecked: boolean = false;
  totalInstance: number = 0;
  lstGroup: any = [];

  constructor(
    private inject: Injector,
    private changeDetectorRef: ChangeDetectorRef,
    private activedRouter: ActivatedRoute,
    private codxDpService: CodxDpService,
    private notificationsService: NotificationsService,
    private authStore: AuthStore,
    private layoutDP: LayoutComponent,
    private dpService: CodxDpService
  ) {
    super(inject);
    this.heightWin = Util.getViewPort().height - 100;
    this.widthWin = Util.getViewPort().width - 100;
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    this.cache
    .gridViewSetup(
      'DPProcesses',
      'grvDPProcesses'
    )
    .subscribe(grv=>{
      this.grvSetup =grv
    })

    this.getListAppyFor();
    this.getValueFormCopy();
    this.getListProcessGroups();
    this.user = this.authStore.get();
  }

  onInit(): void {
    this.button = {
      id: this.btnAdd,
    };
    if (!this.funcID) {
      this.funcID = this.activedRouter.snapshot.params['funcID'];
      this.crrFunID = this.funcID;
    }
    this.afterLoad();
  }

  afterLoad() {
    this.showButtonAdd = this.funcID == 'DP01';
  }

  //chang data
  viewChanged(e) {
    this.layoutDP.hidenNameProcess() ;
    var funcIDClick = this.activedRouter.snapshot.params['funcID'];
    if (this.crrFunID != funcIDClick) {
      this.funcID = funcIDClick;
      this.crrFunID = this.funcID;
      this.afterLoad();

      this.changeDetectorRef.detectChanges();
    }
  }
  onDragDrop(e: any) {}

  click(evt: ButtonModel) {
    this.titleAction = evt.text;
    switch (evt.id) {
      case this.btnAdd:
        this.add();
        break;
    }
  }
  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.card,
        sameData: true,
        active: true,
        toolbarTemplate: this.footerButton,
        model: {
          template: this.templateViewCard,
          headerTemplate: this.headerTemplate,
        },
      },
    ];
    this.view.dataService.methodSave = 'AddProcessAsync';
    this.view.dataService.methodUpdate = 'UpdateProcessAsync';
    this.changeDetectorRef.detectChanges();
  }

  searchDynamicProcess($event) {
    this.view.dataService.search($event).subscribe();
    this.changeDetectorRef.detectChanges();
  }

  // CRUD methods
  add() {
    this.view.dataService.addNew().subscribe((res) => {
      let dialogModel = new DialogModel();
      dialogModel.IsFull = true;
      dialogModel.zIndex = 999;
      dialogModel.DataService = this.view?.dataService;
      dialogModel.FormModel = JSON.parse(JSON.stringify(this.view.formModel));
      this.cache
        .gridViewSetup(
          this.view.formModel.formName,
          this.view.formModel.gridViewName
        )
        .subscribe((res) => {
          if (res) {
            this.gridViewSetup = res;
            var obj = {
              action: 'add',
              processNo: this.processNo,
              showID: this.showID,
              instanceNo: this.instanceNo,
              titleAction: this.titleAction,
              gridViewSetup: this.gridViewSetup,
              lstGroup: this.lstGroup,
            };
            var dialog = this.callfc.openForm(
              PopupAddDynamicProcessComponent,
              '',
              this.widthWin,
              this.heightWin,
              '',
              obj,
              '',
              dialogModel
            );
            dialog.closed.subscribe((e) => {
              if (!e?.event) this.view.dataService.clear();
              if (e && e.event != null) {
                e.event.totalInstance = this.totalInstance;
                this.view.dataService.update(e.event).subscribe();
                this.changeDetectorRef.detectChanges();
              }
              // if (e?.event == null)
              //   this.view.dataService.delete(
              //     [this.view.dataService.dataSelected],
              //     false
              //   );
            });
          }
        });
    });
  }

  edit(data: any) {
    if (data) {
      this.view.dataService.dataSelected = data;
      this.totalInstance = data.totalInstance;
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res) => {
        let dialogModel = new DialogModel();
        dialogModel.IsFull = true;
        dialogModel.zIndex = 999;
        dialogModel.DataService = this.view?.dataService;
        dialogModel.FormModel = JSON.parse(JSON.stringify(this.view.formModel));
        this.cache
          .gridViewSetup(
            this.view.formModel.formName,
            this.view.formModel.gridViewName
          )
          .subscribe((res) => {
            if (res) {
              this.gridViewSetup = res;
              var obj = {
                action: 'edit',
                titleAction: this.titleAction,
                gridViewSetup: this.gridViewSetup,
                lstGroup: this.lstGroup,
              };
              var dialog = this.callfc.openForm(
                PopupAddDynamicProcessComponent,
                '',
                this.widthWin,
                this.heightWin,
                '',
                obj,
                '',
                dialogModel
              );
              dialog.closed.subscribe((e) => {
                if (!e?.event) this.view.dataService.clear();
                if (e && e.event != null) {
                  this.view.dataService.update(e.event).subscribe();
                  this.changeDetectorRef.detectChanges();
                }
              });
            }
          });
      });
  }
  copy(data: any) {
    if (this.isCopy) {
      if (data) {
        this.view.dataService.dataSelected = data;
        this.oldIdProccess = this.view.dataService.dataSelected.recID;
      }
      this.view.dataService.copy().subscribe((res) => {
        let dialogModel = new DialogModel();
        dialogModel.IsFull = true;
        dialogModel.zIndex = 999;
        dialogModel.DataService = this.view?.dataService;
        dialogModel.FormModel = JSON.parse(JSON.stringify(this.view.formModel));
        this.cache
          .gridViewSetup(
            this.view.formModel.formName,
            this.view.formModel.gridViewName
          )
          .subscribe((res) => {
            this.gridViewSetup = res;
            var obj = {
              action: 'copy',
              processNo: this.processNo,
              showID: this.showID,
              instanceNo: this.instanceNo,
              conditionCopy: this.listClickedCoppy,
              titleAction: this.titleAction,
              oldIdProccess: this.oldIdProccess,
              newIdProccess: this.view.dataService.dataSelected.recID,
              listValueCopy: this.listClickedCoppy.map((x) => x.id),
              gridViewSetup: this.gridViewSetup,
              lstGroup: this.lstGroup,
            };
            var dialog = this.callfc.openForm(
              PopupAddDynamicProcessComponent,
              '',
              this.widthWin,
              this.heightWin,
              '',
              obj,
              '',
              dialogModel
            );
            dialog.closed.subscribe((e) => {
              if (!e?.event) this.view.dataService.clear();
              if (e && e.event != null) {
                e.event.totalInstance = this.totalInstance;
                this.changeDetectorRef.detectChanges();
              }
            });
          });
      });
    }
    return;
  }
  saveCopy() {
    this.isCopy = true;
    this.dialogQuestionCopy.close();
    this.isCopy && this.copy(this.dataCopy);
  }
  OpenFormCopy(data) {
    this.isCopy = false;
    this.listClickedCoppy = [];
    this.isChecked = false;
    this.dataCopy = data;
    this.dialogQuestionCopy = this.callfc.openForm(
      this.popUpQuestionCopy,
      '',
      500,
      500
    );
  }
  checkValueCopy($event, data) {
    if ($event && $event.currentTarget.checked) {
      this.listClickedCoppy.push(data);
      if (data.id === '3') {
        this.listClickedCoppy = this.listClickedCoppy.concat(
          this.listSelectStepCoppy
        );
      }
    } else {
      if (data.id === '3') {
        this.listClickedCoppy = this.listClickedCoppy.filter((item2) => {
          return !this.listSelectStepCoppy.some(
            (item1) => item1.id === item2.id
          );
        });
      }
      let idx = this.listClickedCoppy.findIndex((x) => x.id === data.id);
      if (idx >= 0) this.listClickedCoppy.splice(idx, 1);
    }
  }
  getValueFormCopy() {
    this.cache.valueList('DP037').subscribe((res) => {
      if (res.datas) {
        this.listSelectCoppy = res.datas.map((x) => {
          return { id: x.value, text: x.text };
        });
        var idxStep = this.listSelectCoppy.findIndex((x) => x.id === '3');
        this.listSelectStepCoppy = this.listSelectCoppy.splice(
          idxStep + 1,
          this.listSelectCoppy.length - 1
        );
      }
    });
  }

  delete(data: any) {
    this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete([this.view.dataService.dataSelected], true, (opt) =>
        this.beforeDel(opt)
      )
      .subscribe((res) => {
        if (res) {
          this.view.dataService.onAction.next({ type: 'delete', data: data });
        }
      });
    this.changeDetectorRef.detectChanges();
  }
  beforeDel(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.methodName = 'DeletedProcessesAsync';
    opt.data = [itemSelected.recID];
    return true;
  }
  async getAvatar(process) {
    var link = '';
    let avatar = [
      '',
      this.funcID,
      process?.recID,
      'DP_Processes',
      'inline',
      1000,
      process?.processName,
      'avt',
      false,
    ];
    this.api
      .execSv<any>('DM', 'DM', 'FileBussiness', 'GetAvatarAsync', avatar)
      .subscribe((res) => {
        if (res && res?.url) {
          link = environment.urlUpload + '/' + res?.url;
          this.changeDetectorRef.detectChanges();
        }
      });
    return link;
  }

  // More functions
  receiveMF(e: any) {
    this.clickMF(e.e, e.data);
  }

  clickMF(e: any, data?: any) {
    this.itemSelected = data;
    this.titleAction = e.text;
    this.moreFunc = e.functionID;

    switch (e.functionID) {
      case 'SYS01':
        this.add();
        break;
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS04':
        this.OpenFormCopy(data);
        //  this.copy(data);
        break;
      case 'SYS02':
        this.delete(data);
        break;
      case 'DP01014':
      case 'DP02014':
      case 'DP02024':
      case 'DP02034':
        this.roles(data);
        break;
      case 'DP01011':
      case 'DP02011':
      case 'DP02021':
      case 'DP02031':
      case 'DP041':
        this.viewDetailProcess(data);
        break;
      case 'DP01013':
      case 'DP02033':
      case 'DP02023':
      case 'DP02013':
        this.properties(data);
        break;
      case 'DP01012': // edit name
      case 'DP02012':
      case 'DP02022':
        this.renameProcess(data);
        break;
      case 'DP042': // edit name
        this.restoreProcess(data);
        break;
    }
  }

  changeDataMF(e, data) {
    if (e != null && data != null) {
      e.forEach((res) => {
        switch (res.functionID) {
          case 'SYS005':
          case 'SYS004':
          case 'SYS001':
          case 'SYS002':
          case 'SYS003':
          //more core - thay doi nhieu dong, bo chon, chon tat ca..
          case 'SYS007':
          case 'SYS006':
            res.disabled = true;
            break;
          case 'SYS104':
          case 'SYS04':
            if (
              this.funcID == 'DP0201' ||
              this.funcID == 'DP0202' ||
              this.funcID == 'DP0203' ||
              this.funcID === 'DP04' ||
              !data.allowCopy
            )
              res.disabled = true;
            break;
          //Xem chi tiết
          case 'DP01011':
          case 'DP02011':
          case 'DP02021':
          case 'DP02031':
            let isRead = this.checkPermissionRead(data);
            if (!isRead) {
              res.isblur = true;
            }
            break;
          //Đổi tên, chỉnh sửa.
          case 'DP01012':
          case 'DP02012':
          case 'DP02022':
          case 'DP02032':
          case 'SYS03':
            let isEdit = data.write;
            if (!isEdit || this.funcID == 'DP0203' || this.funcID === 'DP04') {
              if (res.functionID == 'SYS03') res.disabled = true;
              else res.isblur = true;
            }
            break;
          //Phân quyền:
          case 'DP01014':
          case 'DP02014':
          case 'DP02024':
          case 'DP02034':
            let isAssign = data.assign;
            if (!isAssign) res.isblur = true;
            break;
          //Phát hành
          // case 'DP01015':
          // case 'DP02015':
          // case 'DP02025':
          //   let isPublish = data.publish;
          //   if (!isPublish) res.isblur = true;

          //   break;
          case 'SYS02': // xoa
            let isDelete = data.delete;
            if (
              !isDelete ||
              data.deleted ||
              this.funcID == 'DP0203' ||
              this.funcID === 'DP04'
            ) {
              res.disabled = true;
            }
            break;
        }
      });
    }
  }

  //#popup roles
  roles(e: any) {
    let dialogModel = new DialogModel();
    let formModel = new FormModel();
    formModel.formName = 'DPProcessesPermissions';
    formModel.gridViewName = 'grvDPProcessesPermissions';
    formModel.entityName = 'DP_Processes_Permissions';
    dialogModel.zIndex = 999;
    dialogModel.FormModel = formModel;
    this.callfc
      .openForm(
        PopupRolesDynamicComponent,
        '',
        950,
        650,
        '',
        [e, this.titleAction, 'role', 'full'],
        '',
        dialogModel
      )
      .closed.subscribe((e) => {
        if (e?.event && e?.event != null) {
          this.view.dataService.update(e?.event).subscribe();
          this.detectorRef.detectChanges();
        }
      });
  }

  properties(data) {
    let option = new SidebarModel();
    option.DataService = this.view?.dataService;
    option.FormModel = this.view?.formModel;
    option.Width = '550px';
    this.dialog = this.callfc.openSide(PopupPropertiesComponent, data, option);
    this.dialog.closed.subscribe((e) => {
      if (!e.event) this.view.dataService.clear();
    });
  }

  //#region đang test ai cần list phần quyền la vô đâyu nha
  setTextPopover(text) {
    return text;
  }

  PopoverDetail(e, p: any, emp) {
    let parent = e.currentTarget.parentElement.offsetWidth;
    let child = e.currentTarget.offsetWidth;
    if (this.popupOld?.popoverClass !== p?.popoverClass) {
      this.popupOld?.close();
    }

    if (emp != null) {
      this.popoverList?.close();
      this.popoverDetail = emp;
      if (emp.memo != null || emp.processName != null) {
        if (parent <= child) {
          p.open();
        }
      }
    } else p.close();
    this.popupOld = p;
  }

  checkPermissionRead(data) {
    let isRead = data.read;
    return isRead;
  }

  doubleClickViewProcess(data) {
    let isRead = this.checkPermissionRead(data);
    if (isRead) {
      this.viewDetailProcess(data);
    }
  }
  getNameUsersStr(data) {
    if (data?.length > 0 && data !== null) {
      var ids = data.map((obj) => obj.objectID);
      ids = [...new Set(ids)];
      var listStr = ids?.join(';');
    }
    // listStr = [...new Set(listStr)];
    return listStr || null || '';
  }

  //#region Của Bảo
  getListAppyFor() {
    this.cache.valueList('DP002').subscribe((res) => {
      if (res) {
        this.listAppyFor = res?.datas;
      }
    });
  }
  //#endregion

  getNameAppyFor(value: string) {
    return this.listAppyFor?.length > 0
      ? this.listAppyFor.find((x) => x.value === value)?.default ?? ''
      : '';
  }

  totalSteps(listStep: any) {
    return listStep.steps?.filter((x) => !x.isSuccessStep && !x.isFailStep)
      .length;
  }

  //#endregion đang test

  viewDetailProcess(data) {
    //thao test khong dc xoa
    if (!data.read) return;
    this.dpService.dataProcess.next(data);
    this.codxService.navigate('', `dp/instances/DPT04/${data.recID}`);

    // let isRead = this.checkPermissionRead(data);
    // if (!isRead) {
    //   return;
    // }
    // let isCreate = data.create ? true : false;
    // let obj = {
    //   data: data,
    //   nameAppyFor: this.getNameAppyFor(data?.applyFor),
    //   isCreate: isCreate,
    // };

    // let dialogModel = new DialogModel();
    // dialogModel.IsFull = true;
    // dialogModel.zIndex = 999;
    // var dialog = this.callfc.openForm(
    //   PopupViewsDetailsProcessComponent,
    //   '',
    //   this.widthWin,
    //   this.heightWin,
    //   '',
    //   obj,
    //   '',
    //   dialogModel
    // );

    // dialog.closed.subscribe((e) => {
    //   if (e?.event && e?.event != null) {
    //     this.view.dataService.update(e?.event[0]).subscribe();
    //     let totalInstanceById = e?.event[1];
    //     if (totalInstanceById.size > 0 && totalInstanceById) {
    //       let listProccess = this.view.dataService.data;
    //       var index = 0;
    //       for (let i = 0; i < listProccess.length; i++) {
    //         let value = totalInstanceById.get(listProccess[i].recID);
    //         if (value) {
    //           listProccess[i].totalInstance =
    //             listProccess[i].totalInstance + value;
    //           this.view.dataService
    //             .update(listProccess[i].totalInstance)
    //             .subscribe();
    //           index++;
    //         }
    //         if (index === totalInstanceById.size) {
    //           break;
    //         }
    //       }
    //     }
    //   }
    // });
    this.detectorRef.detectChanges();
  }

  // nvthuan
  renameProcess(process) {
    this.processRename = process;
    this.processName = process['processName'];
    this.processNameBefore = process['processName'];
    this.popupEditName = this.callfc.openForm(
      this.editNameProcess,
      '',
      500,
      280
    );
  }

  changeValueInput(event) {
    this.processName = event?.data;
  }

  async editName() {
    if (!this.processName?.trim()) {
      this.notificationsService.notifyCode('SYS009', 0, 'Tên quy trình');
      return;
    }
    if (this.processName.trim() === this.processNameBefore.trim()) {
      this.popupEditName.close();
      this.notificationsService.notifyCode('SYS007');
      return;
    }
    let check = await this.checkExitsProcessName(
      this.processName,
      this.processRename['recID']
    );
    if (check) {
      this.notificationsService.notifyCode('DP021');
    } else {
      this.dpService
        .renameProcess([this.processName, this.processRename['recID']])
        .subscribe((res) => {
          if (res) {
            this.processRename['processName'] = this.processName;
            this.processRename['modifiedOn'] = res || new Date();
            this.processRename['modifiedBy'] = this.user?.userID;
            this.processName = '';
            this.popupEditName.close();
            this.notificationsService.notifyCode('SYS007');
          } else {
            this.notificationsService.notifyCode('DP030');
          }
        });
    }
  }

  async checkExitsProcessName(processName, processID) {
    let check = await firstValueFrom(
      this.dpService.checkExitsName([processName, processID])
    );
    return check;
  }

  async restoreProcess(data) {
    let check = await this.checkExitsProcessName(
      data['processName'],
      data['recID']
    );
    if (check) {
      this.notificationsService.notifyCode('DP021');
      return;
    }
    this.dpService.restoreBinById(data.recID).subscribe((res) => {
      if (res) {
        this.view.dataService.remove(data).subscribe();
        this.detectorRef.detectChanges();
        this.notificationsService.notifyCode('DP002');
      } else {
        this.notificationsService.notifyCode('DP003');
      }
    });
  }

  getListProcessGroups() {
    this.dpService.getListProcessGroups().subscribe((res) => {
      if (res && res.length > 0) {
        this.lstGroup = res;
      }
    });
  }

  valueChangeFilter(e){
    let predicates = '';
    let predicate = e.field + '=@';
    let dataValueFilter = e.data
    if(dataValueFilter?.length >1){
      for (var i = 0; i < dataValueFilter.length - 1; i++) {
        predicates += predicate + i  + 'or ';
      }
      predicates += predicate + (dataValueFilter.length);
    }else if(dataValueFilter?.length ==1){
      predicates  = predicate +'0' ;
    }
    if(predicates) predicates = "( " + predicates+ ' )' ;

    (this.view.dataService as CRUDService)
      .setPredicates(
        [predicates],
        [dataValueFilter.join(';')]
      )
      .subscribe();
  }
}
