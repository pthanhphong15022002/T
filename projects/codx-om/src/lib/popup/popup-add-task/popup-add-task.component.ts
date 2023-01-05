import { CodxOmService } from './../../codx-om.service';
import { Injector, Optional, ViewChild } from '@angular/core';
import { Component } from '@angular/core';
import {
  CRUDService,
  DialogData,
  DialogRef,
  FormModel,
  RequestOption,
  UIComponent,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'lib-popup-add-task',
  templateUrl: './popup-add-task.component.html',
  styleUrls: ['./popup-add-task.component.scss'],
})
export class PopupAddTaskComponent extends UIComponent {
  @ViewChild('attachment') attachment: AttachmentComponent;
  headerText: string = 'Tạo công việc';
  data: any;
  funcID: string;
  dialogRef: DialogRef;
  formModel: FormModel;
  isPopupUserCbb = false;
  lstUser = [];
  fGroupAddTask: FormGroup;
  isAfterRender: boolean = false;
  returnData: any;

  constructor(
    private injector: Injector,
    private omService: CodxOmService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.dialogRef = dialogRef;
    this.data = dialogData;
    debugger;
    this.formModel = this.dialogRef?.formModel;
  }

  onInit(): void {
    this.initForm();
  }

  initForm() {
    this.omService.getFormGroup('OMTasks', 'grvOMTasks').then((item) => {
      this.fGroupAddTask = item;
      this.fGroupAddTask.patchValue({ refType: 'OM_Tasks', status: '1' });
      console.log('Form', this.fGroupAddTask.value);
      this.isAfterRender = true;
    });
  }

  popupUploadFile(evt: any) {
    this.attachment.uploadFile();
  }

  fileAdded(event: any) {
    this.fGroupAddTask.patchValue({
      attachments: event.data.length,
    });
  }

  fileCount(event: any) {}

  valueCbxUserChange(event) {
    if (event == null) {
      this.isPopupUserCbb = false;
      return;
    }
    if (event?.dataSelected) {
      this.lstUser = [];
      event.dataSelected.forEach((people) => {
        this.lstUser.push(people.UserID);
      });
      //this.cbbDataUser = tmpDataCBB;
      this.isPopupUserCbb = false;
      this.detectorRef.detectChanges();
    }
  }
  openUserPopup() {
    this.isPopupUserCbb = true;
  }

  beforeSave(option: RequestOption) {
    let itemData = this.data;
    option.service = 'TM';
    option.assemblyName = 'TM';
    option.className = 'TaskBusiness';
    option.methodName = 'AddTaskAsync';
    debugger;
    option.data = [itemData, 'OMT013'];
    return true;
  }

  onSaveForm() {
    this.fGroupAddTask.patchValue(this.data);
    if (this.fGroupAddTask.invalid == true) {
      this.omService.notifyInvalid(this.fGroupAddTask, this.formModel);
      return;
    }
    (this.dialogRef.dataService as CRUDService).save(
      (opt: RequestOption) => this.beforeSave(opt),
      0,
      null,
      'TM005',
      true
    );
    // .subscribe(async (res) => {
    //   if (res.save || res.update) {
    //     if (!res.save) {
    //       this.returnData = res.update;
    //     } else {
    //       this.returnData = res.save;
    //     }
    //     if (this.returnData?.recID && this.returnData?.attachments > 0) {
    //       if (
    //         this.attachment.fileUploadList &&
    //         this.attachment.fileUploadList.length > 0
    //       ) {
    //         this.attachment.objectId = this.returnData?.recID;
    //         (await this.attachment.saveFilesObservable()).subscribe(
    //           (item2: any) => {
    //             if (item2?.status == 0) {
    //               this.fileAdded(item2);
    //             }
    //           }
    //         );
    //       }
    //     }
    //   }
    // });
  }
}
