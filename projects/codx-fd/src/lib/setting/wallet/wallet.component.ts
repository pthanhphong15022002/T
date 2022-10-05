import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Type,
  Injector,
  ViewChild,
} from '@angular/core';
import { Location } from '@angular/common';
import { AuthStore, NotificationsService, UIComponent } from 'codx-core';
import { SettingService } from '../setting.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss'],
})
export class WalletComponent extends UIComponent implements OnInit {
  titlePage = '';
  datafuntion = null;
  item = null;
  tenant: any;
  objectUpdateCoin = {};
  fieldUpdateCoin = '';
  disableGroupFund = false;
  applyFor = '';
  scheduledTasks;
  scheduledTasks_CoCoin;
  scheduledTasks_KuDos;
  lstHandleStringToBool = [
    'ActiveCoins',
    'MaxCoinsForEGiftControl',
    'ActiveCoCoins',
    'ExchangeRateCoinsControl',
    'ResetCoCoinsControl',
    'ActiveMyKudos',
    'ResetMyKudosControl',
  ];
  listParameter;

  constructor(
    private at: ActivatedRoute,
    private location: Location,
    private changedr: ChangeDetectorRef,
    private modalService: NgbModal,
    private authStore: AuthStore,
    private settingSV: SettingService,
    private notification: NotificationsService,
    injector: Injector
  ) {
    super(injector);
    this.tenant = this.authStore.get();
  }
  onInit(): void {
    this.LoadData();
    this.LoadDataPolicies('2');
    this.LoadDataPolicies('1');
    this.getSettingRunPolicyCoCoin();
    this.getSettingRunPolicyKuDos();
    this.getInfoCMParameter();
    this.at.queryParams.subscribe((params) => {
      if (params && params.funcID) {
        this.api
          .call('ERM.Business.SYS', 'FunctionListBusiness', 'GetAsync', [
            '',
            params.funcID.substring(0, 6),
          ])
          .subscribe((res) => {
            //this.ngxLoader.stop();
            if (res && res.msgBodyData[0]) {
              var data = res.msgBodyData[0] as [];
              this.datafuntion = data;
              this.titlePage = data['customName'];
              this.changedr.detectChanges();
            }
          });
      }
    });
  }
  backLocation() {
    this.location.back();
  }
  LoadDetailPolicy(category, recID) {
    // this.router.navigate(['/' + this.tenant + '/fed/detailpolicy'], {
    //   queryParams: {
    //     type: 'wallet',
    //     cardtype: null,
    //     category: category,
    //     funcID: 'FED20431',
    //     recID: recID,
    //   },
    // });
  }
  changValueListPopup(e) {
    this.item[e.field] = e.data.value;
    this.objectUpdateCoin[e.field] = this.item[e.field];
    this.fieldUpdateCoin = e.field;
    this.handleSaveParameter();
  }
  valueChange(e, element) {
    this.item[e.field] = e.data; //this.item[e.field] === '0' ? '1' : '0';
    this.objectUpdateCoin[e.field] = this.item[e.field] === true ? '1' : '0';
    this.fieldUpdateCoin = e.field;

    if (e.field == 'ActiveCoCoins') {
      this.disableGroupFund = !e.data;
    }
    this.handleSaveParameter();
  }
  onSavePopupCombobx() {
    this.objectUpdateCoin['MaxCoinsForEGift'] = this.item.MaxCoinsForEGift;
    this.objectUpdateCoin['MaxCoinsForEGiftPeriod'] =
      this.item.MaxCoinsForEGiftPeriod;

    this.onSaveCMParameter(this.objectUpdateCoin);
    this.modalService.dismissAll();
  }
  emptyObjectUpdate() {
    this.objectUpdateCoin = {};
    this.modalService.dismissAll();
  }
  // handleTrueFalse(value) {
  //   return value == '1' ? true : false;
  // }
  LoadData() {
    this.api
      .call(
        'ERM.Business.FED',
        'WalletsBusiness',
        'GetDataForSettingWalletAsync',
        []
      )
      .subscribe((res) => {
        if (res && res.msgBodyData.length > 0) {
          this.item = res.msgBodyData[0].parameter;
          for (const property in this.item) {
            if (this.lstHandleStringToBool.includes(property)) {
              this.item[property] = this.item[property] == '1' ? true : false;
            }
          }
          if (this.item['ActiveCoCoins'] == true) {
            this.disableGroupFund = false;
          } else {
            this.disableGroupFund = true;
          }
          this.changedr.detectChanges();
        }
      });
  }
  open(content, typeContent) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      centered: true,
      size: 'sm',
    });

    this.changedr.detectChanges();
  }
  redirectPageDetailWallet(applyFor: string) {
    // this.mainService.navigatePageUrl('fed/detail-policy-coin', {
    //   applyFor: applyFor,
    //   funcID: 'FED20431',
    // });
  }
  onSaveStatusPolicy(data, value) {
    this.api
      .execSv<any>(
        'FED',
        'ERM.Business.FED',
        'WalletsBusiness',
        'OnSavePolicySettingWalletAsync',
        [data.field]
      )
      .subscribe((res) => {
        var index = this.policyList.findIndex((p) => p.recID == data.field);
        var item = this.policyList.find((p) => p.recID == data.field);
        item.actived = data.data;
        this.policyList[index] = item;
        this.changedr.detectChanges();
      });
  }
  redirectPage(page) {
    // this.router.navigate(['/' + this.tenant + '/fed/setting'], {
    //   queryParams: { funcID: 'FED204', page: page },
    // });
  }
  openFormChangeCoin(content, typeContent) {
    this.fieldUpdateCoin = typeContent;
    this.objectUpdateCoin[this.fieldUpdateCoin] =
      this.item[this.fieldUpdateCoin];
    this.changedr.detectChanges();
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      centered: true,
      size: 'sm',
    });
  }

  policyList = [];
  getItems(category) {
    return this.policyList.filter((item) => item.category === category);
  }
  handleSaveParameter() {
    this.onSaveCMParameter(this.objectUpdateCoin);

    this.modalService.dismissAll();
  }
  onSaveCMParameter(objectUpdate) {
    this.api
      .callSv(
        'SYS',
        'ERM.Business.CM',
        'ParametersBusiness',
        'SaveParamsOfPolicyAsync',
        ['FED_Parameters', null, JSON.stringify(objectUpdate)]
      )
      .subscribe((res) => {
        if (res && res.msgBodyData.length > 0) {
          if (res.msgBodyData[0] === true) {
            for (const property in objectUpdate) {
              if (this.lstHandleStringToBool.includes(property)) {
                this.item[property] =
                  objectUpdate[property] == '1' ? true : false;
              } else {
                this.item[property] = objectUpdate[property];
              }
            }
            this.changedr.detectChanges();
            this.objectUpdateCoin = {};
          }
        }
      });
  }
  getInfoCMParameter() {
    let predicate =
      'FormName=@0 && TransType=null && (FieldName = @1 or FieldName = @2  or FieldName = @3)';
    let dataValue = 'FED_Parameters;PolicyCoins;PolicyCoCoins;PolicyKudos';
    this.settingSV
      .getParameterByPredicate(predicate, dataValue)
      .subscribe((result) => {
        if (result?.length > 0) {
          this.listParameter
        }
      });
  }
  LoadDataPolicies(category) {
    let applyFor = '1';
    let cardType = null;
    this.api
      .call(
        'ERM.Business.FED',
        'SettingsBusiness',
        'GetDataForPolicyCoinDedicationAsync',
        [cardType, category, applyFor]
      )
      .subscribe((res) => {
        if (res && res.msgBodyData.length > 0) {
          this.policyList = [...this.policyList, ...res.msgBodyData[0]];
        }
      });
  }
  openPopupSettingCycleRun(applyFor) {
    this.scheduledTasks =
      applyFor == '4' ? this.scheduledTasks_CoCoin : this.scheduledTasks_KuDos;
    this.applyFor = applyFor;
    this.changedr.markForCheck();
    // this.settingCycle.openPopup();
  }
  saveSettingCycleRun() {
    this.api
      .execSv('SYS', 'AD', 'ScheduledTasksBusiness', 'AddUpdateAsync', [
        this.scheduledTasks,
      ])
      .subscribe((result) => {
        if (result) {
          this.notification.notifyCode('E0408');
        }
      });
  }
  getSettingRunPolicyCoCoin() {
    this.getSettingRunPolicy('4').subscribe((result) => {
      this.scheduledTasks_CoCoin = result;
    });
  }
  getSettingRunPolicyKuDos() {
    this.getSettingRunPolicy('5').subscribe((result) => {
      this.scheduledTasks_KuDos = result;
    });
  }
  getSettingRunPolicy(applyFor: string) {
    return this.api.execSv<any>(
      'SYS',
      'AD',
      'AlertRulesBusiness',
      'GetSettingRunPolicyAsync',
      ['RefreshWallet', applyFor]
    );
  }
  valueChangePolicyCoin(applyFor) {
    if (applyFor == '4') {
      this.scheduledTasks_CoCoin.stop = !this.scheduledTasks_CoCoin.stop;
      this.scheduledTasks = this.scheduledTasks_CoCoin;
    } else {
      this.scheduledTasks_KuDos.stop = !this.scheduledTasks_KuDos.stop;
      this.scheduledTasks = this.scheduledTasks_KuDos;
    }
    this.saveSettingCycleRun();
  }
}
