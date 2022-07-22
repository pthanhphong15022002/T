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
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { CodxEsService } from '../../../codx-es.service';
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
  @ViewChild('templateItem') templateItem: ElementRef;
  @ViewChild('content') content: TemplateRef<any>;
  @ViewChild('popupModal') popupModal;
  @ViewChild('editApprovalStep') editApprovalStep: TemplateRef<any>;
  @ViewChild('viewApprovalSteps') viewApprovalSteps: ApprovalStepComponent;

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
    private api: ApiHttpService,
    private notifyService: NotificationsService,
    private cache: CacheService,
    private cfService: CallFuncService,
    private cr: ChangeDetectorRef,
    private codxService: CodxService,
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
          this.isAfterRender = true;
          this.dialogCategory.patchValue({
            eSign: true,
            signatureType: '1',
            icon: 'icon-category',
          });
          this.dialogCategory.addControl(
            'countStep',
            new FormControl(this.data.countStep ?? 0)
          );
          this.dialogCategory.addControl(
            'id',
            new FormControl(this.data.id ?? '')
          );
          if (!this.isAdd) {
            this.dialogCategory.patchValue(this.data);

            this.api
              .callSv(
                'ES',
                'ES',
                'ApprovalStepsBusiness',
                'GetListApprovalStepAsync',
                [this.data.id]
              )
              .subscribe((res) => {
                if (res && res?.msgBodyData[0]) {
                  this.lstStep = res.msgBodyData[0];
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
      });
    this.isSaved = false;
    this.cr.detectChanges();
  }

  valueChange(event) {
    if (event?.field) {
      if (event?.data === Object(event?.data))
        this.dialogCategory.patchValue({ [event['field']]: event.data.value });
      else this.dialogCategory.patchValue({ [event['field']]: event.data });
    }
    this.cr.detectChanges();
  }

  onSaveForm(isClose) {
    if (this.dialogCategory.invalid == true) {
      return;
    }
    if (isClose) {
      this.dialog.dataService.dataSelected = this.dialogCategory.value;
      this.dialog.dataService
        .save((opt: any) => this.beforeSave(opt))
        .subscribe((res) => {
          if (res.update || res.save) {
            this.isSaved = true;
            this.updateAutonumber();
            if (res.save) {
              this.updateApprovalStep(res.save.id);
            } else {
              this.updateApprovalStep();
            }

            this.dialog && this.dialog.close();
          }
        });
    } else {
      this.esService
        .addNewCategory(this.dialogCategory.value)
        .subscribe((res) => {
          if (res) {
            this.cfService.openForm(
              ApprovalStepComponent,
              '',
              900,
              800,
              '',
              res.id
            );
          }
        });
    }
  }

  updateAutonumber() {
    this.esService.isSetupAutoNumber.subscribe((res) => {
      if (res != null) {
        this.esService.addEditAutoNumbers(res, true).subscribe((res) => {});
      }
    });
  }

  updateApprovalStep(id = null) {
    if (id == null) {
      this.esService.editApprovalStep().subscribe((res) => {
        console.log('result edit appp', res);
      });

      this.esService.deleteApprovalStep().subscribe((res) => {
        console.log('result delete aaappppp', res);
      });
    } else {
      //Them moi
      this.esService.addNewApprovalStep(id).subscribe((res) => {
        console.log('result add new appp', res);
      });
    }
  }

  beforeSave(option: any) {
    let itemData = this.dialogCategory.value;
    let countStep = 0;
    if (this.isAdd) {
      option.method = 'AddNewAsync';
    } else {
      option.method = 'EditCategoryAsync';
    }

    this.esService.approvalStep.subscribe((res) => {
      if (res) {
        countStep = res.length;
      }
    });

    option.data = [itemData, this.isAdd, this.lstApproval, countStep];
    return true;
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
    let transID = '';
    if (!this.isAdd) {
      transID = this.dialogCategory.value.id;
    }
    let data = {
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

  getCount(countStep) {
    let lstNumber = [];
    for (let i = 0; i < countStep; i++) {
      lstNumber.push(i + 1);
    }
    return lstNumber;
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
