import {
  Component,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  Injector,
} from '@angular/core';
import { ComboBoxComponent } from '@syncfusion/ej2-angular-dropdowns';
import {
  AlertConfirmInputConfig,
  AuthStore,
  ButtonModel,
  CallFuncService,
  CodxListviewComponent,
  CodxService,
  CodxTreeviewComponent,
  DataRequest,
  DialogModel,
  DialogRef,
  NotificationsService,
  RequestOption,
  ResourceModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import {
  compareDate,
  convertHtmlAgency,
  extractContent,
  formatBytes,
  formatDtDis,
  getIdUser,
  getListImg,
} from '../function/default.function';
import { dispatch } from '../models/dispatch.model';
import { AgencyService } from '../services/agency.service';
import { DispatchService } from '../services/dispatch.service';
import { FileService } from '@shared/services/file.service';
import { IncommingAddComponent } from './incomming-add/incomming-add.component';
import { ViewDetailComponent } from './view-detail/view-detail.component';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { AttachmentService } from 'projects/codx-share/src/lib/components/attachment/attachment.service';
import { ActivatedRoute } from '@angular/router';
import { CodxOdService } from '../codx-od.service';
import { isObservable } from 'rxjs';

@Component({
  selector: 'app-incomming',
  templateUrl: './incomming.component.html',
  styleUrls: ['./incomming.component.scss'],
})
export class IncommingComponent
  extends UIComponent
  implements AfterViewInit, OnChanges
{
  @ViewChild('panelLeft') panelLeft: TemplateRef<any>;
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('asideRight') asideRight: TemplateRef<any>;
  @ViewChild('cbxDept') cbxDept: ComboBoxComponent;
  @ViewChild('cbxAgency') cbxAgency: ComboBoxComponent;
  @ViewChild('listview') listview: CodxListviewComponent;
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('treeAdd') treeAdd: CodxTreeviewComponent;
  @ViewChild('itemTemplate') template!: TemplateRef<any>;
  @ViewChild('panelRightRef') panelRight?: TemplateRef<any>;
  @ViewChild('viewdetail') viewdetail!: ViewDetailComponent;
  @ViewChild('cardKanban') cardKanban!: TemplateRef<any>;

  public lstDtDis: any;
  public lstUserID: any = '';
  public disEdit: any;
  public txtLstAgency = '';
  public status: string;
  public predicate = '';
  public dispatchType: string = '1';
  public totalPage: number = 0;
  public fieldAgency: Object = { text: 'agencyName', value: 'agencyID' };
  public lstAgency: any;
  public lstDept: any;
  public sort = [{ field: 'CreatedOn', dir: 'déc' }];
  public switchTemplate = 'new';
  public objectIDFile: any;
  public objectType = 'OD_Dispatches';
  referType = "source"
  dialog!: DialogRef;
  button?: ButtonModel;
  request: ResourceModel;
  resourceKanban?: ResourceModel;
  userPermission: any;
  checkUserPer: any;
  compareDate = compareDate;
  formatBytes = formatBytes;
  extractContent = extractContent;
  convertHtmlAgency = convertHtmlAgency;
  getIdUser = getIdUser;
  crrDate = new Date().getTime();
  gridViewSetup: any;
  dispatch = new dispatch();
  active = 1;
  activeDiv = '1';
  fileAdd: any;
  idAgency: any;
  ///////////Các biến data valuelist/////////////////
  dvlSecurity: any;
  dvlUrgency: any;
  dvlStatus: any;
  dvlCategory: any;
  dvlStatusRel: any;
  dvlRelType: any;
  dvlStatusTM: any;
  dvlReCall: any;
  widthAsideRight = '700px';
  showAgency = false;
  dataItem: any;
  funcList: any;
  userID: any;
  ///////////Các biến data valuelist/////////////////

  ///////////Các biến data default///////////////////
  dfDis = new dispatch();
  options = new DataRequest();
  ///////////////////////////////////////////////////
  views: Array<ViewModel> | any = [];
  odService: DispatchService;
  agService: AgencyService;
  callfunc: CallFuncService;
  notifySvr: NotificationsService;
  atSV: AttachmentService;
  fileService: FileService;
  authStore: AuthStore;
  constructor(
    inject: Injector,
    private route: ActivatedRoute,
    private codxODService: CodxOdService
  ) {
    super(inject);
    this.odService = inject.get(DispatchService);
    this.agService = inject.get(AgencyService);
    this.callfunc = inject.get(CallFuncService);
    this.notifySvr = inject.get(NotificationsService);
    this.atSV = inject.get(AttachmentService);
    this.authStore = inject.get(AuthStore);
    // this.codxService = inject.get(CodxService);
    this.fileService = inject.get(FileService);
  }
  ngOnChanges(changes: SimpleChanges): void {}
  onInit(): void {
    this.resourceKanban = new ResourceModel();
    this.resourceKanban.service = 'SYS';
    this.resourceKanban.assemblyName = 'SYS';
    this.resourceKanban.className = 'CommonBusiness';
    this.resourceKanban.method = 'GetColumnsKanbanAsync';

    this.request = new ResourceModel();
    this.request.service = 'OD';
    this.request.assemblyName = 'OD';
    this.request.className = 'DispatchesBusiness';
    this.request.method = 'GetListByStatusAsync';
    this.request.idField = 'recID';
    this.userID = this.authStore.get().userID;
  }
 
  ngAfterViewInit(): void {
    this.views = [
      {
        id: '1',
        type: ViewType.listdetail,
        active: true,
        sameData: true,
        model: {
          template: this.template,
          //panelLeftRef: this.panelLeft,
          panelRightRef: this.panelRight,
          contextMenu: '',
        },
      },
      {
        id: '2',
        type: ViewType.kanban,
        active: false,
        sameData: false,
        request: this.request,
        request2: this.resourceKanban,
        model: {
          template: this.cardKanban,
        },
      },
    ];
    this.view.dataService.methodSave = 'SaveDispatchAsync';
    this.view.dataService.methodDelete = 'DeleteDispatchByIDAsync';
    this.getGridViewSetup(this.view.formModel.funcID);
    this.button = {
      id: 'btnAdd',
    };
    this.detectorRef.detectChanges();
  }
  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.show();
        break;
    }
  }

  show() {
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      // option.zIndex = 499;
      option.DataService = this.view?.currentView?.dataService;
      this.dialog = this.callfunc.openSide(
        IncommingAddComponent,
        {
          gridViewSetup: this.gridViewSetup,
          headerText: 'Thêm mới ' + (this.funcList?.defaultName).toLowerCase(),
          subHeaderText: 'Tạo & Upload File văn bản',
          type: 'add',
          formModel: this.view.formModel,
          service: this.view.service,
          dispatchType: this.funcList?.dataValue,
          data: res
        },
        option
      );
      this.dialog.closed.subscribe((x) => {
        if (x.event) {
          
          delete x.event._uuid;
          this.view.dataService.add(x.event, 0).subscribe((item) => {
            this.view.dataService.onAction.next({
              type: 'update',
              data: x.event,
            });
          });
          //this.getDtDis(x.event?.recID)
        }
      });
    });
  }
  changeDataMF(e: any, data: any) {
    //Bookmark
    var bm = e.filter(
      (x: { functionID: string }) =>
        x.functionID == 'ODT110' || x.functionID == 'ODT209' || x.functionID == "ODT3009"
    );
    //Unbookmark
    var unbm = e.filter(
      (x: { functionID: string }) =>
        x.functionID == 'ODT111' || x.functionID == 'ODT210' || x.functionID == "ODT3010"
    );
    if (data?.isBookmark) {
      if(bm[0]) bm[0].disabled = true;
      if(unbm[0]) unbm[0].disabled = false;
    } else  {
      if(unbm[0]) unbm[0].disabled = true;
      if(bm[0]) bm[0].disabled = false;
    }

    if(this.view.formModel.funcID == 'ODT41' || this.view.formModel.funcID == 'ODT51')
    {
      if(data?.status != '1' && data?.status != '2' && data?.approveStatus != '2')
      {
        var approvel = e.filter(
          (x: { functionID: string }) => x.functionID == 'ODT201' || x.functionID == 'ODT5101' 
        );
        if(approvel[0]) approvel[0].disabled = true;
      }

      //Hủy yêu cầu duyệt
      var approvel = e.filter(
        (x: { functionID: string }) => x.functionID == 'ODT212' || x.functionID == "ODT3012" || x.functionID == 'ODT5112'
      );
      for(var i = 0 ; i< approvel.length ; i++)
      {
        approvel[i].disabled = true;
      }

      if(data?.approveStatus == '3' && data?.createdBy == this.userID)
      {
        var approvel = e.filter(
          (x: { functionID: string }) => x.functionID == 'ODT212' || x.functionID == "ODT3012"
        );
        for(var i = 0 ; i< approvel.length ; i++)
        {
          approvel[i].disabled = false;
        }
      }

      //Hiện thị chức năng gửi duyệt khi xét duyệt
      if(data?.approveStatus == '1' && data?.status == '3' )
      {
          //Chức năng Gửi duyệt
          var approvel = e.filter(
            (x: { functionID: string }) => x.functionID == 'ODT201' || x.functionID == 'ODT5101' 
          );
          if (approvel[0]) approvel[0].disabled = false;
      }
    }

    //Từ chối , Bị đóng 
    if(data?.status == "9" || data?.approveStatus == "4")
    {
      var approvel = e.filter(
        (x: { functionID: string }) => 
          x.functionID == 'ODT112' || 
          x.functionID == 'ODT211' || 
          x.functionID == 'ODT103' || 
          x.functionID == 'ODT202' ||
          x.functionID == 'SYS03'  ||
          x.functionID == 'ODT103' ||
          x.functionID == 'ODT202'
      );
      if(approvel && approvel.length > 0)
        for (var i = 0; i < approvel.length; i++) {
          approvel[i].disabled = true;
        }
    }
    //Hoàn tất
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
    if (data?.status == '3') {
      var completed = e.filter(
        (x: { functionID: string }) => x.functionID == 'SYS02'
      );
      completed.forEach((elm) => {
        elm.disabled = true;
      });
    }
    var approvelCL = e.filter(
      (x: { functionID: string }) => x.functionID == 'ODT114'
    );
    if (approvelCL[0]) approvelCL[0].disabled = true;
    //Trả lại
    if (data?.status == '4') {
      var approvel = e.filter(
        (x: { functionID: string }) => x.functionID == 'ODT113'
      );
      if (approvel[0]) approvel[0].disabled = true;
      if (approvelCL[0]) approvelCL[0].disabled = false;
    }
  }
  aaaa(e: any) {
    if (e) {
      var foundIndex = e.findIndex(
        (x: { functionID: string }) => x.functionID == 'SYS001'
      );
      e[foundIndex].disabled = true;
    }
  }
  beforeDel(opt: RequestOption) {
    opt.service = 'TM';
    opt.assemblyName = 'TM';
    opt.className = 'TaskBusiness';
    opt.methodName = 'TestApi';
    return true;
  }

  getGridViewSetup(funcID: any) {
    var funcList = this.codxODService.loadFunctionList(funcID);
    if(isObservable(funcList))
    {
      this.codxODService.loadFunctionList(funcID).subscribe((fuc) => {
        this.funcList = fuc;
        var gw =  this.codxODService.loadGridView(fuc?.formName, fuc?.gridViewName)
        if(isObservable(gw))
        {
          gw.subscribe((grd) => {
            this.gridViewSetup = grd;
            this.loadDataFormGridView()
          });
        }
        else
        {
          this.gridViewSetup = gw;
          this.loadDataFormGridView()
        }
       
      });
    }
    else
    {
      this.funcList = funcList;
      var gw =  this.codxODService.loadGridView(this.funcList?.formName, this.funcList?.gridViewName)
      if(isObservable(gw))
      {
        gw.subscribe((grd) => {
          this.gridViewSetup = grd;
          this.loadDataFormGridView()
        });
      }
      else
      {
        this.gridViewSetup = gw;
        this.loadDataFormGridView()
      }
    }

    var vllRelType = this.codxODService.loadValuelist('OD008');
    if(isObservable(vllRelType))
    {
      vllRelType.subscribe((item) => {
        this.dvlRelType = item;
      });
    }
    else this.dvlRelType = vllRelType;

    var vllStatusRel = this.codxODService.loadValuelist('OD009');
    if(isObservable(vllStatusRel))
    {
      vllStatusRel.subscribe((item) => {
        this.dvlStatusRel = item;
      });
    }
    else this.dvlStatusRel = vllRelType;
   
    var vllReCall = this.codxODService.loadValuelist('OD010');
    if(isObservable(vllReCall))
    {
      vllReCall.subscribe((item) => {
        this.dvlReCall = item;
      });
    }
    else this.dvlReCall = vllRelType;

    var vllStatusTM  = this.codxODService.loadValuelist('L0614');
    if(isObservable(vllStatusTM))
    {
      vllStatusTM.subscribe((item) => {
        this.dvlStatusTM = item;
      });
    }
    else this.dvlStatusTM = vllRelType;
    //formName: string, gridName: string
  }

  loadDataFormGridView()
  {
    if (this.gridViewSetup['Security']['referedValue'])
    {
      var vll = this.codxODService.loadValuelist(this.gridViewSetup['Security']['referedValue']);
      if(isObservable(vll))
      {
        vll.subscribe((item) => {
          this.dvlSecurity = item;
        });
      }
      else this.dvlSecurity = vll;
    }
    if (this.gridViewSetup['Urgency']['referedValue'])
    {
      var vll = this.codxODService.loadValuelist(this.gridViewSetup['Urgency']['referedValue']);
      if(isObservable(vll))
      {
        vll.subscribe((item) => {
          this.dvlUrgency = item;
        });
      }
      else this.dvlUrgency = vll;
    }
    if (this.gridViewSetup['Status']['referedValue'])
    {
      var vll = this.codxODService.loadValuelist(this.gridViewSetup['Status']['referedValue']);
      if(isObservable(vll))
      {
        vll.subscribe((item) => {
          this.dvlStatus = item;
        });
      }
      else this.dvlStatus = vll;
    }
    if (this.gridViewSetup['Category']['referedValue'])
    {
      var vll = this.codxODService.loadValuelist(this.gridViewSetup['Category']['referedValue']);
      if(isObservable(vll))
      {
        vll.subscribe((item) => {
          this.dvlCategory = item;
        });
      }
      else this.dvlCategory = vll;
    }
  }
  //Mở form
  openFormUploadFile() {
    this.attachment.openPopup();
  }
  openFormRecallSharing(recID: any, relID: any) {
    var recID = recID;
    var relID = relID;
    var config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
  }
  ////////////////Các hàm đóng Form ///////////////////////////
  closeDept(e) {
    var dt = e.event;
    console.log(dt);
  }

  //Hàm lấy thông tin chi tiết của công văn
  getDtDis(id: any) {
    this.lstDtDis = null;
    if (id) {
      this.lstUserID = '';
      this.odService
        .getDetailDispatch(id, this.view.formModel.entityName , this.referType)
        .subscribe((item) => {
          //this.getChildTask(id);
          if (item) {
            this.lstDtDis = formatDtDis(item);
            //this.view.dataService.setDataSelected(this.lstDtDis);
          }
        });
    }
  }

  //hàm render lại list view theo status công văn
  clickChangeStatus(status: any) {
    this.view.dataService.page = 0;
    var predicates;
    var dataValues;

    if (status == '') predicates = dataValues = [''];
    else {
      predicates = ['Status=@0'];
      dataValues = [status];
    }
    this.view.dataService
      .setPredicates(predicates, dataValues)
      .subscribe((item) => {
        this.lstDtDis = item[0];
      });
    this.activeDiv = status;
  }

  valueChange(dt: any) {
    var recID = null;
    if (dt?.data) {
      recID = dt.data.recID;
      this.dataItem = dt?.data;
    } else if (dt?.recID) {
      recID = dt.recID;
      this.dataItem = dt;
    }
    this.getDtDis(recID);
  }
  fileAdded(event: any) {
    this.fileAdd = event.data;
    this.dfDis.File = event.data;
  }
  getJSONString(data) {
    return JSON.stringify(data);
  }
  refeshTaskView(e: any) {
    this.lstDtDis.relations = e.data[0].relations;
    this.lstDtDis.owner = e.data[0].owner;
    this.lstUserID = getListImg(this.lstDtDis.relations);
    this.lstDtDis.lstIfRelation = [
      ...this.lstDtDis.lstIfRelation,
      ...e.data[1],
    ];
    this.odService.getTaskByRefID(this.lstDtDis.recID).subscribe((res) => {
      if (res != null) {
        this.lstDtDis.listTask = res;
      }
    });
  }

  requestEnded(evt: any) {
    console.log(evt);
  }
  openFormFuncID(val: any, data: any) {
    this.viewdetail.openFormFuncID(val, data, true);
  }
  viewChange(e: any) {
    var funcID = e?.component?.instance?.funcID;
    this.getGridViewSetup(funcID);
    this.lstDtDis = null;
  }
  checkDeadLine(time: any) {
    if (new Date(time).getTime() < new Date().getTime() || !time) {
      return 'icon-access_alarm';
    }
    return '';
  }
}
