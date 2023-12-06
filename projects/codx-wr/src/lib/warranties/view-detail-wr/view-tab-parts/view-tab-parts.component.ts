import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  CRUDService,
  CacheService,
  CodxFormDynamicComponent,
  CodxGridviewV2Component,
  DataRequest,
  FormModel,
  SidebarModel,
  UIComponent,
  Util,
} from 'codx-core';
import { Observable, finalize, map } from 'rxjs';
import { CodxWrService } from '../../../codx-wr.service';
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'wr-view-tab-parts',
  templateUrl: './view-tab-parts.component.html',
  styleUrls: ['./view-tab-parts.component.scss'],
})
export class ViewTabPartsComponent extends UIComponent {
  @Input() transID: any;
  @Input() isShow: boolean;
  @Output() listChange = new EventEmitter<any>();
  @ViewChild('grid') grid: CodxGridviewV2Component;

  @ViewChild('headerPartInfo') headerPartInfo: TemplateRef<any>;
  @ViewChild('tempPartInfo') tempPartInfo: TemplateRef<any>;
  @ViewChild('headerQuantity') headerQuantity: TemplateRef<any>;
  @ViewChild('tempQuantity') tempQuantity: TemplateRef<any>;
  @ViewChild('headerStatus') headerStatus: TemplateRef<any>;
  @ViewChild('tempStatus') tempStatus: TemplateRef<any>;
  // @ViewChild('headerNote') headerNote: TemplateRef<any>;
  // @ViewChild('tempNote') tempNote: TemplateRef<any>;

  formModel: FormModel = {
    formName: 'WRWorkOrderParts',
    gridViewName: 'grvWRWorkOrderParts',
    entityName: 'WR_WorkOrderParts',
    funcID: 'WR0101_2',
  };
  lstParts = [];
  columnsGrid = [];
  loaded: boolean;
  request = new DataRequest();
  predicates = 'TransID=@0';
  dataValues = '';
  vllStatus = '';
  service = 'WR';
  currentRecID = '';
  assemblyName = 'ERM.Business.WR';
  className = 'WorkOrderPartsBusiness';
  method = 'LoadDataAsync';
  id: any;
  grvSetupWorkOrderParts: any;
  arrFieldIsVisible: any[];
  dataSelected: any;
  titleAction = '';
  function: any = {};
  constructor(
    private wrSv: CodxWrService,
    private codxShareService: CodxShareService,
    private inject: Injector
  ) {
    super(inject);
    this.cache
      .gridViewSetup(this.formModel.formName, this.formModel.gridViewName)
      .subscribe((res) => {
        this.grvSetupWorkOrderParts = res;
        this.vllStatus =
          this.grvSetupWorkOrderParts['Status'].referedValue ?? this.vllStatus;
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['transID']) {
      if (
        changes['transID'].currentValue != null &&
        changes['transID']?.currentValue?.trim() != ''
      ) {
        if (changes['transID']?.currentValue == this.id) return;
        this.id = changes['transID']?.currentValue;
        this.getListOrderParts();
      } else {
        if (!this.loaded) this.loaded = true;
      }
    }
  }

  onInit(): void {
  }

  ngAfterViewInit(): void {
    this.detectorRef.detectChanges();
  }

  getListOrderParts() {
    this.loaded = false;
    this.request.predicates = this.predicates;
    this.request.dataValues = this.transID;
    this.request.entityName = 'WR_WorkOrderParts';
    this.request.pageLoading = false;
    this.fetch().subscribe(async (item) => {
      this.loaded = true;
      this.lstParts = item;
      if (this.grid) {
        this.grid.dataSource = this.lstParts;
      }
      // {
      //   headerTemplate: this.headerQuantity,
      //   template: this.tempQuantity,
      //   width: 150,
      // },
      // {
      //   headerTemplate: this.headerStatus,
      //   template: this.tempStatus,
      //   width: 250,
      // },
      // {
      //   headerTemplate: this.headerNote,
      //   template: this.tempNote,
      //   width: 150,
      // },
      // this.wrSv.listOrderPartsSubject.next(this.lstParts);
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

  getColumsGrid(grvSetup) {
    this.columnsGrid = [];
    this.arrFieldIsVisible.forEach((key) => {
      let field = Util.camelize(key);
      let template: any;
      let column: any;

      switch (key) {
        case 'Qty':
          template = this.tempQuantity;
          break;
        case 'Status':
          template = this.tempStatus;
          break;
      }

      if (template) {
        column = {
          field: field,
          headerText: grvSetup[key].headerText,
          width: grvSetup[key].width,
          template: template,
        };
      } else {
        column = {
          field: field,
          headerText: grvSetup[key].headerText,
          width: grvSetup[key].width,
        };
      }

      this.columnsGrid.push(column);
    });
    var colums = {
      field: 'partInfo',
      headerTemplate: this.headerPartInfo,
      template: this.tempPartInfo,
      width: 400,
    };
    this.columnsGrid.unshift(colums);
  }

  //#region more
  async clickMF(e, data) {
    this.function = e;
    this.dataSelected = data;
    this.titleAction = e.text;
    switch (e.functionID) {
      case 'SYS03':
        this.edit(data);
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
          case 'SYS02':
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

  //#region more

  edit(data) {
    let tempData = JSON.parse(JSON.stringify(data));
    var dataService = new CRUDService(this.inject);
    let request = new DataRequest(
      this.formModel.formName,
      this.formModel?.gridViewName,
      this.formModel?.entityName
    );
    request.funcID = this.formModel?.funcID;
    dataService.service = 'WR';
    dataService.request = request;
    dataService.dataSelected = tempData;
    dataService.updateDatas.set(tempData.recID, tempData);
    let option = new SidebarModel();
    option.FormModel = this.formModel;
    option.Width = '550px';
    let dialogAdd = this.callfc.openSide(
      CodxFormDynamicComponent,
      {
        formModel: option.FormModel,
        data: tempData,
        function: this.function,
        dataService: dataService,
        titleMore: this.titleAction,
        isAddMode: false,
      },
      option
    );
    dialogAdd.closed.subscribe((e) => {
      if(e && e?.event && e?.event?.update){
        var data = e?.event?.update?.data;
        let idx = this.lstParts.findIndex(
          (x) => x.recID == data.recID
        );
        if (idx != -1) {
          this.lstParts[idx] = data;
        }
        this.lstParts = JSON.parse(JSON.stringify(this.lstParts));
      }
    });
  }
  //#endregion
}
