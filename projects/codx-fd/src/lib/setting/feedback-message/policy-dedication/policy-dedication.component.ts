import { Component, OnInit, Injector, ChangeDetectorRef, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TenantStore, UIComponent } from 'codx-core';

@Component({
  selector: 'app-policy-dedication',
  templateUrl: './policy-dedication.component.html',
  styleUrls: ['./policy-dedication.component.scss']
})
export class PolicyDedicationComponent extends UIComponent implements OnInit {
  funcID: any;
  tenant: string;
  constructor(
    private change: ChangeDetectorRef,
    private tenantStore: TenantStore,
    private at: ActivatedRoute,
    injector: Injector,
  ) {
    super(injector);
    this.tenant = this.tenantStore.get()?.tenant;
  }

  onInit(): void {
    this.at.queryParams.subscribe(params => {
      if(params.funcID){
        this.funcID = params.funcID;
        };
      });
    this.LoadData();
  }
  @Input() typeCard: string;
  categoryID: string = "2";
  policyDedicationList = [];
  addPolicy() {
    // alert('Tính năng đang phát triển ở version kế tiếp');
  }
  LoadData() {
    let applyFor = "2";
    this.api
      .call(
        "ERM.Business.FED",
        "SettingsBusiness",
        "GetDataForPolicyCoinDedicationAsync",
        [this.typeCard, this.categoryID,applyFor]
      )
      .subscribe((res) => {
        if (res && res.msgBodyData.length > 0) {
          this.policyDedicationList = res.msgBodyData[0];
          this.change.detectChanges();
        }
      });

  }
  onSaveStatusPolicy(data){
    this.api
      .execSv<any>(
        "FED",
        "ERM.Business.FED",
        "WalletsBusiness",
        "OnSavePolicySettingWalletAsync",
        [data.field]
      )
      .subscribe((res) => {
      });
  }

  LoadDetailPolicy(recID) {
    // this.router.navigate(["/" + this.tenant + "/fed/detailpolicy"], { queryParams: { type: "dedication", cardtype: this.typeCard,funcID:this.funcID,recID:recID } });
  }
}
