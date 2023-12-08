import { CodxShareService } from 'projects/codx-share/src/public-api';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  AlertConfirmInputConfig,
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  CodxGridviewV2Component,
  DataRequest,
  DialogModel,
  FormModel,
  NotificationsService,
  SortModel,
  Util,
} from 'codx-core';
import { Observable, Subject, finalize, firstValueFrom, map } from 'rxjs';
import { CodxWrService } from '../../../codx-wr.service';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import { PopupUpdateReasonCodeComponent } from '../../popup-update-reasoncode/popup-update-reasoncode.component';
import moment from 'moment';

@Component({
  selector: 'wr-view-tab-update',
  templateUrl: './view-tab-update.component.html',
  styleUrls: ['./view-tab-update.component.scss'],
})
export class ViewTabUpdateComponent implements OnInit {
  @Input() transID: any;
  @Input() dataWorkOrder: any;
  @Input() isShow: boolean;
  @Output() listChange = new EventEmitter<any>();
  @ViewChild('headerStatusCode') headerStatusCode: TemplateRef<any>;
  @ViewChild('tempStatusCode') tempStatusCode: TemplateRef<any>;
  @ViewChild('headerComment') headerComment: TemplateRef<any>;
  @ViewChild('tempComment') tempComment: TemplateRef<any>;
  @ViewChild('headerScheduleStart') headerScheduleStart: TemplateRef<any>;
  @ViewChild('tempScheduleStart') tempScheduleStart: TemplateRef<any>;
  @ViewChild('headerScheduleTime') headerScheduleTime: TemplateRef<any>;
  @ViewChild('tempScheduleTime') tempScheduleTime: TemplateRef<any>;
  @ViewChild('headerEngineerID') headerEngineerID: TemplateRef<any>;
  @ViewChild('tempEngineerID') tempEngineerID: TemplateRef<any>;
  @ViewChild('headerCreatedBy') headerCreatedBy: TemplateRef<any>;
  @ViewChild('tempCreatedBy') tempCreatedBy: TemplateRef<any>;
  @ViewChild('headerAttachment') headerAttachment: TemplateRef<any>;
  @ViewChild('tempAttachment') tempAttachment: TemplateRef<any>;
  @ViewChild('grid') grid: CodxGridviewV2Component;

  formModel: FormModel = {
    formName: 'WRWorkOrderUpdates',
    gridViewName: 'grvWRWorkOrderUpdates',
    entityName: 'WR_WorkOrderUpdates',
    funcID: 'WR0101_1',
  };

  //sortField = new SortModel();

