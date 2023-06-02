import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  UIComponent,
  ViewModel,
  ButtonModel,
  FormModel,
  ResourceModel,
  CacheService,
  NotificationsService,
  ViewType,
  SidebarModel,
  RequestOption,
  DialogModel,
} from 'codx-core';
import { CodxCmService } from '../codx-cm.service';
import { PopupAddDealComponent } from '../deals/popup-add-deal/popup-add-deal.component';
import { CM_Customers } from '../models/cm_model';
import { PopupAddLeadComponent } from './popup-add-lead/popup-add-lead.component';
import { PopupConvertLeadComponent } from './popup-convert-lead/popup-convert-lead.component';
import { PopupMergeLeadsComponent } from './popup-merge-leads/popup-merge-leads.component';

@Component({
  selector: 'lib-leads',
  templateUrl: './leads.component.html',
  styleUrls: ['./leads.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LeadsComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @ViewChild('templateDetail', { static: true })
  templateDetail: TemplateRef<any>;
  @ViewChild('itemTemplate', { static: true })
  itemTemplate: TemplateRef<any>;
  @ViewChild('itemViewList', { static: true })
  itemViewList: TemplateRef<any>;
  @ViewChild('itemMoreFunc', { static: true })
  itemMoreFunc: TemplateRef<any>;
  @ViewChild('itemFields', { static: true })
  itemFields: TemplateRef<any>;
  @ViewChild('cardKanban') cardKanban!: TemplateRef<any>;
  @ViewChild('viewColumKaban') viewColumKaban!: TemplateRef<any>;
  @ViewChild('popDetail') popDetail: TemplateRef<any>;
  @ViewChild('footerButton') footerButton?: TemplateRef<any>;

  // extension core
  views: Array<ViewModel> = [];
  moreFuncs: Array<ButtonModel> = [];
  formModel: FormModel;

  // type any for view detail
  funcID: any;
  dataObj?: any;
  kanban: any;

  // config api get data
  service = 'CM';
  assemblyName = 'ERM.Business.CM';
  entityName = 'CM_Leads';
  className = 'LeadsBusiness';
  method = 'GetListLeadsAsync';
  idField = 'recID';

  // data structure
  listCustomer: CM_Customers[] = [];

  // type of string
  customerName: string = '';
  oldIdDeal: string = '';

  @Input() showButtonAdd = false;

  columnGrids = [];
  // showButtonAdd = false;
  button?: ButtonModel;
  dataSelected: any;
  //region Method
  //endregion

  titleAction = '';
  vllPriority = 'TM005';
  crrFuncID = '';
  viewMode = 2;
  // const set value
  readonly btnAdd: string = 'btnAdd';
  request: ResourceModel;
  resourceKanban?: ResourceModel;
  hideMoreFC = true;
  listHeader: any;
  deadId: string = '';
  constructor(
    private inject: Injector,
    private cacheSv: CacheService,
    private activedRouter: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private codxCmService: CodxCmService,
    private notificationsService: NotificationsService
  ) {
    super(inject);
    if (!this.funcID) {
      this.funcID = this.activedRouter.snapshot.params['funcID'];
    }
  }
  ngOnChanges(changes: SimpleChanges): void {}

  onInit(): void {
    this.dataObj = {
      processID: '327eb334-5695-468c-a2b6-98c0284d0620',
    };
    this.request = new ResourceModel();
    this.request.service = 'CM';
    this.request.assemblyName = 'CM';
    this.request.className = 'LeadsBusiness';
    this.request.method = 'GetListLeadsAsync';
    this.request.idField = 'recID';
    this.request.dataObj = this.dataObj;

    this.resourceKanban = new ResourceModel();
    this.resourceKanban.service = 'DP';
    this.resourceKanban.assemblyName = 'DP';
    this.resourceKanban.className = 'ProcessesBusiness';
    this.resourceKanban.method = 'GetColumnsKanbanAsync';
    this.resourceKanban.dataObj = this.dataObj;

    this.button = {
      id: this.btnAdd,
    };

    this.views = [
      {
        type: ViewType.listdetail,
        sameData: true,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.templateDetail,
        },
      },
      {
        type: ViewType.kanban,
        active: false,
        sameData: false,
        request: this.request,
        request2: this.resourceKanban,
        toolbarTemplate: this.footerButton,
        model: {
          template: this.cardKanban,
          template2: this.viewColumKaban,
          setColorHeader: true,
        },
      },
    ];

    this.router.params.subscribe((param: any) => {
      if (param.funcID) {
        this.funcID = param.funcID;
      }
    });
  }

  ngAfterViewInit(): void {
    this.crrFuncID = this.funcID;
    this.changeDetectorRef.detectChanges();
  }

  onLoading(e) {}

  changeView(e) {
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    if (this.crrFuncID != this.funcID) {
      this.crrFuncID = this.funcID;
    }
  }

  click(evt: ButtonModel) {
    this.titleAction = evt.text;
    switch (evt.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }

  clickMoreFunc(e) {
    this.clickMF(e.e, e.data);
  }

  changeDataMF($event, data) {
    if ($event != null && data != null) {
      if (!data?.roles?.isOnwer) {
        for (let more of $event) {
          switch (more.functionID) {
            default:
              more.disabled = true;
          }
        }
      } else {
        if (data.status == '1') {
          for (let more of $event) {
            switch (more.functionID) {
              case 'SYS03':
              case 'SYS04':
              case 'SYS02':
              case 'CM0201_2':
                more.isblur = false;
                break;
              default:
                more.isblur = true;
            }
          }
        }
      }
    }
  }
  checkMoreReason(data, isUseReason) {
    if (data.status != '2' || isUseReason) {
      return true;
    }
    if (data.closed) {
      return true;
    }
    if (!data.permissionMoveInstances) {
      return true;
    }
    return false;
  }

  clickMF(e, data) {
    this.dataSelected = data;
    this.titleAction = e.text;
    switch (e.functionID) {
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS04':
        this.copy(data);
        break;
      case 'SYS02':
        this.delete(data);
        break;
      case 'CM0201_2':
        this.handelStartDay(data);
        break;
      case 'CM0205_1':
        this.convertLead(data);
        break;
      case 'CM0205_2':
        this.mergeLead(data);
        break;
    }
  }
  changeMF(e) {
    this.changeDataMF(e.e, e.data);
  }

  handelStartDay(data) {
    this.notificationsService
      .alertCode('DP033', null, ['"' + data?.title + '"' || ''])
      .subscribe((x) => {
        if (x.event && x.event.status == 'Y') {
          this.startDeal(data.recID);
        }
      });
  }

  startDeal(recId) {
    var data = [recId];
    this.codxCmService.startDeal(data).subscribe((res) => {
      if (res) {
        debugger;
        // data.status = '2';
        // data.startDate = res?.length > 0 ? res[0].startDate : null;
        //   this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
        //   this.listInstanceStep = res;
        this.dataSelected = res[0];
        this.notificationsService.notifyCode('SYS007');
        this.view.dataService.update(this.dataSelected).subscribe();
        if (this.kanban) this.kanban.updateCard(this.dataSelected);
      }
      this.detectorRef.detectChanges();
    });
  }

  getPropertiesHeader(data, type) {
    if (this.listHeader?.length == 0) {
      this.listHeader = this.getPropertyColumn();
    }
    let find = this.listHeader?.find((item) => item.recID === data.keyField);
    return find ? find[type] : '';
  }

  getPropertyColumn() {
    let dataColumns =
      this.kanban?.columns?.map((column) => {
        return {
          recID: column['dataColums']?.recID,
          icon: column['dataColums']?.icon || null,
          iconColor: column['dataColums']?.iconColor || null,
          backgroundColor: column['dataColums']?.backgroundColor || null,
          textColor: column['dataColums']?.textColor || null,
        };
      }) || [];

    return dataColumns;
  }

  //#region Search
  searchChanged(e) {}
  //#endregion

  //#region CRUD
  add() {
    switch (this.funcID) {
      case 'CM0205': {
        //statements;
        this.addLead();
        break;
      }
      default: {
        //statements;
        break;
      }
    }
  }

  addLead() {
    this.view.dataService.addNew().subscribe((res) => {
      this.cache.functionList(this.funcID).subscribe((fun) => {
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        var formMD = new FormModel();
        formMD.funcID = this.funcID;
        formMD.entityName = fun.entityName;
        formMD.formName = fun.formName;
        formMD.gridViewName = fun.gridViewName;
        option.Width = '800px';
        option.zIndex = 1001;
        this.openFormLead(formMD, option, 'add');
        // }

        // });
      });
    });
  }

  openFormLead(formMD, option, action) {
    var obj = {
      action: action === 'add' ? 'add' : 'copy',
      formMD: formMD,
      titleAction: action === 'add' ? 'Thêm tiềm năng' : 'Sao chép tiềm năng',
    };
    let dialogCustomDeal = this.callfc.openSide(
      PopupAddLeadComponent,
      obj,
      option
    );
    dialogCustomDeal.closed.subscribe((e) => {
      if (e && e.event != null) {
        this.view.dataService.update(e.event).subscribe();
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  edit(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res) => {
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.Width = '800px';
        option.zIndex = 1001;
        var formMD = new FormModel();
        // formMD.funcID = funcIDApplyFor;
        // formMD.entityName = fun.entityName;
        // formMD.formName = fun.formName;
        // formMD.gridViewName = fun.gridViewName;
        var obj = {
          action: 'edit',
          formMD: formMD,
          titleAction: 'Chỉnh sửa tiềm năng',
        };
        let dialogCustomDeal = this.callfc.openSide(
          PopupAddLeadComponent,
          obj,
          option
        );
        dialogCustomDeal.closed.subscribe((e) => {
          if (e && e.event != null) {
            e.event.modifiedOn = new Date();
            this.view.dataService.update(e.event).subscribe();
            //this.leadsComponent.dataSelected = JSON.parse(JSON.stringify(e.event));
            this.changeDetectorRef.detectChanges();
          }
        });
      });
  }

  copy(data) {
    if (data) {
      this.view.dataService.dataSelected = JSON.parse(JSON.stringify(data));
      this.oldIdDeal = data.recID;
    }
    this.view.dataService.copy().subscribe((res) => {
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;

      var formMD = new FormModel();
      // formMD.funcID = funcIDApplyFor;
      // formMD.entityName = fun.entityName;
      // formMD.formName = fun.formName;
      // formMD.gridViewName = fun.gridViewName;
      option.Width = '800px';
      option.zIndex = 1001;
      this.openFormLead(formMD, option, 'copy');
    });
  }

  delete(data: any) {
    //   this.cache.functionList(this.funcID).subscribe((fun) => {

    // });
    this.view.dataService.dataSelected = data;

    this.cache.functionList(this.funcID).subscribe((fun) => {
      this.view.dataService
        .delete([this.view.dataService.dataSelected], true, (opt) =>
          this.beforeDel(opt, fun.entityName)
        )
        .subscribe((res) => {
          if (res) {
            this.view.dataService.onAction.next({ type: 'delete', data: data });
          }
        });
      this.changeDetectorRef.detectChanges();
    });
  }
  beforeDel(opt: RequestOption, entityName: string) {
    var itemSelected = opt.data[0];
    opt.methodName = 'DeletedLeadAsync';
    opt.data = [itemSelected.recID, entityName];
    return true;
  }
  //#endregion

  //#region convertLead
  convertLead(data) {
    this.dataSelected = data;
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res) => {
        this.cache.functionList(this.funcID).subscribe((fun) => {
          let option = new SidebarModel();
          option.DataService = this.view.dataService;
          var formMD = new FormModel();
          formMD.entityName = fun.entityName;
          formMD.formName = fun.formName;
          formMD.gridViewName = fun.gridViewName;
          formMD.funcID = this.funcID;
          option.FormModel = JSON.parse(JSON.stringify(formMD));
          option.Width = '800px';
          var obj = {
            action: 'edit',
            title: this.titleAction,
          };
          var dialog = this.callfc.openSide(
            PopupConvertLeadComponent,
            obj,
            option
          );
          dialog.closed.subscribe((e) => {
            if (!e?.event) this.view.dataService.clear();
            if (e && e.event) {
              this.dataSelected.status = '5';
              this.view.dataService.update(this.dataSelected).subscribe();
              this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
              this.detectorRef.detectChanges();
            }
          });
        });
      });
  }
  //#endregion

  //#region mergeLead
  mergeLead(data) {
    let obj = {
      data,
      title: this.titleAction,
    };
    let option = new DialogModel();
    option.IsFull = true;
    option.zIndex = 1001;
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    let popupContract = this.callfc.openForm(
      PopupMergeLeadsComponent,
      '',
      null,
      null,
      '',
      obj,
      '',
      option
    );
    popupContract.closed.subscribe((e) => {
      if (!e?.event) this.view.dataService.clear();

      if (e && e.event) {
        if (e.event.length > 0) {
          e.event[0].modifiedOn = new Date();
          this.view.dataService.add(e.event[0], 0).subscribe();
          if (e.event[1]) {
            this.view.dataService.remove(e.event[1]).subscribe();
          }
          if (e.event[2]) {
            this.view.dataService.remove(e.event[2]).subscribe();
          }
          if (e.event[3]) {
            this.view.dataService.remove(e.event[3]).subscribe();
          }
          this.dataSelected = JSON.parse(
            JSON.stringify(this.view.dataService.data[0])
          );
          this.detectorRef.detectChanges();
        }
      }
    });
  }
  //#endregion

  //#region event
  selectedChange(data) {
    this.dataSelected = data?.data ? data?.data : data;
    this.changeDetectorRef.detectChanges();
  }
  //#endregion
}
