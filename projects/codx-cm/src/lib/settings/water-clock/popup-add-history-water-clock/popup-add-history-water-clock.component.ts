import { AfterViewInit, Component, OnInit, Optional, ViewChild } from '@angular/core';
import { ApiHttpService, CacheService, CodxFormComponent, DialogData, DialogRef, NotificationsService } from 'codx-core';
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
    this.data = JSON.parse(JSON.stringify(dialog?.dataService?.dataSelected));
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

  onSave() {

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
}
