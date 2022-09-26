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
import {
  ApiHttpService,
  CacheService,
  DataRequest,
  LangPipe,
  NotificationsService,
  UIComponent,
  ViewData,
} from 'codx-core';

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
  changValuelist(data) {
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
  ViewData() {}
  changeValueSwitch(nameProperty) {
    this.item[nameProperty] = this.item[nameProperty] === '0' ? '1' : '0';
    this.objectUpdate[nameProperty] = this.item[nameProperty];
    this.handleSaveParameter();
  }
  lvInputChangeSwitch(data, value) {
    if (data?.field) {
      this.changeValueSwitch(data?.field);
    }
  }
  handleSaveParameter() {
    this.onSaveCMParameter(this.objectUpdate);
    this.modalService.dismissAll();
  }
  onSaveCMParameter(objectUpdate) {
    this.api
      .callSv(
        'SYS',
        'ERM.Business.CM',
        'ParametersBusiness',
        'SaveParamsOfPolicyAsync',
        ['FED_Parameters', this.typeCard, JSON.stringify(objectUpdate)]
      )
      .subscribe((res) => {
        if (res && res.msgBodyData.length > 0) {
          if (res.msgBodyData[0] === true) {
            this.item[this.fieldUpdate] = objectUpdate[this.fieldUpdate];

            this.change.detectChanges();
            //this.objectUpdate = {};
          }
        }
      });
  }
  modelForm = { title: '', type: 0, quantity: 0, cycle: '' };
  async LoadLabel() {
    // var langPipe = new LangPipe(this.api, this.cache);
  }

  options = new DataRequest();
  conboboxName = '';
  openPopupCombobox(content) {
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
    // this.cbxsv.appendData();
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      centered: true,
      size: 'md',
    });
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
    this.change.detectChanges();
  }
  changeValueListRuleSelected(selected) {
    this.item.RuleSelected = selected.data.value;
    this.objectUpdate['RuleSelected'] = selected.data.value;
    this.handleSaveParameter();
  }
  changValueListPopup(selected, typeContent) {
    if (typeContent == 0) {
      this.item.MaxSendPeriod = selected.data.value;
    }
    if (typeContent == 1) {
      this.item.MaxReceivePeriod = selected.data.value;
    }
    if (typeContent == 2) {
      this.item.MaxPointPeriod = selected.data.value;
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
        MaxSendPeriod: this.item.MaxSendPeriod,
      };
    }
    if (typeContent == 1) {
      this.item.MaxReceives = this.modelForm.quantity;
      objectUpdate = {
        MaxReceives: this.modelForm.quantity,
        MaxReceivePeriod: this.item.MaxReceivePeriod,
      };
    }
    if (typeContent == 2) {
      this.item.MaxPoints = this.modelForm.quantity;
      objectUpdate = {
        MaxPoints: this.modelForm.quantity,
        MaxPointPeriod: this.item.MaxPointPeriod,
      };
    }
    if (typeContent == 3) {
      this.item.MaxPointPerOnce = this.modelForm.quantity;
      objectUpdate = {
        MaxPointPerOnce: this.modelForm.quantity,
      };
    }

    return this.api
      .callSv('SYS', 'CM', 'ParametersBusiness', 'SaveParamsOfPolicyAsync', [
        'FED_Parameters',
        this.typeCard,
        JSON.stringify(objectUpdate),
      ])
      .subscribe((res) => {
        if (res && res.msgBodyData[0]) {
          if (res.msgBodyData[0] == true) {
            this.notificationsService.notify('Hệ thống thực thi thành công!');
            this.modalService.dismissAll();
            //this.LoadData();
            return;
          }
          this.notificationsService.notify('Có lỗi xảy ra!');
        }
      });
  }
  LoadData() {
    this.api
      .call(
        'ERM.Business.FED',
        'SettingsBusiness',
        'GetDataForPolicyCardAsync',
        [this.typeCard]
      )
      .subscribe((res) => {
        if (res && res.msgBodyData.length > 0) {
          this.item = res.msgBodyData[0].parameter;
          if (Object.keys(this.item).length == 0) {
            this.isShowPolicyCard = false;
          }
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
        this.change.detectChanges();
      }
    });
  }
  setValueListName(list) {
    // let item = this.mainService.convertListToObject(list, "fieldName", "fieldValue");
    if (!list) return;
    var item = JSON.parse(list.dataValue);
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
}
