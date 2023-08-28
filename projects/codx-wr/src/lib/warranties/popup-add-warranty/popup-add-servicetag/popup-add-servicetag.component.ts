import { firstValueFrom } from 'rxjs';
import {
  Component,
  Optional,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  CodxComboboxComponent,
  CodxFormComponent,
  CodxInputComponent,
  DialogData,
  DialogRef,
  NotificationsService,
} from 'codx-core';
import { WR_WorkOrders } from '../../../_models-wr/wr-model.model';

@Component({
  selector: 'lib-popup-add-servicetag',
  templateUrl: './popup-add-servicetag.component.html',
  styleUrls: ['./popup-add-servicetag.component.css'],
})
export class PopupAddServicetagComponent implements OnInit {
  @ViewChild('productType') productType: CodxInputComponent;
  @ViewChild('productBrand') productBrand: CodxInputComponent;
  @ViewChild('productModel') productModel: CodxInputComponent;

  @ViewChild('form') form: CodxFormComponent;
  data: WR_WorkOrders;
  dialog: DialogRef;
  title = '';
  constructor(
    private notiService: NotificationsService,
    private api: ApiHttpService,
    private changeDetector: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.title = dt?.data?.title;
    this.data = JSON.parse(JSON.stringify(dt?.data?.data));
  }
  ngOnInit(): void {
    this.data.seriNo = '';
    this.data.serviceTag = '';
    this.data.lob = '';
    this.data.productID = '';
    this.data.productType = '';
    this.data.productModel = '';
    this.data.productBrand = '';
    this.data.productDesc = '';
    this.data.note = '';
    this.data.warrantyExpired = null;
  }

  //#region onSave
  async onSave() {
    if (this.data?.serviceTag == null || this.data?.serviceTag?.trim() == '') {
      return;
    }
    let isExit = await firstValueFrom(
      this.api.execSv<any>(
        'WR',
        'ERM.Business.WR',
        'ServiceTagsBusiness',
        'IsExitServiceTagAsync',
        [this.data?.serviceTag]
      )
    );

    if (isExit) {
      this.notiService.notifyCode('Trùng serviceTag');
      return;
    }

    this.data.seriNo = this.data.serviceTag;
    this.dialog.close(this.data);
  }
  //#endregion

  valueChange(e) {
    if (this.data[e?.field] != e?.data) {
      this.data[e?.field] = e?.data;
      if (e?.field == 'productID') {
        this.data.productType = e?.component?.itemsSelected[0]?.ProductType;
        if (
          this.data?.productType == null ||
          this.data?.productType?.trim() == ''
        ) {
          (
            this.productType.ComponentCurrent as CodxComboboxComponent
          ).dataService.data = [];
          this.productType.crrValue = null;
        }
        this.data.productBrand = e?.component?.itemsSelected[0]?.ProductBrand;
        if (
          this.data?.productBrand == null ||
          this.data?.productBrand?.trim() == ''
        ) {
          (
            this.productBrand.ComponentCurrent as CodxComboboxComponent
          ).dataService.data = [];
          this.productBrand.crrValue = null;
        }
        this.data.productModel = e?.component?.itemsSelected[0]?.ProductModel;
        if (
          this.data?.productModel == null ||
          this.data?.productModel?.trim() == ''
        ) {
          (
            this.productModel.ComponentCurrent as CodxComboboxComponent
          ).dataService.data = [];
          this.productModel.crrValue = null;
        }
        this.form.formGroup.patchValue(this.data);
      }
    }
    this.changeDetector.detectChanges();
  }

  valueChangeDate(e) {
    if (e?.data) {
      this.data.warrantyExpired = e?.data?.fromDate;
      if (this.data.warrantyExpired > new Date()) {
        this.data.oow = true;
      } else {
        this.data.oow = false;
      }
    }
    this.changeDetector.detectChanges();
  }
}
