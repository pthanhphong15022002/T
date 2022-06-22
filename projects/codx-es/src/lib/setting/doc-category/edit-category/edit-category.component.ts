import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Optional,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataItem } from '@shared/models/folder.model';
import {
  ApiHttpService,
  CallFuncService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { debug } from 'console';
import {
  AddGridData,
  CodxEsService,
  ModelPage,
} from '../../../codx-es.service';
import { ApprovalStepsComponent } from '../../approval-steps/approval-steps.component';
@Component({
  selector: 'app-edit-category',
  templateUrl: './edit-category.component.html',
  styleUrls: ['./edit-category.component.scss'],
})
export class EditCategoryComponent implements OnInit, AfterViewInit {
  @Output() closeForm = new EventEmitter();
  @Output() openAsideForm = new EventEmitter();

  @ViewChild('templateItem') templateItem: ElementRef;
  @ViewChild('content') content: TemplateRef<any>;
  @ViewChild('popupModal') popupModal;
  @ViewChild('editApprovalStep') editApprovalStep: TemplateRef<any>;
  @ViewChild('viewApprovalSteps') viewApprovalSteps: ApprovalStepsComponent;

  color: any;
  dialogCategory: FormGroup;
  isAfterRender: boolean = false;
  cbxName;
  dataGrid: AddGridData;
  isAdd: boolean = false;
  showPlan = true;
  isSaved = false;
  isClose = true;
  transID: String = '';
  stepNo: number = -1;

  dialogAutoNum: FormGroup;
  isAfterAuto = false;
  cbxNameAuto: any;

  headerText = 'Thêm mới Phân loại tài liệu';
  subHeaderText = 'Tạo & upload file văn bản';
  dialog: DialogRef;
  data: any;

  formModel: FormModel;

  constructor(
    private esService: CodxEsService,
    private api: ApiHttpService,
    private notifyService: NotificationsService,
    private cfService: CallFuncService,
    private modalService: NgbModal,
    @Optional() dialog: DialogRef,
    @Optional() data: DialogData
  ) {
    this.dialog = dialog;
    this.data = data;
    this.formModel = this.dialog.formModel;
  }
  html: any;
  ngAfterViewInit(): void {}

  ngOnInit(): void {
    this.initForm();

    this.esService
      .getComboboxName(this.formModel.formName, this.formModel.gridViewName)
      .then((res) => {
        if (res) this.cbxName = res;
      });

    this.initAutoNumber();
  }

  initForm() {
    this.esService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((res) => {
        if (res) {
          this.dialogCategory = res;
          this.isAfterRender = true;
          this.dialogCategory.patchValue({ eSign: true, signatureType: '1' });
        }
      });
    this.isAdd = true;
    this.isSaved = false;
  }

  initAutoNumber() {
    this.esService.getFormGroup('AutoNumbers', 'grvAutoNumbers').then((res) => {
      if (res) {
        this.dialogAutoNum = res;
        this.isAfterAuto = true;

        this.dialogAutoNum.patchValue({ step: 1 });
      }
    });

    this.esService
      .getComboboxName('AutoNumbers', 'grvAutoNumbers')
      .then((res) => {
        if (res) {
          this.cbxNameAuto = res;
        }
      });
  }

  valueChange(event) {
    if (event?.field) {
      if (event?.data === Object(event?.data))
        this.dialogCategory.patchValue({ [event['field']]: event.data.value });
      else this.dialogCategory.patchValue({ [event['field']]: event.data });
    }
  }

  valueChange1(event) {
    if (event?.field) {
      if (event?.data === Object(event?.data))
        this.dialogAutoNum.patchValue({
          [event['field']]: event.data.value ?? event.data.checked,
        });
      else this.dialogAutoNum.patchValue({ [event['field']]: event.data });
    }
  }

  onSaveAutoNumber() {
    if (this.dialogAutoNum.invalid == true) {
      return;
    }

    this.api
      .callSv('SYS', 'AD', 'AutoNumbersBusiness', 'SettingAutoNumberAsync', [
        this.dialogAutoNum.value,
      ])
      .subscribe((res) => {
        if (res && res.msgBodyData[0]) {
        }
      });
  }

  onSaveForm(isClose) {
    if (this.dialogCategory.invalid == true) {
      return;
    }

    this.api
      .callSv(
        'ES',
        'ERM.Business.ES',
        'CategoriesBusiness',
        'AddEditItemAsync',
        [this.dialogCategory.value, this.isAdd, '']
      )
      .subscribe((res) => {
        if (res && res.msgBodyData[0]) {
          this.dataGrid = new AddGridData();
          this.dataGrid.dataItem = res.msgBodyData[0];
          this.dataGrid.isAdd = this.isAdd;
          this.dataGrid.key = 'categoryID';
          this.isSaved = true;
          this.transID = res.msgBodyData[0].id;
          this.isAdd = false;
          if (!isClose) {
            this.modalService
              .open(this.popupModal, { centered: true, size: 'xl' })
              .result.then(
                (result) => {},
                (reason) => {}
              );
          }
        } else {
          this.notifyService.notifyCode('E0011');
        }
        if (isClose) this.close(this.dataGrid);
      });
  }

  openPopup(content, title) {
    // this.cfService.openForm(content, title, 750, 1000).subscribe((res) => {
    //   res.close = this.closePopup();
    //   // let hmtl = (content as any).getElementById('templateItem');
    //   // this.setHtml();
    // });
  }

  openPopupModal() {
    console.log(this.viewApprovalSteps);

    if (this.isAdd) {
      this.onSaveForm(false);
    } else {
      this.transID = this.dialogCategory.value.recID;
      this.modalService
        .open(this.popupModal, { centered: true, size: 'xl' })
        .result.then(
          (result) => {},
          (reason) => {}
        );
    }
  }

  closePopup() {}

  close(data) {
    this.initForm();
    this.closeForm.emit(data);
  }

  openAside() {
    this.openAsideForm.emit();
  }

  setHtml() {
    this.html = this.templateItem.nativeElement;
    let parent = document.getElementsByClassName(
      'timeline-items'
    )[0] as HTMLElement;
    let inner = '';
    let frag = [];
    for (let i = 0; i < this.data.length; i++) {
      let ele = this.html as HTMLElement;
      for (let j = 0; j < this.data[i].approvers.length; j++) {
        let childEle = ele
          .getElementsByClassName('flex-wrap')[0]
          .children.item(j);
        childEle
          .getElementsByTagName('codx-img')[0]
          .setAttribute('objectId', this.data[i].approvers[j].userID);
        childEle
          .getElementsByTagName('codx-img')[0]
          .setAttribute(
            'ng-reflect-object-id',
            this.data[i].approvers[j].userID
          );
      }

      ele.style.display = 'block';
      (ele as HTMLElement).getElementsByClassName('step-order')[0].innerHTML =
        this.data[i].number.toString();
      (ele as HTMLElement).getElementsByClassName(
        'stepper-title'
      )[0].innerHTML = this.data[i].name.toString();
      (ele as HTMLElement).getElementsByClassName('stepper-desc')[0].innerHTML =
        this.data[i].name2.toString();
      frag.push(ele);
      inner += ele.outerHTML;
    }
    if (parent) {
      // let inner = '';
      // frag.forEach((item) => {
      //   inner = inner + item.innerHTML;
      // });
      parent.innerHTML = inner;
    }
  }

  extendShowPlan() {
    this.showPlan = !this.showPlan;
  }

  getCount(countStep) {
    let lstNumber = [];
    for (let i = 0; i < countStep; i++) {
      lstNumber.push(i + 1);
    }
    return lstNumber;
  }

  openAddEditStep(data) {
    // this.transID = data.transID;
    // this.stepNo = data.stepNo;
    // this.cfService
    //   .openForm(this.editApprovalStep, '', 750, 1000)
    //   .subscribe((res) => {
    //     res.close = this.close1();
    //   });
  }

  close1() {}

  changeStep(data) {
    if (data) {
      this.popupModal.addHandler(data, this.stepNo);
    }
  }
}
