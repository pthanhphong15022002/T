import { count } from 'console';
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
import { WR_Products, WR_WorkOrders } from '../../_models-wr/wr-model.model';
import { CodxWrService } from '../../codx-wr.service';

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
  data: any;
  dialog: DialogRef;
  title = '';
  gridViewSetup: any;
  addProduct: boolean = false; // true - form product, false - form add serviceTag
  radioAddEdit: boolean = true; //true - edit, false - add
  recID: any;
  countValidate = 0;
  constructor(
    private notiService: NotificationsService,
    private api: ApiHttpService,
    private changeDetector: ChangeDetectorRef,
    private wrSv: CodxWrService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.title = dt?.data?.title;
    this.data = JSON.parse(JSON.stringify(dt?.data?.data));
    this.gridViewSetup = dt?.data?.gridViewSetup;
    this.addProduct = dt?.data?.addProduct ?? false;
    this.recID = dt?.data?.recID; //recID để lấy data workOrder
  }
  ngOnInit(): void {
    if (!this.addProduct) {
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
    } else {
      this.api
        .execSv<any>('WR', 'WR', 'ProductsBusiness', 'GetOneAsync', [
          this.data.productID,
        ])
        .subscribe(async (res) => {
          if (res) {
            this.data = res;
          }else{
            const defaultData = await firstValueFrom(this.wrSv.getDefault('WR','WRS0103','WR_Products'));
            if(defaultData?.data){
              let product = defaultData?.data;
              product.productID = this.data?.productID ?? product.productID;
              product.productName = this.data?.productName;
              product.productType = this.data?.productType;
              product.productBrand = this.data?.productBrand;
              product.productModel = this.data?.productModel;
              this.data = product;
            }
          }
          this.form?.formGroup?.patchValue(this.data);
        });
    }
  }

  //#region onSave
  async onSave() {
    if (!this.addProduct) {
      this.addServiceTags();
    } else {
      this.addEditProduct();
    }
  }

  async addServiceTags() {
    if (this.data?.serviceTag == null || this.data?.serviceTag?.trim() == '') {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup?.ServiceTag?.headerText + '"'
      );
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
      this.notiService.notifyCode(
        'WR001',
        null,
        "'" + this.gridViewSetup?.ServiceTag?.headerText + "'"
      );
      return;
    }

    this.data.seriNo = this.data.serviceTag;
    this.dialog.close(this.data);
    this.data = null;
  }

  addEditProduct() {
    this.countValidate = this.wrSv.checkValidate(this.gridViewSetup, this.data);
    if (this.countValidate > 0) {
      return;
    }
    this.api
      .execSv<any>(
        'WR',
        'WR',
        'WorkOrdersBusiness',
        'UpdateProductWorkOrderAsync',
        [this.recID, this.data]
      )
      .subscribe((res) => {
        if (res) {
          this.dialog.close(res);
          this.notiService.notifyCode('SYS007');
        } else {
          this.notiService.notifyCode('SYS021');
          this.dialog.close();
        }
      });
  }
  //#endregion

  valueChange(e) {
    if (e?.field == 'productID' && !this.addProduct) {
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

    this.changeDetector.detectChanges();
  }

  valueChangeDate(e) {
    if (e?.data) {
      this.data.warrantyExpired = new Date(e?.data);
      if (this.data.warrantyExpired > new Date()) {
        this.data.oow = true;
      } else {
        this.data.oow = false;
      }
    }

    this.changeDetector.detectChanges();
  }
}
