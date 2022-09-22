import { Component, OnInit, Input, ChangeDetectorRef, Injector } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TenantStore, UIComponent } from 'codx-core';

@Component({
  selector: 'app-policy-coin',
  templateUrl: './policy-coin.component.html',
  styleUrls: ['./policy-coin.component.scss']
})
export class PolicyCoinComponent extends UIComponent implements OnInit {

  item: any = {};
  @Input() typeCard: string;
  categoryID: string = "1";
  policyCoinList = [];
  tenant: string;
  private funcID;
  constructor(
    private changeDr: ChangeDetectorRef,
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
  trackByFn(index, item) {
    return index;
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
  addPolicy() {
    alert('Tính năng đang phát triển ở version kế tiếp');
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
          this.policyCoinList = res.msgBodyData[0];
          this.changeDr.detectChanges();
        }
      });

  }

  LoadDetailPolicy(recID) {
    // this.router.navigate(["/" + this.tenant + "/fed/detailpolicy"], { queryParams: { type: "coin", cardtype: this.typeCard,funcID:this.funcID,recID:recID } });
  }

}
