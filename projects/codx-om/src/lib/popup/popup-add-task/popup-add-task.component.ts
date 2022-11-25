import { Injector, Optional, ViewChild } from '@angular/core';
import { Component } from '@angular/core';
import { DialogData, DialogRef, FormModel, UIComponent } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';

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

  constructor(
    private injector: Injector,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
    //this.data = dialogData?.data[0];
    this.dialogRef = dialogRef;
    this.formModel = this.dialogRef?.formModel;
  }

  onInit(): void {}

  popupUploadFile(evt: any) {
    this.attachment.uploadFile();
  }

  fileAdded(event: any) {
    this.data.attachments = event.data.length;
  }
  fileCount(event: any) {}

  onSaveForm() {}
}
