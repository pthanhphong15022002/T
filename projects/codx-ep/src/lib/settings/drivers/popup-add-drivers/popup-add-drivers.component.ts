import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Optional,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import {
  CacheService,
  CallFuncService,
  DialogData,
  DialogRef,
  FormModel,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';

import { CodxEpService } from '../../../codx-ep.service';

@Component({
  selector: 'popup-add-drivers',
  templateUrl: 'popup-add-drivers.component.html',
  styleUrls: ['popup-add-drivers.component.scss'],
})
export class PopupAddDriversComponent implements OnInit, AfterViewInit {
  @ViewChild('attachment') attachment: AttachmentComponent

  @Input() editResources: any;
  @Input() isAdd = true;
  @Input() data: any;
  @Output() closeEdit = new EventEmitter();
  @Output() onDone = new EventEmitter();

  headerText = '';
  subHeaderText = 'Tạo & upload file văn bản';

  fGroupAddDriver: FormGroup;
  formModel: FormModel;
  dialogRef: DialogRef;

  CbxName: any;
  isAfterRender = false;

  constructor(
    private callFuncService: CallFuncService,
    private cacheService: CacheService,
    private changeDetectorRef: ChangeDetectorRef,
    private codxEpService: CodxEpService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    this.data = dialogData?.data[0];
    this.isAdd = dialogData?.data[1];
    this.dialogRef = dialogRef;
    this.formModel = this.dialogRef.formModel;
  }
  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    this.initForm();

    this.codxEpService
      .getComboboxName(this.dialogRef.formModel.formName, this.dialogRef.formModel.gridViewName)
      .then((res) => {
        this.CbxName = res;
        console.log('cbx', this.CbxName);
      });
  }

  initForm() {
    if (this.isAdd) {
      this.headerText = "Thêm mới lái xe"
    }
    else {
      this.headerText = "Sửa thông tin lái xe"
    }
    this.codxEpService
      .getFormGroup(this.dialogRef.formModel.formName, this.dialogRef.formModel.gridViewName)
      .then((item) => {
        this.fGroupAddDriver = item;
        if (this.data) {
          this.fGroupAddDriver.patchValue(this.data);
        }
        this.fGroupAddDriver.addControl(
          'code',
          new FormControl(this.data.code)
        );
        this.isAfterRender = true;
      });
  }

  valueChange(event: any) {
    if (event?.field != null && event?.field != '') {
      if (event.data instanceof Object) {
        this.fGroupAddDriver.patchValue({ [event['field']]: event.data.value });
      } else {
        this.fGroupAddDriver.patchValue({ [event['field']]: event.data });
      }
    }
  }

  // valueChangeFGroup(event: any) {
  //   if (event?.data != '') {
  //     if (event.data instanceof Object) {
  //       this.fGroupAddDriver.patchValue({ [event.component.ControlName]: event.data.value });
  //     } else {
  //       this.fGroupAddDriver.patchValue({ [event.component.ControlName]: event.data });
  //     }
  //   }
  // }

  valueCbxCarChange(event: any) {
    if (event.data != '') {
      if (event.data instanceof Object) {
        this.fGroupAddDriver.patchValue({ [event['field']]: event.data.value });
      } else {
        this.fGroupAddDriver.patchValue({ [event['field']]: event.data });
      }
      var cbxCar = event.component.dataService.data;
      cbxCar.forEach(element => {
        if (element.ResourceID == event.component.valueSelected) {
          this.fGroupAddDriver.patchValue({ code: element.Code });
          this.changeDetectorRef.detectChanges();
        }
      });
    }
  }

  beforeSave(option: any) {
    let itemData = this.fGroupAddDriver.value;
    option.methodName = 'AddEditItemAsync';
    option.data = [itemData, this.isAdd];
    return true;
  }

  onSaveForm() {
    if (this.fGroupAddDriver.invalid == true) {
      console.log(this.fGroupAddDriver);
      return;
    }
    this.fGroupAddDriver.value.companyID = this.fGroupAddDriver.value.companyID[0];
    this.fGroupAddDriver.value.owner = this.fGroupAddDriver.value.owner[0];
    this.fGroupAddDriver.value.resourceType = '3';

    if (!this.fGroupAddDriver.value.linkType) {
      this.fGroupAddDriver.value.linkType = '2';
    }
    this.dialogRef.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe();
    this.attachment.saveFilesObservable().subscribe(res => { })
  }

  fileCount(event) {
    this.fGroupAddDriver.value.icon = event.data[0].data;
  }

  fileAdded(event) {
  }

  popupUploadFile() {
    this.attachment.uploadFile();
  }

  closeFormEdit(data) {
    this.initForm();
    this.closeEdit.emit(data);
  }
}
