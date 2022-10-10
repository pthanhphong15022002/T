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
import { AuthStore, DialogModel, NotificationsService, UIComponent } from 'codx-core';
import { SettingService } from '../setting.service';
import { CodxFdService } from '../../codx-fd.service';
import { SettingCycleComponent } from '../setting-cycle/setting-cycle.component';

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
    this.route.params.subscribe((params) => {
      if (params) this.funcID = params['funcID'];
    });
    this.cache.functionList(this.funcID).subscribe((res) => {
      if (res) this.functionList = res;
    });
  }
  onInit(): void {
    this.LoadData();
    this.LoadDataPolicies('2');
    this.LoadDataPolicies('1');
    this.getSettingRunPolicyCoCoin();
    this.getSettingRunPolicyKuDos();
    this.api
      .call('ERM.Business.SYS', 'FunctionListBusiness', 'GetAsync', [
        '',
        this.funcID,
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
  getItems(category) {
    return this.policyList.filter((item) => item.category === category);
  }
  backLocation() {
    this.location.back();
  }
  LoadDetailPolicy(category, recID) {
    this.codxService.navigate('', 'fd/detailpolicy', {
      type: 'wallet',
      cardtype: null,
      category: category,
      funcID: this.funcID,
      recID: recID,
    });
  }
  changValueListPopup(e) {
    this.objectUpdateCoin[e.field] = e.data;
    this.fieldUpdateCoin = e.field;
  }
  valueChangeVoucher(e) {
    if (e) {
      this.objectUpdateCoin[e.field] = e.data;
    }
  }
  valueChange(e) {
    if (e) {
      var dt = e.data == true ? '1' : '0';
      this.objectUpdateCoin[e.field] = dt;
      this.fieldUpdateCoin = e.field;
      if (e.field == 'ActiveCoCoins') {
        this.disableGroupFund = !e.data;
      }
      this.handleSaveParameter();
    }
  }
  onSavePopupCombobx() {
    // this.objectUpdateCoin['MaxCoinsForEGift'] = this.quantity.MaxCoinsForEGift;
    // this.objectUpdateCoin['MaxCoinsForEGiftPeriod'] =
    //   this.quantity.MaxCoinsForEGiftPeriod;
    this.onSaveCMParameter(this.objectUpdateCoin);
  }
  emptyObjectUpdate() {
    this.objectUpdateCoin = {};
    this.modalService.dismissAll();
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
        'GetDataForSettingWalletAsync'
      )
      .subscribe((res) => {
        if (res && res.msgBodyData[0].length > 0) {
          this.data = res.msgBodyData[0][0];
          this.quantity = this.fdSV.convertListToObject(
            this.data,
            'fieldName',
            'fieldValue'
          );
          this.title = this.fdSV.convertListToObject(
            this.data,
            'fieldName',
            'title'
          );
          this.description = this.fdSV.convertListToObject(
            this.data,
            'fieldName',
            'description'
          );
          this.field = this.fdSV.convertListToObject(
            this.data,
            'fieldName',
            'fieldValue'
          );
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
    this.codxService.navigate('', 'fd/detail-policy-coin', {
      applyFor: applyFor,
      funcID: this.funcID,
    });
  }
  onSaveStatusPolicy(e, item) {
    this.api
      .execSv<any>(
        'FD',
        'ERM.Business.FD',
        'WalletsBusiness',
        'OnSavePolicySettingWalletAsync',
        [e.field]
      )
      .subscribe((res) => {
        if (res) {
          var index = this.policyList.findIndex((p) => p.recID == e.field);
          var data = this.policyList.find((p) => p.recID == e.field);
          this.policyList[index] = data;
          this.refreshActive(item);
        }
      });
  }

  refreshActive(item) {
    var dt = JSON.parse(JSON.stringify(this.policyList));
    dt.forEach((obj) => {
      if (obj.recID == item.recID) obj.actived = !item.actived;
    });
    this.policyList = dt;
    this.changedr.detectChanges();
  }

  redirectPage(page) {
    // this.router.navigate(['/' + this.tenant + '/fed/setting'], {
    //   queryParams: { funcID: 'FED204', page: page },
    // });
  }
  openFormChangeCoin(content, typeContent) {
    this.fieldUpdateCoin = typeContent;
    this.objectUpdateCoin[this.fieldUpdateCoin] =
      this.quantity[this.fieldUpdateCoin];
    this.changedr.detectChanges();
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      centered: true,
      size: 'sm',
    });
  }

  valueChangeCoin(e) {
    if (e) {
      this.objectUpdateCoin[e.field] = e.data;
    }
  }

  policyList = [];
  getdatas(category) {
    return this.policyList.filter((data) => data.category === category);
  }
  handleSaveParameter() {
    this.onSaveCMParameter(this.objectUpdateCoin);
  }
  onSaveCMParameter(objectUpdate) {
    this.api
      .callSv(
        'SYS',
        'ERM.Business.SYS',
        'SettingValuesBusiness',
        'SaveParamsOfPolicyAsync',
        ['FDParameters', null, JSON.stringify(objectUpdate)]
      )
      .subscribe((res) => {
        if (res && res.msgBodyData.length > 0) {
          if (res.msgBodyData[0] === true) {
            for (const property in objectUpdate) {
              this.quantity[property] = objectUpdate[property];
            }
            this.changedr.detectChanges();
            this.objectUpdateCoin = {};
          }
        }
      });
    this.modalService.dismissAll();
  }

  LoadDataPolicies(category) {
    let applyFor = '1';
    let cardType = null;
    this.api
      .call(
        'ERM.Business.FD',
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
    var obj = {
      scheduledTasks: this.scheduledTasks,
    };
    let option = new DialogModel();
    option.DataService = this.view?.currentView?.dataService;
    option.FormModel = this.view?.currentView?.formModel;
    this.callfc.openForm(
      SettingCycleComponent,
      '',
      600,
      400,
      '',
      obj,
      '',
      option
    );
  }
  saveSettingCycleRun() {
    this.api
      .execSv('SYS', 'AD', 'ScheduledTasksBusiness', 'AddUpdateAsync', [
        this.scheduledTasks,
      ])
      .subscribe((result) => {
        if (result) {
          
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
