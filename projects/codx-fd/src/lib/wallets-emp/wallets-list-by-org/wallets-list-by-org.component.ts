import {
  ChangeDetectorRef,
  Component,
  Input,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  CodxGridviewV2Component,
  CodxService,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { PopupWalletHistoryComponent } from '../popup-wallet-history/popup-wallet-history.component';
import { CodxFdService } from '../../codx-fd.service';

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
  @Input() modeView: 'wallet' | 'achievement' = 'wallet';
  @Input() rowHeight: string = '50';
  @Input() showRowNumber: boolean = true;
  @Input() funcID: string = 'HRT03a1';

  @ViewChild('grid') grid: CodxGridviewV2Component;

  @ViewChild('colEmployeeHeader') colEmployeeHeader: TemplateRef<any>;
  @ViewChild('colJoinedOnHeader') colJoinedOnHeader: TemplateRef<any>;
  @ViewChild('colCoinsHeader') colCoinsHeader: TemplateRef<any>;
  @ViewChild('colCoCoinsHeader') colCoCoinsHeader: TemplateRef<any>;
  @ViewChild('colKudosHeader') colKudosHeader: TemplateRef<any>;
  @ViewChild('colEmployee') colEmployee: TemplateRef<any>;
  @ViewChild('colJoinedOn') colJoinedOn: TemplateRef<any>;
  @ViewChild('colCoins') colCoins: TemplateRef<any>;
  @ViewChild('colCoCoins') colCoCoins: TemplateRef<any>;
  @ViewChild('colKudos') colKudos: TemplateRef<any>;

  entityName = 'FD_Wallets';
  service = 'FD';
  assemblyName = 'ERM.Business.FD';
  className = 'WalletsBusiness';
  method = 'GetWalletsTreeMasterAsync';
  idField = 'employeeID';
  predicates = '@0.Contains(OrgUnitID)';

  columnsGrid: any[];
  itemSelected: any;
  policyID: string;

  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    private dt: ChangeDetectorRef,
    private callfc: CallFuncService,
    private shareService: CodxShareService,
    private codxService: CodxService,
    private fdService: CodxFdService,
    private notiService: NotificationsService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.orgUnitID.currentValue) {
      this.orgUnitID = changes.orgUnitID.currentValue;
      if (this.grid) {
        this.grid.dataService.rowCount = 0;
        this.grid.dataService.request.dataValues = this.orgUnitID;
        this.grid.dataValues = this.orgUnitID;
        this.grid.refresh();
      }
    }
  }

  ngOnInit(): void {
    this.getPolicy();
  }

  ngAfterViewInit(): void {
    this.initColumnGrid();
  }

  getPolicy() {
    const predicates = 'Category = @0 and ApplyFor = @1 and ItemType = @2';
    let dataValue = '';
    if (this.modeView == 'wallet') {
      dataValue = '3;5;4';
    } else if (this.modeView == 'achievement') {
      dataValue = '3;4;4';
    }
    this.fdService
      .getListPolicyByPredicate(predicates, dataValue)
      .subscribe((res) => {
        if (res) {
          this.policyID = res[0]?.policyID;
        }
      });
  }

  initColumnGrid() {
    if (this.modeView == 'wallet') {
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
    } else if (this.modeView == 'achievement') {
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
          headerTemplate: this.colKudosHeader,
          template: this.colKudos,
          width: '150',
        },
      ];
    }
  }

  clickMF(moreFunc: any, data: any) {
    this.itemSelected = data;
    if (moreFunc.functionID == 'FDK0111' || moreFunc.functionID == 'FDW0111') {
      // xem lịch sử xu hoặc điểm
      this.openPopupHistory(data);
    } else if (moreFunc.functionID == 'FDW0112') {
      // kích hoạt ví
      this.fdService
        .activeWallet(this.itemSelected.domainUser)
        .subscribe((res) => {
          if (res) this.notiService.notifyCode('SYS007');
        });
    } else if (
      moreFunc.functionID == 'FDW0113' ||
      moreFunc.functionID == 'FDK0112'
    ) {
      // chạy lại số dư
      let refreshType = '';
      if (this.modeView == 'wallet') {
        refreshType = '2';
      } else if (this.modeView == 'achievement') {
        refreshType = '3';
      }
      this.fdService
        .refreshWallet(refreshType, this.policyID, this.itemSelected.domainUser)
        .subscribe((res) => {
          if (res) this.notiService.notifyCode('SYS007');
        });
    }
  }

  openPopupHistory(item) {
    var obj = {
      userID: item.domainUser,
      formModel: this.formModel,
      modeView: this.modeView,
    };

    let popup = this.callfc.openForm(
      PopupWalletHistoryComponent,
      '',
      1400,
      1500,
      '',
      obj,
      ''
    );
    popup.closed.subscribe((res: any) => {
      if (!res || res.closedBy == 'escape' || !res.event) return;
    });
  }
}
