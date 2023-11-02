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

  @ViewChild('grid') grid: CodxGridviewV2Component;

  /* #region template */
  @ViewChild('colTransDateHeader') colTransDateHeader: TemplateRef<any>;
  @ViewChild('colTransTypeHeader') colTransTypeHeader: TemplateRef<any>;
  @ViewChild('colCardHeader') colCardHeader: TemplateRef<any>;
  @ViewChild('colEmployeeHeader') colEmployeeHeader: TemplateRef<any>;
  @ViewChild('colCoinsHeader') colCoinsHeader: TemplateRef<any>;
  @ViewChild('colCoCoinsHeader') colCoCoinsHeader: TemplateRef<any>;

  @ViewChild('colTransDate') colTransDate: TemplateRef<any>;
  @ViewChild('colTransType') colTransType: TemplateRef<any>;
  @ViewChild('colCard') colCard: TemplateRef<any>;
  @ViewChild('colEmployee') colEmployee: TemplateRef<any>;
  @ViewChild('colCoins') colCoins: TemplateRef<any>;
  @ViewChild('colCoCoins') colCoCoins: TemplateRef<any>;
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

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.cache.valueList('FD015').subscribe(res => {
      const listCardType = res;
    });
    this.setData();
    this.initColumnGrid();
  }

  setData() {
    if (this.dialogData) {
      ({ userID: this.userID, formModel: this.formModel } = this.dialogData);
    }
  }

  initColumnGrid() {
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
  }
}
