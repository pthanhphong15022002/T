import { Component, OnInit, TemplateRef, ViewChild, AfterViewInit, ChangeDetectorRef, OnChanges, SimpleChanges, Injector } from '@angular/core';
import { ComboBoxComponent } from '@syncfusion/ej2-angular-dropdowns';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { AlertConfirmInputConfig, ApiHttpService, AuthStore, ButtonModel, CacheService, CallFuncService, CodxListviewComponent, CodxService, CodxTreeviewComponent, DataRequest, DialogRef, NotificationsService, RequestOption, SidebarModel, UIComponent, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { compareDate, extractContent, formatBytes, formatDtDis, getListImg } from '../function/default.function';
import { permissionDis, updateDis, dispatch, inforSentEMail, extendDeadline, gridModels } from '../models/dispatch.model';
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
  styleUrls: ['./incomming.component.scss']
})
export class IncommingComponent extends UIComponent implements  AfterViewInit, OnChanges {
  @ViewChild('panelLeft') panelLeft: TemplateRef<any>;
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('asideRight') asideRight: TemplateRef<any>;
  @ViewChild('cbxDept') cbxDept: ComboBoxComponent;
  @ViewChild('cbxAgency') cbxAgency: ComboBoxComponent;
  @ViewChild("listview") listview: CodxListviewComponent;
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('treeAdd') treeAdd: CodxTreeviewComponent;
  @ViewChild('itemTemplate') template!: TemplateRef<any>;
  @ViewChild('panelRightRef') panelRight?: TemplateRef<any>;
  @ViewChild('viewdetail') viewdetail!: ViewDetailComponent;
  public lstDtDis: any;
  public lstUserID: any = "";
  public disEdit: any;
  public txtLstAgency = "";
  public status: string;
  public predicate = '';
  public dispatchType: string = "1";
  public totalPage: number = 0;
  public fieldAgency: Object = { text: 'agencyName', value: 'agencyID' };
  public lstAgency: any;
  public lstDept: any;
  public sort = [{ field: "CreatedOn", dir: "déc" }]
  public switchTemplate = "new";
  public objectIDFile: any;
  public objectType = "OD_Dispatches";
  dialog!: DialogRef;
  button?: ButtonModel;
  userPermission    : any;
  checkUserPer      : any;
  textNew           = "Thêm mới ";
  textEdit          = "Chỉnh sửa ";
  textCopy          = "Sao chép ";
  compareDate       = compareDate;
  formatBytes       = formatBytes;
  extractContent    = extractContent;
  crrDate           = new Date().getTime();
  gridViewSetup     : any;
  titleFormNew      = this.textNew;
  dispatch          = new dispatch();
  activeTab         = 'tab_1';
  activeTabAg       = 'tab_ag1';
  showCbxAgency     = false;
  action            : any;
  actionEdit        : any;
  autoLoad          = false;
  itemDelete        :any;
  active            = 1; 

  fileAdd           : any
  funcID            = "ODT1"
  idAgency          : any ;
  ///////////Các biến data valuelist/////////////////
  dvlSecurity: any
  dvlUrgency: any
  dvlStatus: any
  dvlCategory: any
  dvlStatusRel: any
  dvlRelType: any
  dvlStatusTM : any
  dvlReCall   : any
  widthAsideRight = "700px"
  showAgency        = false;
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
  codxService: CodxService;
  fileService : FileService;
  constructor(inject: Injector) {
    super(inject);
    this.odService = inject.get(DispatchService);
    this.agService = inject.get(AgencyService);
    this.callfunc = inject.get(CallFuncService);
    this.notifySvr = inject.get(NotificationsService);
    this.atSV = inject.get(AttachmentService);
    this.codxService = inject.get(CodxService);
    this.fileService = inject.get(FileService);
  };
  ngOnChanges(changes: SimpleChanges): void {
  }
  onInit(): void {
    /*  this.routerActive.params
    .subscribe(params => {
      this.view.loaded = false;
      this.loadView();
    });
    //this.loadView(); */
   /*  this.router.params.subscribe((params) => {
      //this.lstDtDis = null;
    }) */
    this.view.dataService.predicates = "Status=@0"
    this.view.dataService.dataValues = "1"
  
    /* this.options.Page = 0,
    this.options.PageLoading = false;
    this.options.PageSize = 10;
    this.options.DataValue = "1";
    this.status = "1";
    //this.loadData();
    this.getGridViewSetup();
    this.codxService.getAutoNumber(this.funcID, "OD_Agencies", "AgencyID").subscribe((dt: any) => {
      this.objectIDFile = dt;
    }); */
    /*this.atSV.isFileList.subscribe(item => {
       if (item != null) {

   /*this.atSV.isFileList.subscribe(item => { 
      if (item != null) {

      }
    });*/

    //this.loadData();
    //this.loadDataAgency();
    // this.agService.loadDataDepartmentCbx("9").subscribe(item=>{
    //   this.lstDept= item;
    // })
  }
  
