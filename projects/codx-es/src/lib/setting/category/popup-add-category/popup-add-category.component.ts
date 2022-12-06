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
import { CodxApproveStepsComponent } from 'projects/codx-share/src/lib/components/codx-approve-steps/codx-approve-steps.component';
import { SettingAlertDrawerComponent } from 'projects/codx-share/src/lib/layout/drawers/alert-drawer/setting-alert-drawer/setting-alert-drawer.component';
import { CodxEsService, GridModels } from '../../../codx-es.service';
//import { ApprovalStepComponent } from '../../approval-step/approval-step.component';
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
  disableCategoryID: string;

  headerText = '';
  subHeaderText = '';
  dialog: DialogRef;
  data: any;

  autoNumber: any;

  formModel: FormModel;
  lstApproval: any = null;
  grvSetup: any;
  settingDataValue: any;
  //havaESign: boolean = false;

  type: string;
  parentRecID: string;
  oldRecID: string;

  //test to update signtype for all step
  isChangeSignatureType: boolean = false;
  signatureType: string;

  oUpdate: any = null; //update item in grid

  hasModuleES: boolean = false;

  constructor(
    private esService: CodxEsService,
    private cache: CacheService,
    private cfService: CallFuncService,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    @Optional() dialog: DialogRef,
    @Optional() data: DialogData
  ) {
    this.dialog = dialog;
    this.data = JSON.parse(JSON.stringify(dialog?.dataService?.dataSelected));
    this.signatureType = dialog?.dataService?.dataSelected?.signatureType;
    this.isAdd = data?.data?.isAdd;
    this.formModel = this.dialog.formModel;
    this.headerText = data?.data?.headerText;
    this.type = data?.data?.type;
    this.oldRecID = data?.data?.oldRecID;
    this.disableCategoryID = data?.data?.disableCategoryID ?? '0';
  }

  ngAfterViewInit(): void {
    this.dialog.closed.subscribe((res) => {
      if (res.event == null && this.oUpdate != null) {
        //update gridView dont use btb Save when close form
        this.dialog.dataService.update(this.oUpdate).subscribe();
      }

      this.esService.setLstDeleteStep(null);
      this.esService.setApprovalStep(null);
      if (this.isSaved) {
        this.esService.deleteCategory(this.data.categoryID);
      }
      if (this.type == 'copy' && !this.isSaved) {
        this.esService.deleteStepByTransID(this.data?.recID).subscribe();
      }
      if (!this.isSaved && this.isAddAutoNumber) {
        //delete autoNumer đã thiết lập
        this.esService
          .deleteAutoNumber(this.data.categoryID)
          .subscribe((resDelete) => {});

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
    let predicate = 'RefModule=@0 and FormName=@1';
    let dataValue = 'SYS;System';
    this.esService
      .getSettingByPredicate(predicate, dataValue)
      .subscribe((res) => {
        if (res?.dataValue) {
          let item = JSON.parse(res?.dataValue);
          if (item?.ES1 == true) {
            this.hasModuleES = true;
            this.cr.detectChanges();
          }
        }
      });
    //copy
    if (this.type == 'copy') {
      //New list step
      this.esService
        .copyApprovalStep(this.oldRecID, this.data.recID)
        .subscribe((res) => {});
    }
    this.cache
      .gridViewSetup(this.formModel.formName, this.formModel.gridViewName)
      .subscribe((grv) => {
        if (grv) this.grvSetup = grv;
        this.cr.detectChanges();
      });

    // this.cache.functionList('ES').subscribe((res) => {
    //   if (res) this.havaESign = true;
    //   if (this.isAdd == true) {
    //     this.data.eSign = this.havaESign;
    //     this.cr.detectChanges();
    //   }
    // });
    if (this.isAdd) {
      this.data.countStep = 0;

      this.esService
        .getSettingByPredicate(
          'FormName=@0 and Category=@1',
          'ESParameters;' + 1
        )
        .subscribe((setting) => {
          if (setting?.dataValue) {
            this.settingDataValue = JSON.parse(setting.dataValue);
            if (this.settingDataValue) {
              let lstTrueFalse = ['AllowEditAreas'];
              for (const key in this.settingDataValue) {
                let fieldName = key.charAt(0).toLowerCase() + key.slice(1);
                this.data[fieldName] = this.settingDataValue[key];

                if (lstTrueFalse.includes(key)) {
                  this.data[fieldName] =
                    this.settingDataValue[key] == '0' ? false : true;
                  if (key == 'AreaControl') {
                  }
                } else {
                  this.data[fieldName] = this.settingDataValue[key];
                }
                //this.data[fieldName] = this.settingDataValue[key];
                this.form.formGroup.patchValue({
                  fieldName: this.data[fieldName],
                });
              }
              this.esService
                .getAutoNumber(this.data.autoNumber)
                .subscribe((res) => {
                  if (res != null) {
                    this.autoNumber = res;
                    if (res.autoNoCode != null) {
                      this.setViewAutoNumber(this.autoNumber);
                      this.isAddAutoNumber = false;
                    }
                  }
                });
              this.cr.detectChanges();
            }
          }
        });
    } else {
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
      this.esService.getAutoNumber(this.data.autoNumber).subscribe((res) => {
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
      let fieldName =
        event.field.charAt(0).toUpperCase() + event.field.slice(1);
      switch (event?.field) {
        case 'areaControl': {
          this.data[event['field']] = event.data == true ? '1' : '0';
          this.form?.formGroup?.patchValue({
            [event['field']]: this.data[event['field']],
          });
          break;
        }
        case 'confirmControl': {
          if (this.data?.countStep > 0) {
            this.notify.alertCode('ES023').subscribe((x) => {
              //open popup confirm
              let lastValue = JSON.parse(
                JSON.stringify(this.data.confirmControl)
              );

              if (x.event?.status == 'Y') {
                this.data.confirmControl = event?.data ? '1' : '0';
                this.form?.formGroup?.patchValue({
                  [event['field']]: event.data,
                });
                this.esService
                  .updateFieldApprovalStepAsync(
                    this.data.recID,
                    fieldName,
                    event.data
                  )
                  .subscribe();

                this.esService.updateCategory(this.data).subscribe((res) => {
                  if (res) {
                    this.oUpdate = res;
                  }
                });
              } else {
                // back data
                this.data.confirmControl = event?.data ? '1' : '0';
                this.data.confirmControl = lastValue == '1' ? true : false;
                this.cr.detectChanges();
              }
            });
          } else {
            this.data[event['field']] = event.data ? '1' : '0';
            this.form?.formGroup?.patchValue({
              [event['field']]: this.data[event['field']],
            });
          }
          break;
        }
        case 'signatureType': {
          if (this.data?.countStep > 0) {
            this.notify.alertCode('ES023').subscribe((x) => {
              //open popup confirm
              let lastValue = JSON.parse(
                JSON.stringify(this.data.signatureType)
              );

              if (x.event?.status == 'Y') {
                this.data[event['field']] = event.data;
                this.form?.formGroup?.patchValue({
                  [event['field']]: event.data,
                });
                this.esService
                  .updateFieldApprovalStepAsync(
                    this.data.recID,
                    fieldName,
                    event.data
                  )
                  .subscribe();

                this.esService.updateCategory(this.data).subscribe((res) => {
                  if (res) {
                    this.oUpdate = res;
                  }
                });
              } else {
                this.data[event['field']] = event.data;
                this.cr.detectChanges();
                this.data.signatureType = lastValue;
                this.cr.detectChanges();
              }
            });
          } else {
            this.data[event['field']] = event.data;
            this.form?.formGroup?.patchValue({ [event['field']]: event.data });
          }
          break;
        }
        default: {
          this.data[event['field']] = event.data;
          this.form?.formGroup?.patchValue({ [event['field']]: event.data });
        }
      }
    }
    this.cr.detectChanges();
  }

  beforeSave(option: RequestOption) {
    let itemData = this.data;

    if (this.isAdd && this.isSaved == false) {
      option.methodName = 'AddNewAsync';
    } else {
      if (this.isSaved == false && this.type == 'copy') {
        option.methodName = 'AddNewAsync';
      } else option.methodName = 'EditCategoryAsync';
    }
    option.data = [itemData];
    return true;
  }

  onSaveForm(isClose: boolean) {
    if (this.form?.formGroup.invalid == true) {
      this.esService.notifyInvalid(this.form?.formGroup, this.formModel);
      return;
    }
    if (this.data.eSign && this.viewAutoNumber == '') {
      let headerText = this.grvSetup['AutoNumber']?.headerText ?? 'AutoNumber';
      this.notify.notifyCode('SYS009', 0, '"' + headerText + '"');
      return;
    }

    this.dialog.dataService.dataSelected = this.data;
    if (
      (this.isAdd && this.isSaved == false) ||
      (this.isSaved == false && this.type == 'copy')
    ) {
      this.esService.addNewCategory(this.data).subscribe((res) => {
        if (res) {
          this.isSaved = true;
          if (isClose) {
            this.dialog && this.dialog.close(res);
          }
        }
      });
    } else {
      this.esService.updateCategory(this.data).subscribe((res) => {
        if (res) {
          this.isSaved = true;
          if (isClose) {
            this.dialog && this.dialog.close(res);
          }
        }
      });
    }
  }

  openAutoNumPopup() {
    if (this.data.categoryID == '' || this.data.categoryID == null) {
      let headerText = this.grvSetup['CategoryID']?.headerText ?? 'CategoryID';
      this.notify.notifyCode('SYS009', 0, '"' + headerText + '"');
      return;
    }
    if (this.data.autoNumber != this.data.categoryID) {
      //save new autoNumber
      let popupAutoNum = this.cfService.openForm(
        PopupAddAutoNumberComponent,
        '',
        550,
        (screen.width * 40) / 100,
        '',
        {
          formModel: this.dialog.formModel,
          autoNoCode: this.data.autoNumber,
          description: this.formModel?.entityName,
          newAutoNoCode: this.data.categoryID,
          isSaveNew: '1',
        }
      );
      popupAutoNum.closed.subscribe((res) => {
        if (res?.event) {
          this.setViewAutoNumber(res.event);
          this.data.autoNumber = this.data.categoryID;
          this.form.formGroup.patchValue({ autoNumber: this.data.autoNumber });
        }
      });
    } else {
      //cap
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
          this.data.autoNumber = this.data.categoryID;
          this.form.formGroup.patchValue({ autoNumber: this.data.autoNumber });
        }
      });
    }
  }

  openPopupApproval() {
    if (this.form?.formGroup.invalid == true) {
      this.esService.notifyInvalid(this.form?.formGroup, this.formModel);
      return;
    }
    if (this.data.categoryID == '' || this.data.categoryID == null) {
      let headerText = this.grvSetup['CategoryID']?.headerText ?? 'CategoryID';
      this.notify.notifyCode('SYS009', 0, '"' + headerText + '"');
      return;
    }
    if (this.data.eSign && this.viewAutoNumber == '') {
      let headerText = this.grvSetup['AutoNumber']?.headerText ?? 'AutoNumber';
      this.notify.notifyCode('SYS009', 0, '"' + headerText + '"');
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
      CodxApproveStepsComponent,
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
        if (vllStringFormat && vllDateFormat && modelAutoNumber) {
          let dateFormat = '';
          if (modelAutoNumber?.dateFormat != '0') {
            dateFormat =
              vllDateFormat.filter(
                (p) => p.value == modelAutoNumber?.dateFormat
              )[0]?.text ?? '';
          }

          let lengthNumber = 0;
          let strNumber = '';

          switch (modelAutoNumber?.stringFormat) {
            // {value: '0', text: 'Chuỗi & Ngày - Số', default: 'Chuỗi & Ngày - Số', color: null, textColor: null, …}
            case '0': {
              this.viewAutoNumber =
                modelAutoNumber?.fixedString +
                dateFormat +
                modelAutoNumber?.separator;
              lengthNumber =
                modelAutoNumber?.maxLength - this.viewAutoNumber.length;
              strNumber = '#'.repeat(lengthNumber);
              this.viewAutoNumber =
                modelAutoNumber?.fixedString +
                dateFormat +
                modelAutoNumber?.separator +
                strNumber;
              break;
            }
            // {value: '1', text: 'Chuỗi & Số - Ngày', default: 'Chuỗi & Số - Ngày', color: null, textColor: null, …}
            case '1': {
              this.viewAutoNumber =
                modelAutoNumber?.fixedString +
                modelAutoNumber?.separator +
                dateFormat;
              lengthNumber =
                modelAutoNumber?.maxLength - this.viewAutoNumber.length;
              strNumber = '#'.repeat(lengthNumber);
              this.viewAutoNumber =
                modelAutoNumber?.fixedString +
                strNumber +
                modelAutoNumber?.separator +
                dateFormat;
              break;
            }
            // {value: '2', text: 'Số - Chuỗi & Ngày', default: 'Số - Chuỗi & Ngày', color: null, textColor: null, …}
            case '2': {
              this.viewAutoNumber =
                modelAutoNumber?.fixedString +
                modelAutoNumber?.separator +
                dateFormat;
              lengthNumber =
                modelAutoNumber?.maxLength - this.viewAutoNumber.length;
              strNumber = '#'.repeat(lengthNumber);
              this.viewAutoNumber =
                strNumber +
                modelAutoNumber?.separator +
                modelAutoNumber?.fixedString +
                dateFormat;
              break;
            }
            // {value: '3', text: 'Số - Ngày & Chuỗi', default: 'Số - Ngày & Chuỗi', color: null, textColor: null, …}
            case '3': {
              this.viewAutoNumber =
                modelAutoNumber?.fixedString +
                modelAutoNumber?.separator +
                dateFormat;
              lengthNumber =
                modelAutoNumber?.maxLength - this.viewAutoNumber.length;
              strNumber = '#'.repeat(lengthNumber);
              this.viewAutoNumber =
                strNumber +
                modelAutoNumber?.separator +
                dateFormat +
                modelAutoNumber?.fixedString;
              break;
            }
            // {value: '4', text: 'Ngày - Số & Chuỗi', default: 'Ngày - Số & Chuỗi', color: null, textColor: null, …}
            case '4': {
              this.viewAutoNumber =
                modelAutoNumber?.fixedString +
                modelAutoNumber?.separator +
                dateFormat;
              lengthNumber =
                modelAutoNumber?.maxLength - this.viewAutoNumber.length;
              strNumber = '#'.repeat(lengthNumber);
              this.viewAutoNumber =
                dateFormat +
                modelAutoNumber?.separator +
                strNumber +
                modelAutoNumber?.fixedString;
              break;
            }
            // {value: '5', text: 'Ngày & Chuỗi & Số', default: 'Ngày & Chuỗi & Số', color: null, textColor: null, …}
            case '5': {
              this.viewAutoNumber = modelAutoNumber?.fixedString + dateFormat;
              lengthNumber =
                modelAutoNumber?.maxLength - this.viewAutoNumber.length;
              strNumber = '#'.repeat(lengthNumber);
              this.viewAutoNumber =
                dateFormat + modelAutoNumber?.fixedString + strNumber;
              break;
            }
            // {value: '6', text: 'Chuỗi - Ngày', default: 'Chuỗi - Ngày', color: null, textColor: null, …}
            case '6': {
              this.viewAutoNumber =
                modelAutoNumber?.fixedString +
                modelAutoNumber?.separator +
                dateFormat;
              break;
            }
            // {value: '7', text: 'Ngày - Chuỗi', default: 'Ngày - Chuỗi', color: null, textColor: null, …}
            case '7': {
              this.viewAutoNumber =
                dateFormat +
                modelAutoNumber?.separator +
                modelAutoNumber?.fixedString;
              break;
            }
          }
          this.cr.detectChanges();
        }

        // vllStringFormat = vllSFormat.datas;
        // let indexStrF = vllStringFormat.findIndex(
        //   (p) => p.value == modelAutoNumber?.stringFormat
        // );
        // let indexDF = vllDateFormat.findIndex(
        //   (p) => p.value == modelAutoNumber?.dateFormat
        // );
        // let stringFormat = '';
        // let dateFormat = '';
        // if (indexStrF >= 0) {
        //   stringFormat = vllStringFormat[indexStrF].text;
        //   stringFormat = stringFormat.replace(/&/g, '-').replace(/\s/g, '');
        // }

        // // replace chuỗi và dấu phân cách
        // stringFormat = stringFormat
        //   .replace(
        //     /-/g,
        //     modelAutoNumber?.separator == null ? '' : modelAutoNumber?.separator
        //   )
        //   .replace(
        //     'Chuỗi',
        //     modelAutoNumber?.fixedString == null
        //       ? ''
        //       : modelAutoNumber?.fixedString
        //   );

        // //replace ngày
        // if (indexDF >= 0) {
        //   dateFormat =
        //     vllDateFormat[indexDF].text == 'None'
        //       ? ''
        //       : vllDateFormat[indexDF].text;
        // }
        // stringFormat = stringFormat.replace('Ngày', dateFormat);

        // //replace số và set chiều dài
        // let lengthNumber = modelAutoNumber?.maxLength - stringFormat.length + 2;
        // if (lengthNumber < 0) {
        //   stringFormat = stringFormat.replace('Số', '');
        //   stringFormat = stringFormat.substring(0, modelAutoNumber?.maxLength);
        // } else if (lengthNumber == 0) {
        //   stringFormat = stringFormat.replace('Số', '');
        // } else {
        //   let strNumber = '#'.repeat(lengthNumber);
        //   stringFormat = stringFormat.replace('Số', strNumber);
        // }
        // this.viewAutoNumber = stringFormat;
        // this.cr.detectChanges();
      });
    });
  }
}
