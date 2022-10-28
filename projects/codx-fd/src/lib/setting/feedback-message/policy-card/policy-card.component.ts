import { SettingService } from './../../setting.service';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataRequest, NotificationsService, UIComponent } from 'codx-core';
import { CodxFdService } from '../../../codx-fd.service';

@Component({
  selector: 'app-policy-card',
  templateUrl: './policy-card.component.html',
  styleUrls: ['./policy-card.component.scss'],
})
export class PolicyCardComponent extends UIComponent implements OnInit {
  action: any;
  data: any = {};
  quantity: any;
  closeResult = '';
  valueListNameCoin: string = '';
  objectUpdate: any = {};
  fieldUpdate = '';
  isLockCoin: boolean;
  isLockDedicate: boolean;
  isShowPolicyCard: boolean = true;
  formModel: any;
  functionList: any;
  @Output() changeLock = new EventEmitter<object>();
  @Input() typeCard: string;

  constructor(
    private modalService: NgbModal,
    private change: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    private settingSV: SettingService,
    private fdSV: CodxFdService,
    injector: Injector
  ) {
    super(injector);
    this.cache.functionList('FDS').subscribe((res) => {
      if (res) {
        this.functionList = res;
        this.formModel = {
          entityName: this.functionList?.entityName,
          formName: this.functionList?.formName,
          gridViewName: this.functionList?.gridViewName,
        };
      }
    });
  }

  onInit(): void {
    this.LoadData();
    // this.LoadDataForChangeVLL();
  }

  changeCombobox(data) {
    if (data.data[0].recID || data.data[0].RecID) {
      this.data.Approvers = data.data[0].recID || data.data[0].RecID;
      this.objectUpdate['Approvers'] = data.data[0].recID || data.data[0].RecID;
      if (data.data.length > 1) {
        for (let i = 1; i < data.data.length; i++) {
          this.objectUpdate['Approvers'] += ';';
          this.objectUpdate['Approvers'] +=
            data.data[i].recID || data.data[i].RecID;
        }
      }
      this.handleSaveParameter();
    }
  }
  valueChangValueList(data) {
    this.quantity[data.field] = data.data;
    this.handleLock(data.data);
    let objectUpdate = {};
    objectUpdate[data.field] = data.data;
    this.onSaveCMParameter(objectUpdate);
  }
  handleLock(status) {
    if (status == '0') {
      this.isLockCoin = true;
      this.isLockDedicate = true;
      this.changeLock.emit({
        isLockCoin: this.isLockCoin,
        isLockDedicate: this.isLockDedicate,
      });
      return;
    }
    switch (this.quantity.PolicyControl) {
      case '1':
        this.isLockCoin = false;
        this.isLockDedicate = false;
        break;
      case '0':
        this.isLockCoin = true;
        this.isLockDedicate = true;
        break;
      case '2':
        this.isLockCoin = false;
        this.isLockDedicate = true;
        break;
      case '3':
        this.isLockCoin = true;
        this.isLockDedicate = false;
        break;
    }
    this.changeLock.emit({
      isLockCoin: this.isLockCoin,
      isLockDedicate: this.isLockDedicate,
    });
  }

  valueChangeSwitch(e) {
    if (e) {
      var field = e.field;
      this.objectUpdate[field] = e.data;
      this.quantity[field] = !this.quantity[field];
      this.handleSaveParameter();
    }
  }

  handleSaveParameter() {
    this.onSaveCMParameter(this.objectUpdate);
  }

  onSaveCMParameter(objectUpdate) {
    this.api
      .callSv(
        'SYS',
        'ERM.Business.SYS',
        'SettingValuesBusiness',
        'SaveParamsOfPolicyAsync',
        ['FDParameters', this.typeCard, JSON.stringify(objectUpdate)]
      )
      .subscribe((res) => {
        if (res && res.msgBodyData.length > 0) {
          if (res.msgBodyData[0] === true) {
            this.data[this.fieldUpdate] = objectUpdate[this.fieldUpdate];
            this.settingSV.dataUpdate.next(objectUpdate);
            this.change.detectChanges();
          }
        }
      });
  }

  modelForm = { title: '', type: 0, quantity: 0, cycle: '' };
  async LoadLabel() {
    // var langPipe = new LangPipe(this.api, this.cache);
  }

