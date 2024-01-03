import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  DataRequest,
  FormModel,
  NotificationsService,
  SidebarModel,
} from 'codx-core';
import { PopupCustomFieldComponent } from './popup-custom-field/popup-custom-field.component';

@Component({
  selector: 'codx-fields-detail-temp',
  templateUrl: './codx-fields-detail-temp.component.html',
  styleUrls: ['./codx-fields-detail-temp.component.scss'],
})
export class CodxFieldsDetailTempComponent implements OnInit {
  @Input() dataStep!: any;
  @Input() formModel!: FormModel;
  @Input() titleDefault = '';
  @Input() titleHeaderFormCF = '';
  @Input() isUpdate = false;
  @Input() showColumnControl = 1;
  @Input() currentElmID: any;
  @Input() viewsCurrent = '';
  @Input() typeView = '1';
  @Output() inputElmIDCF = new EventEmitter<any>();
  @Input() isSaving = false;
  @Input() isShowTitle = true;
  @Output() actionSaveCF = new EventEmitter<any>();
  @Output() saveDataStep = new EventEmitter<any>();
  @Input() listFields!: any;
  //dung cho co hoi
  @Input() objectIdParent: any = '';
  @Input() customerID: string = ''; //Khách hàng cơ hội

  viewsCrr: any;
  currentRate = 0;
  dtFormatDate: any = [];
  formModelDefault: FormModel = {
    entityName: 'DP_Instances_Steps_Fields',
    formName: 'DPInstancesStepsFields',
    gridViewName: 'grvDPInstancesStepsFields',
  };
  elmIDCrr: any;
  dataValueOld: any;
  moreFuncNameEdit = '';
  listColumns = []; //columfield TA

  formModelContact: FormModel = {
    formName: 'CMContacts',
    gridViewName: 'grvCMContacts',
    entityName: 'CM_Contacts',
  };

  constructor(
    private callfc: CallFuncService,
    private cache: CacheService,
    private notiService: NotificationsService,
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService
  ) {
    this.formModel = new FormModel();
    this.formModel.formName = 'DPInstancesStepsFields';
    this.formModel.gridViewName = 'grvDPInstancesStepsFields';
    this.formModel.entityName = 'DP_Instances_Steps_Fields';
    if (!this.titleHeaderFormCF) {
      this.cache.functionList('DPT0301').subscribe((f) => {
        this.titleHeaderFormCF = f?.customName || f?.description;
      });
    }

    this.cache.valueList('DP0274').subscribe((res) => {
      if (res) this.dtFormatDate = res.datas;
    });
    this.cache.moreFunction('CoDXSystem', '').subscribe((res) => {
      if (res && res.length) {
        let edit = res.find((x) => x.functionID == 'SYS03');
        if (edit) this.moreFuncNameEdit = edit.customName;
      }
    });
  }

  ngOnInit(): void {}
  // ngOnChanges() {
  //   this.changeDetectorRef.detectChanges();
  // }

  clickShow(e, id) {
    let children = e.currentTarget.children[0];
    let element = document.getElementById(id);
    if (element) {
      let isClose = element.classList.contains('hidden-main');
      let isShow = element.classList.contains('show-main');
      if (isClose) {
        children.classList.add('icon-expand_less');
        children.classList.remove('icon-expand_more');
        element.classList.remove('hidden-main');
        element.classList.add('show-main');
      } else if (isShow) {
        element.classList.remove('show-main');
        element.classList.add('hidden-main');
        children.classList.remove('icon-expand_less');
        children.classList.add('icon-expand_more');
      }
    }
  }

  clickMF(e, data) {
    switch (e.functionID) {
      case 'SYS03':
        this.popupCustomField(data);
        break;
    }
  }

  changeFieldMF(e) {
    //đe vậy tính sau
    if (e != null) {
      e.forEach((res) => {
        switch (res.functionID) {
          case 'SYS102':
          case 'SYS02':
            res.disabled = true;
            break;
          //edit
          case 'SYS103':
          case 'SYS03':
            if (!this.isUpdate) res.disabled = true;
            break;
        }
      });
    }
  }

  popupCustomField(data) {
    //nếu nhấn tại ô input mới dùng cái này tabs mơi dùng
    // if (this.currentElmID && this.currentElmID != this.elmIDCrr) {
    //   this.clickInput(this.currentElmID);
    // }
    // if (this.elmIDCrr) {
    //   this.clickInput(this.elmIDCrr);
    // }
    // this.elmIDCrr = this.currentElmID = null;
    // this.inputElmIDCF.emit(null);
    // if (this.currentElmID) var list = [];
    let list = [];
    if (Array.isArray(data) && data.length > 0) {
      list = data;
    } else {
      list.push(data);
    }
    let obj = {
      data: JSON.parse(JSON.stringify(list)),
      titleHeader: this.titleHeaderFormCF,
      objectIdParent: this.objectIdParent,
      customerID: this.customerID,
      isAdd: false,
    };
    let formModel: FormModel = {
      entityName: 'DP_Instances_Steps_Fields',
      formName: 'DPInstancesStepsFields',
      gridViewName: 'grvDPInstancesStepsFields',
    };
    let option = new SidebarModel();
    option.FormModel = formModel;
    option.Width = '550px';
    option.zIndex = 1000;
    var dialogFields = this.callfc.openSide(
      PopupCustomFieldComponent,
      obj,
      option
    );
    dialogFields.closed.subscribe((e) => {
      if (e && e?.event) {
        var fields = e?.event;
        fields.forEach((obj) => {
          var idx = this.dataStep.fields.findIndex(
            (x) => x.recID == obj.recID && x.dataValue != obj.dataValue
          );
          if (idx != -1) {
            this.dataStep.fields[idx] = JSON.parse(JSON.stringify(obj));
          }
        });
        this.changeDetectorRef.detectChanges();
        this.saveDataStep.emit(this.dataStep);
      }
    });
  }

