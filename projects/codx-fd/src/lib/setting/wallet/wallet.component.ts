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
import { CodxFdService } from '../../codx-fd.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss'],
})
export class WalletComponent extends UIComponent implements OnInit {
  titlePage = '';
  datafuntion = null;
  data: any = {};
  quantity: any;
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
  funcID: any;
  functionList: any;

  constructor(
    private at: ActivatedRoute,
    private location: Location,
    private changedr: ChangeDetectorRef,
    private modalService: NgbModal,
    private authStore: AuthStore,
    private settingSV: SettingService,
    private notification: NotificationsService,
    private route: ActivatedRoute,
    private fdSV: CodxFdService,
    injector: Injector
  ) {
    super(injector);
    this.tenant = this.authStore.get();
    this.route.params.subscribe(params => {
      if(params) this.funcID = params['funcID'];
    })
    this.cache.functionList(this.funcID).subscribe(res => {
      if(res) this.functionList = res;
    })
  }
  onInit(): void {
    this.LoadData();
    this.LoadDataPolicies('2');
    this.LoadDataPolicies('1');
    this.getSettingRunPolicyCoCoin();
    this.getSettingRunPolicyKuDos();
    this.at.params.subscribe((params) => {
      if (params && params.funcID) {
        this.api
          .call('ERM.Business.SYS', 'FunctionListBusiness', 'GetAsync', [
            '',
            params.funcID,
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
  getItems(category) {
    return this.policyList.filter((item) => item.category === category);
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
    this.data[e.field] = e.data.value;
    this.objectUpdateCoin[e.field] = this.data[e.field];
    this.fieldUpdateCoin = e.field;
    this.handleSaveParameter();
  }
  valueChange(e, element) {
    this.data[e.field] = e.data; //this.data[e.field] === '0' ? '1' : '0';
    this.objectUpdateCoin[e.field] = this.data[e.field] === true ? '1' : '0';
    this.fieldUpdateCoin = e.field;

    if (e.field == 'ActiveCoCoins') {
      this.disableGroupFund = !e.data;
    }
    this.handleSaveParameter();
  }
  onSavePopupCombobx() {
    this.objectUpdateCoin['MaxCoinsForEGift'] = this.data.MaxCoinsForEGift;
    this.objectUpdateCoin['MaxCoinsForEGiftPeriod'] =
      this.data.MaxCoinsForEGiftPeriod;

    this.onSaveCMParameter(this.objectUpdateCoin);
  }
  emptyObjectUpdate() {
    this.objectUpdateCoin = {};
  }
  // handleTrueFalse(value) {
  //   return value == '1' ? true : false;
  // }
  title: any;
  description: any;
  field: any;
  LoadData() {
    this.api
      .call(
        'ERM.Business.FD',
        'WalletsBusiness',
        'GetDataForSettingWalletAsync',
      )
      .subscribe((res) => {
        if (res && res.msgBodyData[0].length > 0) {
          this.data = res.msgBodyData[0][0];
          this.quantity = this.fdSV.convertListToObject(this.data, 'fieldName', 'fieldValue');
          this.title = this.fdSV.convertListToObject(this.data, 'fieldName', 'title');
          this.description = this.fdSV.convertListToObject(this.data, 'fieldName', 'description');
          this.field = this.fdSV.convertListToObject(this.data, 'fieldName', 'fieldValue');
          for (const property in this.data) {
            if (this.lstHandleStringToBool.includes(property)) {
              this.data[property] = this.data[property] == '1' ? true : false;
            }
          }
          if (this.quantity.ActiveCoCoins == true) {
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
        var data = this.policyList.find((p) => p.recID == data.field);
        data.actived = data.data;
        this.policyList[index] = data;
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
      this.data[this.fieldUpdateCoin];
    this.changedr.detectChanges();
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      centered: true,
      size: 'sm',
    });
  }

  policyList = [];
  getdatas(category) {
    return this.policyList.filter((data) => data.category === category);
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
                this.data[property] =
                  objectUpdate[property] == '1' ? true : false;
              } else {
                this.data[property] = objectUpdate[property];
              }
            }
            this.changedr.detectChanges();
            this.objectUpdateCoin = {};
          }
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
