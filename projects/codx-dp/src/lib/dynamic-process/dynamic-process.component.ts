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
} from 'codx-core';
import { CodxDpService } from '../codx-dp.service';
import { DP_Processes, DP_Processes_Permission } from '../models/models';

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

  // Input
  @Input() dataObj?: any;
  @Input() showButtonAdd = true;
  dialog!: DialogRef;
  // create variables
  crrFunID: string = '';
  funcID: string = '';
  gridViewSetup: any;
  showID = false;
  processNo: any;
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

  //test chưa có api
  popoverDetail: any;
  popupOld: any;
  popoverList: any;

  // Call API Dynamic Proccess
  readonly service = 'DP';
  readonly assemblyName = 'ERM.Business.DP';
  readonly entityName = 'DP_Processes';
  readonly className = 'ProcessesBusiness';

  // Method API dynamic proccess
  readonly methodGetList = 'GetListProcessesAsync';

  // Get idField
  readonly idField = 'recID';

  constructor(
    private inject: Injector,
    private changeDetectorRef: ChangeDetectorRef,
    private activedRouter: ActivatedRoute,
    private codxDpService: CodxDpService,
    private notificationsService: NotificationsService,
    private authStore: AuthStore,
    private callFunc: CallFuncService,
    private dpService: CodxDpService
  ) {
    super(inject);
    this.heightWin = Util.getViewPort().height - 100;
    this.widthWin = Util.getViewPort().width - 100;
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    // this.genAutoNumber();
  }

  onInit(): void {
    this.button = {
      id: this.btnAdd,
    };
    // gán tạm để test
    this.getListUser();
  }

  afterLoad() {}
  onDragDrop(e: any) {}

  click(evt: ButtonModel) {
    switch (evt.id) {
      case this.btnAdd:
        this.genAutoNumber();
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
        model: {
          template: this.templateViewCard,
        },
      },
    ];
    this.view.dataService.methodSave = 'AddProcessAsync';
    this.view.dataService.methodUpdate = 'UpdateProcessAsync';

    this.changeDetectorRef.detectChanges();
  }

  searchDynamicProcess($event) {
    if ($event) this.changeDetectorRef.detectChanges();
  }

  async genAutoNumber() {
    this.dpService
      .genAutoNumber(this.funcID, 'grvDPProcesses', 'processNo')
      .subscribe((res) => {
        if (res) {
          this.processNo = res;
          this.showID = true;
        } else {
          this.showID = false;
        }
      });
  }
  // CRUD methods
  add() {
    this.view.dataService.addNew().subscribe((res) => {
      var obj = {
        action: 'add',
        processNo: this.processNo,
        showID: this.showID
      };
      let dialogModel = new DialogModel();
      dialogModel.IsFull = true;
      dialogModel.zIndex = 999;
      dialogModel.DataService = this.view?.dataService;
      dialogModel.FormModel = this.view.formModel;
      this.dialog = this.callfc.openForm(
        PopupAddDynamicProcessComponent,
        '',
        this.widthWin,
        this.heightWin,
        '',
        obj,
        '',
        dialogModel
      );
      this.dialog.closed.subscribe((e) => {
        if (!e?.event) this.view.dataService.clear();
        if (e?.event == null)
          this.view.dataService.delete(
            [this.view.dataService.dataSelected],
            false
          );
      });
    });
  }

  edit(data: any) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res) => {
        var obj = {
          action: 'edit',
        };
        let dialogModel = new DialogModel();
        dialogModel.IsFull = true;
        dialogModel.zIndex = 999;
        dialogModel.DataService = this.view?.dataService;
        dialogModel.FormModel = this.view.formModel;
        this.dialog = this.callfc.openForm(
          PopupAddDynamicProcessComponent,
          '',
          this.widthWin,
          this.heightWin,
          '',
          obj,
          '',
          dialogModel
        );
        this.dialog.closed.subscribe((e) => {
          if (!e?.event) this.view.dataService.clear();
          if (e?.event == null)
            this.view.dataService.delete(
              [this.view.dataService.dataSelected],
              false
            );
          if (e && e.event != null) {
            this.view.dataService.update(e.event).subscribe();
            this.detectorRef.detectChanges();
          }
        });
      });
    this.changeDetectorRef.detectChanges();
  }
  copy(data: any) {
    this.changeDetectorRef.detectChanges();
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
    opt.data = [itemSelected.recID, true];
    return true;
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
        this.copy(data);
        break;
      case 'SYS02':
        this.delete(data);
        break;
    }
  }

  //#region đang test
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

    return isRead ? true : false;
  }

  getListUser() {
    this.codxDpService
      .getUserByProcessId('675ef83a-f2a6-4798-b377-9071c52fa714')
      .subscribe((res) => {
        if (res) {
          this.listUserInUse = res;
        }
      });
  }

  //#endregion đang test
}
