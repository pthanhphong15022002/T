import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AlertConfirmInputConfig,
  ApiHttpService,
  ButtonModel,
  CRUDService,
  CacheService,
  CallFuncService,
  CodxService,
  DialogData,
  DialogModel,
  DialogRef,
  NotificationsService,
  ResourceModel,
  SidebarModel,
  ViewModel,
  ViewType,
  ViewsComponent,
} from 'codx-core';
import { AddProcessDefaultComponent } from './add-process-default/add-process-default.component';
import { ProcessReleaseDetailComponent } from './process-release-detail/process-release-detail.component';

@Component({
  selector: 'lib-process-release',
  templateUrl: './process-release.component.html',
  styleUrls: ['./process-release.component.css'],
})
export class ProcessReleaseComponent implements OnInit, AfterViewInit {
  @ViewChild('view') view: ViewsComponent;
  @ViewChild('viewColumKaban') viewColumKaban!: TemplateRef<any>;
  @ViewChild('cardKanban') cardKanban!: TemplateRef<any>;
  @ViewChild('templateList') templateList?: TemplateRef<any>;
  @ViewChild('headerTemplateList') headerTemplateList?: TemplateRef<any>;
  @ViewChild('templateDetail')
  templateDetail: TemplateRef<any>;
  @ViewChild('itemTemplate')
  itemTemplate: TemplateRef<any>;
  views: Array<ViewModel> = [];
  recID: any;
  funcID: any;
  request?: ResourceModel;
  resourceKanban?: ResourceModel;
  button?: ButtonModel[];
  process: any;

  //#region setting methods
  service = 'BP';
  assemblyName = 'ERM.Business.BP';
  entityName = 'BP_Instances';
  className = 'ProcessInstancesBusiness';
  idField = 'currentStage';
  method = 'GetListInstancesAsync';
  dataObj: any;
  //#endregion
  dataSelected: any;
  lstSteps = [];
  parentFunc:any;
  codxService: CodxService;
  constructor(
    private api: ApiHttpService,
    private callFunc: CallFuncService,
    private router: ActivatedRoute,
    private notifiSer: NotificationsService,
    private detectorRef: ChangeDetectorRef,
    private cache: CacheService,
    private codxSv: CodxService,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    this.codxService = this.codxSv;
    this.router.params.subscribe((param) => {
      if (!this.funcID) this.funcID = param['funcID'];
      if (param['id'])
      {
        this.recID = param['id'];
        if(this.view)
        {
          this.onInits();
          (this.view.currentView as any).request2.dataObj = this.recID;
          (this.view.currentView as any).loadResource();
          this.refesh(this.funcID);
          this.getProcess();
        }
      }
    });
  }

  refesh(funcId:any)
  {
    this.view.dataService.data = [];
    this.view.dataService.page = 0;
    this.view.dataService.pageCount = 0;
    (this.view.dataService as any).isFull = false;
    this.view.dataService.loaded = false;
    this.view.dataService.loading = false;
    this.view.dataService.currentComponent = null;
    this.view.dataService.searchText = '';
    this.view.dataService.predicates = '';
    this.view.dataService.dataValues = '';
    this.view.funcID = '';
    // this.view.components = new Map<string, ComponentRef<ViewBaseComponent>>();
    // this.view.setDefault = false;
    //this.view.dataService.autoLoad = true;
    this.view.restoreDefault();
    this.view.load(funcId);
  }
  ngAfterViewInit(): void {
    this.button = [
      {
        id: 'btnAdd',
      },
    ];

    this.views = [
      {
        type: ViewType.kanban,
        active: false,
        sameData: false,
        request: this.request,
        request2: this.resourceKanban,
        model: {
          template: this.cardKanban,
          template2: this.viewColumKaban,
        },
      },
      {
        type: ViewType.list,
        sameData: true,
        active: false,
        model: {
          template: this.templateList,
          headerTemplate: this.headerTemplateList,
        },
      },
      {
        type: ViewType.listdetail,
        active: true,
        sameData: true,
        // toolbarTemplate: this.footerButton,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.templateDetail,
        },
      },
      // request: this.request,
      // request2: this.resourceKanban,
      // // toolbarTemplate: this.footerButton,
      // model: {
      //   template: this.cardKanban,
      //   template2: this.viewColumKaban,
      //   setColorHeader: true,
      // },
    ];

