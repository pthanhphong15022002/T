import {
  Component,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { ImageElement } from '@syncfusion/ej2-angular-diagrams';
import { UIComponent, AuthStore, DialogData, DialogRef } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxEsService } from '../../codx-es.service';

@Component({
  selector: 'lib-popup-select-label',
  templateUrl: './popup-select-label.component.html',
  styleUrls: ['./popup-select-label.component.scss'],
})
export class PopupSelectLabelComponent extends UIComponent {
  constructor(
    private inject: Injector,
    private esService: CodxEsService,
    private authStore: AuthStore,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
    this.data = dt.data;
  }

  @ViewChild('attachment') attachment: AttachmentComponent;

  data;
  title: string;
  funcID;
  dialog;

  curLabel;
  labels = [
    // { idx: 0, image: 'assets\\img\\Labels\\Urgent.jpg' },
    // { idx: 1, image: 'assets\\img\\Labels\\Illegal.jpg' },
    // { idx: 2, image: 'assets\\img\\Labels\\Express.jpg' },
  ];
  folderID = 'label';
  folderName = 'Nhãn đính kèm'; //chị Thương kêu gắn cứng đi em, chị lo
  parentID = 'EST011';
  onInit(): void {
    this.title = this.data.title;
    this.labels = this.data.labels;

    this.detectorRef.detectChanges();
  }
  async closePopUp(isComplete) {
    this.dialog.close(this.curLabel);

    // if (isComplete) {
    //   this.dialog.close(this.curLabel);
    //   (await this.attachment.saveFilesObservable()).subscribe((res) => {
    //     console.log('saved file', res);
    //   });
    // } else this.dialog.close(null);
  }

  changeLabel(e: any) {
    this.curLabel = e;
  }

  popupUploadFile() {
    this.attachment.uploadFile();
  }

  fileAdded(e) {
    console.log('add event', e);
  }

  fileSave(e) {
    console.log('add save', e.data);
  }
}
