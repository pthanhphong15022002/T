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
import { AlertConfirmInputConfig, ButtonModel, CallFuncService, CodxListviewComponent, CodxService, CodxTreeviewComponent, DataRequest, DialogModel, DialogRef, NotificationsService, RequestOption, SidebarModel, UIComponent, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { compareDate, convertHtmlAgency, extractContent, formatBytes, formatDtDis, getIdUser, getListImg } from '../function/default.function';
import { dispatch } from '../models/dispatch.model';
import { AgencyService } from '../services/agency.service';
import { DispatchService } from '../services/dispatch.service';
import { FileService } from '@shared/services/file.service';
import { IncommingAddComponent } from './incomming-add/incomming-add.component';
import { ViewDetailComponent } from './view-detail/view-detail.component';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { AttachmentService } from 'projects/codx-share/src/lib/components/attachment/attachment.service';

@Component({
  selector: 'app-incomming',
  templateUrl: './incomming.component.html',
  styleUrls: ['./incomming.component.scss'],
})
export class IncommingComponent
  extends UIComponent
  implements AfterViewInit, OnChanges {
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
  dialog!: DialogRef;
  button?: ButtonModel;
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
  activeDiv = "1";
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
  dataItem :any;
  funcList: any;
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
  constructor(inject: Injector) {
    super(inject);
    this.odService = inject.get(DispatchService);
    this.agService = inject.get(AgencyService);
    this.callfunc = inject.get(CallFuncService);
    this.notifySvr = inject.get(NotificationsService);
    this.atSV = inject.get(AttachmentService);
    // this.codxService = inject.get(CodxService);
    this.fileService = inject.get(FileService);
  }
  ngOnChanges(changes: SimpleChanges): void { }
  onInit(): void {
    
  } 

  ngAfterViewInit(): void {
    this.views = [
      {
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
      option.DataService = this.view?.currentView?.dataService;
      this.dialog = this.callfunc.openSide(
        IncommingAddComponent,
        {
          gridViewSetup: this.gridViewSetup,
          headerText: 'Thêm mới '+ (this.funcList?.defaultName).toLowerCase(),
          subHeaderText: 'Tạo & Upload File văn bản',
          type: 'add',
          formModel: this.view.formModel,
          dispatchType: this.funcList?.dataValue
        },
        option
      );
      this.dialog.closed.subscribe((x) => {
        if (x.event) {
          delete x.event._uuid;
          this.view.dataService.add(x.event, 0).subscribe();
          //this.getDtDis(x.event?.recID)
        }
      });
    });
  }
  changeDataMF(e:any,data:any)
  {
    var bm = e.filter((x: { functionID: string }) => x.functionID == 'ODT110' || x.functionID == 'ODT209');
    var unbm = e.filter((x: { functionID: string }) => x.functionID == 'ODT111');
   /*  var blur =  e.filter((x: { functionID: string }) => x.functionID == 'ODT108');
    blur[0].isblur = true; */
    if(data?.isBookmark) 
    {
      bm[0].disabled = true;
      unbm[0].disabled = false;
    }
    else
    {
      unbm[0].disabled = true;
      bm[0].disabled = false;
    }
  }
  aaaa(e:any)
  {
    if(e)
    {
    debugger;
      var foundIndex = e.findIndex((x: { functionID: string }) => x.functionID == 'SYS001');
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

  getGridViewSetup(funcID:any) {
   
    this.cache.functionList(funcID).subscribe((fuc) => {
      this.funcList = fuc;
      this.cache
        .gridViewSetup(fuc?.formName, fuc?.gridViewName)
        .subscribe((grd) => {
          this.gridViewSetup = grd;
          if (grd['Security']['referedValue'] != undefined)
            this.cache
              .valueList(grd['Security']['referedValue'])
              .subscribe((item) => {
                this.dvlSecurity = item;
              });
          if (grd['Urgency']['referedValue'] != undefined)
            this.cache
              .valueList(grd['Urgency']['referedValue'])
              .subscribe((item) => {
                this.dvlUrgency = item;
                //this.ref.detectChanges();
              });
          if (grd['Status']['referedValue'] != undefined)
            this.cache
              .valueList(grd['Status']['referedValue'])
              .subscribe((item) => {
                this.dvlStatus = item;
                console.log(this.dvlStatus);
                //this.ref.detectChanges();
              });
          if (grd['Category']['referedValue'] != undefined)
            this.cache
              .valueList(grd['Category']['referedValue'])
              .subscribe((item) => {
                this.dvlCategory = item;
                //this.ref.detectChanges();
              });
        });
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
    //formName: string, gridName: string
  }
  
  //Mở form
  openFormUploadFile() {
    this.attachment.openPopup();
    // this.atSV.openForm.next(true);
    /* this.callfc.openForm(UploadComponent,"UploadFile",500,700,null,null).subscribe((dialog:any)=>{
      var that = this;
      dialog.close = function(e){
        return that.closeUpload(e, that);
    }
    }); */
  }
  openFormRecallSharing(recID: any, relID: any) {
    var recID = recID;
    var relID = relID;
    var config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
    /* this.notifySvr.alert("Thông báo", "Hệ thống sẽ thu hồi quyền chia sẻ của người này. Bạn có muốn xác nhận không?", config).subscribe((res: Dialog) => {
      let that = this;
      res.close = function (e) {
        return that.closeRecallSharing(e, that, recID, relID);
      }
    }) */
  }
  ////////////////Các hàm đóng Form ///////////////////////////
  closeDept(e) {
    var dt = e.event;
    console.log(dt);
  }

  groupDispatchData(data: any) {
    /*   var date = new Date();
    var firstweek = date.getDate() - date.getDay(); // First day is the day of the month - the day of the week
    var lastweek = firstweek + 6; // last day is the first day + 6
    var today = date.toDateString();
    var yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toDateString();
    var fdayofweek = new Date(date.setDate(firstweek));
    var ldayofweek = new Date(date.setDate(lastweek));
    var fdayofweekago = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() - 7);
    var ldayofweekago = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() - 1);
    var fdayofmonth = new Date(date.getFullYear(), date.getMonth(), 1);
    var ldayofmonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    var fdayoflastmonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    var ldayoflastmonth = new Date(date.getFullYear(), date.getMonth(), 0);
    data.forEach(item => {
      var createdOn = new Date(item.createdOn);
      //Today
      if (createdOn.toDateString() === today) this.lstDispatch[0].data.push(item);
      //Hôm qua
      else if (createdOn.toDateString() == yesterday) this.lstDispatch[1].data.push(item);
      //Tuần này
      else if (fdayofweek <= new Date(createdOn) && new Date(createdOn) <= ldayofweek) this.lstDispatch[2].data.push(item);
      //Tuần trước
      else if (fdayofweekago <= new Date(createdOn) && new Date(createdOn) <= ldayofweekago) this.lstDispatch[3].data.push(item);
      //Tháng này
      else if (fdayofmonth <= new Date(createdOn) && new Date(createdOn) <= ldayofmonth) this.lstDispatch[4].data.push(item);
      //Tháng trước
      else if (fdayoflastmonth <= new Date(createdOn) && new Date(createdOn) <= ldayoflastmonth) this.lstDispatch[5].data.push(item);
      else this.lstDispatch[6].data.push(item);
    }); */
  }

  //Hàm lấy thông tin chi tiết của công văn
  getDtDis(id: any) {
    this.lstDtDis = null;
    if(id)
    {
      this.lstUserID = '';
      this.odService.getDetailDispatch(id).subscribe((item) => {
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
    var predicates ; var dataValues;

    if(status == "")
      predicates = dataValues = [""];
    else
    {
      predicates = ['Status=@0'] ;
      dataValues = [status];
    }
    this.view.dataService.setPredicates(predicates,dataValues).subscribe(item=>{
      this.lstDtDis = item[0];
    });
    this.activeDiv = status;
  }
 
  valueChange(dt: any) {
    var recID = null;
    if (dt?.data) {
      recID = dt.data.recID
      this.dataItem = dt?.data;
    }
    else if(dt?.recID){
      recID = dt.recID
      this.dataItem = dt;
    };
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
    debugger;
    console.log(evt);
  }
  openFormFuncID(val: any, data: any) {
    //this.lstDtDis = data;
    this.viewdetail.openFormFuncID(val, data);
  }
  viewChange(e:any)
  {
    var funcID = e?.component?.instance?.funcID;
    this.getGridViewSetup(funcID);
   /*  this.view.dataService.predicates = "Status=@0";
    this.view.dataService.dataValues = "1"; */
    //this.view.dataService.setPredicates(['Status=@0'],['1']).subscribe();
    //this.activeDiv = "1";
   
  }
}
