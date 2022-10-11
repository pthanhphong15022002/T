import { SettingCycleComponent } from './../setting-cycle/setting-cycle.component';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  Injector,
  TemplateRef,
  SimpleChanges,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import {
  CallFuncService,
  DialogModel,
  DialogRef,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { SettingService } from '../setting.service';

@Component({
  selector: 'app-detail-policy-coins',
  templateUrl: './detail-policy-coins.component.html',
  styleUrls: ['./detail-policy-coins.component.scss'],
})
export class DetailPolicyCoinsComponent extends UIComponent implements OnInit {
  applyFor: string = '';
  scheduledTasks = null;
  listPolicyByPredicate: any;
  listParameter;
  functionList: any;
  functionID: any;
  headerSettingCycle = '';
  dialog: DialogRef;

  @ViewChild('popupSettingCycle') popupSettingCycle: TemplateRef<any>;
  @ViewChild('settingCycle') settingCycle: SettingCycleComponent;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    public modalService: NgbModal,
    private changeDetectorRef: ChangeDetectorRef,
    private notification: NotificationsService,
    private settingSV: SettingService,
    private callFS: CallFuncService,
    injector: Injector
  ) {
    super(injector);
    this.route.queryParams.subscribe((params) => {
      if (params.funcID) {
        this.functionID = params.funcID;
        this.cache.functionList(params.funcID).subscribe((res) => {
          if (res) this.functionList = res;
        });
      }
      if (params.applyFor) {
        this.applyFor = params.applyFor;
      }
    });
  }

  onInit(): void {
    if (this.applyFor) {
      this.getListFEDPolicy();
      this.getSettingRunPolicy(this.applyFor);
      this.getInfoCMParameter(this.applyFor);
    }
  }

  ngAfterViewInit() {
    this.getMessage();
  }

  backLocation() {
    this.location.back();
  }
  redirectPage(page, number) {
    this.codxService.navigate('', 'fd/settings/FDS', {
      redirectPage: page,
      index: number,
    });
  }
  getListFEDPolicy() {
    this.api
      .exec('FD', 'PoliciesBusiness', 'GetListPolicyByPredicateAsync', [
        'Category = @0 and ApplyFor = @1',
        `3;${this.applyFor}`,
      ])
      .subscribe((res) => {
        if (res) this.listPolicyByPredicate = res;
      });
  }
  getSettingRunPolicy(applyFor: string) {
    this.api
      .execSv<any>(
        'SYS',
        'AD',
        'AlertRulesBusiness',
        'GetSettingRunPolicyAsync',
        ['WalletPolicy', applyFor]
      )
      .subscribe((result) => {
        this.scheduledTasks = result;
      });
  }
  valueChange(e) {
    if (e.field == 'stop') {
      this.scheduledTasks.stop = !this.scheduledTasks?.stop;
      this.changeDetectorRef.detectChanges();
    }
  }
  onSaveStatusPolicy(data, value) {
    this.api
      .exec<boolean>('FD', 'PoliciesBusiness', 'AddUpdateActiveAsync', [
        data.field,
      ])
      .subscribe((result) => {
        if (result) {
          this.refreshActive(value);
        }
      });
  }

  refreshActive(item) {
    var dt = JSON.parse(JSON.stringify(this.listPolicyByPredicate));
    dt.forEach((obj) => {
      if (obj.recID == item.recID) obj.actived = !item.actived;
    });
    this.listPolicyByPredicate = dt;
    this.changeDetectorRef.detectChanges();
  }

  LoadDetailPolicy(category, recID) {
    this.codxService.navigate('', 'fd/setting-policylines', {
      recID,
      funcID: this.functionID,
    });
  }

  runPolicy() {
    this.api
      .exec<boolean>('FD', 'WalletsBusiness', 'CalWalletPolicyAsync', [
        this.applyFor,
      ])
      .subscribe((result) => {
        if (result) {
          this.notification.notifyCode('SYS019');
        }
      });
  }
  getInfoCMParameter(applyFor) {
    let policy = '';
    switch (applyFor) {
      case '3':
        policy = 'PolicyCoins';
        break;
      case '4':
        policy = 'PolicyCoCoins';
        break;
      default:
        policy = 'PolicyKudos';
        break;
    }
    let predicate = 'FormName=@0 && TransType=null && FieldName = @1';
    let dataValue = `FDParameters;${policy}`;
    this.settingSV
      .getSettingByPredicate(predicate, dataValue)
      .subscribe((result) => {
        if (result?.length > 0) {
          this.listParameter = result[0];
        }
      });
  }

  monthActive = ['1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'];
  messageSC003 = '';
  monthNameRun = '';
  dayNameRun = '';

  openPopup() {
    var obj = {
      messageSC003: this.messageSC003,
      scheduledTasks: this.scheduledTasks,
    };
    let option = new DialogModel();
    option.DataService = this.view?.currentView?.dataService;
    option.FormModel = this.view?.currentView?.formModel;
    this.dialog = this.callfc.openForm(
      SettingCycleComponent,
      '',
      600,
      400,
      '',
      obj,
      '',
      option
    );
    this.dialog.closed.subscribe((res) => {
      if (res.event) this.messageSC003 = res.event;
    });
    this.changeDetectorRef.detectChanges();
  }

  setTextMemo() {
    if (this.scheduledTasks?.occurrenceOption == '1') {
      this.dayNameRun = 'ngày ' + this.scheduledTasks?.dayOfMonth;
    } else {
      this.dayNameRun = 'ngày cuối tháng';
    }
    if (this.messageSC003) {
      var mess = JSON.parse(JSON.stringify(this.messageSC003));
      var main = JSON.parse(JSON.stringify(this.messageSC003));
      mess = mess.replace('{0}', this.dayNameRun);
      main = mess.replace('{1}', this.monthNameRun);
      this.messageSC003 = main;
    }
  }

  updateMonthNameRun() {
    this.monthNameRun = '';
    this.monthActive.forEach((element, index) => {
      if (element == '1') {
        let month = index + 1;
        this.monthNameRun += 'tháng ' + month + ', ';
      }
    });
    this.monthNameRun = this.monthNameRun.slice(0, -2);
  }

  getMessage() {
    this.cache.message('SC003').subscribe((res) => {
      if (res) {
        this.messageSC003 = res.defaultName;
        if (this.scheduledTasks)
          this.monthActive = this.scheduledTasks.months.split('');
        this.updateMonthNameRun();
        this.setTextMemo();
      }
    });
  }
}