  loadView()
  {
    this.getGridViewSetup();
    this.options.page = 0,
    this.options.pageLoading = false;
    this.options.pageSize = 10;
    this.options.dataValue = "1";
    this.status = "1";
    //this.loadData();
    this.codxService.getAutoNumber(this.view.formModel.funcID, "OD_Agencies", "AgencyID").subscribe((dt: any) => {
      this.objectIDFile = dt;
    });
    //this.autoLoad = true;
    this.lstDtDis = [];
    //this.autoLoad = false;
    this.detectorRef.detectChanges();
  }

  ngAfterViewInit(): void {
    this.views = [/* {
      id: '1',
      type: 'content',
      active: true,
      model: {
        panelLeftRef: this.panelLeftRef,
        panelRightRef: this.panelRightRef,
        sideBarRightRef: this.asideRight,
        widthAsideRight: this.widthAsideRight,
        widthLeft: "350px",
        resizeable: false
      }
    } */
    {
      type: ViewType.listdetail,
      active: true,
      sameData: true,
      model: {
        template: this.template,
        panelLeftRef: this.panelLeft,
        panelRightRef: this.panelRight,
        contextMenu: '',
      },
    },
    {
      type: ViewType.listdetail,
      active: true,
      sameData: true,
      model: {
        template: this.template,
        panelLeftRef: this.panelLeft,
        panelRightRef: this.panelRight,
        contextMenu: '',
      },
    },
  ];
  this.button = {
    id: 'btnAdd',
  };
  this.view.dataService.methodSave = 'SaveDispatchAsync';
  this.view.dataService.methodDelete = 'DeleteDispatchByIDAsync';
  this.getGridViewSetup();
  }
  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.show();
        break;
      case 'edit':
        this.edit();
        break;
      case 'delete':
        this.delete();
        break;
    }
  }
 
  show() {
    this.view.dataService.addNew(0).subscribe((res: any) => {
      //this.view.
       //this.detectorRef.detectChanges();
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      this.dialog = this.callfunc.openSide(IncommingAddComponent, {
        gridViewSetup: this.gridViewSetup,
        headerText:"Thêm mới công văn đến",
        type: "add",
        formModel : this.view.formModel
      }, option);
      this.dialog.closed.subscribe(x=>{
        if(x.event == null) this.view.dataService.remove(this.view.dataService.dataSelected).subscribe();
        else 
        {
          //debugger;
          this.view.dataService.update(x.event).subscribe();
          this.view.dataService.setDataSelected(x.event);
         // this.view.dataService.remove(x.event).subscribe();
          //this.view.dataService.add(x.event,0).subscribe();
          //this.view.dataService.setDataSelected(x.event);
          //debugger;
          //debugger;
          //this.view.dataService.setDataSelected(x.event);
        }
      });
      // this.dialog.closed.subscribe((e)=>{
      //   if(e.event != null)
      //   {
      //     debugger;
      //     this.view.dataService.setDataSelected(e.event.data);
      //   }
      // });
     
    });
  }

  edit() {
    this.view.dataService.edit(this.view.dataService.dataSelected).subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      //this.dialog = this.callfunc.openSide(TestAddComponent, res, option);
    });
  }

  delete() {
    this.view.dataService.dataSelected = this.lstDtDis;
    this.view.dataService.delete([this.view.dataService.dataSelected], this.beforeDel).subscribe();
  }

  beforeDel(opt: RequestOption) {
    opt.service = 'TM';
    opt.assemblyName = 'TM';
    opt.className = 'TaskBusiness';
    opt.methodName = 'TestApi';
    return true;
  }

  getGridViewSetup() {
    //this.funcID
    this.cache.functionList(this.view.formModel.funcID).subscribe((fuc) => {
      console.log(fuc);
      this.cache.gridViewSetup(fuc?.formName, fuc?.gridViewName).subscribe((grd) => {
        this.gridViewSetup = grd;
        if (grd["Security"]["referedValue"] != undefined)
          this.cache.valueList(grd["Security"]["referedValue"]).subscribe((item) => {
            this.dvlSecurity = item;
          })
        if (grd["Urgency"]["referedValue"] != undefined)
          this.cache.valueList(grd["Urgency"]["referedValue"]).subscribe((item) => {
            this.dvlUrgency = item;
            //this.ref.detectChanges();
          })
        if (grd["Status"]["referedValue"] != undefined)
          this.cache.valueList(grd["Status"]["referedValue"]).subscribe((item) => {
            this.dvlStatus = item;
            console.log(this.dvlStatus);
            //this.ref.detectChanges();
          })
        if (grd["Category"]["referedValue"] != undefined)
          this.cache.valueList(grd["Category"]["referedValue"]).subscribe((item) => {
            this.dvlCategory = item;
            //this.ref.detectChanges();
          })
      })
    })
    this.cache.valueList("OD008").subscribe((item) => {
      this.dvlRelType = item;
    })
    this.cache.valueList("OD009").subscribe((item) => {
      this.dvlStatusRel = item;
    })
    this.cache.valueList("OD010").subscribe((item) => {
      this.dvlReCall = item;
    })
    this.cache.valueList("L0614").subscribe((item) => {
      this.dvlStatusTM = item;
    })
    //formName: string, gridName: string
  }

  //Load data đơn vị
  loadDataAgency() {
    this.agService.loadDataAgencyCbx().subscribe(item => {
      this.lstAgency = item;
    })
  }

  //Load data phòng ban
  loadDataDept() {
    this.agService.loadDataDepartmentCbx(this.idAgency).subscribe(item => {
      this.lstDept = item;
    })
  }

  closeSideBar(): void {
    if(this.actionEdit == "1" && this.fileAdd != null && this.fileAdd.length >0)
    {
      
      this.fileAdd.forEach((elm)=>{
        this.fileService.deleteFileByObjectIDType(elm.objectId,this.objectType,true).subscribe((item)=>{
          //alert(item);
          if(item == true)
            this.fileAdd = null;
        })
      })
    }
    //this.viewbase.currentView.closeSidebarRight();
  }
  
  openSideBar(): void {
    this.action = true;
    //this.viewbase.currentView.openSidebarRight();
  }

  //Mở form
  opensideBarRight() {
    this.switchTemplate = "new";
    this.openSideBar();
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
    config.type = "YesNo";
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
  closeUpload(e: any, that: IncommingComponent) {
    that.reloadFile();
  }
  reloadFile() {
    this.atSV.isFileList.subscribe(item => {
      if (item != null) {
        console.log(item);
      }
    });
  }
  closeAgency(e) {
    var dt = e.event;
    if (dt == true) this.notifySvr.alert("Thêm mới đơn vị", "Thành công");
    else this.notifySvr.alert("Thêm mới đơn vị", "Thất bại");

  }
  //đóng form cập nhật tiến độ công việc
  closeUpdateExtend(e: any, that: IncommingComponent) {
    if (e.event == true) that.notifySvr.notify("Thành công");
    else if (e.event == false) that.notifySvr.notify("Thất bại");
  }

  closeSaveToFolder(e: any, that: IncommingComponent) { 

  }

  //đóng form gia hạn deadline
  closeExtendDeadline(e: any, that: IncommingComponent) {
    if (e.event[0] == true) {
      that.notifySvr.notify("Gia hạn thành công");
      //that.listview.addHandler(e.event[1], false, "recID")
    }
    else if (e.event[0] == false) that.notifySvr.notify("Gia hạn thất bại");
  }
  //////////////////////////////////////////////////////////////
  loadData() {
    /* this.odService.GetListDispatchByStatus(this.options).subscribe(item => {
      if (item == null || item[0].length == 0) return;
      this.totalPage = item[1];
      if (this.options.page == 0) {
        //this.groupDispatchData(item[0]);
        this.getDtDis(item[0][0].recID)
        this.lstUserID = this.getListImg(this.lstDtDis.relations)
      }
      else if (this.options.page < item[0]) this.lstDispatch = this.loadMoreData(item[0]);
      this.ref.detectChanges();
    }) */
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
  loadMoreData(datas: any) {
    //return [...this.lstDispatch, ...datas];
  }

  //Hàm lấy thông tin chi tiết của công văn
  getDtDis(id: any) {
    this.lstUserID = ""
    this.odService.getDetailDispatch(id).subscribe(item => {
      //this.getChildTask(id);
      if(item) 
      {
        this.lstDtDis = formatDtDis(item);
        //this.view.dataService.setDataSelected(this.lstDtDis);
      }
      
    });
  }
  

  //hàm render lại list view theo status công văn
  clickChangeStatus(status: any) {
    this.view.dataService.predicates = "Status=@0"
    this.view.dataService.dataValues = status
    this.view.dataService.load().subscribe(item=>{
      if(item[0]) this.lstDtDis = this.getDtDis(item[0].recID)
      else
      {
        this.lstDtDis = item[0];
      }
    });
  }
 

  selectFirst(dt: any) {
    var recID ;
    if(dt.data) recID = dt.data.recID ;
    else recID = dt.recID;
    this.getDtDis(recID)
  }
  fileAdded(event:any) { 
    this.fileAdd = event.data
    this.dfDis.File = event.data;
  }
  getJSONString(data) {
    return JSON.stringify(data);    
  }
  refeshTaskView(e:any)
  {
    this.lstDtDis.relations  = e.data[0].relations;
    this.lstDtDis.owner =  e.data[0].owner;
    this.lstUserID = getListImg(this.lstDtDis.relations)
    this.lstDtDis.lstIfRelation = [...this.lstDtDis.lstIfRelation, ...e.data[1]];
    this.odService.getTaskByRefID(this.lstDtDis.recID).subscribe((res) => {
      if(res != null)
      {
        this.lstDtDis.listTask = res;
      }
    });
  }
 
  requestEnded(evt: any)
  {
    console.log(evt);
  }
  openFormFuncID(val:any,data:any)
  {
    //this.lstDtDis = data;
    this.viewdetail.openFormFuncID(val,data);
  }
}