  clickInput(eleID, dataStep = null, isClick = false) {
    if (this.isSaving) return;
    if (isClick && eleID != this.elmIDCrr) {
      if (this.currentElmID && this.currentElmID != this.elmIDCrr)
        this.clickInput(this.currentElmID);
      if (this.elmIDCrr) {
        this.clickInput(this.elmIDCrr);
      }
    }
    if (!this.isUpdate) return;

    let element = document.getElementById(eleID);
    if (element) {
      let isClose = element.classList.contains('hidden-main');
      let isShow = element.classList.contains('show-main');
      if (isClose) {
        element.classList.remove('hidden-main');
        element.classList.add('show-main');
      } else if (isShow) {
        element.classList.remove('show-main');
        element.classList.add('hidden-main');
      }
    }
    let elementForm = document.getElementById('fr-' + eleID);
    if (elementForm) {
      let isCloseF = elementForm.classList.contains('hidden-main');
      let isShowF = elementForm.classList.contains('show-main');
      if (isCloseF) {
        elementForm.classList.remove('hidden-main');
        elementForm.classList.add('show-main');
      } else if (isShowF) {
        elementForm.classList.remove('show-main');
        elementForm.classList.add('hidden-main');
      }
    }
    if (isClick) {
      this.elmIDCrr = eleID;
      this.inputElmIDCF.emit(this.elmIDCrr);
    } else this.elmIDCrr = null;
  }

  valueChangeCustom(event) {
    if (event && event.data) {
      var result = event.e?.data;
      var field = event.data;
      this.dataValueOld = field.dataValue;
      switch (field.dataType) {
        case 'D':
          result = event.e?.data.fromDate;
          break;
        case 'P':
        case 'R':
        case 'A':
        case 'C':
        case 'L':
        case 'TA':
        case 'PA':
          result = event?.e;
          break;
      }
      field.dataValue = result;
      // if (field.dataType == 'TA')
      //   field.formatData = JSON.parse(JSON.stringify(field.formatData));
      this.saveField(field);
    }
  }

  checkFormat(field) {
    if (field.dataType == 'T') {
      if (field.dataFormat == 'E') {
        var validEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!field.dataValue.toLowerCase().match(validEmail)) {
          this.cache.message('SYS037').subscribe((res) => {
            if (res) {
              var errorMessage = res.customName || res.defaultName;
              this.notiService.notify(errorMessage, '2');
            }
          });
          return false;
        }
      }
      if (field.dataFormat == 'P') {
        var validPhone = /(((09|03|07|08|05)+([0-9]{8})|(01+([0-9]{9})))\b)/;
        if (!field.dataValue.toLowerCase().match(validPhone)) {
          this.cache.message('RS030').subscribe((res) => {
            if (res) {
              var errorMessage = res.customName || res.defaultName;
              this.notiService.notify(errorMessage, '2');
            }
          });
          return false;
        }
      }
    }
    return true;
  }
  saveField(field) {
    let check = true;
    let checkFormat = true;

    if (!field.dataValue || field.dataValue?.toString().trim() == '') {
      if (field.isRequired) {
        this.notiService.notifyCode('SYS009', 0, '"' + field.title + '"');
        check = false;
      }
    } else checkFormat = this.checkFormat(field);

    if (!check || !checkFormat) return;
    if (this.isSaving) return;
    this.isSaving = true;
    this.actionSaveCF.emit(true);
    let data = [field.stepID, [field]];
    this.api
      .exec<any>(
        'DP',
        'InstancesStepsBusiness',
        'UpdateInstanceStepFielsByStepIDAsync',
        data
      )
      .subscribe((res) => {
        let idx = this.dataStep.fields.findIndex((x) => x.recID == field.recID);
        this.isSaving = false;
        this.actionSaveCF.emit(false);
        if (res) {
          if (idx != -1) this.dataStep.fields[idx].dataValue = field.dataValue;
          this.notiService.notifyCode('SYS007');
          this.clickInput(this.elmIDCrr);
          this.inputElmIDCF.emit(null);
        } else {
          this.notiService.notifyCode('SYS021');
          if (idx != -1)
            this.dataStep.fields[idx].dataValue = this.dataValueOld;
        }
      });
  }
}
