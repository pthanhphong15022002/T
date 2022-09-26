import {
  AfterViewInit,
  Component,
  EventEmitter,
  Injector,
  Input,
  Optional,
  Output,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';

import {
  DialogData,
  DialogRef,
  FormModel,
  ImageViewerComponent,
  UIComponent,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';

import { CodxEpService } from '../../../codx-ep.service';

@Component({
  selector: 'popup-add-drivers',
  templateUrl: 'popup-add-drivers.component.html',
  styleUrls: ['popup-add-drivers.component.scss'],
})
export class PopupAddDriversComponent
  extends UIComponent
  implements AfterViewInit
{
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;

  @Input() editResources: any;
  @Input() isAdd = true;
  @Input() data: any;
  @Output() closeEdit = new EventEmitter();
  @Output() onDone = new EventEmitter();

  headerText = '';
  subHeaderText = '';

  fGroupAddDriver: FormGroup;
  formModel: FormModel;
  dialogRef: DialogRef;

  CbxName: any;
  isAfterRender = false;

  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.data = dialogData?.data[0];
    this.isAdd = dialogData?.data[1];
    this.dialogRef = dialogRef;
    this.formModel = this.dialogRef.formModel;
  }

  onInit(): void {
    this.initForm();

    this.codxEpService
      .getComboboxName(
        this.dialogRef.formModel.formName,
        this.dialogRef.formModel.gridViewName
      )
      .then((res) => {
        this.CbxName = res;
        console.log('cbx', this.CbxName);
      });
  }

  ngAfterViewInit(): void {}

  initForm() {
    if (this.isAdd) {
      this.headerText = 'Thêm mới lái xe';
    } else {
      this.headerText = 'Sửa thông tin lái xe';
    }
    this.codxEpService
      .getFormGroup(
        this.dialogRef.formModel.formName,
        this.dialogRef.formModel.gridViewName
      )
      .then((item) => {
        this.fGroupAddDriver = item;
        if (this.data) {
          this.fGroupAddDriver.patchValue(this.data);
          this.fGroupAddDriver.patchValue({
            resourceType: '3',
            linkType: '2',
          });
        }
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
      cbxCar.forEach((element) => {
        if (element.ResourceID == event.component.valueSelected) {
          this.fGroupAddDriver.patchValue({ code: element.Code });
          this.detectorRef.detectChanges();
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
      this.codxEpService.notifyInvalid(this.fGroupAddDriver, this.formModel);
      return;
    }
    if (this.fGroupAddDriver.value.category != 1) {
      this.fGroupAddDriver.value.companyID = null;
    } else {
      if (this.fGroupAddDriver.value.companyID instanceof Object) {
        this.fGroupAddDriver.patchValue({
          companyID: this.fGroupAddDriver.value.companyID[0],
        });
      }
    }
    if (this.fGroupAddDriver.value.owner instanceof Object) {
      this.fGroupAddDriver.patchValue({
        owner: this.fGroupAddDriver.value.owner[0],
      });
    }
    if (this.fGroupAddDriver.value.linkID instanceof Object) {
      this.fGroupAddDriver.patchValue({
        linkID: this.fGroupAddDriver.value.linkID[0],
      });
    }
    this.fGroupAddDriver.patchValue({
      resourceType: '3',
      linkType: '2',
    });

    this.dialogRef.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe((res) => {
        if (res) {
          let objectID= res.save.recID !=null? res.save.recID:res.update.recID;
          this.imageUpload
            .updateFileDirectReload(objectID)
            .subscribe((result) => {
              if (result) {
                //this.loadData.emit();
              }
            });
          this.dialogRef.close();
        }
        return;
      });
    //this.attachment.saveFilesObservable().subscribe(res => { })
  }

  fileCount(event) {
    this.fGroupAddDriver.value.icon = event.data[0].data;
  }

  fileAdded(event) {}

  popupUploadFile() {
    this.attachment.uploadFile();
  }

  closeFormEdit(data) {
    this.initForm();
    this.closeEdit.emit(data);
  }
}
