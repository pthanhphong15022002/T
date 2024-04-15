import { AfterViewInit, Component, OnInit, Optional, ViewChild } from '@angular/core';
import { ApiHttpService, CRUDService, CacheService, CodxFormComponent, DialogData, DialogRef, NotificationsService, RequestOption } from 'codx-core';
import { CodxCmService } from '../../../codx-cm.service';

@Component({
  selector: 'lib-popup-add-history-water-clock',
  templateUrl: './popup-add-history-water-clock.component.html',
  styleUrls: ['./popup-add-history-water-clock.component.css']
})
export class PopupAddHistoryWaterClockComponent implements OnInit, AfterViewInit {
  @ViewChild('form') form: CodxFormComponent;


  dialog: any;
  gridViewSetup: any;

  action: string = '';
  headerText: string = "Chốt chỉ số đồng hồ nước";
  valueList: string = '';
  objectStatus: string = '';
  planceHolderAutoNumber: string = '';
  disabledShowInput = false;
  valueListStatus: any[] = [];
  data: any;
  arrFieldForm: any[];
  validate = 0;
  viewOnly = false;
  parentID: any;
  oldAssetId: any;
  siteIDOldData: any;
  loadedCus: boolean = false;
  oldRef = '';
  siteIDOld = '';
  isWaterClock = false;
  parent: any
  constructor(
    private cache: CacheService,
    private notiService: NotificationsService,
    private codxCmService: CodxCmService,
    private api: ApiHttpService,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    this.dialog = dialog;
    this.data = JSON.parse(JSON.stringify(dt?.data.data));
    this.headerText = dt?.data?.headerText;
    this.action = dt?.data?.action;
    this.parent = dt?.data?.parent;
    this.gridViewSetup = dt?.data?.gridViewSetup;

    this.viewOnly = this.action == 'view';
  }
  ngAfterViewInit(): void {

  }
  ngOnInit(): void {

  }

  valueChange(e) {
    if (e.field) {
      this.data[e.field] = e.data;
    }
    switch (e.field) {
      case 'quantity':
        this.data['cumulatedDepr'] = this.data['quantity'] - this.parent['quantity'];
        this.data['costAmt'] = this.data['cumulatedDepr'] * 1000;//this.data['purcAmount'] //test
        // if (this.data['deprRate'] && this.data['cumulatedDepr']) {
        //   this.data['estimatedCapacity'] = this.data['cumulatedDepr'] / 100 * this.data['deprRate'];
        //   this.data['capacityPrice'] = this.data['estimatedCapacity'] * this.data['capacityUsed']
        // } else {
        //   this.data['estimatedCapacity'] = 0;
        //   this.data['capacityPrice'] = 0
        // }
        break;
      case 'deprRate':

        break;
    }
    if (this.data['deprRate'] && this.data['cumulatedDepr']) {
      this.data['estimatedCapacity'] = this.data['cumulatedDepr'] / 100 * this.data['deprRate'];
      this.data['capacityPrice'] = this.data['estimatedCapacity'] * 1000 // this.data['capacityUsed'] //test
    } else {
      this.data['estimatedCapacity'] = 0;
      this.data['capacityPrice'] = 0
    }
    this.form.formGroup.patchValue(this.data)
  }

  onSave() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    }
    if (this.action == 'add' || this.action == 'copy') {
      this.onAdd();
    } else {
      this.onUpdate();
    }
  }

  onAdd() {
    this.api.exec<any>("AM", "AssetsBusiness", "SaveWaterClockAsync", this.data)
      .subscribe((res) => {
        if (res) {

          this.parent.indexLastMonth = this.parent.quantity;
          this.parent.quantity = res.quantity;
          this.parent.lastChangedDate = res.lastChangedDate;
          this.parent.cumulatedDepr = res.cumulatedDepr;
          this.parent.costAmt = res.costAmt;
          this.parent.estimatedCapacity = res.estimatedCapacity;
          this.parent.capacityPrice = res.capacityPrice;
          this.parent.note = res.note;
          (this.dialog.dataService as CRUDService).update(this.parent).subscribe();

          this.dialog.close(res);
        }
      });
  }

  onUpdate() {
    this.api.exec<any>("AM", "AssetsBusiness", "UpdateWaterClockAsync", this.data)
      .subscribe((res) => {
        if (res) {

          this.parent.indexLastMonth = this.parent.quantity;
          this.parent.quantity = res.quantity;
          this.parent.lastChangedDate = res.lastChangedDate;
          this.parent.cumulatedDepr = res.cumulatedDepr;
          this.parent.costAmt = res.costAmt;
          this.parent.estimatedCapacity = res.estimatedCapacity;
          this.parent.capacityPrice = res.capacityPrice;
          this.parent.note = res.note;
          (this.dialog.dataService as CRUDService)
            .update(this.parent)
            .subscribe();
          this.dialog.close(res);
        }
      });
  }
  // beforeSave(op: RequestOption) {
  //   op.service = 'AM';
  //   op.assemblyName = 'ERM.Business.AM';
  //   op.className = 'AssetsBusiness';
  //   let data = [];
  //   if (this.action == 'add' || this.action == 'copy') {
  //     op.methodName = 'SaveWaterClockAsync';
  //     data = [this.data];
  //   } else if (this.action == 'edit') {
  //     op.methodName = 'UpdateWaterClockAsync';
  //     data = [this.data, this.oldAssetId];
  //   }
  //   op.data = data;
  //   return true;
  // }
  checkValidate() {
    //check điều kiện gì đây Khanh
    return true;
  }
}
