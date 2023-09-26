import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { ApiHttpService, DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-popup-add-campaign-contact',
  templateUrl: './popup-add-campaign-contact.component.html',
  styleUrls: ['./popup-add-campaign-contact.component.css'],
})
export class PopupAddCampaignContactComponent implements OnInit {
  @ViewChild('cbxProvince') cbxProvince: any;
  @ViewChild('cbxDistrict') cbxDistrict: any;
  @ViewChild('cbxIndustries') cbxIndustries: any;
  @ViewChild('cbxStatus') cbxStatus: any;

  dialog: any;
  data: any;
  transID: any;
  lstCampainsAdd = []; //Add new
  lstCampainsHadAdd = []; //Lst đã có.
  objectType = '';
  titleAction = '';
  provinceIDs = [];
  districtIDs = [];
  industries = [];
  status = [];
  isProvince: boolean = false;
  isDistrict: boolean = false;
  isIndustries: boolean = false;
  isStatus: boolean = false;
  countLeadCus = 0; //Số lượng được tìm thấy
  countHadLeadCus = 0; // Số lượng đã có trong chiến dịch
  countAdd = 0; //Số lượng sẽ được thêm

  countChange = 0; //Để check lần change
  constructor(
    private detector: ChangeDetectorRef,
    private api: ApiHttpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.titleAction = dt?.data?.title;
    this.transID = dt?.data?.transID;
    this.objectType = dt?.data?.objectType;
  }
  ngOnInit(): void {
    if (this.lstCampainsHadAdd == null || this.lstCampainsHadAdd.length == 0) {
      this.api
        .execSv<any>(
          'CM',
          'ERM.Business.CM',
          'CampaignsBusiness',
          'GetCampaignContactsByTransIDAsync',
          [this.transID, this.objectType]
        )
        .subscribe((res) => {
          if (res) {
            this.lstCampainsHadAdd = res[0] ?? [];
            this.countHadLeadCus = res[1];
          }
        });
    }
  }

  //#region save
  onSave() {}
  //#endregion

  //#region change

  valueChange(e) {
    if (e) {
      this[e?.field] = e?.data;
      switch (e?.field) {
        case 'isProvince':
          if (!this.isProvince) {
            if (this.cbxProvince) {
              this.cbxProvince.value = [];
              this.cbxProvince.selectedItems = [];
              this.cbxProvince.setValue([]);
            }
            this.provinceIDs = [];
            this.bindingCountCompaign();
          }
          break;
        case 'isDistrict':
          if (!this.isDistrict) {
            this.districtIDs = [];
            this.bindingCountCompaign();
          }
          break;
        case 'isIndustries':
          if (!this.isIndustries) {
            this.industries = [];
            this.bindingCountCompaign();
          }
          break;
        case 'isStatus':
          if (!this.isStatus) {
            this.status = [];
            this.bindingCountCompaign();
          }
          break;
        default:
          this.bindingCountCompaign();
          break;
        // case 'districtIDs':
        //   break;
        // case 'industries':
        //   break;
        // case 'status':
        //   break;
      }
    }

    this.detector.detectChanges();
  }

  bindingCountCompaign() {
    this.api
      .execSv<any>(
        'CM',
        'ERM.Business.CM',
        'LeadsBusiness',
        'GetLeadOrCustomersAsync',
        [
          this.objectType,
          this.provinceIDs,
          this.districtIDs,
          this.industries,
          this.status,
        ]
      )
      .subscribe((res) => {
        if (res) {
          let lstAllSearchs = res[0];
          this.countLeadCus = res[1];
        } else {
          let lstAllSearchs = [];
          this.countLeadCus = 0;
        }
      });
  }
  //#endregion
}
