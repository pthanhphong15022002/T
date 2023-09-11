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
  CacheService,
  CallFuncService,
  CodxGridviewV2Component,
  DataRequest,
  DialogModel,
  FormModel,
  NotificationsService,
  Util,
} from 'codx-core';
import { Observable, finalize, map } from 'rxjs';
import { CodxWrService } from '../../../codx-wr.service';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import { PopupUpdateReasonCodeComponent } from '../../popup-update-reasoncode/popup-update-reasoncode.component';

@Component({
  selector: 'wr-view-tab-update',
  templateUrl: './view-tab-update.component.html',
  styleUrls: ['./view-tab-update.component.css'],
})
export class ViewTabUpdateComponent implements OnInit {
  @Input() transID: any;
  @Output() listChange = new EventEmitter<any>();
  @ViewChild('tempStatusCode') tempStatusCode: TemplateRef<any>;
  @ViewChild('tempComment') tempComment: TemplateRef<any>;
  @ViewChild('tempScheduleStart') tempScheduleStart: TemplateRef<any>;
  @ViewChild('tempScheduleTime') tempScheduleTime: TemplateRef<any>;
  @ViewChild('tempEngineerID') tempEngineerID: TemplateRef<any>;
  @ViewChild('createdBy') tempCreatedBy: TemplateRef<any>;

  @ViewChild('grid') grid: CodxGridviewV2Component;

  formModel: FormModel = {
    formName: 'WRWorkOrderUpdates',
    gridViewName: 'grvWRWorkOrderUpdates',
    entityName: 'WR_WorkOrderUpdates',
    funcID: 'WR0101',
  };
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
  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
    private wrSv: CodxWrService,
    private detectorRef: ChangeDetectorRef,
    private callFc: CallFuncService,
    private notiSv: NotificationsService
  ) {}

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

  ngOnInit(): void {
    // this.columnsGrid = [
    //   {
    //     field: 'statusCode',
    //     headerText: 'StatusCode',
    //     template: this.tempStatusCode,
    //     width: 180,
    //   },
    //   {
    //     field: 'comment',
    //     headerText: 'Comment',
    //     template: this.tempComment,
    //     width: 400,
    //   },
    //   {
    //     field: 'scheduleStart',
    //     headerText: 'ScheduleStart',
    //     template: this.tempScheduleStart,
    //     width: 100,
    //   },
    //   {
    //     field: 'scheduleTime',
    //     headerText: 'ScheduleTime',
    //     template: this.tempScheduleTime,
    //     width: 200,
    //   },
    //   {
    //     field: 'engineerID',
    //     headerText: 'EngineerID',
    //     template: this.tempEngineerID,
    //     width: 200,
    //   },
    //   {
    //     field: 'createdBy',
    //     headerText: 'CreatedBy',
    //     template: this.tempCreatedBy,
    //     width: 200,
    //   },
    // ];
    // this.getGridViewSetup();
  }

  getListOrderUpdate() {
    this.loaded = false;
    this.request.predicates = this.predicates;
    this.request.dataValues = this.transID;
    this.request.entityName = 'WR_WorkOrderUpdates';
    this.request.pageLoading = false;
    this.fetch().subscribe(async (item) => {
      this.lstUpdate = item;
      this.wrSv.listOrderUpdateSubject.next({
        e: this.lstUpdate,
        date: null,
        update: null,
      });
      this.loaded = true;
      // this.grid.refresh();
      // this.grid.dataSource = JSON.parse(JSON.stringify(this.lstUpdate));
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
      });
  }

  getColumsGrid(grvSetup) {
    this.columnsGrid = [];
    this.arrFieldIsVisible.forEach((key) => {
      let field = Util.camelize(key);
      let template: any;
      let colums: any;
      switch (key) {
        case 'Comment':
          template = this.tempComment;
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
  }

  //#region more
  clickMF(e, data) {
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
        break;
    }
    this.detectorRef.detectChanges();
  }

  changeDataMF(e, data) {
    if (e != null && data != null) {
      e.forEach((res) => {
        switch (res.functionID) {
          case 'SYS04':
            res.disabled = true;
            break;
          default:
            break;
        }
      });
    }
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
            gridViewSetup: res,
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
                  this.lstUpdate.push(Object.assign({}, data));
                }
                this.lstUpdate = JSON.parse(JSON.stringify(this.lstUpdate));
                this.wrSv.listOrderUpdateSubject.next({
                  e: this.lstUpdate,
                  date: new Date(),
                  update: null,
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
            'DeleteReasonCodeAsync',
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
