import { ChangeDetectorRef, Component, Input, SimpleChanges, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  CodxGridviewV2Component,
  CodxService,
  FormModel,
} from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'lib-wallets-list-by-org',
  templateUrl: './wallets-list-by-org.component.html',
  styleUrls: ['./wallets-list-by-org.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class WalletsListByOrgComponent {
  @Input() orgUnitID: string = '';
  @Input() formModel: FormModel = null;
  @Input() showManager: boolean = false;
  @Input() view: any;
  @Input() grvSetup: any;
  @Input() editable: boolean = false;
  @Input() modeView: string = 'employee';
  @Input() rowHeight: string = '50';
  @Input() showRowNumber: boolean = true;
  @Input() funcID: string = 'HRT03a1';

  @ViewChild('grid') grid: CodxGridviewV2Component;

  @ViewChild('colEmployeeHeader') colEmployeeHeader: TemplateRef<any>;
  @ViewChild('colJoinedOnHeader') colJoinedOnHeader: TemplateRef<any>;
  @ViewChild('colCoinsHeader') colCoinsHeader: TemplateRef<any>;
  @ViewChild('colCoCoinsHeader') colCoCoinsHeader: TemplateRef<any>;
  @ViewChild('colEmployee') colEmployee: TemplateRef<any>;
  @ViewChild('colJoinedOn') colJoinedOn: TemplateRef<any>;
  @ViewChild('colCoins') colCoins: TemplateRef<any>;
  @ViewChild('colCoCoins') colCoCoins: TemplateRef<any>;

  entityName = 'FD_Wallets';
  service = 'FD';
  assemblyName = 'ERM.Business.FD';
  className = 'WalletsBusiness';
  method = 'GetWalletsTreeMasterAsync';
  idField = 'employeeID';
  predicates = '@0.Contains(OrgUnitID)';

  columnsGrid: any[];
  itemSelected: any;


  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    private dt: ChangeDetectorRef,
    private callfc: CallFuncService,
    private shareService: CodxShareService,
    private codxService: CodxService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.orgUnitID.currentValue){
      this.orgUnitID = changes.orgUnitID.currentValue;
      if (this.grid) {
        this.grid.dataService.rowCount = 0;
        this.grid.dataService.request.dataValues = this.orgUnitID;
        this.grid.dataValues = this.orgUnitID;
        this.grid.refresh();
      }
    }

  }

  ngAfterViewInit(): void {
    this.initColumnGrid();
  }

  initColumnGrid() {
    this.columnsGrid = [
      {
        headerTemplate: this.colEmployeeHeader,
        template: this.colEmployee,
        width: '200',
      },
      {
        headerTemplate: this.colJoinedOnHeader,
        template: this.colJoinedOn,
        width: '150',
      },
      {
        headerTemplate: this.colCoinsHeader,
        template: this.colCoins,
        width: '150',
      },
      {
        headerTemplate: this.colCoCoinsHeader,
        template: this.colCoCoins,
        width: '150',
      },
    ];
  }

  clickMF(moreFunc: any, data: any) {
    this.itemSelected = data;
    // switch (moreFunc.functionID) {
    //   case 'SYS02': // xóa
    //     this.delete(data);
    //     break;
    //   case 'SYS03': // sửa
    //     this.edit(data, moreFunc);
    //     break;
    //   case 'SYS04': // sao chép
    //     this.copy(data, moreFunc);
    //     break;
    //   case 'HRT03a1A07': // cập nhật tình trạng
    //     this.updateStatus(data, moreFunc.functionID);
    //     break;
    //   default:
    //     this.shareService.defaultMoreFunc(
    //       moreFunc,
    //       data,
    //       null,
    //       this.view.formModel,
    //       this.view.dataService,
    //       this
    //     );
    //     break;
    // }
  }
}
