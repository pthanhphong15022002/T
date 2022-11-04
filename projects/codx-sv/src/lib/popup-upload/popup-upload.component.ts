import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  AuthStore,
  CodxListviewComponent,
  CRUDService,
  DialogData,
  DialogRef,
  UIComponent,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';

@Component({
  selector: 'app-popup-upload',
  templateUrl: './popup-upload.component.html',
  styleUrls: ['./popup-upload.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PopupUploadComponent extends UIComponent implements OnInit {
  dialog: DialogRef;
  functionList: any;
  user: any;
  predicate = `ObjectType=@0 && IsDelete=@1 && CreatedBy=@2 && ReferType=@3`;
  dataValue: any;
  dtService: any;
  data: any;
  REFER_TYPE = {
    IMAGE: 'image',
    VIDEO: 'video',
    APPLICATION: 'application',
  };
  lstEditIV: any = new Array();
  @ViewChild('listView') listView: CodxListviewComponent;
  @ViewChild('ATM_Image') ATM_Image: AttachmentComponent;
  constructor(
    private injector: Injector,
    private dialogRef: DialogRef,
    private dt: DialogData,
    private auth: AuthStore,
    private change: ChangeDetectorRef
  ) {
    super(injector);
    this.dialog = dialogRef;
    this.user = auth.get();
    this.data = dt.data;
    this.dataValue = `WP_Comments;false;${this.user?.userID};image`;
    var dataSv = new CRUDService(injector);
    dataSv.request.gridViewName = 'grvFileInfo';
    dataSv.request.entityName = 'DM_FileInfo';
    dataSv.request.formName = 'FileInfo';
    this.dtService = dataSv;
  }

  onInit(): void {}

  onSave() {}

  chooseImage(item) {
    var dataTemp = this.listView.dataService.data;
    var indexIC = dataTemp.findIndex((x) => x?.isChoose == true);
    if (indexIC >= 0) dataTemp[indexIC]['isChoose'] = false;
    if (dataTemp) {
      var index = dataTemp.findIndex((x) => x.recID == item.recID);
      dataTemp[index]['isChoose'] = !dataTemp[index]['isChoose'];
    }
    this.listView.dataService.data = dataTemp;
    this.change.detectChanges();
  }

  async selectedImage(e) {
    this.generateGuid();
    let recID = JSON.parse(JSON.stringify(this.guidID));
    e.data[0].objectID = recID;
    let files = e.data;
    // up file
    if (files.length > 0) {
      files.map((dt: any) => {
        if (dt.mimeType.indexOf('image') >= 0) {
          dt['referType'] = this.REFER_TYPE.IMAGE;
        } else if (dt.mimeType.indexOf('video') >= 0) {
          dt['referType'] = this.REFER_TYPE.VIDEO;
        } else {
          dt['referType'] = this.REFER_TYPE.APPLICATION;
        }
      });
      this.lstEditIV.push(files[0]);
    }
    if (files) {
      this.ATM_Image.objectId = recID;
    }
    (await this.ATM_Image.saveFilesObservable()).subscribe((result: any) => {
      if (result.data && result.data.length > 0) {
        // this.uploadImage(this.itemActive, attachmentEle);
        this.dialog.close(result.data);
      }
    });
  }

  guidID: any;
  generateGuid() {
    var d = new Date().getTime(); //Timestamp
    var d2 =
      (typeof performance !== 'undefined' &&
        performance.now &&
        performance.now() * 1000) ||
      0; //Time in microseconds since page-load or 0 if unsupported
    this.guidID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = Math.random() * 16; //random number between 0 and 16
        if (d > 0) {
          //Use timestamp until depleted
          r = (d + r) % 16 | 0;
          d = Math.floor(d / 16);
        } else {
          //Use microseconds since page-load if supported
          r = (d2 + r) % 16 | 0;
          d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      }
    );
  }
}
