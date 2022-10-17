import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Optional,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataItem } from '@shared/models/folder.model';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  CodxFormComponent,
  CodxService,
  CRUDService,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
} from 'codx-core';
import { CodxApprovalStepComponent } from 'projects/codx-share/src/lib/components/codx-approval-step/codx-approval-step.component';
import { SettingAlertDrawerComponent } from 'projects/codx-share/src/lib/layout/drawers/alert-drawer/setting-alert-drawer/setting-alert-drawer.component';
import { CodxEsService, GridModels } from '../../../codx-es.service';
import { ApprovalStepComponent } from '../../approval-step/approval-step.component';
import { PopupAddAutoNumberComponent } from '../popup-add-auto-number/popup-add-auto-number.component';
@Component({
  selector: 'popup-add-category',
  templateUrl: './popup-add-category.component.html',
  styleUrls: ['./popup-add-category.component.scss'],
})
export class PopupAddCategoryComponent implements OnInit, AfterViewInit {
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('editApprovalStep') editApprovalStep: TemplateRef<any>;
  @ViewChild('approvalStep') approvalStep: CodxApprovalStepComponent;

  isAfterRender: boolean = false;
  viewAutoNumber = '';

  isAdd: boolean = false;
  isSaved = false;
  isAddAutoNumber = true;
  isClose = true;
  transID: String = '';

  headerText = '';
  subHeaderText = '';
  dialog: DialogRef;
  data: any;

  autoNumber: any;

  formModel: FormModel;
  lstApproval: any = null;
  grvSetup: any;
  settingDataValue: any;
  havaESign: boolean = false;

  constructor(
    private esService: CodxEsService,
    private cache: CacheService,
    private cfService: CallFuncService,
    private cr: ChangeDetectorRef,
    private codxService: CodxService,
    private notify: NotificationsService,
    @Optional() dialog: DialogRef,
    @Optional() data: DialogData
  ) {
    this.dialog = dialog;
    this.data = dialog?.dataService?.dataSelected;
    this.isAdd = data?.data?.isAdd;
    this.formModel = this.dialog.formModel;
    this.headerText = data?.data?.headerText;
  }

  ngAfterViewInit(): void {
    this.dialog.closed.subscribe((res) => {
      this.esService.setLstDeleteStep(null);
      this.esService.setApprovalStep(null);
      if (this.isSaved) {
        this.esService.deleteCategory(this.data.categoryID);
      }
      if (!this.isSaved && this.isAddAutoNumber) {
        //delete autoNumer đã thiết lập
        this.esService
          .deleteAutoNumber(this.data.categoryID)
          .subscribe((res1) => {
            console.log('result delete auto', res1);
          });

        //delete EmailTemplate da thiet lap
        this.esService.deleteEmailTemplate().subscribe((res1) => {
          if (res1) {
            this.esService.lstTmpEmail = [];
          }
        });
      }
    });
  }

  ngOnInit(): void {
    this.cache
      .gridViewSetup(this.formModel.formName, this.formModel.gridViewName)
      .subscribe((grv) => {
        if (grv) this.grvSetup = grv;
      });

    this.cache.functionList('ES').subscribe((res) => {
      if (res) this.havaESign = true;
      this.data.eSign = this.havaESign;
      this.cr.detectChanges();
    });
    if (this.isAdd) {
      this.data.countStep = 0;
      this.data.signatureType = '1';
      this.data.icon = 'icon-text_snippet';
      this.data.color = '#0078FF';

      this.esService
        .getSettingByPredicate(
          'FormName=@0 and Category=@1',
          'ESParameters;' + 1
        )
        .subscribe((setting) => {
          if (setting?.dataValue) {
            this.settingDataValue = JSON.parse(setting.dataValue);
            if (this.settingDataValue) {
              for (const key in this.settingDataValue) {
                console.log(key);
                let fieldName = key.charAt(0).toLowerCase() + key.slice(1);
                this.data[fieldName] = this.settingDataValue[key];
              }
            }
            console.log(this.data);
          }
        });
    }
    this.form?.formGroup?.addControl(
      'countStep',
      new FormControl(this.data.countStep ?? 0)
    );

    if (!this.isAdd) {
      this.esService.getFormModel('EST04').then((res) => {
        if (res && this.data.countStep > 0) {
          let fmApprovalStep = res;
          let gridModels = new GridModels();
          gridModels.dataValue = this.data.recID;
          gridModels.predicate = 'TransID=@0';
          gridModels.funcID = fmApprovalStep.funcID;
          gridModels.entityName = fmApprovalStep.entityName;
          gridModels.gridViewName = fmApprovalStep.gridViewName;
          gridModels.pageSize = 20;
        }
      });

      //get Autonumber
      this.esService.getAutoNumber(this.data.categoryID).subscribe((res) => {
        if (res != null) {
          this.autoNumber = res;
          if (res.autoNoCode != null) {
            this.setViewAutoNumber(this.autoNumber);
            this.isAddAutoNumber = false;
          }
        }
      });
      this.isAfterRender = true;
    }
  }

  valueChange(event) {
    if (event?.field && event?.component) {
      this.data[event['field']] = event.data;
      this.form?.formGroup?.patchValue({ [event['field']]: event.data });
    }
    this.cr.detectChanges();
  }

