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
import { CodxEsService, GridModels } from '../../../codx-es.service';
import { ApprovalStepComponent } from '../../approval-step/approval-step.component';
import { PopupAddAutoNumberComponent } from '../popup-add-auto-number/popup-add-auto-number.component';
@Component({
  selector: 'popup-add-category',
  templateUrl: './popup-add-category.component.html',
  styleUrls: ['./popup-add-category.component.scss'],
})
export class PopupAddCategoryComponent implements OnInit, AfterViewInit {
  @Output() closeForm = new EventEmitter();
  @Output() openAsideForm = new EventEmitter();

  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('editApprovalStep') editApprovalStep: TemplateRef<any>;

  dialogCategory: FormGroup;
  isAfterRender: boolean = false;
  cbxName;
  viewAutoNumber = '';

  isAdd: boolean = false;
  isSaved = false;
  isAddAutoNumber = true;
  isClose = true;
  transID: String = '';

  headerText = 'Thêm mới Phân loại tài liệu';
  subHeaderText = 'Tạo & upload file văn bản';
  dialog: DialogRef;
  data: any;

  lstStep = [];

  autoNumber: any;

  formModel: FormModel;
  lstApproval: any = null;

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
    this.data = data?.data[0];
    this.isAdd = data?.data[1];
    this.formModel = this.dialog.formModel;
  }

  ngAfterViewInit(): void {
    this.esService.isSetupAutoNumber.subscribe((res) => {
      if (res != null) {
        this.autoNumber = res.value;
        this.setViewAutoNumber(res.value);
      }
    });

    this.esService.isSetupApprovalStep.subscribe((res) => {
      this.lstStep = res;
    });

    this.dialog.closed.subscribe((res) => {
      this.esService.setupAutoNumber.next(null);
      this.esService.setLstDeleteStep(null);
      this.esService.setApprovalStep(null);
      if (!this.isSaved && this.isAddAutoNumber) {
        //delete autoNumer đã thiết lập
        this.esService
          .deleteAutoNumber(this.dialogCategory.value.categoryID)
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
    this.initForm();

    this.esService
      .getComboboxName(this.formModel.formName, this.formModel.gridViewName)
      .then((res) => {
        if (res) this.cbxName = res;
      });
  }

  initForm() {
    this.esService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((res) => {
        if (res) {
          this.dialogCategory = res;
          this.dialogCategory.patchValue({
            eSign: true,
            signatureType: '1',
            icon: 'icon-text_snippet',
            color: '#0078FF',
          });
          this.dialogCategory.addControl(
            'countStep',
            new FormControl(this.data.countStep ?? 0)
          );
          this.dialogCategory.addControl(
            'id',
            new FormControl(this.data.id ?? '')
          );
          this.dialogCategory.addControl(
            'recID',
            new FormControl(this.data.recID)
          );
          if (!this.isAdd) {
            this.dialogCategory.patchValue(this.data);
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

                this.esService.getApprovalSteps(gridModels).subscribe((res) => {
                  if (res && res?.length >= 0) {
                    this.lstStep = res;
                  }
                });
              }
            });

            //get Autonumber
            this.esService
              .getAutoNumber(this.data.categoryID)
              .subscribe((res) => {
                if (res != null) {
                  this.autoNumber = res;
                  if (res.autoNoCode != null) {
                    this.setViewAutoNumber(this.autoNumber);
                    this.isAddAutoNumber = false;
                  }
                }
              });
          } else {
            this.codxService
              .getAutoNumber(
                this.formModel.funcID,
                this.formModel.entityName,
                'CategoryID'
              )
              .subscribe((dt: any) => {
                this.dialogCategory.patchValue({ categoryID: dt });
              });
          }
        }
        this.isAfterRender = true;
      });
    this.isSaved = false;
    this.cr.detectChanges();
  }

  valueChange(event) {
    if (event?.field && event?.component) {
      if (event?.data === Object(event?.data))
        this.dialogCategory.patchValue({ [event['field']]: event.data.value });
      else this.dialogCategory.patchValue({ [event['field']]: event.data });
    }
    this.cr.detectChanges();
  }

  beforeSave(option: RequestOption) {
    let itemData = this.dialogCategory.value;
    let countStep = this.lstStep?.length ?? 0;
    if (this.isAdd) {
      option.methodName = 'AddNewAsync';
    } else {
      option.methodName = 'EditCategoryAsync';
    }
    option.data = [itemData, countStep];
    return true;
  }

  onSaveForm() {
    if (this.dialogCategory.invalid == true) {
      return;
    }
    this.dialog.dataService.dataSelected = this.dialogCategory.value;
    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe((res) => {
        if (res.update || res.save) {
          this.isSaved = true;
          this.updateAutonumber();
          if (res.save) {
            this.updateApprovalStep(true);
          } else {
            (this.dialog.dataService as CRUDService)
              .update(res.update)
              .subscribe();
            this.updateApprovalStep(false);
          }
          this.dialog && this.dialog.close();
        } else this.notify.notifyCode('E0011');
      });
  }

  updateAutonumber() {
    this.esService.isSetupAutoNumber.subscribe((res) => {
      if (res != null) {
        this.esService.addEditAutoNumbers(res, true).subscribe((res) => {});
      }
    });
  }

  updateApprovalStep(isAddNew) {
    if (!isAddNew) {
      this.esService.editApprovalStep().subscribe((res) => {
        console.log('result edit appp', res);
      });

      this.esService.deleteApprovalStep().subscribe((res) => {
        console.log('result delete aaappppp', res);
      });
    } else {
      //Them moi
      this.esService.addNewApprovalStep().subscribe((res) => {
        console.log('result add new appp', res);
      });
    }
  }

  openAutoNumPopup() {
    this.cfService.openForm(
      PopupAddAutoNumberComponent,
      '',
      (screen.width * 35) / 100,
      (screen.width * 40) / 100,
      '',
      [
        {
          formModel: this.dialog.formModel,
          autoNoCode: this.dialogCategory.value.categoryID,
        },
      ]
    );
  }

  openPopupApproval() {
    let transID = this.dialogCategory.value.recID;
    let data = {
      type: '0',
      transID: transID,
      model: this.dialogCategory,
    };

    let dialogModel = new DialogModel();
    dialogModel.IsFull = true;

    this.cfService.openForm(
      ApprovalStepComponent,
      '',
      screen.width,
      screen.height,
      '',
      data,
      '',
      dialogModel
    );
  }

  closePopup() {
    this.esService.setupAutoNumber.next(null);
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
          (p) => p.value == modelAutoNumber.stringFormat.toString()
        );
        let indexDF = vllDateFormat.findIndex(
          (p) => p.value == modelAutoNumber.dateFormat?.toString()
        );
        let stringFormat = '';
        let dateFormat = '';
        if (indexStrF >= -1) {
          stringFormat = vllStringFormat[indexStrF].text;
          stringFormat = stringFormat.replace(/&/g, '-').replace(/\s/g, '');
        }

        // replace chuỗi và dấu phân cách
        stringFormat = stringFormat
          .replace(
            'Chuỗi',
            modelAutoNumber.fixedString == null
              ? ''
              : modelAutoNumber.fixedString
          )
          .replace(
            /-/g,
            modelAutoNumber.separator == null ? '' : modelAutoNumber.separator
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
        let lengthNumber = modelAutoNumber.maxLength - stringFormat.length + 2;
        if (lengthNumber < 0) {
          stringFormat = stringFormat.replace('Số', '');
          stringFormat = stringFormat.substring(0, modelAutoNumber.maxLength);
        } else if (lengthNumber == 0) {
          stringFormat = stringFormat.replace('Số', '');
        } else {
          let strNumber = '#'.repeat(lengthNumber);
          stringFormat = stringFormat.replace('Số', strNumber);
        }
        this.viewAutoNumber = stringFormat;
      });
    });
  }
}
