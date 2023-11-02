import {
  Component,
  Input,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  CodxGridviewV2Component,
  DialogData,
  DialogRef,
  FormModel,
} from 'codx-core';
import { CodxFdService } from '../../codx-fd.service';

@Component({
  selector: 'lib-popup-wallet-history',
  templateUrl: './popup-wallet-history.component.html',
  styleUrls: ['./popup-wallet-history.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PopupWalletHistoryComponent implements OnInit {
  dialogData: any = null;
  dialogRef: DialogRef = null;

  @Input() view: any;
  @Input() grvSetup: any;
  @Input() editable: boolean = false;
  @Input() rowHeight: string = '50';
  @Input() showRowNumber: boolean = true;
  @Input() formModel: FormModel = null;
  @Input() modeView: 'wallet' | 'achievement' = 'wallet';

  @ViewChild('grid') grid: CodxGridviewV2Component;

  /* #region template */
  @ViewChild('colTransDateHeader') colTransDateHeader: TemplateRef<any>;
  @ViewChild('colTransTypeHeader') colTransTypeHeader: TemplateRef<any>;
  @ViewChild('colCardHeader') colCardHeader: TemplateRef<any>;
  @ViewChild('colEmployeeHeader') colEmployeeHeader: TemplateRef<any>;
  @ViewChild('colCoinsHeader') colCoinsHeader: TemplateRef<any>;
  @ViewChild('colCoCoinsHeader') colCoCoinsHeader: TemplateRef<any>;
  @ViewChild('colKudosHeader') colKudosHeader: TemplateRef<any>;

  @ViewChild('colTransDate') colTransDate: TemplateRef<any>;
  @ViewChild('colTransType') colTransType: TemplateRef<any>;
  @ViewChild('colCard') colCard: TemplateRef<any>;
  @ViewChild('colEmployee') colEmployee: TemplateRef<any>;
  @ViewChild('colCoins') colCoins: TemplateRef<any>;
  @ViewChild('colCoCoins') colCoCoins: TemplateRef<any>;
  @ViewChild('colKudos') colKudos: TemplateRef<any>;
  /* #endregion */

  entityName = 'FD_KudosTrans';
  service = 'FD';
  assemblyName = 'ERM.Business.FD';
  className = 'KudosTransBusiness';
  method = 'GetListHistoryKudosAsync';
  predicates = 'CreatedBy = @0';

  columnsGrid: any[];

  userID: string;
  headerText: string = 'Lịch sử';

  constructor(
    private api: ApiHttpService,
    private fdService: CodxFdService,
    private cache: CacheService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    this.dialogData = dialogData?.data;
    this.dialogRef = dialogRef;
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.setData();
    this.initColumnGrid();
  }

  setData() {
    if (this.dialogData) {
      ({
        userID: this.userID,
        formModel: this.formModel,
        modeView: this.modeView,
      } = this.dialogData);
    }
  }

  initColumnGrid() {
    if (this.modeView == 'wallet') {
      this.columnsGrid = [
        {
          headerTemplate: this.colTransDateHeader,
          template: this.colTransDate,
          width: '150',
        },
        {
          headerTemplate: this.colTransTypeHeader,
          template: this.colTransType,
          width: '100',
        },
        {
          headerTemplate: this.colCardHeader,
          template: this.colCard,
          width: '200',
        },
        {
          headerTemplate: this.colEmployeeHeader,
          template: this.colEmployee,
          width: '200',
        },
        {
          headerTemplate: this.colCoinsHeader,
          template: this.colCoins,
          width: '100',
        },
        {
          headerTemplate: this.colCoCoinsHeader,
          template: this.colCoCoins,
          width: '100',
        },
      ];
    } else if (this.modeView == 'achievement') {
      this.columnsGrid = [
        {
          headerTemplate: this.colTransDateHeader,
          template: this.colTransDate,
          width: '150',
        },
        {
          headerTemplate: this.colTransTypeHeader,
          template: this.colTransType,
          width: '100',
        },
        {
          headerTemplate: this.colCardHeader,
          template: this.colCard,
          width: '200',
        },
        {
          headerTemplate: this.colEmployeeHeader,
          template: this.colEmployee,
          width: '200',
        },
        {
          headerTemplate: this.colKudosHeader,
          template: this.colKudos,
          width: '100',
        },
      ];
    }
  }
}
