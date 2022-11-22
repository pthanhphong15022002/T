import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  Output,
  EventEmitter,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  AuthStore,
  CodxListviewComponent,
  CRUDService,
  DialogData,
  DialogRef,
  ImageViewerComponent,
  UIComponent,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { environment } from 'src/environments/environment';
import { CodxSvService } from '../codx-sv.service';

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
  dataValueImage: any;
  dataValueVideo: any;
  dtService: any;
  REFER_TYPE = {
    IMAGE: 'image',
    VIDEO: 'video',
    APPLICATION: 'application',
  };
  data: any;
  typeFile: any;
  dataImg: any;
  dataVideo: any;
  modeFile: any;
  urlVideo: any;
  @ViewChild('listViewImage') listViewImage: CodxListviewComponent;
  @ViewChild('listViewVideo') listViewVideo: CodxListviewComponent;
  @ViewChild('ATM_Choose_Image') ATM_Choose_Image: AttachmentComponent;
  @ViewChild('ATM_Image') ATM_Image: AttachmentComponent;

  @Output() loadData = new EventEmitter();

  constructor(
    private injector: Injector,
    private dialogRef: DialogRef,
    private dt: DialogData,
    private auth: AuthStore,
    private change: ChangeDetectorRef,
    private SVServices: CodxSvService,
    private sanitizer: DomSanitizer
  ) {
    super(injector);
    this.dialog = dialogRef;
    this.typeFile = dt.data?.typeFile;
    this.modeFile = dt.data?.modeFile;
    this.data = dt.data?.data;
    this.functionList = dt.data.functionList;
    this.user = auth.get();
    this.dataValueImage = `WP_Comments;false;${this.user?.userID};image`;
    this.dataValueVideo = `WP_Comments;false;${this.user?.userID};video`;
    var dataSv = new CRUDService(injector);
    dataSv.request.gridViewName = 'grvFileInfo';
    dataSv.request.entityName = 'DM_FileInfo';
    dataSv.request.formName = 'FileInfo';
    this.dtService = dataSv;
  }

  onInit(): void {}

  onSave(referType) {
    this.generateGuid();
    let recID = JSON.parse(JSON.stringify(this.guidID));
    var dataUpload: any;
    if (referType == 'image') dataUpload = this.dataImg;
    else dataUpload = this.dataVideo;
    delete dataUpload['recID'];
    delete dataUpload['id'];
    delete dataUpload['uploadId'];
    dataUpload.history = null;
    dataUpload.objectType = this.functionList.entityName;
    dataUpload.objectID = recID;
    var result = {
      referType: referType,
      dataUpload: [dataUpload],
    };
    this.api
      .execSv('DM', 'DM', 'FileBussiness', 'CopyAsync', dataUpload)
      .subscribe((res) => {
        if (res) {
          this.dialog.close(result);
        }
      });
  }

  getSrcVideo(data) {
    return (data['srcVideo'] = `${environment.urlUpload}/${data.pathDisk}`);
  }

  valueChangeURLVideo(e) {
    if (this.urlVideo) {
      this.getURLEmbed(this.urlVideo);
    }
  }

  chooseImage(item) {
    var dataTemp = this.listViewImage.dataService.data;
    var indexIC = dataTemp.findIndex((x) => x?.isChoose == true);
    if (indexIC >= 0) dataTemp[indexIC]['isChoose'] = false;
    if (dataTemp) {
      var index = dataTemp.findIndex((x) => x.recID == item.recID);
      dataTemp[index]['isChoose'] = !dataTemp[index]['isChoose'];
    }
    this.listViewImage.dataService.data = dataTemp;
    this.dataImg = item;
  }

  chooseVideo(item) {
    var dataTemp = this.listViewVideo.dataService.data;
    var indexIC = dataTemp.findIndex((x) => x?.isChoose == true);
    if (indexIC >= 0) dataTemp[indexIC]['isChoose'] = false;
    if (dataTemp) {
      var index = dataTemp.findIndex((x) => x.recID == item.recID);
      dataTemp[index]['isChoose'] = !dataTemp[index]['isChoose'];
    }
    this.listViewVideo.dataService.data = dataTemp;
    this.dataVideo = item;
  }

  async selectedFile(e) {
    this.generateGuid();
    let recID = JSON.parse(JSON.stringify(this.guidID));
    e.data[0].objectID = recID;
    let files = e.data;
    // up file
    if (files.length > 0) {
      files.map((dt: any) => {
        if (dt.mimeType.indexOf('image') >= 0) {
          dt['referType'] = this.REFER_TYPE.IMAGE;
        } else if (dt.mimeType.indexOf('video/mp4') >= 0) {
          dt['referType'] = this.REFER_TYPE.VIDEO;
        } else {
          dt['referType'] = this.REFER_TYPE.APPLICATION;
        }
      });
    }
    this.ATM_Image.fileUploadList = files;
    (await this.ATM_Image.saveFilesObservable()).subscribe((result: any) => {
      if (result.data) {
        if (this.modeFile == 'change') {
          this.SVServices.deleteFile(
            this.data,
            this.functionList.entityName
          ).subscribe();
        }
        var obj = {
          referType: files[0]?.referType,
          dataUpload: files,
        };
        this.dialog.close(obj);
      }
    });
  }

  selectedVideo;

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

  getEmbedID(url) {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }

  urlEmbedSafe: any;
  iframeMarkup: any;
  getURLEmbed(url) {
    const ID = this.getEmbedID(url);
    var urlEmbed = `//www.youtube.com/embed/${ID}`;
    this.urlEmbedSafe = this.sanitizer.bypassSecurityTrustResourceUrl(urlEmbed);
  }
}