  editSettings: EditSettingsModel = {
    allowEditing: true,
    allowDeleting: true,
    allowAdding: false,
    mode: 'Normal',
  };
  lstUpdate = [];
  loaded: boolean;
  request = new DataRequest();
  predicates = 'TransID=@0';
  dataValues = '';
  service = 'WR';
  currentRecID = '';
  assemblyName = 'ERM.Business.WR';
  className = 'WorkOrderUpdatesBusiness';
  method = 'LoadDataAsync';
  id: any;
  arrFieldIsVisible = [];
  columnsGrid = [];
  dataSelected: any;
  titleAction = '';
  adjustWorkOrderUpdate = '0';
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  language = '';

  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
    private wrSv: CodxWrService,
    private detectorRef: ChangeDetectorRef,
    private callFc: CallFuncService,
    private notiSv: NotificationsService,
    private codxShareService: CodxShareService,
    private auth: AuthStore,

  ) {
    this.language = this.auth?.get()?.language?.toLowerCase();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['transID']) {
      if (
        changes['transID'].currentValue != null &&
        changes['transID']?.currentValue?.trim() != ''
      ) {
        if (changes['transID']?.currentValue == this.id) return;
        this.id = changes['transID']?.currentValue;
        this.getListOrderUpdate();
      } else {
        if (!this.loaded) this.loaded = true;
      }
    }
  }

  async ngOnInit() {
    // this.getGridViewSetup();
    //this.sortField = new SortModel();
    // this.sortField.field = 'statusCode';
    // this.sortField.dir = 'asc';
    var param = await firstValueFrom(
      this.cache.viewSettingValues('WRParameters')
    );
    if (param?.length > 0) {
      let dataParam = param.filter((x) => x.category == '1' && !x.transType)[0];
      if (dataParam) {
        let paramDefault = JSON.parse(dataParam.dataValue);
        this.adjustWorkOrderUpdate = paramDefault['AdjustWorkOrderUpdate'] ?? '0';
      }
    }
  }

  ngAfterViewInit(): void {
    this.getGridViewSetup();

  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  getListOrderUpdate() {
    this.loaded = false;
    this.request.predicates = this.predicates;
    this.request.dataValues = this.transID;
    this.request.entityName = 'WR_WorkOrderUpdates';
    this.request.pageLoading = false;
    this.fetch().subscribe(async (item) => {
      this.loaded = true;
      this.lstUpdate = item;
      if (this.grid) {
        this.grid.dataSource = this.lstUpdate;
      }
      // this.grid.dataSource = JSON.parse(JSON.stringify(this.lstUpdate));

      // this.columnsGrid = [
      //   {
      //     headerTemplate: this.headerStatusCode,
      //     template: this.tempStatusCode,
      //     width: 150,
      //   },
      //   {
      //     headerTemplate: this.headerComment,
      //     template: this.tempComment,
      //     width: 400,
      //   },
      //   {
      //     headerTemplate: this.headerScheduleTime,
      //     template: this.tempScheduleTime,
      //     width: 250,
      //   },
      //   {
      //     headerTemplate: this.headerEngineerID,
      //     template: this.tempEngineerID,
      //     width: 150,
      //   },
      //   {
      //     headerTemplate: this.headerCreatedBy,
      //     template: this.tempCreatedBy,
      //     width: 150,
      //   },
      //   {
      //     headerTemplate: this.headerAttachment,
      //     template: this.tempAttachment,
      //     width: 80,
      //   },
      // ];
      this.wrSv.listOrderUpdateSubject.next({
        e: this.lstUpdate,
        date: null,
        update: null,
      });
      // this.grid.showRowNumber = false;
    });
  }

  private fetch(): Observable<any[]> {
    return this.api
      .execSv<Array<any>>(
        this.service,
        this.assemblyName,
        this.className,
        this.method,
        this.request
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

  loadList(lstUpdate) {
    this.lstUpdate = lstUpdate;
    if (this.grid) {
      this.grid.dataSource = this.lstUpdate;
    }
  }

  getGridViewSetup() {
    this.cache
      .gridViewSetup(this.formModel.formName, this.formModel.gridViewName)
      .subscribe((res) => {
        //lay grid view
        let arrField = Object.values(res).filter((x: any) => x.isVisible);
        if (Array.isArray(arrField)) {
          this.arrFieldIsVisible = arrField
            .sort((x: any, y: any) => x.columnOrder - y.columnOrder)
            .map((x: any) => x.fieldName);
          this.getColumsGrid(res);
        }
        this.detectorRef.detectChanges();
      });
  }

  getColumsGrid(grvSetup) {
    this.columnsGrid = [];
    this.arrFieldIsVisible.forEach((key) => {
      let field = Util.camelize(key);
      let template: any;
      let colums: any;
      switch (key) {
        case 'ScheduleTime':
          template = this.tempScheduleTime;
          break;
        case 'EngineerID':
          template = this.tempEngineerID;
          break;
        case 'CreatedBy':
          template = this.tempCreatedBy;
          break;
      }

      if (template) {
        colums = {
          field: field,
          headerText: grvSetup[key].headerText ?? key,
          width: grvSetup[key].width,
          template: template,
        };
      } else {
        colums = {
          field: field,
          headerText: grvSetup[key].headerText ?? key,
          width: grvSetup[key].width,
        };
      }

      this.columnsGrid.push(colums);
    });
    var colums = {
      headerTemplate: this.headerAttachment,
      template: this.tempAttachment,
      width: 80,
    };
    this.columnsGrid.push(colums);
  }

  //#region more
  async clickMF(e, data) {
    this.dataSelected = data;
    this.titleAction = e.text;
    switch (e.functionID) {
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS02':
        this.delete(data);
        break;
      default:
        this.codxShareService.defaultMoreFunc(
          e,
          data,
          null,
          this.formModel,
          null,
          this,
          null
        );
        break;
    }
    this.detectorRef.detectChanges();
  }

  changeDataMF(e, data) {
    if (e != null && data != null) {
      e.forEach((res) => {
        res.isbookmark = false;
        switch (res.functionID) {
          case 'SYS04':
            res.disabled = true;
            break;
          case 'SYS02':
          case 'SYS03':
            if (data?.exported || this.adjustWorkOrderUpdate == '0') res.disabled = true;

            break;
          default:
            break;
        }
      });
    }
  }
  //#endregion

  //#region  set time scheduleTime
  setTimeEdit(startDate, scheduleTime) {
    let serviceTime = null;
    if (startDate && scheduleTime) {
      let date = new Date(startDate);

      serviceTime = moment(date).format("DD/MM/YYYY")  + ' ' + scheduleTime;
    }
    return serviceTime
  }

  padTo2Digits(num) {
    return String(num).padStart(2, '0');
  }
  //#endregion

  //#region  CRUD
  edit(data) {
    this.cache
      .gridViewSetup('WRWorkOrderUpdates', 'grvWRWorkOrderUpdates')
      .subscribe((res) => {
        if (res) {
          let dialogModel = new DialogModel();
          dialogModel.zIndex = 1010;
          let formModel = new FormModel();

          formModel.entityName = 'WR_WorkOrderUpdates';
          formModel.formName = 'WRWorkOrderUpdates';
          formModel.gridViewName = 'grvWRWorkOrderUpdates';
          dialogModel.FormModel = formModel;
          let obj = {
            data: data,
            title: this.titleAction,
            transID: this.transID,
            engineerID: data?.engineerID,
            createdBy: this.dataWorkOrder?.createdBy,
            gridViewSetup: res,
            action: 'edit',
          };
          this.callFc
            .openForm(
              PopupUpdateReasonCodeComponent,
              '',
              600,
              700,
              '',
              obj,
              '',
              dialogModel
            )
            .closed.subscribe((e) => {
              if (e && e?.event != null) {
                var data = e?.event;
                let idx = this.lstUpdate.findIndex(
                  (x) => x.recID == data.recID
                );
                if (idx != -1) {
                  this.lstUpdate[idx] = data;
                } else {
                  this.lstUpdate.unshift(data);
                }
                this.lstUpdate = JSON.parse(JSON.stringify(this.lstUpdate));
                this.wrSv.listOrderUpdateSubject.next({
                  e: this.lstUpdate,
                  date: new Date(data.createdOn),
                  update: data,
                });

                this.detectorRef.detectChanges();
              }
            });
        }
      });
  }

  delete(data) {
    var config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
    this.notiSv.alertCode('SYS030').subscribe(async (x) => {
      if (x?.event?.status == 'Y') {
        this.api
          .execSv<any>(
            'WR',
            'ERM.Business.WR',
            'WorkOrderUpdatesBusiness',
            'DeleteAsync',
            [data.recID, this.transID]
          )
          .subscribe((res) => {
            if (res[0]) {
              let indx = this.lstUpdate.findIndex(
                (x) => x.recID == data?.recID
              );
              if (indx != -1) {
                this.lstUpdate.splice(indx, 1);
              }
              this.lstUpdate = JSON.parse(JSON.stringify(this.lstUpdate));
              let last = res[1];
              this.wrSv.listOrderUpdateSubject.next({
                e: this.lstUpdate,
                date: new Date(),
                update: last,
              });
              this.notiSv.notifyCode('SYS008');
              this.detectorRef.detectChanges();
            }
          });
      }
    });
  }
  //#endregion
}