  beforeSave(option: RequestOption) {
    let itemData = this.data;

    if (this.isAdd && this.isSaved == false) {
      option.methodName = 'AddNewAsync';
    } else {
      option.methodName = 'EditCategoryAsync';
    }
    option.data = [itemData];
    return true;
  }

  onSaveForm(isClose: boolean) {
    if (this.form?.formGroup.invalid == true) {
      this.esService.notifyInvalid(this.form?.formGroup, this.formModel);
      return;
    }
    if (this.viewAutoNumber == '') {
      let headerText = this.grvSetup['AutoNumber']?.headerText ?? 'AutoNumber';
      this.notify.notifyCode('SYS028', 0, '"' + headerText + '"');
      return;
    }

    this.dialog.dataService.dataSelected = this.data;
    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt), 0)
      .subscribe((res) => {
        if (res.update || res.save) {
          this.isSaved = true;
          if (res.update) {
            (this.dialog.dataService as CRUDService)
              .update(res.update)
              .subscribe();
          }
          if (isClose) {
            this.dialog && this.dialog.close();
          }
        }
      });
  }

  openAutoNumPopup() {
    if (this.data.categoryID == '' || this.data.categoryID == null) {
      let headerText = this.grvSetup['CategoryID']?.headerText ?? 'CategoryID';
      this.notify.notifyCode('SYS028', 0, '"' + headerText + '"');
      return;
    }
    let popupAutoNum = this.cfService.openForm(
      PopupAddAutoNumberComponent,
      '',
      550,
      (screen.width * 40) / 100,
      '',
      {
        formModel: this.dialog.formModel,
        autoNoCode: this.data.categoryID,
        description: this.formModel?.entityName,
      }
    );
    popupAutoNum.closed.subscribe((res) => {
      if (res?.event) {
        this.setViewAutoNumber(res.event);
      }
    });
  }

  openPopupApproval() {
    if (this.form?.formGroup.invalid == true) {
      this.esService.notifyInvalid(this.form?.formGroup, this.formModel);
      return;
    }
    if (this.data.categoryID == '' || this.data.categoryID == null) {
      let headerText = this.grvSetup['CategoryID']?.headerText ?? 'CategoryID';
      this.notify.notifyCode('SYS028', 0, '"' + headerText + '"');
      return;
    }
    if (this.viewAutoNumber == '') {
      let headerText = this.grvSetup['AutoNumber']?.headerText ?? 'AutoNumber';
      this.notify.notifyCode('SYS028', 0, '"' + headerText + '"');
      return;
    }
    if (this.isAdd) {
      this.esService.addNewCategory(this.data).subscribe((res) => {
        if (res) {
          this.data = res;
          this.isSaved = true;
        }
      });
    }
    let transID = this.data.recID;
    let data = {
      type: '0',
      transID: transID,
      model: this.form?.formGroup,
      data: this.data,
      isAddNew: !this.isSaved,
    };

    let dialogModel = new DialogModel();
    dialogModel.IsFull = true;

    let popupeStep = this.cfService.openForm(
      ApprovalStepComponent,
      '',
      screen.width,
      screen.height,
      '',
      data,
      '',
      dialogModel
    );

    popupeStep.closed.subscribe((res) => {
      if (res.event) {
        this.approvalStep?.initForm();
      }
    });
  }

  closePopup() {
    this.dialog && this.dialog.close();
  }

  setViewAutoNumber(modelAutoNumber) {
    let vllDateFormat;
    let vllStringFormat;
    this.cache.valueList('L0088').subscribe((vllDFormat) => {
      vllDateFormat = vllDFormat.datas;
      this.cache.valueList('L0089').subscribe((vllSFormat) => {
        vllStringFormat = vllSFormat.datas;
        let indexStrF = vllStringFormat.findIndex(
          (p) => p.value == modelAutoNumber?.stringFormat
        );
        let indexDF = vllDateFormat.findIndex(
          (p) => p.value == modelAutoNumber?.dateFormat
        );
        let stringFormat = '';
        let dateFormat = '';
        if (indexStrF >= 0) {
          stringFormat = vllStringFormat[indexStrF].text;
          stringFormat = stringFormat.replace(/&/g, '-').replace(/\s/g, '');
        }

        // replace chuỗi và dấu phân cách
        stringFormat = stringFormat
          .replace(
            /-/g,
            modelAutoNumber?.separator == null ? '' : modelAutoNumber?.separator
          )
          .replace(
            'Chuỗi',
            modelAutoNumber?.fixedString == null
              ? ''
              : modelAutoNumber?.fixedString
          );

        //replace ngày
        if (indexDF >= 0) {
          dateFormat =
            vllDateFormat[indexDF].text == 'None'
              ? ''
              : vllDateFormat[indexDF].text;
        }
        stringFormat = stringFormat.replace('Ngày', dateFormat);

        //replace số và set chiều dài
        let lengthNumber = modelAutoNumber?.maxLength - stringFormat.length + 2;
        if (lengthNumber < 0) {
          stringFormat = stringFormat.replace('Số', '');
          stringFormat = stringFormat.substring(0, modelAutoNumber?.maxLength);
        } else if (lengthNumber == 0) {
          stringFormat = stringFormat.replace('Số', '');
        } else {
          let strNumber = '#'.repeat(lengthNumber);
          stringFormat = stringFormat.replace('Số', strNumber);
        }
        this.viewAutoNumber = stringFormat;
        this.cr.detectChanges();
      });
    });
  }
}
