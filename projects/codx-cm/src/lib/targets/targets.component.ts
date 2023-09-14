import {
  AfterViewInit,
  ChangeDetectorRef,
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
  AuthService,
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
  selector: 'cm-targets',
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
  @Input() viewDashboard = false;
  //schedule view
  @ViewChild('codxInput') codxInput: any;
  @ViewChild('calendarDrop') calendarDrop: any;
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
  service: string = 'CM';
  assemblyName: string = 'ERM.Business.CM';
  entityName: string = 'CM_Targets';
  className: string = 'TargetsBusiness';
  method: string = 'GetListTargetAsync';
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
  viewCurrent = '1';
  viewDataValue = '1';
  viewMode = 9;
  lstCurrentView = [];
  currencyID: any;
  exchangeRate: number;
  currencyIDSys: any;
  exchangeRateSys: number;
  gridViewSetupTarget: any;
  countLoad = 0;
  datasVll = [];
  language: string;
  search = '';
  countTarget = 0;
  countPersons = 0;
  predicateSearch = '';
  dataValueSearch = '';
  probability = '1';
  formModel: any;
  isButton = false;
  constructor(
    private inject: Injector,
    private activedRouter: ActivatedRoute,
    private notiService: NotificationsService,
    private decimalPipe: DecimalPipe,
    private changeDetec: ChangeDetectorRef,
    private cmSv: CodxCmService,
    private auth: AuthService,
    private codxShareService: CodxShareService
  ) {
    super(inject);
    // if (!this.funcID)
    //   this.funcID = this.activedRouter.snapshot.params['funcID'];
    this.funcID = "CM0601";
    this.language = this.auth.userValue?.language?.toLowerCase();

    this.heightWin = Util.getViewPort().height - 100;
    this.widthWin = Util.getViewPort().width - 100;
  }

  async onInit() {
    // this.viewDashboard = true;
    if (this.viewDashboard) this.viewDataValue = '2';
    this.showButtonAdd = this.viewCurrent == '1' ? true : false;
    this.button = {
      id: this.btnAdd,
    };

    this.year = new Date().getFullYear();

    this.loadTreeData(this.year?.toString());
    let datasVll = await firstValueFrom(this.cache.valueList('CRM054'));

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
        width: 120,
      },
      //quý
      {
        headerTemplate: this.headerQuarter1,
        template: this.templateQuarter1,
        width: 120,
      },
      {
        headerTemplate: this.headerQuarter2,
        template: this.templateQuarter2,
        width: 120,
      },
      {
        headerTemplate: this.headerQuarter3,
        template: this.templateQuarter3,
        width: 120,
      },
      {
        headerTemplate: this.headerQuarter4,
        template: this.templateQuarter4,
        width: 120,
      },
      //Tháng
      {
        headerTemplate: this.headerMonth1,
        template: this.templateMonth1,
        width: 120,
      },
      {
        headerTemplate: this.headerMonth2,
        template: this.templateMonth2,
        width: 120,
      },
      {
        headerTemplate: this.headerMonth3,
        template: this.templateMonth3,
        width: 120,
      },
      {
        headerTemplate: this.headerMonth4,
        template: this.templateMonth4,
        width: 120,
      },
      {
        headerTemplate: this.headerMonth5,
        template: this.templateMonth5,
        width: 120,
      },
      {
        headerTemplate: this.headerMonth6,
        template: this.templateMonth6,
        width: 120,
      },
      {
        headerTemplate: this.headerMonth7,
        template: this.templateMonth7,
        width: 120,
      },
      {
        headerTemplate: this.headerMonth8,
        template: this.templateMonth8,
        width: 120,
      },
      {
        headerTemplate: this.headerMonth9,
        template: this.templateMonth9,
        width: 120,
      },
      {
        headerTemplate: this.headerMonth10,
        template: this.templateMonth10,
        width: 120,
      },
      {
        headerTemplate: this.headerMonth11,
        template: this.templateMonth11,
        width: 120,
      },
      {
        headerTemplate: this.headerMonth12,
        template: this.templateMonth12,
        width: 120,
      },
    ];
    if (!this.viewDashboard) {
      this.views = [
        {
          type: ViewType.content,
          sameData: false,
          active: true,
          model: {
            panelRightRef: this.panelRight,
          },
        },
        {
          type: ViewType.chart,
          text: datasVll?.datas[1]?.text,
          icon: datasVll?.datas[1]?.icon,
          sameData: false,
          active: false,
          model: {
            panelRightRef: this.panelRight,
          },
        },
      ];
    } else {
      this.views = [
        {
          type: ViewType.chart,
          text: datasVll?.datas[1]?.text,
          icon: datasVll?.datas[1]?.icon,
          sameData: false,
          model: {
            panelRightRef: this.panelRight,
          },
        },
      ];
    }

    this.cache.valueList('CRM050').subscribe((res) => {
      if (res && res.datas) {
        this.lstCurrentView = res.datas;
      }
    });

    // if (this.queryParams == null) {
    //   this.queryParams = this.router.snapshot.queryParams;
    // }
    // this.getSchedule();
  }
  async ngAfterViewInit() {
    if (this.viewDashboard) {
      this.formModel = await this.cmSv.getFormModel('CM0601');

    } else {
      this.formModel = this.view.formModel;

      this.view.dataService.methodSave = 'AddTargetAndTargetLineAsync';
      this.view.dataService.methodDelete = 'DeletedTargetAsync';
      this.view.dataService.methodUpdate = 'UpdateTargetAndTargetLineAsync';
      this.changeDetec.detectChanges();
    }
    this.gridViewSetupTarget = await firstValueFrom(
      this.cache.gridViewSetup('CMTargets', 'grvCMTargets')
    );
  }

  //#region event codx-view
  viewChanged(e) {
    this.clickShow(false);
    this.viewMode = e?.view?.type;
    this.changeDetec.detectChanges();
  }
  async onLoading(e) {
    // if(datasVll && datasVll.datas){
    // let obj =
    // this.views.push(Object.assign({}, obj));
    // }
  }
  searchChanged(e) {
    this.search = '';
    if (e == null || e?.trim() == '') {
      this.predicateSearch = '';
      this.dataValueSearch = '';
      this.loadTreeData(this.year);
      return;
    }
    const text = e;
    this.search = text;
    let predicates = '';
    let dataValues = '';
    this.isShow = false;
    let keySearch = Object.keys(this.gridViewSetupTarget);
    let j = 0;
    for (let i = 0; i < keySearch.length; i++) {
      if (this.gridViewSetupTarget[keySearch[i]].isQuickSearch == true) {
        let or = j > 0 ? ' or ' : '';
        predicates += or + `${keySearch[i]}.Contains(@1)`;
        j++;
      }
    }

    // predicates =
    //   'BusinessLineID.Contains(@1) or TargetName.Contains(@1) or Owner.Contains(@1)';
    dataValues = text;
    this.predicateSearch = predicates;
    this.dataValueSearch = dataValues;
    this.loadTreeData(this.year, predicates, dataValues);
    this.changeDetec.detectChanges();
  }

  convertToCamelCase(name: string): string {
    return name.replace(/_([a-z])/g, (_match, letter) => letter.toUpperCase());
  }

  filterChange(e) {}

  filterReportChange(e) {}
  selectedChange(e) {}
  //#endregion

  //#region load tree
  async loadTreeData(year, predicates = '', dataValues = '') {
    this.loadedTree = false;
    var resource = new DataRequest();
    resource.predicates =
      predicates != '' ? 'Year=@0' + ' and ' + predicates : 'Year=@0';
    resource.dataValues = dataValues != '' ? year + ';' + dataValues : year;
    resource.funcID = 'CM0601';
    resource.pageLoading = false;
    this.requestTree = resource;
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
          this.countLoad++;
        }
      }
    }
    let data = await firstValueFrom(this.fetch());
    if (data != null) {
      this.lstDataTree = data[0];
      this.countTarget = data[1];
      this.countPersons = data[2];
      this.lstTreeSearchs = this.lstDataTree;
    }
    this.loadedTree = true;
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
          return response ? response : null;
        })
      );
  }
  viewBusinessLines(valueView) {
    if (valueView != this.viewCurrent) {
      this.lstDataTree = [];
      this.countLoad++;
      this.isShow = false;
      this.showButtonAdd = this.viewCurrent == '1' ? false : true;
      this.currencyID = this.currencyIDSys;
      this.exchangeRate = this.exchangeRateSys;
      this.search = '';
      this.viewCurrent = valueView;
      this.loadTreeData(
        this.year?.toString(),
        this.predicateSearch,
        this.dataValueSearch
      );
    }
    this.changeDetec.detectChanges();
  }

  viewDataValueGrid(view) {
    if (view != this.viewDataValue) {
      this.viewDataValue = view;
    }
    this.changeDetec.detectChanges();
  }

  valueChangeProbability(e) {
    if (e) {
      this.probability = e?.data;
    }
  }

  isActive(item: any, type): boolean {
    return this[type] === item;
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
    if (!data?.fromDate) {
      this.date = new Date();
      this.calendarDrop.value = this.date;
    }
    var year = data?.fromDate
      ? parseInt(data?.fromDate?.getFullYear())
      : new Date().getFullYear();
    if (year != this.year) {
      this.isShow = false;
      this.year = year;
      this.loadTreeData(year?.toString());
    }

    this.changeDetec.detectChanges();
  }

  async valueChange(e) {
    if (e?.data != this.currencyID) {
      this.exChangeRate(this.currencyID, e?.data);
    }
    // this.changeDetec.detectChanges();
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
          element.dealValue =
            (element.dealValue / exchangeRate?.exchRate) * element.exchangeRate;
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

          if (element?.deals != null) {
            element?.deals.forEach((deal) => {
              deal.dealValue =
                (deal.dealValue / exchangeRate?.exchRate) * deal.exchangeRate;
              deal.currencyID = currencyID;
              deal.exchangeRate = exchangeRate?.exchRate ?? 1;
            });
          }

          if (element?.items != null) {
            element?.items.forEach((item) => {
              item.target =
                (item.target / exchangeRate?.exchRate) * item.exchangeRate;
              item.dealValue =
                (item.dealValue / exchangeRate?.exchRate) * item.exchangeRate;
              if (item?.targetsLines != null) {
                item?.targetsLines.forEach((line) => {
                  line.target =
                    (line.target / exchangeRate?.exchRate) * line.exchangeRate;
                  line.currencyID = currencyID;
                  line.exchangeRate = exchangeRate?.exchRate ?? 1;
                });
              }

              if (item?.deals != null) {
                item?.deals.forEach((deal) => {
                  deal.dealValue =
                    (deal.dealValue / exchangeRate?.exchRate) *
                    deal.exchangeRate;
                  deal.currencyID = currencyID;
                  deal.exchangeRate = exchangeRate?.exchRate ?? 1;
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
        this.currencyID = null;
        this.codxInput.crrValue = null;
        this.codxInput.value = null;
      }
      this.currencyID = currencyID;
      this.exchangeRate = exchangeRate?.exchRate;

      this.changeDetec.detectChanges();
    }
  }

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
          if (!this.isButton) this.deleteTargetLine(data);
          break;
        case 'SYS03':
          if (!this.isButton) this.edit(data);
          break;
        case 'CM0206_1':
          if (!this.isButton) this.popupChangeAllocationRate(data);
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
    this.isButton = true;
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
        year: this.year,
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
        this.isButton = false;
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
              this.countTarget++;
            }
            this.lstDataTree = JSON.parse(JSON.stringify(this.lstDataTree));
            let lst = [];
            this.lstDataTree.forEach((res) => {
              res?.items?.forEach((element) => {
                if (
                  !lst.some(
                    (item) => item?.salespersonID == element?.salespersonID
                  )
                ) {
                  lst.push(Object.assign({}, element));
                }
              });
            });
            this.countPersons = lst.length;
            this.isShow = false;
          }

          this.changeDetec.detectChanges();
        }
      });
    });
  }

  async edit(data) {
    this.isButton = true;
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
          this.isButton = false;
          if (!e?.event) this.view.dataService.clear();
          if (e != null && e?.event != null) {
            var data = e?.event[0];
            if (data.year == this.year) {
              this.view.dataService.update(data).subscribe();
              var index = this.lstDataTree.findIndex(
                (x) => x.businessLineID == data?.businessLineID
              );
              if (index != -1) {
                this.lstDataTree[index] = data;
              } else {
                this.lstDataTree.push(Object.assign({}, data));
                this.countTarget++;
              }
              this.lstDataTree = JSON.parse(
                JSON.stringify(this.lstDataTree)
              );
              let lst = [];
              this.lstDataTree.forEach((res) => {
                res?.items?.forEach((element) => {
                  if (
                    !lst.some(
                      (item) => item?.salespersonID == element?.salespersonID
                    )
                  ) {
                    lst.push(Object.assign({}, element));
                  }
                });
              });
              this.countPersons = lst.length;
              this.isShow = false;
            }
            // this.lstDataTree.push(Object.assign({}, data));

            this.changeDetec.detectChanges();
          }
        });
      });
  }

  deleteTargetLine(data) {
    this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete([this.view.dataService.dataSelected], true, (opt) =>
        this.beforeDel(opt)
      )
      .subscribe((res) => {
        if (res) {
          this.view.dataService.onAction.next({
            type: 'delete',
            data: data,
          });
          var index = this.lstDataTree.findIndex(
            (x) => x.recID == data.recID
          );
          if (index != -1) {
            this.lstDataTree.splice(index, 1);
            this.countTarget--;
          }
          this.lstDataTree = JSON.parse(JSON.stringify(this.lstDataTree));
          let lst = [];
          this.lstDataTree.forEach((res) => {
            res?.items?.forEach((element) => {
              if (
                !lst.some(
                  (item) => item?.salespersonID == element?.salespersonID
                )
              ) {
                lst.push(Object.assign({}, element));
              }
            });
          });
          this.countPersons = lst.length;
          this.changeDetec.detectChanges();
        }
      });
  }

  beforeDel(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.methodName = 'DeletedTargetAsync';
    opt.assemblyName = 'ERM.Business.CM';
    opt.className = 'TargetsBusiness';
    opt.service = 'CM';
    opt.data = [itemSelected.recID];
    return true;
  }
  //#endregion

  //#region Month
  async popupChangeAllocationRate(data) {
    this.isButton = true;
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
      lstLinesBySales = result[0];
      dataEdit.target = result[1];
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
      this.isButton = false;
      if (!e?.event) this.view.dataService.clear();
      if (e != null && e?.event != null) {
        let index = this.lstDataTree.findIndex(
          (x) => e.event.businessLineID == x.businessLineID
        );
        if (index != -1) {
          this.lstDataTree[index] = e.event;
          this.lstDataTree = JSON.parse(JSON.stringify(this.lstDataTree));
        }
        this.isShow = false;
        this.changeDetec.detectChanges();
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
    this.changeDetec.detectChanges();
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
    this.changeDetec.detectChanges();
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

  sumTargetQuarter(lstLines = [], i: number) {
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

  sumDealValueQuarter(lstDeal = [], i: number) {
    var dealValue = 0;

    if (lstDeal != null && lstDeal.length > 0) {
      lstDeal.forEach((element) => {
        if (
          this.checkMonthQuarter(i, new Date(element.createdOn)?.getMonth() + 1)
        )
          dealValue += element.dealValue;
      });
    }

    return this.targetToFixed(dealValue);
  }

  sumProbabilityDVQuarter(lstDeal = [], lstLines = [], i: number) {
    let dealValue = 0;
    let target = 0;

    target = this.sumTargetQuarter(lstLines, i);
    dealValue = this.sumDealValueQuarter(lstDeal, i);

    let probability = 0;

    if (target > 0) {
      probability = (dealValue / target) * 100;
    }

    return this.formatNumberWithoutTrailingZeros(probability);
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

  getDealValueMonth(lstDeals = [], month: number) {
    let dealValue = 0;

    if (lstDeals != null && lstDeals.length > 0) {
      lstDeals.forEach((element) => {
        if (month === new Date(element.createdOn)?.getMonth() + 1)
          dealValue += element.dealValue;
      });
    }

    return this.targetToFixed(dealValue);
  }

  getProbabilityMonth(lstDeals = [], lstTargetLines = [], month: number) {
    let dealValue = 0;
    let target = 0;

    dealValue = this.getDealValueMonth(lstDeals, month);
    target = this.getTargetMonth(lstTargetLines, month);

    let probability = 0;
    if (target > 0) {
      probability = (dealValue / target) * 100;
    }

    return this.formatNumberWithoutTrailingZeros(probability);
  }

  formatNumberWithoutTrailingZeros(num) {
    const roundedNum = parseFloat(num.toFixed(2));

    const formattedNum = roundedNum.toString().replace(/(\.\d*?)0+$/, '$1');

    return formattedNum;
  }
  //#endregion
}
