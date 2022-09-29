import {
  Component,
  OnInit,
  Input,
  ChangeDetectorRef,
  Injector,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationsService, TenantStore, UIComponent } from 'codx-core';

@Component({
  selector: 'app-policy-coin',
  templateUrl: './policy-coin.component.html',
  styleUrls: ['./policy-coin.component.scss'],
})
export class PolicyCoinComponent extends UIComponent implements OnInit {
  item: any = {};
  @Input() typeCard: string;
  categoryID: string = '1';
  policyCoinList = [];
  tenant: string;
  private funcID;
  constructor(
    private changeDr: ChangeDetectorRef,
    private tenantStore: TenantStore,
    private at: ActivatedRoute,
    private notification: NotificationsService,
    injector: Injector
  ) {
    super(injector);
    this.tenant = this.tenantStore.get()?.tenant;
  }

  onInit(): void {
    this.at.queryParams.subscribe((params) => {
      if (params.funcID) {
        this.funcID = params.funcID;
      }
    });
    this.LoadData();
  }
  trackByFn(index, item) {
    return index;
  }
  onSaveStatusPolicy(data, item) {
    if (data && item) {
      this.api
        .execSv<any>(
          'FD',
          'ERM.Business.FD',
          'WalletsBusiness',
          'OnSavePolicySettingWalletAsync',
          [item.recID]
        )
        .subscribe((res) => {
          if (res) this.notification.notifyCode('SYS007');
          else {
            for (let i = 0; i < this.policyCoinList.length; i++) {
              if (this.policyCoinList[i].recID == item.recID)
                this.policyCoinList[i].actived = false;
            }
            this.changeDr.detectChanges();
            this.notification.notifyCode('SYS021');
          }
        });
    }
  }
  addPolicy() {
    alert('Tính năng đang phát triển ở version kế tiếp');
  }
  LoadData() {
    let applyFor = '2';
    this.api
      .call(
        'ERM.Business.FD',
        'SettingsBusiness',
        'GetDataForPolicyCoinDedicationAsync',
        [this.typeCard, this.categoryID, applyFor]
      )
      .subscribe((res) => {
        if (res && res.msgBodyData.length > 0) {
          this.policyCoinList = res.msgBodyData[0];
          this.changeDr.detectChanges();
        }
      });
  }

  LoadDetailPolicy(recID) {
    this.codxService.navigate('','fd/detailpolicy', { type: "coin", cardtype: this.typeCard,funcID:this.funcID,recID:recID });
  }
}
