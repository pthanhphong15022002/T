import { DataRequest } from './../../../../../../src/shared/models/data.request';
import {
  Component,
  ElementRef,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  DialogData,
  DialogRef,
  ApiHttpService,
  CodxFormComponent,
  CodxGridviewV2Component,
  FormModel,
  Util,
} from 'codx-core';

@Component({
  selector: 'lib-voucher',
  templateUrl: './voucher.component.html',
  styleUrls: ['./voucher.component.css'],
})
export class VoucherComponent implements OnInit {
  //#region Constructor
  dialog!: DialogRef;
  setting: any;
  vouchers: Array<any> = [];
  gridModel: DataRequest = new DataRequest();
  gridHeight: number = 0;
  formModel: FormModel = {
    gridViewName: 'grvSubLedgerOpen',
    formName: 'SubLedgerOpen',
    entityName: 'AC_SubLedgerOpen',
  };

  sublegendOpen: Array<any> = [];

  @ViewChild('grid') public grid: CodxGridviewV2Component;
  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('cardbodyRef') cardbodyRef: ElementRef;
  @ViewChild('cashRef') cashRef: ElementRef;

  constructor(
    private api: ApiHttpService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    this.dialog = dialog;
    this.setting = dialogData.data;
  }
  //#region Constructor

  //#region Init
  ngOnInit(): void {
    this.gridModel.comboboxName = this.setting.comboboxName;
    this.gridModel.pageSize = 20;
    this.gridModel.page = 1;
    this.api
      .execSv<any>(
        'AC',
        'Core',
        'DataBusiness',
        'LoadDataCbxAsync',
        this.gridModel
      )
      .subscribe((res) => {
        if (res && res.length) {
          let data = [];
          let p = JSON.parse(res[0]);
          for (let i = 0; i < p.length; i++) {
            data.push(Util.camelizekeyObj(p[i]));
          }
          this.sublegendOpen = data;
        }
      });
  }
  //#endregion

  //#region Event
  valueChange(e: any) {}

  gridCreated(e) {
    let hBody, hTab;
    if (this.cardbodyRef)
      hBody = this.cardbodyRef.nativeElement.parentElement.offsetHeight;
    if (this.cashRef) hTab = (this.cashRef as any).element.offsetHeight;

    this.gridHeight = hBody - (hTab + 120);
  }

  //#endregion
}
