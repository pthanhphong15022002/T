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
import { environment } from 'src/environments/environment';
import { PopupConfirmSaveLabelComponent } from './popup-confirm-save-label/popup-confirm-save-label.component';

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
  dialog;

  curLabel;
  defaultLabels = [];
  selfLabels = [];

  folderID = 'label';
  folderName = 'Nhãn đính kèm'; //chị Thương kêu gắn cứng đi em, chị lo
  parentID = 'EST011';
  funcID = 'EST011';
  lstAddedFile = [];
  onInit(): void {
    this.title = this.data.title;
    this.defaultLabels = this.data.labels;
    this.getSelfLabels();
    this.detectorRef.detectChanges();
  }

  async closePopUp(isComplete) {
    if (isComplete) {
      if (
        this.attachment?.fileUploadList?.length > 0 ||
        this.data?.files?.length > 0
      ) {
        if (this.attachment.fileUploadList?.length > 0) {
          for (let i = 0; i < this.attachment.fileUploadList.length; i++) {
            this.attachment.fileUploadList[i].referType = this.folderID;
          }
          (await this.attachment.saveFilesObservable()).subscribe(
            (item2: any) => {
              if (item2?.status == 0) {
                this.dialog.close(this.curLabel);
              }
            }
          );
        }
      }
      this.dialog.close(this.curLabel);
    } else {
      if (
        this.attachment?.fileUploadList?.length > 0 ||
        this.data?.files?.length > 0
      ) {
        let confirmDialog = this.callfc.openForm(
          PopupConfirmSaveLabelComponent,
          'Phát hiện file chưa được lưu',
          500,
          200,
          this.funcID,
          {}
        );
        confirmDialog.closed.subscribe(async (res) => {
          if (res.event) {
            for (let i = 0; i < this.attachment.fileUploadList.length; i++) {
              this.attachment.fileUploadList[i].referType = this.folderID;
            }
            (await this.attachment.saveFilesObservable()).subscribe(
              (item2: any) => {
                if (item2?.status == 0) {
                  this.dialog.close(this.curLabel);
                }
              }
            );
          } else {
            this.dialog.close(null);
          }
        });
      } else {
        this.dialog.close(null);
      }
    }
  }

  getSelfLabels() {
    this.esService.getLabels().subscribe((res) => {
      this.selfLabels = res as Array<any>;
      this.selfLabels.forEach((label) => {
        label.pathDisk = environment.urlUpload + '/' + label.pathDisk;
      });
      console.log('Self Labels', res);
      this.detectorRef.detectChanges();
    });
  }

  changeLabel(e: any) {
    this.curLabel = e;
  }

  popupUploadFile() {
    this.attachment.uploadFile();
  }

  fileAdded(e) {
    if (e?.data) {
      this.lstAddedFile = e.data;
      this.detectorRef.detectChanges();
    }
  }

  fileSave(e) {
    console.log('add save', e.data);
  }
}