    this.getFunc();
  }

  getFunc()
  {
    this.cache.functionList(this.funcID).subscribe(item=>{
      if(item)
      {
        this.cache.functionList(item.parentID).subscribe(item2=>{
           if(item2) {
            this.parentFunc = item2;
           }
        })
      }
    })
  }

  getProcess() {
    this.api
      .execSv('BP', 'BP', 'ProcessesBusiness', 'GetAsync', this.recID)
      .subscribe((item) => {
        if (item) {
          this.process = item;
          this.lstSteps = this.process?.steps?.filter(
            (x) => x.activityType == 'Stage'
          );
        }
      });
  }

  ngOnInit(): void {
   this.onInits();
  }

  onInits()
  {
    this.dataObj = {
      processID: this.recID,
    };

    // this.request = new ResourceModel();
    // this.request.service = 'BP';
    // this.request.assemblyName = 'BP';
    // this.request.className = 'ProcessInstancesBusiness';
    // this.request.method = 'GetListInstancesAsync';
    // this.request.idField = 'recID';
    // this.request.dataObj = this.dataObj;

    this.resourceKanban = new ResourceModel();
    this.resourceKanban.service = 'BP';
    this.resourceKanban.assemblyName = 'BP';
    this.resourceKanban.className = 'ProcessesBusiness';
    this.resourceKanban.method = 'GetColumnsKanbanAsync';
    this.resourceKanban.dataObj = this.recID;

    this.getProcess();
  }
  selectedChange(data) {
    this.dataSelected = data?.data ? data?.data : data;

    this.detectorRef.detectChanges();
  }

  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.addItem();
        break;
    }
  }

  openFormDetail(dt: any) {
    var option = new DialogModel();
    option.IsFull = true;
    option.FormModel = this.view.formModel;
    option.zIndex = 100;
    let popup = this.callFunc.openForm(
      ProcessReleaseDetailComponent,
      '',
      850,
      600,
      '',
      { data: dt, process: this.process },
      '',
      option
    );
  }

  clickMF(e: any) {
    var funcID = e?.functionID;
    switch (funcID) {
      //edit
      case 'SYS03': {
        this.editItem();
        break;
      }
      //Delete
      case 'SYS02':
      {
        this.deleteItem();
        break;
      }
      case 'SYS05':
        break;
      //start
      case 'BPT01011': {
        this.startProcess();
        break;
      }
      //Xem chi tiết quy trình
      case 'BPT01012':
      {
        this.openFormDetail(this.view?.dataService?.dataSelected)
        break;
      }
    }
  }

  changeDataMF(e:any)
  {
    var approvelCL = e.filter(
      (x: { functionID: string }) =>
        x.functionID == 'BPT01011'
    );
    if (approvelCL[0] && this.view?.dataService?.dataSelected?.status == "2") approvelCL[0].disabled = true;
  }

  startProcess() {
    this.api
      .execSv(
        'BP',
        'ERM.Business.BP',
        'ProcessesBusiness',
        'StartProcessAsync',
        [this.view?.dataService?.dataSelected?.recID]
      )
      .subscribe((res:any) => {
        if (res) {
          let data = this.view?.dataService?.dataSelected;
          if(res?.recID){
            data = res
          }
          else{
            data.status = '2';
          }
          this.notifiSer.notifyCode('SYS034');
          (this.view.currentView as any).kanban.updateCard(data);
          this.view.dataService.update(data).subscribe();
        }
      });
  }

  addItem() {
    if(this.process?.status == '5')
    {
      this.view?.dataService?.addNew().subscribe((item) => {
        this.popUpAddEdit(item, 'add');
      });
    }
    else this.notifiSer.notifyCode('BP003');
  }

  editItem() {
    this.popUpAddEdit(this.view.dataService.dataSelected, 'edit');
  }

  deleteItem()
  {
    var config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
    this.notifiSer
      .alert('Thông báo', 'Bạn có chắc chắn muốn xóa?', config)
      .closed.subscribe((x) => {
        if (x.event.status == 'Y')
        {
          this.api
          .execSv(
            'BP',
            'ERM.Business.BP',
            'ProcessInstancesBusiness',
            'DeleteInsAsync',
            this.view?.dataService?.dataSelected?.recID
          )
          .subscribe((res) => {
            if (res) {
              (this.view.currentView as any).kanban.removeCard(this.view?.dataService?.dataSelected);
              this.notifiSer.notifyCode('SYS008');
            }
            else this.notifiSer.notifyCode('SYS022');
          });
        }
      });

  }
  popUpAddEdit(item: any, type: any) {
    var option = new SidebarModel();
    option.FormModel = {
      funcID: this.funcID,
    };
    let popup = this.callFunc.openSide(
      AddProcessDefaultComponent,
      { process: this.process, dataIns: item, type: type },
      option
    );
    popup.closed.subscribe((res) => {
      if (res?.event) {
        if (type == 'add')
        {
          (this.view.dataService as CRUDService).add(res.event).subscribe();
          // (this.view.currentView as any).kanban.addCard(res?.event);
          (this.view.currentView as any).kanban.refresh();
        }
        else {
          (this.view.currentView as any).kanban.updateCard(res?.event);
          (this.view.dataService as CRUDService).update(res.event).subscribe();
          this.view.dataService.update(res?.event).subscribe();
          this.view.dataService.dataSelected = res?.event;
          var index = (this.view.currentView as any).kanban.dataSource.findIndex(x=>x.recID == res?.event?.recID);
          if(index>=0)(this.view.currentView as any).kanban.dataSource[index] = res?.event
        }
      }
    });
  }

  viewChange(e: any) {}

  //#region event view list
  dbClickEvent(e){
    if(e && e?.data){
      this.openFormDetail(e?.data);
    }
  }
  //#endregion event view list
}
