import {
  AfterViewInit,
  ChangeDetectionStrategy,
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
import { ActivatedRoute, Router } from '@angular/router';
import {
  AuthStore,
  ButtonModel,
  NotificationsService,
  UIComponent,
  ViewModel,
  ViewType,
  DialogModel,
  SidebarModel,
  Util,
  RequestOption,
  DialogRef,
  FormModel,
  CRUDService,
  CodxLabelComponent,
  UrlUtil,
  LayoutService,
  CodxFormComponent,
  CodxInputComponent,
  CodxComboboxComponent,
} from 'codx-core';
import { CodxDpService } from '../codx-dp.service';
import { DP_Processes, DP_Processes_Permission } from '../models/models';
import { PopupViewsDetailsProcessComponent } from './popup-views-details-process/popup-views-details-process.component';
import { PopupRolesDynamicComponent } from './popup-roles-dynamic/popup-roles-dynamic.component';
import { environment } from 'src/environments/environment';
import { PopupPropertiesComponent } from './popup-properties/popup-properties.component';
import { firstValueFrom, Subject } from 'rxjs';
import { LayoutComponent } from '../_layout/layout.component';
import { PopupAddCategoryComponent } from 'projects/codx-es/src/lib/setting/category/popup-add-category/popup-add-category.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { PopupReleaseProcessComponent } from './popup-release-process/popup-release-process.component';

@Component({
  selector: 'lib-dynamic-process',
  templateUrl: './dynamic-process.component.html',
  styleUrls: ['./dynamic-process.component.css'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicProcessComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  // View
  views: Array<ViewModel> = [];
  moreFuncs: Array<ButtonModel> = [];
  button?: ButtonModel[];

  // view child
  @ViewChild('templateViewCard', { static: true })
  templateViewCard: TemplateRef<any>;
  @ViewChild('editNameProcess') editNameProcess: TemplateRef<any>;
  @ViewChild('releaseProcess') releaseProcessTemp: TemplateRef<any>;
  @ViewChild('headerTemplate') headerTemplate: TemplateRef<any>;
  @ViewChild('footerButton') footerButton: TemplateRef<any>;
  @ViewChild('releasedNameTem') releasedNameTem: CodxLabelComponent;
  @ViewChild('popUpQuestionCopy') popUpQuestionCopy: TemplateRef<any>;
  @ViewChild('bodyFormCopyName') bodyFormCopyName: TemplateRef<any>;
  @ViewChild('footerFormCopyName') footerFormCopyName: TemplateRef<any>;
  //Form phát hành
  // @ViewChild('formRelease') formRelease: CodxFormComponent;
  // @ViewChild('moduleCbx') moduleCbx: CodxInputComponent;
  // @ViewChild('functionCbx') functionCbx: CodxInputComponent;

  // Input
  @Input() dataObj?: any;
  @Input() showButtonAdd = true;
  dialog!: DialogRef;
  dialogQuestionCopy!: DialogRef;
  // create variables
  crrFunID: string = '';
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
  popupRelease: DialogRef;
  processRename: DP_Processes;
  processRelease: DP_Processes;
  processReleaseClone: DP_Processes;
  processName = '';
  processNameBefore = '';
  user;
  isCopy: boolean = false;
  dataCopy: any;
  oldIdProccess: any;
  isButton = true;
  // Call API Dynamic Proccess
  readonly service = 'DP';
  readonly assemblyName = 'ERM.Business.DP';
  readonly entityName = 'DP_Processes';
  readonly className = 'ProcessesBusiness';

  // Method API dynamic proccess
  readonly methodGetList = 'GetListProcessesAsync';

  // Get idField
  readonly idField = 'recID';
  grvSetup: any;
  isChecked: boolean = false;
  totalInstance: number = 0;
  lstGroup: any = [];
  isSaveName: boolean = true;
  lstVllRoles = [];
  asideMode: string;
  crrModule: string;
  constructor(
    private inject: Injector,
    private activedRouter: ActivatedRoute,
    private notificationsService: NotificationsService,
    private authStore: AuthStore,
    private layoutDP: LayoutComponent,
    private layoutService: LayoutService,
    private dpService: CodxDpService,
    private codxShareService: CodxShareService
  ) {
    super(inject);
    this.heightWin = Util.getViewPort().height - 100;
    this.widthWin = Util.getViewPort().width - 100;
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    this.cache
      .gridViewSetup('DPProcesses', 'grvDPProcesses')
      .subscribe((grv) => {
        this.grvSetup = grv;
      });

    this.getListAppyFor();
    this.getValueFormCopy();
    this.getListProcessGroups();
    this.user = this.authStore.get();
  }

  onInit(): void {
    this.asideMode = this.codxService?.asideMode;
    this.button = [
      {
        id: this.btnAdd,
      },
    ];
    if (!this.funcID) {
      this.funcID = this.activedRouter.snapshot.params['funcID'];
      this.crrFunID = this.funcID;
    }
    this.afterLoad();
    this.cache.valueList('DP010').subscribe((vll) => {
      if (vll && vll?.datas) {
        this.lstVllRoles = vll.datas;
      }
    });
  }

  afterLoad() {
    this.showButtonAdd =
      this.funcID == 'DP01' ||
      this.funcID == 'DP0101' ||
      this.funcID == 'DP0204'; // this.funcID == 'DP01' || this.funcID == 'DP0101'  2 cái này Khanh đổi rồi để vậy xóa sau
  }

  //chang data
  viewChanged(e) {
    this.layoutDP.hidenNameProcess();
    var funcIDClick = this.activedRouter.snapshot.params['funcID'];
    if (this.crrFunID != funcIDClick) {
      this.funcID = funcIDClick;
      this.crrFunID = this.funcID;
      this.afterLoad();

      this.detectorRef.detectChanges();
      //this.detectorRef.markForCheck();
    }
  }
  onDragDrop(e: any) {}

  click(evt: ButtonModel) {
    this.titleAction = evt.text;
    switch (evt.id) {
      case this.btnAdd:
        if (this.isButton) {
          this.add();
          break;
        }
    }
  }
  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.card,
        sameData: true,
        active: true,
        // toolbarTemplate: this.footerButton,
        model: {
          template: this.templateViewCard,
          headerTemplate: this.headerTemplate,
        },
      },
    ];
    this.view.dataService.methodSave = 'AddProcessAsync';
    this.view.dataService.methodUpdate = 'UpdateProcessAsync';
    this.detectorRef.detectChanges();
    // this.detectorRef.markForCheck();
  }

  searchDynamicProcess($event) {
    this.view.dataService.search($event);
    this.detectorRef.detectChanges();
    // this.detectorRef.markForCheck();
  }

  // CRUD methods
  add() {
    this.isButton = false;
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
              // processNo: this.processNo,
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
              this.isButton = true;
              if (!e?.event) this.view.dataService.clear();
              if (e && e.event != null) {
                e.event.totalInstance = 0;
                this.view.dataService.update(e.event).subscribe();
                this.detectorRef.detectChanges();
                // this.detectorRef.markForCheck();
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
    this.isButton = false;
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
                totalInstance: this.totalInstance,
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
                this.isButton = true;
                if (!e?.event) this.view.dataService.clear();
                if (e && e.event != null) {
                  this.view.dataService.update(e.event).subscribe();
                  this.itemSelected = e.event;
                  this.detectorRef.detectChanges();
                  // this.detectorRef.markForCheck();
                }
              });
            }
          });
      });
  }
  //chỉ xem
  viewInfo(data: any) {
    this.isButton = false;
    if (data) {
      this.view.dataService.dataSelected = data;
    }

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
            action: 'view',
            titleAction: this.titleAction,
            gridViewSetup: this.gridViewSetup,
            lstGroup: this.lstGroup,
          };

          let dialogView = this.callfc.openForm(
            PopupAddDynamicProcessComponent,
            '',
            this.widthWin,
            this.heightWin,
            '',
            obj,
            '',
            dialogModel
          );
        }
        this.isButton = true;
      });
  }

  copy(data: any) {
    if (this.isCopy) {
      if (data) {
        // cũ-BLV
        //this.view.dataService.dataSelected = data;
        // this.oldIdProccess = this.view.dataService.dataSelected.recID;
        //Mới_VT
        this.oldIdProccess = data.recID;
      }
      this.view.dataService.copy().subscribe((res) => {
        //Mới_VT
        this.view.dataService.dataSelected = res;
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
              // processNo: this.processNo,
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
            let data = [
              this.oldIdProccess,
              this.view.dataService.dataSelected.recID,
            ];
            this.dpService.copyAvatarById(data).subscribe((res) => {
              this.openFormCopyProccess(obj, dialogModel);
            });
          });
      });
    }
    return;
  }

  openFormCopyProccess(obj, dialogModel) {
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
      this.isButton = true;
      if (!e?.event) this.view.dataService.clear();
      if (e && e.event != null) {
        e.event.totalInstance = 0;
        this.view.dataService.update(e.event).subscribe();
        this.detectorRef.detectChanges();
        // this.detectorRef.markForCheck();
      }
    });
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
      550,
      500
    );
    this.dialogQuestionCopy.closed.subscribe();
  }
  checkValueCopy($event, data) {
    // if ($event && $event.currentTarget.checked) {
    //   this.listClickedCoppy.push(data);
    //   if (data.id === '3') {
    //     this.listClickedCoppy = this.listClickedCoppy.concat(
    //       this.listSelectStepCoppy
    //     );
    //   }
    // } else {
    //   if (data.id === '3') {
    //     this.listClickedCoppy = this.listClickedCoppy.filter((item2) => {
    //       return !this.listSelectStepCoppy.some(
    //         (item1) => item1.id === item2.id
    //       );
    //     });
    //   }
    //   let idx = this.listClickedCoppy.findIndex((x) => x.id === data.id);
    //   if (idx >= 0) this.listClickedCoppy.splice(idx, 1);
    // }
    const index = this.listClickedCoppy.indexOf(data);
    if (index >= 0) {
      if (data.id === '3') {
        this.listClickedCoppy = this.listClickedCoppy.filter((item2) => {
          return !this.listSelectStepCoppy.some(
            (item1) => item1.id === item2.id
          );
        });

        this.isChecked = false;
      }
      this.listClickedCoppy.splice(index, 1);
    } else {
      if (data.id === '3') {
        this.listClickedCoppy = this.listClickedCoppy.concat(
          this.listSelectStepCoppy
        );
        this.isChecked = true;
      }
      this.listClickedCoppy.push(data);
    }
  }
  getValueFormCopy() {
    this.cache.valueList('DP037').subscribe((res) => {
      if (res?.datas) {
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
    this.detectorRef.detectChanges();
    // this.detectorRef.markForCheck();
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
          this.detectorRef.detectChanges();
          // this.detectorRef.markForCheck();
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
        if (this.isButton) this.edit(data);
        break;
      case 'SYS04':
        this.OpenFormCopy(data);
        break;
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS05':
        this.viewInfo(data);
        break;
      case 'DP01014':
      case 'DP02014':
      case 'DP02024':
      case 'DP02034':
      case 'DP034':
        if (this.isButton) this.roles(data);
        break;
      case 'DP01011':
      case 'DP02011':
      case 'DP02021':
      case 'DP02031':
      case 'DP041':
      case 'DP031':
        this.openDetail(data);
        //  this.viewDetailProcess(data);
        break;
      case 'DP01013':
      case 'DP02033':
      case 'DP02023':
      case 'DP02013':
      case 'DP033':
        if (this.isButton) this.properties(data);
        break;
      case 'DP01012': // edit name
      case 'DP02012':
      case 'DP02022':
      case 'DP032':
        this.renameProcess(data);
        break;

      case 'DP042': // edit name
        this.restoreProcess(data);
        break;
      case 'DP01015': // thiết lập quy trình duyệt
      case 'DP02015':
      case 'DP02025':
      case 'DP02035':
      case 'DP035':
        this.settingSubmit(data.processNo);
        break;
      case 'DP01016': // phát hành quy trình
      case 'DP02016':
      case 'DP02026':
      case 'DP02036':
      case 'DP036':
        this.releaseProcess(data);
        break;
      case 'DP01017': //cập nhật phát hành quy trình
      case 'DP02017':
      case 'DP02027':
      case 'DP02037':
      case 'DP037':
        this.releaseProcess(data);
        break;
      case 'DP01018': // hủy phát hành quy trình
      case 'DP02018':
      case 'DP02028':
      case 'DP02038':
      case 'DP038':
        this.cancelReleaseProcess(data);
        break;
      default: {
        this.codxShareService.defaultMoreFunc(
          e,
          data,
          this.afterSave,
          this.view.formModel,
          this.view.dataService,
          this
        );
        this.detectorRef.detectChanges();
        break;
      }
    }
  }
  afterSave(e?: any, that: any = null) {
    //đợi xem chung sửa sao rồi làm tiếp
  }

  changeDataMF(e, data) {
    if (e) {
      if (!data) {
        e.forEach((res) => {
          res.disabled = true;
        });
      } else if (data) {
        e.forEach((res) => {
          switch (res.functionID) {
            // case 'SYS005':
            // case 'SYS004':
            // case 'SYS001':
            // case 'SYS002':
            // case 'SYS003':
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
            case 'DP031':
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
            case 'DP032':
              if (
                data.category === '0' ||
                !data.write ||
                this.funcID == 'DP0203' ||
                this.funcID === 'DP04'
              ) {
                res.disabled = true;
              }
              break;
            case 'SYS03':
              if (
                !data.write ||
                this.funcID == 'DP0203' ||
                this.funcID === 'DP04'
              ) {
                if (res.functionID == 'SYS03') res.disabled = true;
                else res.isblur = true;
              }
              break;
            //Phân quyền:
            case 'DP01014':
            case 'DP02014':
            case 'DP02024':
            case 'DP02034':
            case 'DP034':
              if (!data.assign) res.isblur = true;
              break;
            case 'SYS02': // xoa
              if (
                data.category === '0' ||
                !data.delete ||
                data.deleted ||
                this.funcID == 'DP0203' ||
                this.funcID === 'DP04'
              ) {
                res.disabled = true;
              }
              break;
            //Phát hành
            case 'DP01015':
            case 'DP02015':
            case 'DP02025':
            case 'DP02035':
            case 'DP035':
              if (!data.write) {
                res.disabled = true;
              } else if (!data.approveRule) {
                res.isblur = true;
              }
              break;
            case 'DP01016':
            case 'DP02016':
            case 'DP02026':
            case 'DP02036':
            case 'DP036':
              if (data.category === '0' || data.released || !data?.publish)
                res.disabled = true;
              break;
            case 'DP01017':
            case 'DP02017':
            case 'DP02027':
            case 'DP02037':
            case 'DP037':
              if (data.category === '0' || !data.released || !data?.publish)
                res.disabled = true;
              break;
            case 'DP01018':
            case 'DP02018':
            case 'DP02028':
            case 'DP02038':
            case 'DP038':
              if (data.category === '0' || !data.released || !data?.publish)
                res.disabled = true;
              break;
          }
        });
      }
    }
  }

  //#popup roles
  roles(e: any) {
    this.isButton = false;
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
        this.isButton = true;
        if (e?.event && e?.event != null) {
          this.view.dataService.update(e?.event).subscribe();
          this.detectorRef.detectChanges();
        }
      });
  }

  properties(data) {
    this.isButton = false;
    let option = new SidebarModel();
    option.DataService = this.view?.dataService;
    option.FormModel = this.view?.formModel;
    option.Width = '550px';
    this.dialog = this.callfc.openSide(PopupPropertiesComponent, data, option);
    this.dialog.closed.subscribe((e) => {
      this.isButton = true;
      if (!e.event) this.view.dataService.clear();
    });
    // let option = new DialogModel();
    // option.IsFull = true;
    // option.zIndex = 1010;
    // let formModelField = new FormModel();
    // formModelField.formName = "DPStepsFields";
    // formModelField.gridViewName = "grvDPStepsFields";
    // formModelField.entityName = "DP_Steps_Fields";
    // formModelField.userPermission = this.view?.formModel?.userPermission;
    // option.FormModel = formModelField;
    // let popupDialog = this.callfc.openForm(
    //   ProcessesPropertiesComponent,
    //   '',
    //   null,
    //   null,
    //   '',
    //   data,
    //   '',
    //   option
    // );
    // popupDialog.closed.subscribe((dg) => {
    //   if(dg){

    //   }
    // })
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
    if (data?.deleted) return;
    let isRead = this.checkPermissionRead(data);
    if (isRead) {
      this.viewDetailProcess(data);
    }
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
    if (!data.read) return;
    this.dpService.dataProcess.next(data);

    this.codxService.navigate('', `dp/instances/DPT04/${data.recID}`);
    this.detectorRef.detectChanges();
    // let url = '/' + UrlUtil.getTenant() + '/dp/instances/DPT04/' + data.recID;
    // this.route.navigate([url]);
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

  //--------------Phát hành quy trình------------------//
  releaseProcess(process) {
    this.processReleaseClone = process;
    this.processRelease = JSON.parse(JSON.stringify(process)) as DP_Processes;
    this.processRelease.releasedName = this.processRelease.releasedName
      ? this.processRelease.releasedName
      : this.processRelease?.processName;
    // this.processRelease.module = 'CM';
    // this.processRelease.function = 'CM02';
    let dialogModel = new DialogModel();
    dialogModel.FormModel = JSON.parse(JSON.stringify(this.view.formModel));
    let obj = {
      processRelease: this.processRelease,
      grvSetup: this.grvSetup,
      processName: process.processName,
      applyFor: process.applyFor,
      headerText: this.titleAction,
    };
    let popupRelease = this.callfc.openForm(
      PopupReleaseProcessComponent,
      '',
      500,
      600,
      '',
      obj,
      '',
      dialogModel
    );
    popupRelease.closed.subscribe((e) => {
      if (e && e.event) {
        let data = e.event;
        this.processReleaseClone.icon = data.icon;
        this.processReleaseClone.released = true;
        this.processReleaseClone.releasedName = data.releasedName;
        this.processReleaseClone.module = data.module;
        this.processReleaseClone.function = this.processRelease.function;
        this.processReleaseClone.status = '7';
        this.processReleaseClone.modifiedOn = data.modifiedOn;
        this.processReleaseClone.modifiedBy = this.user?.userID;
        this.view.dataService.update(this.processReleaseClone).subscribe();

        this.notificationsService.notifyCode('SYS007');
      }
    });
  }

  cancelReleaseProcess(process) {
    this.dpService.releaseProcess([process, false]).subscribe((res) => {
      if (res) {
        process.status = '1';
        process.released = false;
        process.modifiedOn = res;
        process.modifiedBy = this.user?.userID;
        this.view.dataService.update(process).subscribe();
        this.detectorRef.detectChanges();
        // this.detectorRef.markForCheck();
        this.notificationsService.notifyCode('SYS007');
      }
    });
  }

  saveReleaseProcess() {
    if (!this.processRelease.releasedName.trim()) {
      this.releasedNameTem;
      this.notificationsService.notifyCode(
        'SYS009',
        0,
        '"' + this.grvSetup['ReleasedName'].headerText + '"'
      );
      return;
    }
    this.dpService
      .releaseProcess([this.processRelease, true])
      .subscribe((res) => {
        if (res) {
          this.processReleaseClone.icon = this.processRelease.icon;
          this.processReleaseClone.released = true;
          this.processReleaseClone.releasedName =
            this.processRelease.releasedName;
          this.processReleaseClone.module = this.processRelease.module;
          this.processReleaseClone.function = this.processRelease.function;
          this.processReleaseClone.status = '7';
          this.processReleaseClone.modifiedOn = res;
          this.processReleaseClone.modifiedBy = this.user?.userID;
          this.view.dataService.update(this.processReleaseClone).subscribe();

          this.notificationsService.notifyCode('SYS007');
          this.popupRelease.close();
          this.detectorRef.detectChanges();
          // this.detectorRef.markForCheck();
        }
      });
  }

  // changeValueCbx(e) {
  //   if (!e?.data || !e?.field) {
  //     if (e.field == 'module') {
  //       this.processRelease['function'] = null;
  //       this.functionCbx.model = null;

  //       (
  //         this.functionCbx.ComponentCurrent as CodxComboboxComponent
  //       ).dataService.data = [];
  //       this.functionCbx.crrValue = null;
  //     }
  //     this.formRelease.formGroup.patchValue(this.processRelease);
  //     return;
  //   }
  //   this.processRelease[e.field] = e.data;
  //   // let module = e?.component?.itemsSelected[0]?.Module ?? e?.data; //tesst

  //   switch (e?.field) {
  //     case 'module':
  //       this.crrModule = e?.data;

  //       this.functionCbx.model = { Module: this.crrModule };
  //       (
  //         this.functionCbx.ComponentCurrent as CodxComboboxComponent
  //       ).dataService.data = [];
  //       this.functionCbx.crrValue = null;
  //       this.processRelease.function = null;

  //       break;
  //     case 'function':
  //       this.crrModule = e?.component?.itemsSelected[0]?.Module; //tesst
  //       // this.moduleCbx.model = { Module: this.crrModule };
  //       (
  //         this.moduleCbx.ComponentCurrent as CodxComboboxComponent
  //       ).dataService.data = [];
  //       this.moduleCbx.crrValue = this.crrModule;
  //       this.processRelease.module = this.crrModule;
  //       break;
  //   }

  //   this.formRelease.formGroup.patchValue(this.processRelease);
  // }

  //--------------End - Phát hành quy trình------------------//

  changeValueName(event, data) {
    let value = event?.data;
    if (typeof event?.data === 'string') {
      value = value.trim();
    }
    this.processName = value;
  }

  changeValue(event, data) {
    let value = event?.data;
    if (typeof event?.data === 'string') {
      value = value.trim();
    }
    data[event?.field] = value;
  }

  async editName() {
    if (!this.isSaveName) return;
    this.isSaveName = false;
    setTimeout(() => {
      this.isSaveName = true;
    }, 3000);

    if (!this.processName?.trim()) {
      this.notificationsService.notifyCode(
        'SYS009',
        0,
        '"' + this.grvSetup['ProcessName']?.headerText + '"'
      );
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
            this.view.dataService.update(this.processRename, true).subscribe();
            // this.changeDetectorRef.markForCheck();
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

  valueChangeFilter(e) {
    let predicates = '';
    let predicate = e.field + '=@';
    let dataValueFilter = e.data;
    if (dataValueFilter?.length > 1) {
      for (var i = 0; i < dataValueFilter.length - 1; i++) {
        predicates += predicate + i + 'or ';
      }
      predicates += predicate + dataValueFilter.length;
    } else if (dataValueFilter?.length == 1) {
      predicates = predicate + '0';
    }
    if (predicates) predicates = '( ' + predicates + ' )';

    (this.view.dataService as CRUDService).setPredicates(
      [predicates],
      [dataValueFilter.join(';')]
    );
  }

  //setting trình kí
  settingSubmit(categoryID) {
    this.dpService
      //.getESCategoryByCategoryID(categoryID)
      .getESCategoryByCategoryIDType(categoryID, 'DP_Processes')
      .subscribe((item: any) => {
        if (item) {
          //gọi ko ra
          // Khanh bảo vậy mặc định luôn là kí sô
          this.cache.functionList('ESS22').subscribe((f) => {
            if (f) {
              if (!f || !f.gridViewName || !f.formName) return;
              this.cache.gridView(f.gridViewName).subscribe((gridview) => {
                this.cache
                  .gridViewSetup(f.formName, f.gridViewName)
                  .subscribe((grvSetup) => {
                    let formES = new FormModel();
                    formES.funcID = f?.functionID;
                    formES.entityName = f?.entityName;
                    formES.formName = f?.formName;
                    formES.gridViewName = f?.gridViewName;
                    formES.currentData = item;
                    let option = new SidebarModel();
                    option.Width = '800px';
                    option.FormModel = formES;
                    // var dataService = new DataService(this.inject);
                    // dataService.dataSelected = item;
                    let popupEditES = this.callfc.openSide(
                      PopupAddCategoryComponent,
                      {
                        disableCategoryID: '1',
                        data: item,
                        isAdd: false,
                        headerText: this.titleAction,
                        dataType: 'auto',
                        templateRefID: this.itemSelected.recID,
                        templateRefType: 'DP_Processes',
                        disableESign: true,
                      },
                      option
                    );

                    popupEditES.closed.subscribe((res) => {
                      if (res?.event) {
                      }
                    });
                  });
              });
            }
          });
        }
      });
  }

  //end trinh ky

  //---------------------view popup Detail-----------------------//
  openDetail(data) {
    if (!data.read) {
      return;
    }
    let isCreate = data.create ? true : false;
    let obj = {
      data: data,
      nameAppyFor: this.getNameAppyFor(data?.applyFor),
      isCreate: isCreate,
    };
    let dialogModel = new DialogModel();
    dialogModel.IsFull = true;
    dialogModel.zIndex = 999;
    let dialogView = this.callfc.openForm(
      PopupViewsDetailsProcessComponent,
      '',
      this.widthWin,
      this.heightWin,
      '',
      obj,
      '',
      dialogModel
    );
    // dialogView.closed.subscribe((e) => {
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
  }

  //----------------------------End-------------------------//

  //popover permissions
  popoverOld: any;
  allTooltips: any[] = [];
  async popoverTempImgs(perm = null) {
    let positionName = '';
    const dataImgs = perm;
    if (
      dataImgs?.objectID &&
      dataImgs?.objectID?.trim() != '' &&
      (dataImgs?.objectType == 'U' || dataImgs?.objectType == '1')
    ) {
      const users = await firstValueFrom(
        this.dpService.getUserByID(dataImgs?.objectID)
      );
      if (users != null) {
        positionName = users?.positionName;
      }
    }
    return positionName;
  }

  closeAllTooltips() {
    for (const tooltip of this.allTooltips) {
      if (tooltip !== this.popoverOld && tooltip?.isOpen()) {
        tooltip.close();
      }
    }
  }

  popoverCrr: any;
  popoverDataSelected: any;
  lstPermissions = [];
  dataPermissions: any;
  lstUsersPositions = [];
  async popoverEmpList(p: any, data = null) {
    if (this.popoverCrr && this.popoverCrr?.isOpen()) {
      this.popoverCrr.close();
      this.lstPermissions = [];
    }
    if (this.popoverDataSelected) {
      if (this.popoverDataSelected.isOpen()) {
        this.lstPermissions = [];
        this.popoverDataSelected.close();
      }
    }

    if (p) {
      var element = document.getElementById(data?.recID);
      if (element) {
        var t = this;
        this.dataPermissions = data;
        this.lstPermissions = data?.permissions ?? [];
        let lstIDs = this.lstPermissions
          .filter(
            (x) =>
              x.objectID &&
              x.objectID.trim() !== '' &&
              (x.objectType == 'U' || x.objectType == '1')
          )
          .map((q) => q.objectID)
          .filter((value, index, self) => self.indexOf(value) === index);
        this.lstUsersPositions = await firstValueFrom(
          this.dpService.getPositionsByUserID(lstIDs)
        );
        //
      }
    }
    this.detectorRef.detectChanges();
  }

  searchName(e) {
    if (this.dataPermissions?.permissions) {
      if (e == null || e?.trim() == '') {
        this.lstPermissions = this.dataPermissions?.permissions ?? [];
        return;
      }

      this.lstPermissions = this.dataPermissions?.permissions.filter(
        (x) =>
          (x.objectName &&
            x.objectName?.trim() != '' &&
            this.fuzzySearch(e, x.objectName)) ||
          (x.objectID &&
            x.objectID?.trim() != '' &&
            this.fuzzySearch(e, x.objectID))
      );
    }
    this.detectorRef.detectChanges();
  }

  fuzzySearch(needle: string, haystack: string): boolean {
    const haystackLower = haystack
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s/g, '');

    const needleLower = needle
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s/g, '');

    const regex = new RegExp([...needleLower].join('.*'));

    return regex.test(haystackLower);
  }
  //end

  selectedChange(process: any) {
    this.itemSelected = process?.data ? process?.data : process;
    this.detectorRef.detectChanges();
  }
  changeItemSelect(process) {
    this.itemSelected = process;
    this.detectorRef.detectChanges();
  }
}
