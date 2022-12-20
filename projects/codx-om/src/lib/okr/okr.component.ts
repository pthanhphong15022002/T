import {
  AfterViewInit,
  Component,
  EventEmitter,
  Injector,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ButtonModel,
  UIComponent,
  ViewModel,
  ViewType,
  AuthStore,
  CallFuncService,
  DialogModel,
  DataRequest,
  SidebarModel,
  FormModel,
  AuthService,
} from 'codx-core';
import { CodxOmService } from '../codx-om.service';
import { PopupAddKRComponent } from '../popup/popup-add-kr/popup-add-kr.component';
import { PopupDistributeKRComponent } from '../popup/popup-distribute-kr/popup-distribute-kr.component';
import { PopupShowKRComponent } from '../popup/popup-show-kr/popup-show-kr.component';
import { OkrAddComponent } from './okr-add/okr-add.component';
import { OkrPlansComponent } from './okr-plans/okr-plans.component';

@Component({
  selector: 'lib-okr',
  templateUrl: './okr.component.html',
  styleUrls: ['./okr.component.css'],
})
export class OKRComponent extends UIComponent implements AfterViewInit {
  views: Array<ViewModel> | any = [];
  @ViewChild('panelRight') panelRight: TemplateRef<any>;
  openAccordion = [];
  dataOKR = [];
  dataOKRPlans = null;
  //title//
  titleRoom = 'Phòng kinh doanh';
  dtCompany = null;
  /////////
  auth: AuthStore;
  okrService: CodxOmService;
  gridView: any;

  //Kỳ
  periodID = "" ;
  //Loại
  interval = "";
  //Năm
  year = null;
  dataDate = null;

  dataRequest = new DataRequest();
  formModelKR = new FormModel();
  constructor(inject: Injector) {
    super(inject);
    this.auth = inject.get(AuthStore);
    this.okrService = inject.get(CodxOmService);
    //var x= this.authService.userValue;
  }
  ngAfterViewInit(): void {
    this.views = [
      {
        id: '1',
        type: ViewType.content,
        active: true,
        sameData: true,
        model: {
          panelRightRef: this.panelRight,
          contextMenu: '',
        },
      },
    ];
    this.getGridViewSetup();

    this.dataRequest.funcID = 'OMT01';
    this.dataRequest.entityName = 'OM_OKRs';
    this.dataRequest.page = 1;
    this.dataRequest.pageSize = 20;
    this.dataRequest.predicate = 'ParentID=@0';
  }

  onInit(): void {
    var user = this.auth.get();
    this.cache.getCompany(user.userID).subscribe(item=>{
      if(item) 
      {
        this.titleRoom = item.organizationName;
        this.dtCompany = item;
      }
    })
    this.formModelKR.entityName = 'OM_OKRs';
    this.formModelKR.gridViewName = 'grvOKRs';
    this.formModelKR.formName = 'OKRs';
    this.formModelKR.entityPer = 'OM_OKRs';
  }

  //Hàm click
  click(event: any) {
    switch (event.id) {
      case 'btnAdd': {
        this.addOKR();
        break;
      }
      case 'btnAddKR': {
        this.addKR();
        break;
      }
      case 'btnAddO': {
        this.addOKR();
        break;
      }
      case 'Calendar': {
        this.changeCalendar(event.data)
        break;
      }
    }
  }

  //Thêm mới bộ mục tiêu
  addOKRPlans() {
    var dialogModel = new DialogModel();
    dialogModel.IsFull = true;
    let dialog = this.callfc.openForm(
      OkrPlansComponent,
      '',
      null,
      null,
      null,
      [this.view.formModel,this.periodID,this.interval,this.year,this.dataDate , this.dtCompany , "1"],
      '',
      dialogModel
    );
    dialog.closed.subscribe((item) => {
      if (item.event) this.dataOKR = this.dataOKR.concat(item.event);
    });
  }

  //Thêm mới mục tiêu
  addOKR()
  {
    let dialog = this.callfc.openSide(OkrAddComponent, [
      this.gridView,
      this.formModelKR,
      "Thêm mới mục tiêu"
    ]
    );    
  }
  //Lấy data danh sách mục tiêu
  getGridViewSetup() {
    this.okrService.loadFunctionList(this.view.funcID).subscribe((fuc) => {
      this.okrService
        .loadGridView(fuc?.formName, fuc?.gridViewName)
        .subscribe((grd) => {
          this.gridView = grd;
        });
    });
  }

  //Thêm KR
  addKR(o: any=null) {
    // Tạo FormModel cho OKRs
    let option = new SidebarModel();
    option.Width = '550px';
    option.FormModel = this.formModelKR;

    let dialogKR = this.callfc.openSide(
      PopupAddKRComponent,
      [null, o, this.formModelKR, true, 'Thêm mới kết quả chính'],
      option
    );
    
    // let dialogModel = new DialogModel();
    // dialogModel.IsFull = true;
    
    // let dialogKR = this.callfc.openForm(
    //   PopupShowKRComponent,'',null,null,null,
    //   ['','','','','',],
    //   '',
    //   dialogModel
    // );
    dialogKR.closed.subscribe(res=>{
      dialogKR=null;
    })

  }

  getOKRPlans(periodID: any , interval: any , year: any)
  {
    this.okrService.getOKRPlans(periodID,interval,year).subscribe((item: any) => {
      if (item) {
        this.dataOKRPlans = item ;
        this.dataRequest.dataValue = item.recID
        this.okrService.getOKR(this.dataRequest).subscribe((item: any) => {
          if (item) this.dataOKR = this.dataOKR.concat(item);
        });
      }
    });
  }

  changeCalendar(data:any)
  {
    var date = new Date(data.toDate);
    this.year = date.getFullYear();
    this.dataDate = {
      formDate : data.formDate,
      toDate : data.toDate
    }
    if(data.type == "year")
    {
      this.periodID = ""
      this.interval = "Y";
    }
    else if(data.type == "quarter")
    {
      var m = Math.floor(date.getMonth()/3) + 1;
      this.periodID = (m > 4? m - 4 : m).toString();
      this.interval = "Q";
    }
    else if(data.type == "month") 
    {
      this.periodID = (date.getMonth() + 1).toString();
      this.interval = "M";
    }
    this.getOKRPlans(this.periodID , this.interval , this.year);
  }
}