  openPopupCbb(content) {
    // this.cbxsv.dataSelcected = [];
    var split = this.data.Approvers.split(';');
    if (split.length > 1) {
      this.api
        .call('ERM.Business.AD', 'UsersBusiness', 'GetListUsersGroupAsync', [
          this.data.Approvers,
        ])
        .subscribe((res) => {
          if (res && res.msgBodyData[0]) {
            var data = res.msgBodyData[0];
            data.forEach((element) => {
              // this.cbxsv.dataSelcected.push({ RecID: element.recID, GroupName: element.groupName, Note: element.note })
            });
          }
        });
    } else {
      this.api
        .call('ERM.Business.AD', 'UsersBusiness', 'GetListUsersGroupAsync', [
          this.data.Approvers,
        ])
        .subscribe((res) => {
          if (res && res.msgBodyData[0]) {
            var data = res.msgBodyData[0];
            data.forEach((element) => {
              // this.cbxsv.dataSelcected.push({ RecID: element.recID, GroupName: element.groupName, Note: element.note })
            });
          }
        });
    }
    this.change.detectChanges();
  }
  open(content, typeContent) {
    let arrayTitle = [
      'Giới hạn phiếu cho',
      'Giới hạn phiếu nhận',
      'Giới hạn xu cho',
      'Giới hạn xu cho/phiếu',
    ]; // Cần mapping ngôn ngữ
    this.modelForm.title = arrayTitle[typeContent];
    this.modelForm.type = typeContent;
    if (typeContent == 0) {
      this.modelForm.quantity = this.quantity.MaxSends;
      this.modelForm.cycle = this.quantity.MaxSendPeriod;
    }
    if (typeContent == 1) {
      this.modelForm.quantity = this.quantity.MaxReceives;
      this.modelForm.cycle = this.quantity.MaxReceivePeriod;
    }
    if (typeContent == 2) {
      this.modelForm.quantity = this.quantity.MaxPoints;
      this.modelForm.cycle = this.quantity.MaxPointPeriod;
    }
    if (typeContent == 3) {
      this.modelForm.quantity = this.quantity.MaxPointPerOnce;
    }
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      centered: true,
      size: 'sm',
    });
  }
  changeValueListRuleSelected(selected) {
    this.quantity.RuleSelected = selected.data;
    this.objectUpdate['RuleSelected'] = selected.data;
    this.handleSaveParameter();
  }

  MaxSendPeriod: any;
  MaxReceivePeriod: any;
  MaxPointPeriod: any;
  changValueListPopup(selected, typeContent) {
    if (selected) {
      var dt = JSON.parse(JSON.stringify(selected.data));
      if (typeContent == 0) {
        this.MaxSendPeriod = dt;
      }
      if (typeContent == 1) {
        this.MaxReceivePeriod = dt;
      }
      if (typeContent == 2) {
        this.MaxPointPeriod = dt;
      }
    }
  }

  onSavePopup(typeContent) {
    let objectUpdate = {};
    if (this.modelForm.quantity == 0 || this.modelForm.quantity == null) {
      this.modelForm.quantity = 1;
      this.notificationsService.notify('Vui lòng nhập số lượng lớn hơn 0');
      return null;
    }
    if (typeContent == 0) {
      this.data.MaxSends = this.modelForm.quantity;
      objectUpdate = {
        MaxSends: this.modelForm.quantity,
        MaxSendPeriod: this.MaxSendPeriod,
      };
    }
    if (typeContent == 1) {
      this.data.MaxReceives = this.modelForm.quantity;
      objectUpdate = {
        MaxReceives: this.modelForm.quantity,
        MaxReceivePeriod: this.MaxReceivePeriod,
      };
    }
    if (typeContent == 2) {
      this.data.MaxPoints = this.modelForm.quantity;
      objectUpdate = {
        MaxPoints: this.modelForm.quantity,
        MaxPointPeriod: this.MaxPointPeriod,
      };
    }
    if (typeContent == 3) {
      this.data.MaxPointPerOnce = this.modelForm.quantity;
      objectUpdate = {
        MaxPointPerOnce: this.modelForm.quantity,
      };
    }

    return this.api
      .callSv(
        'SYS',
        'ERM.Business.SYS',
        'SettingValuesBusiness',
        'SaveParamsOfPolicyAsync',
        ['FDParameters', this.typeCard, JSON.stringify(objectUpdate)]
      )
      .subscribe((res) => {
        if (res && res.msgBodyData[0]) {
          if (res.msgBodyData[0] == true) {
            this.LoadData();
            return;
          }
        }
      });
  }
  dataFull: any;
  LoadData() {
    this.api
      .execSv(
        'FD',
        'ERM.Business.FD',
        'SettingsBusiness',
        'GetDataForPolicyCardAsync',
        this.typeCard
      )
      .subscribe((res: any) => {
        if (res && res.length > 0) {
          this.data = res[0];
          this.dataFull = res[1];
          this.quantity = this.fdSV.convertListToObject(
            this.data,
            'fieldName',
            'fieldValue'
          );
          if (Object.keys(this.data).length == 0) {
            this.isShowPolicyCard = false;
          }
          this.handleLock(this.data.PolicyControl);
          this.setValueListName(this.dataFull);
          this.change.detectChanges();
        }
      });
  }
  // LoadDataForChangeVLL() {
  //   this.settingSV.getParameter().subscribe((res) => {
  //     if (res) {
  //       this.setValueListName(res[0]);
  //     }
  //   });
  // }
  stringToBoolean(val) {
    var a = {
      "true": true,
      "false": false,
      "1": true,
      "0": false,
    };
    return a[val];
  }
  setValueListName(list) {
    if (!list) return;
    var dataActiveCoins;
    var dataActiveMyKudos;
    list.forEach((x) => {
      if (x.transType == 'ActiveCoins')
        dataActiveCoins = JSON.parse(x.dataValue);
      else dataActiveMyKudos = JSON.parse(x.dataValue);
    });
    var isActiveCoins = this.stringToBoolean(dataActiveCoins.ActiveCoins);
    var isActiveMyKudos = this.stringToBoolean(dataActiveMyKudos.ActiveMyKudos);
    if (isActiveCoins && isActiveMyKudos) {
      this.valueListNameCoin = 'L1434';
      return;
    }
    if (isActiveCoins) {
      this.valueListNameCoin = 'L1459';
      return;
    }
    if (isActiveMyKudos) {
      this.valueListNameCoin = 'L1460';
      return;
    }
    this.change.detectChanges();
  }

  valueChangeQuantity(event) {
    if (event) this.modelForm.quantity = event.data;
  }
}
