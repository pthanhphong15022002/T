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
  ApiHttpService,
  CacheService,
  CodxGridviewV2Component,
  DataRequest,
  FormModel,
  Util,
} from 'codx-core';
import { Observable, finalize, map } from 'rxjs';
import { CodxWrService } from '../../../codx-wr.service';

@Component({
  selector: 'wr-view-tab-parts',
  templateUrl: './view-tab-parts.component.html',
  styleUrls: ['./view-tab-parts.component.scss'],
})
export class ViewTabPartsComponent implements OnInit {
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

  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
    private wrSv: CodxWrService,
    private detectorRef: ChangeDetectorRef
  ) {
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

  ngOnInit(): void {}

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
      if(this.grid){
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

    this.columnsGrid.unshift({
      headerTemplate: this.headerPartInfo,
      template: this.tempPartInfo,
      width: 400,
    });
  }
}
