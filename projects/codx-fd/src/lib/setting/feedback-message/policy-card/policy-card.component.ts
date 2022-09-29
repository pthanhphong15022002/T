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

@Component({
  selector: 'app-policy-card',
  templateUrl: './policy-card.component.html',
  styleUrls: ['./policy-card.component.scss'],
})
export class PolicyCardComponent extends UIComponent implements OnInit {
  action: any;
  item: any = {};
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
    this.LoadDataForChangeVLL();
  }

  changeCombobox(data) {
    if (data.data[0].recID || data.data[0].RecID) {
      this.item.Approvers = data.data[0].recID || data.data[0].RecID;
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
    this.item[data.field] = data.data.value;
    this.handleLock(data.data.value);
    let objectUpdate = {};
    objectUpdate[data.field] = data.data.value;
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
    switch (this.item.PolicyControl) {
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
      this.item[field] = !this.item[field];
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
            this.item[this.fieldUpdate] = objectUpdate[this.fieldUpdate];
            this.notificationsService.notifyCode('SYS007');
            this.change.detectChanges();
          }
        } else this.notificationsService.notifyCode('SYS021');
      });
  }

  modelForm = { title: '', type: 0, quantity: 0, cycle: '' };
  async LoadLabel() {
    // var langPipe = new LangPipe(this.api, this.cache);
  }

  openPopupCbb(content) {
    // this.cbxsv.dataSelcected = [];
    var split = this.item.Approvers.split(';');
    if (split.length > 1) {
      this.api
        .call('ERM.Business.AD', 'UsersBusiness', 'GetListUsersGroupAsync', [
          this.item.Approvers,
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
          this.item.Approvers,
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
      this.modelForm.quantity = this.item.MaxSends;
      this.modelForm.cycle = this.item.MaxSendPeriod;
    }
    if (typeContent == 1) {
      this.modelForm.quantity = this.item.MaxReceives;
      this.modelForm.cycle = this.item.MaxReceivePeriod;
    }
    if (typeContent == 2) {
      this.modelForm.quantity = this.item.MaxPoints;
      this.modelForm.cycle = this.item.MaxPointPeriod;
    }
    if (typeContent == 3) {
      this.modelForm.quantity = this.item.MaxPointPerOnce;
    }
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      centered: true,
      size: 'sm',
    });
  }
  changeValueListRuleSelected(selected) {
    this.item.RuleSelected = selected.data;
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
      this.item.MaxSends = this.modelForm.quantity;
      objectUpdate = {
        MaxSends: this.modelForm.quantity,
        MaxSendPeriod: this.MaxSendPeriod,
      };
    }
    if (typeContent == 1) {
      this.item.MaxReceives = this.modelForm.quantity;
      objectUpdate = {
        MaxReceives: this.modelForm.quantity,
        MaxReceivePeriod: this.MaxReceivePeriod,
      };
    }
    if (typeContent == 2) {
      this.item.MaxPoints = this.modelForm.quantity;
      objectUpdate = {
        MaxPoints: this.modelForm.quantity,
        MaxPointPeriod: this.MaxPointPeriod,
      };
    }
    if (typeContent == 3) {
      this.item.MaxPointPerOnce = this.modelForm.quantity;
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
        debugger;
        if (res && res.msgBodyData[0]) {
          if (res.msgBodyData[0] == true) {
            this.notificationsService.notify('Hệ thống thực thi thành công!');
            this.LoadData();
            return;
          }
          this.notificationsService.notify('Có lỗi xảy ra!');
        }
      });
  }
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
          this.item = JSON.parse(res[0].dataValue);
          if (Object.keys(this.item).length == 0) {
            this.isShowPolicyCard = false;
          }
          console.log('check item', this.item);
          this.handleLock(this.item.PolicyControl);
          this.setValueListName(this.item);
          this.change.detectChanges();
        }
      });
  }
  LoadDataForChangeVLL() {
    this.settingSV.getParameter().subscribe((res) => {
      if (res) {
        this.setValueListName(res[0]);
      }
    });
  }
  setValueListName(list) {
    if (!list) return;
    var item;
    if(list?.dataValue)
      item = JSON.parse(list.dataValue);
    else item = list;
    const isActiveCoins = item.hasOwnProperty('ActiveCoins');
    const isActiveMyKudos = item.hasOwnProperty('ActiveMyKudos');
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
