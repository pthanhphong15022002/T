import {
  Component,
  OnInit,
  Injector,
  ChangeDetectorRef,
  Input,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NotificationsService, TenantStore, UIComponent } from 'codx-core';

@Component({
  selector: 'app-policy-dedication',
  templateUrl: './policy-dedication.component.html',
  styleUrls: ['./policy-dedication.component.scss'],
})
export class PolicyDedicationComponent extends UIComponent implements OnInit {
  funcID: any;
  tenant: string;
  constructor(
    private change: ChangeDetectorRef,
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
  @Input() typeCard: string;
  categoryID: string = '2';
  policyDedicationList = [];
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
          this.policyDedicationList = res.msgBodyData[0];
        }
      });
  }
  onSaveStatusPolicy(data, item) {
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
          for (let i = 0; i < this.policyDedicationList.length; i++) {
            if (this.policyDedicationList[i].recID == item.recID)
              this.policyDedicationList[i].actived = false;
          }
          this.change.detectChanges();
          this.notification.notifyCode('SYS021');
        }
      });
  }

  LoadDetailPolicy(recID) {
    this.codxService.navigate('', 'fd/detailpolicy', {
      type: 'dedication',
      cardtype: this.typeCard,
      funcID: this.funcID,
      recID: recID,
    });
  }
}
