import { OMCONST } from './../codx-om.constant';
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
import { PopupShowKRComponent } from '../popup/popup-show-kr/popup-show-kr.component';
import { OkrAddComponent } from './okr-add/okr-add.component';
import { OkrPlansComponent } from './okr-plans/okr-plans.component';
import { ActivatedRoute } from '@angular/router';

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
  dtCompany = null;
  compName = '';
  deptName = '';
  orgName = '';
  persName = '';
  compFuncID = OMCONST.FUNCID.COMP;
  deptFuncID = OMCONST.FUNCID.DEPT;
  orgFuncID = OMCONST.FUNCID.ORG;
  persFuncID = OMCONST.FUNCID.PERS;
  /////////
  auth: AuthStore;
  okrService: CodxOmService;
  gridView: any;

  //Kỳ
  periodID = '';
  //Loại
  interval = '';
  //Năm
  year = null;
  dataDate = null;
  curUser: any;
  dataRequest = new DataRequest();
  formModelKR = new FormModel();
  formModelOB = new FormModel();
  funcID: any;
  obFuncID: any;
  krFuncID: any;
  addKRTitle = '';
  addOBTitle = '';
  isAffterRender = false;
  constructor(
    inject: Injector,
    private activatedRoute: ActivatedRoute,
    private codxOmService: CodxOmService
  ) {
    super(inject);
    this.funcID = this.activatedRoute.snapshot.params['funcID'];
    this.auth = inject.get(AuthStore);
    this.okrService = inject.get(CodxOmService);
    //var x= this.authService.userValue;
  }

  //-----------------------Base Func-------------------------//
  ngAfterViewInit(): void {
    this.funcIDChanged();
    this.formModelChanged();
    this.views = [
      {
        id: '1',
        type: ViewType.content,
        active: true,
        sameData: false,
        model: {
          panelRightRef: this.panelRight,
        },
      },
    ];
    this.getGridViewSetup();

    this.dataRequest.funcID = this.funcID;
    this.dataRequest.entityName = 'OM_OKRs';
    this.dataRequest.page = 1;
    this.dataRequest.pageSize = 20;
    this.dataRequest.predicate = 'ParentID=@0';
  }

  onInit(): void {
    this.curUser = this.auth.get();

    this.compName =
      this.curUser?.employee?.companyName != null
        ? this.curUser?.employee?.companyName
        : '';
    this.compName = this.compName != '' ? this.compName : 'Công ty';

    this.deptName =
      this.curUser?.employee?.departmentName != null
        ? this.curUser?.employee?.departmentName
        : '';

    this.orgName =
      this.curUser?.employee?.orgUnitName != null
        ? this.curUser?.employee?.orgUnitName
        : '';

    this.persName =
      this.curUser?.employee?.employeeName != null
        ? this.curUser?.employee?.employeeName
        : '';
  }

  //-----------------------End-------------------------------//

  //-----------------------Base Event------------------------//
  //Sự kiện thay đổi view (funcID thay đổi - load lại page với data mới)
  viewChanged(evt: any) {
    this.funcID = this.router.snapshot.params['funcID'];
    this.funcIDChanged();
    this.formModelChanged();
    this.detectorRef.detectChanges();
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
        this.changeCalendar(event.data);
        break;
      }
      case 'SharePlan':
      {
        this.sharePlan();
        break;
      }
    }
  }
  //Thời gian thay đổi
  changeCalendar(data: any) {
    var date = new Date(data.toDate);
    this.year = date.getFullYear();
    this.dataDate = {
      formDate: data.formDate,
      toDate: data.toDate,
    };
    if (data.type == 'year') {
      this.periodID = this.year;
      this.interval = 'Y';
    } else if (data.type == 'quarter') {
      this.periodID = data.text;
      this.interval = 'Q';
    } else if (data.type == 'month') {
      this.periodID = (date.getMonth() + 1).toString();
      this.interval = 'M';
    }
    this.getOKRPlans(this.periodID, this.interval, this.year);
  }

  //-----------------------End-------------------------------//

  //-----------------------Get Data Func---------------------//
  //Lấy OKR Plan
  getOKRPlans(periodID: any, interval: any, year: any) {
    if (!this.curUser.administrator) {
      this.okrService
        .getOKRPlans(periodID, interval, year)
        .subscribe((item: any) => {
          //Reset data View
          this.dataOKRPlans = null;
          this.dataOKR = null;
          if (item) {
            this.dataOKRPlans = item;
            //----------
            this.dataRequest.dataValue = item.recID;
            //----------
            this.okrService.getOKR(this.dataRequest).subscribe((item: any) => {
              if (item) {
                this.dataOKR = item;
              }
            });
          }
        });
    }
  }

  //Lấy fucID con
  funcIDChanged() {
    switch (this.funcID) {
      case OMCONST.FUNCID.COMP:
        this.krFuncID = OMCONST.KRFUNCID.COMP;
        this.obFuncID = OMCONST.OBFUNCID.COMP;
        break;
      case OMCONST.FUNCID.DEPT:
        this.krFuncID = OMCONST.KRFUNCID.DEPT;
        this.obFuncID = OMCONST.OBFUNCID.DEPT;
        break;
      case OMCONST.FUNCID.ORG:
        this.krFuncID = OMCONST.KRFUNCID.ORG;
        this.obFuncID = OMCONST.OBFUNCID.ORG;
        break;
      case OMCONST.FUNCID.PERS:
        this.krFuncID = OMCONST.KRFUNCID.PERS;
        this.obFuncID = OMCONST.OBFUNCID.PERS;
        break;
    }
    this.isAffterRender = true;
    this.detectorRef.detectChanges();
  }
  //Lấy form Model con
  formModelChanged() {
    this.codxOmService.getFormModel(this.krFuncID).then((krFM) => {
      if (krFM) {
        this.formModelKR = krFM;
      }
    });
    this.codxOmService.getFormModel(this.obFuncID).then((obFM) => {
      if (obFM) {
        this.formModelOB = obFM;
      }
    });
    //Lấy tiêu đề theo FuncID cho Popup
    this.cache.functionList(this.krFuncID).subscribe((res) => {
      if (res) {
        this.addKRTitle = res.customName.toString();
      }
    });
    this.cache.functionList(this.obFuncID).subscribe((res) => {
      if (res) {
        this.addOBTitle = res.customName.toString();
      }
    });
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

  //-----------------------End-------------------------------//

  //-----------------------Validate Func---------------------//

  //-----------------------End-------------------------------//

  //-----------------------Logic Func------------------------//

  //-----------------------End-------------------------------//

  //-----------------------Logic Event-----------------------//

  //-----------------------End-------------------------------//

  //-----------------------Custom Func-----------------------//

  //-----------------------End-------------------------------//

  //-----------------------Custom Event-----------------------//

  //-----------------------End-------------------------------//

  //-----------------------Popup-----------------------------//

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
      [
        this.view.formModel,
        this.periodID,
        this.interval,
        this.year,
        this.dataDate,
        this.dtCompany,
        '1',
      ],
      '',
      dialogModel
    );
    dialog.closed.subscribe((item) => {
      if (item.event) this.dataOKR = this.dataOKR.concat(item.event);
    });
  }

  //Thêm mới mục tiêu
  addOKR() {
    let dialog = this.callfc.openSide(OkrAddComponent, [
      this.gridView,
      this.formModelKR,
      'add',
      this.dataOKRPlans,
      null,
    ]);
    //   "add",
    //   this.dataOKRPlans,
    //   null
    //  ]
    // );
  }
  //Thêm mới KR
  addKR(o: any = null) {
    let option = new SidebarModel();
    option.FormModel = this.formModelKR;

    let dialogKR = this.callfc.openSide(
      PopupAddKRComponent,
      [OMCONST.MFUNCID.Add, this.addKRTitle, null, o, this.dataOKRPlans],
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
    dialogKR.closed.subscribe((res) => {
      dialogKR = null;
    });
  }
   //Chia sẻ bộ mục tiêu
   sharePlan() {
    let dialog = this.callfc.openSide(OkrAddComponent, [
      this.gridView,
      this.formModelKR,
      'add',
      this.dataOKRPlans,
      null,
    ]);
    //   "add",
    //   this.dataOKRPlans,
    //   null
    //  ]
    // );
  }
  //-----------------------End-------------------------------//
}
