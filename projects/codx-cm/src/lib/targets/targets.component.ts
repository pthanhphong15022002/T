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
import { Observable, finalize, firstValueFrom, map } from 'rxjs';
import { CodxCmService } from '../codx-cm.service';
import { X } from '@angular/cdk/keycodes';
import { PopupChangeAllocationRateComponent } from './popup-change-allocation-rate/popup-change-allocation-rate.component';

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
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  @ViewChild('templateMonth0') templateMonth0?: TemplateRef<any>;
  @ViewChild('templateMonth1') templateMonth1?: TemplateRef<any>;
  @ViewChild('templateMonth2') templateMonth2?: TemplateRef<any>;
  @ViewChild('templateMonth3') templateMonth3?: TemplateRef<any>;
  @ViewChild('templateMonth4') templateMonth4?: TemplateRef<any>;
  @ViewChild('templateMonth5') templateMonth5?: TemplateRef<any>;
  @ViewChild('templateMonth6') templateMonth6?: TemplateRef<any>;
  @ViewChild('templateMonth7') templateMonth7?: TemplateRef<any>;
  @ViewChild('templateMonth8') templateMonth8?: TemplateRef<any>;
  @ViewChild('templateMonth9') templateMonth9?: TemplateRef<any>;
  @ViewChild('templateMonth10') templateMonth10?: TemplateRef<any>;
  @ViewChild('templateMonth11') templateMonth11?: TemplateRef<any>;
  @ViewChild('templateMonth12') templateMonth12?: TemplateRef<any>;

  lstDataTree = [];
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
  constructor(
    private inject: Injector,
    private activedRouter: ActivatedRoute,
    private notiService: NotificationsService,
    private decimalPipe: DecimalPipe,
    private cmSv: CodxCmService
  ) {
    super(inject);
    if (!this.funcID)
      this.funcID = this.activedRouter.snapshot.params['funcID'];

    this.heightWin = Util.getViewPort().height - 100;
    this.widthWin = Util.getViewPort().width - 100;
  }

  onInit(): void {
    this.showButtonAdd = true;
    this.button = {
      id: this.btnAdd,
    };
    if (this.queryParams == null) {
      this.queryParams = this.router.snapshot.queryParams;
    }
    // this.getSchedule();
  }
  ngAfterViewInit(): void {
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
    this.fetch().subscribe((item) => {
      this.lstDataTree = item;

      this.loadedTree = true;
    });
  }

  private fetch(): Observable<any[]> {
    return this.api
      .execSv<Array<any>>(
        this.serviceTree,
        this.assemblyNameTree,
        this.classNameTree,
        this.methodTree,
        this.requestTree
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
    this.year = year;
    this.loadTreeData(year?.toString());
    this.detectorRef.detectChanges();
  }
  //#endregion
  //#region event codx-view
  viewChanged(e) {
    if (e?.view?.type == 8) {
      if (!this.schedule)
        this.schedule = (this.view?.currentView as any)?.schedule;
    } else {
      this.schedule = null;
    }
    var formModel = new FormModel();
    formModel.formName = 'CMTargetsLines';
    formModel.gridViewName = 'grvCMTargetsLines';
    formModel.entityName = 'CM_TargetsLines';
    this.fmTargetLines = formModel;
    this.detectorRef.detectChanges();
  }
  onLoading(e) {
    let lst = [];

    for (let i = 0; i < 13; i++) {
      var tmp = {};
      if (i == 0) {
        tmp['field'] = '';
        tmp['headerText'] = '';
        tmp['width'] = 350;
        tmp['template'] = this[`templateMonth${0}`];
      } else {
        tmp['field'] = '';
        tmp['headerText'] = 'Tháng ' + i;
        tmp['width'] = 175;
        tmp['template'] = this[`templateMonth${i}`];
      }
      lst.push(Object.assign({}, tmp));
    }
    this.columnGrids = lst;
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
        type: ViewType.grid,
        sameData: true,
        active: false,
        model: {
          resources: this.columnGrids,
          hideMoreFunc: true,
        },
      },
      // {
      //   sameData: false,
      //   type: ViewType.schedule,
      //   active: false,
      //   request2: this.scheduleHeader,
      //   request: this.schedules,
      //   toolbarTemplate: this.footerButton,
      //   showSearchBar: false,
      //   showFilter: false,
      //   model: {
      //     eventModel: this.scheduleModel,
      //     resourceModel: this.scheduleHeaderModel, //resource
      //     template: this.cardTemplate,
      //     template4: this.resourceHeader,
      //     // template5: this.resourceTootip, //tooltip
      //     template6: this.mfButton, //header
      //     template8: this.contentTmp, //content
      //     //template7: this.footerButton,//footer
      //     // statusColorRef: 'EP022',
      //   },
      // },
    ];
    this.detectorRef.detectChanges();
  }
  searchChanged(e) {}
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
            if (type == 'tree') res.disabled = true;
            break;
          case 'SYS03':
            if (type == 'tree') {
              if (data.parentID != null) res.disabled = true;
            }
            break;
          case 'CM0206_1':
            if (type == 'tree') {
              if (data.parentID == null || data.target == 0) {
                if (data.parentID == null){
                  res.disabled = true;
                }else{
                  res.isblur = true;
                }
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
          if (e?.event[0] != null && e?.event[0][1] != null) {
            var data = e?.event[0][1];
            var lstOwners = e?.event[1];
            var lstTargetLines = e?.event[0][0];
            if (data.year == this.year) {
              this.businessLineID = e?.event[2];
              this.lstTargetLines = lstTargetLines;
              this.lstOwners = lstOwners;
              this.data = e?.event[0][2];
              var index = this.lstDataTree.findIndex(
                (x) => x.businessLineID == data?.businessLineID
              );
              if (index != -1) {
                this.lstDataTree[index] = data;
                // this.lstDataTree.splice(index, 1);
              } else {
                this.lstDataTree.push(Object.assign({}, data));
              }
            }
          }
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
          this.businessLineID = null;
          if (!e?.event) this.view.dataService.clear();
          if (e != null && e?.event != null) {
            if (e?.event[0] != null && e?.event[0][1] != null) {
              var data = e?.event[0][1];
              if (data.year == this.year) {
                this.businessLineID = e?.event[2];
                this.lstTargetLines = e?.event[0][0];
                this.lstOwners = e?.event[1];
                this.data = e?.event[0][2];
                var index = this.lstDataTree.findIndex(
                  (x) => x.businessLineID == data?.businessLineID
                );
                if (index != -1) {
                  this.lstDataTree[index] = data;
                } else {
                  this.lstDataTree.push(Object.assign({}, data));
                }
              }
              // this.lstDataTree.push(Object.assign({}, data));

              this.detectorRef.detectChanges();
            }
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
    lstLinesBySales = await firstValueFrom(
      this.api.execSv<any>(
        'CM',
        'ERM.Business.CM',
        'TargetsLinesBusiness',
        'GetSalesPersonsByBusinessIDAsync',
        [data?.businessLineID, data?.salespersonID]
      )
    );
    let dialogModel = new DialogModel();
    dialogModel.DataService = this.view.dataService;
    dialogModel.FormModel = this.view?.formModel;
    dialogModel.zIndex = 999;
    var obj = {
      data: data,
      title: this.titleAction,
      lstLinesBySales: lstLinesBySales,
    };
    var dialog = this.callfc.openForm(
      PopupChangeAllocationRateComponent,
      '',
      850,
      850,
      '',
      obj,
      '',
      dialogModel
    );
    dialog.closed.subscribe((e) => {});
  }
  //#endregion

  targetToFixed(data) {
    return Math.round(data);
  }

  clickShow(isShow: boolean) {
    if (this.lstDataTree != null && this.lstDataTree.length > 0) {
      this.lstDataTree.forEach((res) => {
        res.isCollapse = isShow;
      });
    }
    this.isShow = isShow;
    this.detectorRef.detectChanges();
  }
}
