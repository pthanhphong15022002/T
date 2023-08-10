import {
  AfterViewInit,
  Component,
  Injector,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AlertConfirmInputConfig,
  ButtonModel,
  DataRequest,
  DialogModel,
  FormModel,
  NotificationsService,
  RequestOption,
  ResourceModel,
  SidebarModel,
  UIComponent,
  Util,
  ViewModel,
  ViewType,
} from 'codx-core';
import { PopupAddTargetComponent } from './popup-add-target/popup-add-target.component';
import { DecimalPipe } from '@angular/common';
import { Observable, finalize, map, filter, firstValueFrom } from 'rxjs';
import { CodxCmService } from '../codx-cm.service';
import { X } from '@angular/cdk/keycodes';
import { PopupChangeAllocationRateComponent } from './popup-change-allocation-rate/popup-change-allocation-rate.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'lib-targets',
  templateUrl: './targets.component.html',
  styleUrls: ['./targets.component.scss'],
  providers: [DecimalPipe],
})
export class TargetsComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @Input() showButtonAdd = true;
  @Input() queryParams: any;
  //schedule view
  @ViewChild('resourceHeader') resourceHeader!: TemplateRef<any>;
  @ViewChild('resourceTootip') resourceTootip!: TemplateRef<any>;
  @ViewChild('footerButton') footerButton?: TemplateRef<any>;
  @ViewChild('mfButton') mfButton?: TemplateRef<any>;
  @ViewChild('contentTmp') contentTmp?: TemplateRef<any>;
  @ViewChild('cardTemplate') cardTemplate?: TemplateRef<any>;
  @ViewChild('panelRight') panelRight?: TemplateRef<any>;
  @ViewChild('templateGrid') templateGrid?: TemplateRef<any>;

  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  //BusinessLine
  @ViewChild('headerBusinessLine', { static: true })
  headerBusinessLine: TemplateRef<any>;
  @ViewChild('templateBusinessLine') templateBusinessLine: TemplateRef<any>;
  //Năm
  @ViewChild('headerYear', { static: true }) headerYear: TemplateRef<any>;
  @ViewChild('templateYear') templateYear: TemplateRef<any>;
  //4 quý
  @ViewChild('headerQuarter1', { static: true })
  headerQuarter1: TemplateRef<any>;
  @ViewChild('templateQuarter1') templateQuarter1: TemplateRef<any>;
  @ViewChild('headerQuarter2', { static: true })
  headerQuarter2: TemplateRef<any>;
  @ViewChild('templateQuarter2') templateQuarter2: TemplateRef<any>;
  @ViewChild('headerQuarter3', { static: true })
  headerQuarter3: TemplateRef<any>;
  @ViewChild('templateQuarter3') templateQuarter3: TemplateRef<any>;
  @ViewChild('headerQuarter4', { static: true })
  headerQuarter4: TemplateRef<any>;
  @ViewChild('templateQuarter4') templateQuarter4: TemplateRef<any>;
  //12 tháng
  @ViewChild('headerMonth1', { static: true }) headerMonth1: TemplateRef<any>;
  @ViewChild('templateMonth1') templateMonth1?: TemplateRef<any>;
  @ViewChild('headerMonth2', { static: true }) headerMonth2: TemplateRef<any>;
  @ViewChild('templateMonth2') templateMonth2?: TemplateRef<any>;
  @ViewChild('headerMonth3', { static: true }) headerMonth3: TemplateRef<any>;
  @ViewChild('templateMonth3') templateMonth3?: TemplateRef<any>;
  @ViewChild('headerMonth4', { static: true }) headerMonth4: TemplateRef<any>;
  @ViewChild('templateMonth4') templateMonth4?: TemplateRef<any>;
  @ViewChild('headerMonth5', { static: true }) headerMonth5: TemplateRef<any>;
  @ViewChild('templateMonth5') templateMonth5?: TemplateRef<any>;
  @ViewChild('headerMonth6', { static: true }) headerMonth6: TemplateRef<any>;
  @ViewChild('templateMonth6') templateMonth6?: TemplateRef<any>;
  @ViewChild('headerMonth7', { static: true }) headerMonth7: TemplateRef<any>;
  @ViewChild('templateMonth7') templateMonth7?: TemplateRef<any>;
  @ViewChild('headerMonth8', { static: true }) headerMonth8: TemplateRef<any>;
  @ViewChild('templateMonth8') templateMonth8?: TemplateRef<any>;
  @ViewChild('headerMonth9', { static: true }) headerMonth9: TemplateRef<any>;
  @ViewChild('templateMonth9') templateMonth9?: TemplateRef<any>;
  @ViewChild('headerMonth10', { static: true }) headerMonth10: TemplateRef<any>;
  @ViewChild('templateMonth10') templateMonth10?: TemplateRef<any>;
  @ViewChild('headerMonth11', { static: true }) headerMonth11: TemplateRef<any>;
  @ViewChild('templateMonth11') templateMonth11?: TemplateRef<any>;
  @ViewChild('headerMonth12', { static: true }) headerMonth12: TemplateRef<any>;
  @ViewChild('templateMonth12') templateMonth12?: TemplateRef<any>;

  lstDataTree = [];
  lstTreeSearchs = [];
  dataObj: any;
  views: Array<ViewModel> = [];
  moreFuncs: Array<ButtonModel> = [];
  button?: ButtonModel;
  scheduleHeader?: ResourceModel;
  schedules?: ResourceModel;
  //#region tree request
  requestTree = new DataRequest();
  serviceTree: string = 'CM';
  assemblyNameTree: string = 'ERM.Business.CM';
  entityNameTree: string = 'CM_Targets';
  classNameTree: string = 'TargetsBusiness';
  methodTree: string = 'GetListTreeTargetLineAsync';
  loadedTree: boolean;
  fmTargetLines: FormModel;
  //#endregion
  scheduleModel: any;
  scheduleHeaderModel: any;
  //#region Exec
  funcID = '';
  service: string = 'CM';
  assemblyName: string = 'ERM.Business.CM';
  entityName: string = 'CM_Targets';
  className: string = 'TargetsBusiness';
  method: string = '';
  idField: string = 'recID';
  //#endregion
  titleAction = '';
  dataSelected: any;
  readonly btnAdd: string = 'btnAdd';
  //calendar - tháng - quý - năm
  date: any = new Date();
  ops = ['y'];
  year: number;
  heightWin: any;
  widthWin: any;
  lstOwners = [];
  lstTargetLines = [];
  businessLineID: any;
  data: any;
  schedule: any;
  columnGrids = [];
  isShow = false;
  isShowGrid = false;
  popoverDetail: any;
  popupOld: any;
  popoverList: any;
  viewMode = 9;
  viewCurrent = '1';
  lstCurrentView = [];
  currencyID: any;
  exchangeRate: number;
  currencyIDSys: any;
  exchangeRateSys: number;
  gridViewSetupTarget: any;
  countLoad = 0;
  constructor(
    private inject: Injector,
    private activedRouter: ActivatedRoute,
    private notiService: NotificationsService,
    private decimalPipe: DecimalPipe,
    private cmSv: CodxCmService,
    private codxShareService: CodxShareService
  ) {
    super(inject);
    if (!this.funcID)
      this.funcID = this.activedRouter.snapshot.params['funcID'];

    this.heightWin = Util.getViewPort().height - 100;
    this.widthWin = Util.getViewPort().width - 100;
  }

  async onInit() {
    this.showButtonAdd = this.viewCurrent == '1' ? true : false;
    this.button = {
      id: this.btnAdd,
    };
    this.year = new Date().getFullYear();
    this.loadTreeData(this.year?.toString());

    this.cache.valueList('CRM050').subscribe((res) => {
      if (res && res.datas) {
        this.lstCurrentView = res.datas;
      }
    });

    if (this.queryParams == null) {
      this.queryParams = this.router.snapshot.queryParams;
    }
    // this.getSchedule();
  }
  async ngAfterViewInit() {
    // this.gridViewSetupTarget = await firstValueFrom(
    //   this.cache.gridViewSetup('CMTargets', 'grvCMTargets')
    // );
    this.view.dataService.methodSave = 'AddTargetAndTargetLineAsync';
    this.view.dataService.methodDelete = 'DeletedTargetLineAsync';
    this.view.dataService.methodUpdate = 'UpdateTargetAndTargetLineAsync';

    this.detectorRef.checkNoChanges();
  }

  //#region setting schedule
  getSchedule() {
    //lấy list target để vẽ schedule
    this.schedules = new ResourceModel();
    this.schedules.assemblyName = 'CM';
    this.schedules.className = 'TargetsBusiness';
    this.schedules.service = 'CM';
    this.schedules.method = 'GetListTargetLineAsync';
    this.schedules.idField = 'recID';
    //lấy list user vẽ header schedule
    this.scheduleHeader = new ResourceModel();
    this.scheduleHeader.assemblyName = 'CM';
    this.scheduleHeader.className = 'TargetsBusiness';
    this.scheduleHeader.service = 'CM';
    this.scheduleHeader.method = 'GetListUserAsync';
    this.scheduleModel = {
      id: 'recID',
      subject: { name: 'target' },
      startTime: { name: 'startDate' },
      endTime: { name: 'endDate' },
      resourceId: { name: 'salespersonID' },
    };

    this.scheduleHeaderModel = {
      Name: 'Owners',
      Field: 'salespersonID',
      IdField: 'salespersonID',
      TextField: 'userName',
      Title: 'Owners',
    };
  }
  //#endregion setting schedule

  //#region load tree
  loadTreeData(year) {
    this.loadedTree = false;
    var resource = new DataRequest();
    resource.predicates = 'Year=@0';
    resource.dataValues = year;
    resource.funcID = 'CM0601';
    resource.pageLoading = false;
    this.requestTree = resource;
    this.loadCurrentID();
  }

  private fetch(): Observable<any[]> {
    return this.api
      .execSv<Array<any>>(
        this.serviceTree,
        this.assemblyNameTree,
        this.classNameTree,
        this.methodTree,
        [this.requestTree, this.viewCurrent, this.currencyID, this.exchangeRate]
      )
      .pipe(
        finalize(() => {
          /*  this.onScrolling = this.loading = false;
          this.loaded = true; */
        }),
        map((response: any) => {
          return response ? response[0] : [];
        })
      );
  }

  viewBusinessLines(valueView) {
    if (valueView != this.viewCurrent) {
      this.lstDataTree = [];
      this.countLoad++;
      this.isShow = false;
      this.showButtonAdd = this.viewCurrent == '1' ? false : true;
      this.view.button = this.showButtonAdd ? this.button : null;
      this.currencyID = this.currencyIDSys;
      this.exchangeRate = this.exchangeRateSys;
      this.viewCurrent = valueView;
      this.loadTreeData(this.year?.toString());
    }
    this.detectorRef.detectChanges();
  }

  async loadCurrentID() {
    if (this.countLoad == 0) {
      var param = await firstValueFrom(
        this.cache.viewSettingValues('CMParameters')
      );
      if (param?.length > 0) {
        let dataParam = param.filter(
          (x) => x.category == '1' && !x.transType
        )[0];
        if (dataParam) {
          let paramDefault = JSON.parse(dataParam.dataValue);
          this.currencyID = paramDefault['DefaultCurrency'] ?? 'VND';
          let exchangeRateCurrent = await firstValueFrom(
            this.cmSv.getExchangeRate(this.currencyID, new Date())
          );
          if (exchangeRateCurrent?.exchRate > 0) {
            this.exchangeRate = exchangeRateCurrent?.exchRate;
          } else {
            this.exchangeRate = 1;
            this.currencyID = 'VND';
          }
          this.currencyIDSys = this.currencyID;
          this.exchangeRateSys = this.exchangeRate;
        }
      }
    }

    this.fetch().subscribe((item) => {
      this.lstDataTree = item;
      this.lstTreeSearchs = this.lstDataTree;
      this.loadedTree = true;
    });
  }

  isActive(item: any): boolean {
    return this.viewCurrent === item;
  }
  clickTreeNode(evt: any) {
    evt.stopPropagation();
    evt.preventDefault();
  }

  selectionChange(parent) {
    if (parent.isItem) {
      parent.data.items = parent?.data?.items;
    }
  }
  //#endregion

  //#region change Calendar ejs
  changeCalendar(data: any) {
    var year = data?.fromDate
      ? parseInt(data?.fromDate?.getFullYear())
      : new Date().getFullYear();
    if (year != this.year) {
      this.year = year;
      this.loadTreeData(year?.toString());
    }

    this.detectorRef.detectChanges();
  }

  async valueChange(e) {
    if (e?.data != this.currencyID) {
      this.exChangeRate(this.currencyID, e?.data);
    }
    this.detectorRef.detectChanges();
  }

  async exChangeRate(currencyIDOld, currencyID) {
    if (currencyIDOld !== currencyID) {
      let day = new Date();

      let exchangeRate = await firstValueFrom(
        this.cmSv.getExchangeRate(currencyID, day)
      );

      if (exchangeRate?.exchRate > 0) {
        this.lstDataTree.forEach((element) => {
          element.target =
            (element.target / exchangeRate?.exchRate) * element.exchangeRate;
          element.currencyID = currencyID;
          element.exchangeRate = exchangeRate?.exchRate ?? 1;
          if (element?.targetsLines != null) {
            element?.targetsLines.forEach((line) => {
              line.target =
                (line.target / exchangeRate?.exchRate) * line.exchangeRate;
              line.currencyID = currencyID;
              line.exchangeRate = exchangeRate?.exchRate ?? 1;
            });
          }
          if (element?.items != null) {
            element?.items.forEach((item) => {
              item.target =
                (item.target / exchangeRate?.exchRate) * item.exchangeRate;
              if (item?.targetsLines != null) {
                item?.targetsLines.forEach((line) => {
                  line.target =
                    (line.target / exchangeRate?.exchRate) * line.exchangeRate;
                });
              }
              item.currencyID = currencyID;
              item.exchangeRate = exchangeRate?.exchRate ?? 1;
            });
          }
        });
        if (this.lstDataTree != null && this.viewMode == 9) {
          this.lstDataTree = JSON.parse(JSON.stringify(this.lstDataTree));
        }
      } else {
        exchangeRate.exchRate = this.exchangeRate;
        currencyID = this.currencyID;
      }
      this.currencyID = currencyID;
      this.exchangeRate = exchangeRate?.exchRate;
    }
  }

  //#endregion
  //#region event codx-view
  viewChanged(e) {
    this.clickShow(false);
    this.viewMode = e?.view?.type;
    this.detectorRef.detectChanges();
  }
  onLoading(e) {
    this.columnGrids = [
      {
        headerTemplate: this.headerBusinessLine,
        template: this.templateBusinessLine,
        width: 350,
      },
      //năm
      {
        headerTemplate: this.headerYear,
        template: this.templateYear,
        width: 150,
      },
      //quý
      {
        headerTemplate: this.headerQuarter1,
        template: this.templateQuarter1,
        width: 150,
      },
      {
        headerTemplate: this.headerQuarter2,
        template: this.templateQuarter2,
        width: 150,
      },
      {
        headerTemplate: this.headerQuarter3,
        template: this.templateQuarter3,
        width: 150,
      },
      {
        headerTemplate: this.headerQuarter4,
        template: this.templateQuarter4,
        width: 150,
      },
      //Tháng
      {
        headerTemplate: this.headerMonth1,
        template: this.templateMonth1,
        width: 150,
      },
      {
        headerTemplate: this.headerMonth2,
        template: this.templateMonth2,
        width: 150,
      },
      {
        headerTemplate: this.headerMonth3,
        template: this.templateMonth3,
        width: 150,
      },
      {
        headerTemplate: this.headerMonth4,
        template: this.templateMonth4,
        width: 150,
      },
      {
        headerTemplate: this.headerMonth5,
        template: this.templateMonth5,
        width: 150,
      },
      {
        headerTemplate: this.headerMonth6,
        template: this.templateMonth6,
        width: 150,
      },
      {
        headerTemplate: this.headerMonth7,
        template: this.templateMonth7,
        width: 150,
      },
      {
        headerTemplate: this.headerMonth8,
        template: this.templateMonth8,
        width: 150,
      },
      {
        headerTemplate: this.headerMonth9,
        template: this.templateMonth9,
        width: 150,
      },
      {
        headerTemplate: this.headerMonth10,
        template: this.templateMonth10,
        width: 150,
      },
      {
        headerTemplate: this.headerMonth11,
        template: this.templateMonth11,
        width: 150,
      },
      {
        headerTemplate: this.headerMonth12,
        template: this.templateMonth12,
        width: 150,
      },
    ];
    this.views = [
      {
        type: ViewType.content,
        active: true,
        sameData: false,
        model: {
          panelRightRef: this.panelRight,
        },
      },
      {
        type: ViewType.chart,
        sameData: false,
        active: false,
        model: {
          panelRightRef: this.panelRight,
        },
      },
    ];
  }
  searchChanged(e) {
    this.loadedTree = false;
    if (e == null || e?.trim() == '') {
      this.loadedTree = true;
      this.lstDataTree = this.lstTreeSearchs;
      return;
    }

    let text = e.toLowerCase();
    if (this.viewCurrent == '1') {
      this.lstDataTree = this.lstTreeSearchs.filter(
        (item) =>
          (text == item?.businessLineID?.toLowerCase() && item.year == this.year) ||
          (text == item?.title?.toLowerCase() && item.year == this.year) ||
          item?.items?.some(
            (x) =>
              (text == x?.title?.toLowerCase() && x.year == this.year) ||
              (text == x?.salespersonID?.toLowerCase() && x.year == this.year)
          )
      );
    } else {
      this.lstDataTree = this.lstTreeSearchs.filter(
        (item) =>
          (text == item?.title?.toLowerCase() && item.year == this.year) ||
          (text == item?.salespersonID?.toLowerCase() && item.year == this.year) ||  item?.items?.some(
            (x) =>
              (text == x?.title?.toLowerCase() && x.year == this.year) ||
              (text == x?.businessLineID?.toLowerCase() && x.year == this.year)
          )
      );
    }
    this.loadedTree = true;
    this.detectorRef.detectChanges();
  }

  filterChange(e) {
    console.log('filter: ', e);
  }

  filterReportChange(e) {
    console.log('filterReport: ', e);
  }
  selectedChange(e) {}
  //#endregion

  //#region more
  click(evt) {
    this.titleAction = evt.text;
    switch (evt.id) {
      case this.btnAdd:
        this.add();
        break;
    }
  }

  clickMF(e, data) {
    this.dataSelected = data;
    this.titleAction = e.text;
    if (e.functionID) {
      switch (e.functionID) {
        case 'SYS02':
          this.deleteTargetLine(data);
          break;
        case 'SYS03':
          this.edit(data);
          break;
        case 'CM0206_1':
          this.popupChangeAllocationRate(data);
          break;
        default:
          this.codxShareService.defaultMoreFunc(
            e,
            data,
            null,
            this.view.formModel,
            this.view.dataService,
            this
          );
          // this.df.detectChanges();
          break;
      }
    }
  }

  changeDataMF(e, data, type = 'schedule') {
    if (e != null && data != null) {
      e.forEach((res) => {
        switch (res.functionID) {
          case 'SYS04':
            res.disabled = true;
            break;
          case 'SYS02':
            res.disabled = true;
            break;
          case 'SYS03':
            if (data.parentID != null) res.disabled = true;
            break;
          case 'CM0206_1':
            if (data.parentID == null || data.target == 0) {
              if (data.parentID == null) {
                res.disabled = true;
              } else {
                res.isblur = true;
              }
            }

            break;
        }
      });
    }
  }

  clickMoreFunc(e) {
    this.clickMF(e.e, e.data);
  }

  changeMoreMF(e) {
    this.changeDataMF(e.e, e.data, e.type);
  }
  //#endregion

  //#region CRUD
  add() {
    this.view.dataService.addNew().subscribe((res: any) => {
      let dialogModel = new DialogModel();
      dialogModel.DataService = this.view.dataService;
      dialogModel.FormModel = this.view?.formModel;
      dialogModel.zIndex = 999;
      var obj = {
        action: 'add',
        title: this.titleAction,
        currencyID: this.currencyID,
        exchangeRate: this.exchangeRate,
        gridViewSetupTarget: this.gridViewSetupTarget,
      };
      var dialog = this.callfc.openForm(
        PopupAddTargetComponent,
        '',
        850,
        850,
        '',
        obj,
        '',
        dialogModel
      );
      dialog.closed.subscribe((e) => {
        if (!e?.event) this.view.dataService.clear();
        if (e != null && e?.event != null) {
          var data = e?.event[0];
          if (data.year == this.year) {
            var index = this.lstDataTree.findIndex(
              (x) => x.businessLineID == data?.businessLineID
            );
            if (index != -1) {
              this.lstDataTree[index] = data;
              // this.lstDataTree.splice(index, 1);
            } else {
              this.lstDataTree.push(Object.assign({}, data));
            }
            if (this.lstDataTree != null && this.viewMode == 9) {
              this.lstDataTree = JSON.parse(JSON.stringify(this.lstDataTree));
            }
          }
          this.isShow = false;

          this.detectorRef.detectChanges();
        }
      });
    });
  }

  async edit(data) {
    let lstOwners = [];
    let lstTargetLines = [];
    var tar = await firstValueFrom(
      this.cmSv.getTargetAndLinesAsync(
        data?.businessLineID,
        data.year > 0 ? data.year : data.period
      )
    );
    if (tar != null) {
      lstOwners = tar[2];
      lstTargetLines = tar[1];
      this.view.dataService.dataSelected = tar[0];
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res) => {
        let dialogModel = new DialogModel();
        dialogModel.DataService = this.view.dataService;
        dialogModel.FormModel = this.view?.formModel;
        dialogModel.zIndex = 999;
        var obj = {
          action: 'edit',
          title: this.titleAction,
          lstOwners: lstOwners,
          lstTargetLines: lstTargetLines,
          currencyID: this.currencyID,
          exchangeRate: this.exchangeRate,
          gridViewSetupTarget: this.gridViewSetupTarget,
        };
        var dialog = this.callfc.openForm(
          PopupAddTargetComponent,
          '',
          850,
          850,
          '',
          obj,
          '',
          dialogModel
        );
        dialog.closed.subscribe((e) => {
          if (!e?.event) this.view.dataService.clear();
          if (e != null && e?.event != null) {
            var data = e?.event[0];
            if (data.year == this.year) {
              var index = this.lstDataTree.findIndex(
                (x) => x.businessLineID == data?.businessLineID
              );
              if (index != -1) {
                this.lstDataTree[index] = data;
              } else {
                this.lstDataTree.push(Object.assign({}, data));
              }
              if (this.lstDataTree != null && this.viewMode == 9) {
                this.lstDataTree = JSON.parse(JSON.stringify(this.lstDataTree));
              }
            }
            // this.lstDataTree.push(Object.assign({}, data));
            this.isShow = false;

            this.detectorRef.detectChanges();
          }
        });
      });
  }

  deleteTargetLine(data) {
    var config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
    this.notiService.alertCode('SYS030').subscribe((x) => {
      if (x.event && x.event?.status) {
        if (x?.event?.status == 'Y') {
          this.api
            .execSv(
              'CM',
              'ERM.Business.CM',
              'TargetsBusiness',
              'DeletedTargetLineAsync',
              data.recID
            )
            .subscribe((res) => {
              if (res) {
                data.target = 0;
                this.view.dataService.update(data.target).subscribe();
                this.notiService.notifyCode('SYS008');
                this.detectorRef.detectChanges();
              }
            });
        }
      }
    });
  }

  beforeDel(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.methodName = 'DeletedTargetLineAsync';
    opt.assemblyName = 'ERM.Business.CM';
    opt.className = 'TargetsBusiness';
    opt.service = 'CM';
    opt.data = [itemSelected.recID];
    return true;
  }
  //#endregion

  //#region Month
  async popupChangeAllocationRate(data) {
    var lstLinesBySales = [];
    let result = await firstValueFrom(
      this.api.execSv<any>(
        'CM',
        'ERM.Business.CM',
        'TargetsLinesBusiness',
        'GetSalesPersonsByBusinessIDAsync',
        [data?.businessLineID, data?.salespersonID, this.year]
      )
    );
    let dataEdit = JSON.parse(JSON.stringify(data));
    if (result != null) {
      dataEdit.target = result[0];
      dataEdit.currencyID = result[1];
      dataEdit.exchangeRate = result[2];
      lstLinesBySales = result[3];
    }
    let dialogModel = new DialogModel();
    dialogModel.DataService = this.view.dataService;
    dialogModel.FormModel = this.view?.formModel;
    dialogModel.zIndex = 999;
    var obj = {
      data: dataEdit,
      title: this.titleAction,
      lstLinesBySales: lstLinesBySales,
      currencyID: this.currencyID,
      exchangeRate: this.exchangeRate,
      targetSys: data.target,
    };
    var dialog = this.callfc.openForm(
      PopupChangeAllocationRateComponent,
      '',
      850,
      1000,
      '',
      obj,
      '',
      dialogModel
    );
    dialog.closed.subscribe((e) => {
      if (!e?.event) this.view.dataService.clear();
      if (e != null && e?.event != null) {
        let index = this.lstDataTree.findIndex(
          (x) => e.event.businessLineID == x.businessLineID
        );

        if (index != -1) {
          var data = this.lstDataTree[index]?.items;
          if (data != null) {
            var indexItem = data.findIndex(
              (x) => x.salespersonID == e?.event.salespersonID
            );
            if (indexItem != -1) {
              data[indexItem] = e.event;
              this.lstDataTree[index].items = data;
            }
          }
          if (this.lstDataTree[index].targetsLines != null) {
            const targetLines = this.lstDataTree[index].targetsLines;
            const updatedItems = [];

            for (const item of targetLines) {
              let foundLineEv = e.event?.targetsLines.find(
                (lineEv) =>
                  new Date(item.startDate)?.getMonth() + 1 ===
                    new Date(lineEv.startDate)?.getMonth() + 1 &&
                  item.salespersonID == lineEv.salespersonID
              );

              if (foundLineEv) {
                Object.assign(item, foundLineEv);
              }

              updatedItems.push(item);
            }

            this.lstDataTree[index].targetsLines = updatedItems;
          }
          this.lstDataTree = JSON.parse(JSON.stringify(this.lstDataTree));
        }
        this.isShow = false;
        this.detectorRef.detectChanges();
      }
    });
  }
  //#endregion

  targetToFixed(data) {
    return Math.round(data);
  }

  clickShow(isShow: boolean) {
    if (this.lstDataTree != null && this.lstDataTree.length > 0) {
      this.lstDataTree.forEach((res) => {
        res.isCollapse = isShow;
        if (res.items != null && this.viewMode == 9) {
          res?.items.forEach((res) => {
            res.isCollapse = isShow;
          });
        }
      });
      if (this.viewMode == 9)
        this.lstDataTree = JSON.parse(JSON.stringify(this.lstDataTree));
      this.isShow = isShow;
    }
    this.detectorRef.detectChanges();
  }

  //#region setting grid
  clickShowGrid(item, isShow: boolean) {
    item.isCollapse = isShow;
    if (item != null && item?.items != null) {
      item?.items.forEach((res) => {
        res.isCollapse = isShow;
      });
    }
    this.isShow = isShow;
    this.detectorRef.detectChanges();
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
      if (emp.title != null || emp.positionName != null) {
        if (parent <= child) {
          p.open();
        }
      }
    } else p.close();
    this.popupOld = p;
  }

  sumQuarter(lstLines = [], i: number) {
    var target = 0;

    if (lstLines != null && lstLines.length > 0) {
      lstLines.forEach((element) => {
        if (
          this.checkMonthQuarter(i, new Date(element.startDate)?.getMonth() + 1)
        )
          target += element.target;
      });
    }

    return this.targetToFixed(target);
  }

  checkMonthQuarter(i, month) {
    if (i == 1) {
      if (month >= 1 && month < 4) {
        return true;
      }
    } else if (i == 2) {
      if (month >= 4 && month < 7) {
        return true;
      }
    } else if (i == 3) {
      if (month >= 7 && month < 10) {
        return true;
      }
    } else if (i == 4) {
      if (month >= 10 && month < 13) {
        return true;
      }
    }
    return false;
  }

  getTargetMonth(lstTargetLines = [], month: number) {
    let target = 0;

    if (lstTargetLines != null && lstTargetLines.length > 0) {
      lstTargetLines.forEach((element) => {
        if (month === new Date(element.startDate)?.getMonth() + 1)
          target += element.target;
      });
    }

    return this.targetToFixed(target);
  }
  //#endregion
}
