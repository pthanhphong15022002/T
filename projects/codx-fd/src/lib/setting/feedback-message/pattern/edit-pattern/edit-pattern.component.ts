import { environment } from 'src/environments/environment';
import {
  ElementRef,
  QueryList,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  Optional,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ApiHttpService,
  AuthService,
  CacheService,
  DialogData,
  DialogRef,
  ImageViewerComponent,
  NotificationsService,
  RequestOption,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { Pattern } from '../model/pattern.model';
import { PatternService } from '../pattern.service';

@Component({
  selector: 'lib-edit-pattern',
  templateUrl: './edit-pattern.component.html',
  styleUrls: ['./edit-pattern.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EditPatternComponent implements OnInit {
  pattern = new Pattern();
  isEdit = false;
  reload = false;
  colorImage = '';
  vll: any;
  dialog!: DialogRef;
  header = 'Thêm mới thiệp';
  formModel: any;
  formType = '';
  listFile: any;
  REFER_TYPE = {
    IMAGE: 'image',
    VIDEO: 'video',
    APPLICATION: 'application',
  };
  user: any;
  checkFileUpload = false;
  checkGetFile = false;
  environment = environment;
  typeView = false;
  @ViewChildren('colordf')
  public listItems!: QueryList<ElementRef<HTMLLIElement>>;
  @ViewChild('uploadImage') uploadImage: ImageViewerComponent;
  @ViewChild('attachment') attachment: AttachmentComponent;
  // @Input() cardType: string;colordf
  cardType: string;
  constructor(
    private patternSV: PatternService,
    private change: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    private cache: CacheService,
    private auth: AuthService,
    private route: ActivatedRoute,
    @Optional() dt: DialogRef,
    @Optional() data: DialogData
  ) {
    this.user = this.auth.userValue;
    this.dialog = dt;
    this.formModel = data.data?.formModel;
    this.formType = data.data?.formType;
    if (this.formType == 'edit') {
      this.header = 'Cập nhật thiệp';
      this.pattern = JSON.parse(JSON.stringify(data.data?.dataUpdate));
    } else {
      this.pattern.backgroundColor = '#caf7e3';
      this.pattern.textColor = '#a4aca4';
      this.pattern.headerColor = '#a4aca4';
    }
    this.cache.valueList('L1447').subscribe((res) => {
      if (res) {
        this.vll = res.datas;
      }
    });
    if (data.data.funcID) this.getCardType(data.data.funcID);
  }

  ngOnInit(): void {}

  ngAfterViewInit() {}

  getCardType(funcID) {
    switch (funcID) {
      case 'FDS011':
        this.pattern.cardType = '1';
        break;
      case 'FDS012':
        this.pattern.cardType = '2';
        break;
      case 'FDS013':
        this.pattern.cardType = '3';
        break;
      case 'FDS014':
        this.pattern.cardType = '4';
        break;
      case 'FDS015':
        this.pattern.cardType = '5';
        break;
      case 'FDS016':
        this.pattern.cardType = '6';
        break;
      case 'FDS017':
        this.pattern.cardType = '7';
        break;
    }
  }

  fileCount(e) {
    if (e.data.length > 0) {
      this.pattern.backgroundColor = '';
      let files = e.data;
      files.map((dt: any) => {
        if (dt.mimeType.indexOf('image') >= 0) {
          dt['referType'] = this.REFER_TYPE.IMAGE;
        } else if (dt.mimeType.indexOf('video') >= 0) {
          dt['referType'] = this.REFER_TYPE.VIDEO;
        } else {
          dt['referType'] = this.REFER_TYPE.APPLICATION;
        }
      });
      this.typeView = true;
      this.listFile = files;
      this.pattern.imageSrc = e.data[0].avatar;
      this.pattern.backgroundColor = null;
      this.checkFileUpload = !this.checkFileUpload;
    }
  }

  closeCreate(): void {}

  valueChange(e) {
    if (e) this.pattern[e.field] = e.data;
  }

  valueChangeColor(e) {
    if (e) {
      if (e.field == 'backgroundColor') this.pattern.backgroundColor = e.data;
      else if (e.field == 'headerColor') this.pattern.headerColor = e.data;
      else this.pattern.textColor = e.data;
      var label = document.querySelectorAll('.symbol-label[data-color]');
      if (label) {
        label.forEach((ele) => {
          if (ele.className == 'symbol-label pointer color-check')
            ele.classList.remove('color-check');
        });
      }
    }
  }

  uploadFile() {
    this.removeSelectColor();
    //this.attachment.uploadFile();
  }

  async handleFileInput(event) {}

  savePattern() {
    if (!this.pattern.patternName) {
      this.notificationsService.notify('Vui lòng nhập mô tả');//
      return;
    }
    if (this.formType == 'edit' && this.checkFileUpload && this.checkGetFile) {
      this.patternSV.deleteFile(this.pattern.recID).subscribe((item) => {
        if (item) {
          this.onSave();
        }
      });
    } else this.onSave();
  }

  onSave() {
    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt), -1)
      .subscribe(async (res) => {
        if (res.save || res.update) {
          var dt = res.save ? res.save : res.update;
          if (this.listFile && this.listFile.length > 0) {
            this.listFile[0].objectID = dt.recID;
            this.listFile[0].objectId = dt.recID;
            this.attachment.objectId = dt.recID;
            this.attachment.fileUploadList = this.listFile;
            this.attachment
              .saveFilesMulObservable()
              .subscribe((result: any) => {
                if (this.formType == 'edit')
                  res.update.imageSrc = result?.data?.pathDisk;
                else res.save.imageSrc = result?.data?.pathDisk;
                var obj = { data: res, listFile: this.listFile };
                this.dialog.close(obj);
                this.change.detectChanges();
              });
            // this.patternSV.deleteFile(this.pattern.recID).subscribe((item) => {

            // });
          } else {
            if (this.formType == 'edit')
              res.update.imageSrc = this.pattern?.imageSrc;
            else res.save.imageSrc = this.pattern?.imageSrc;
            if (!this.pattern?.imageSrc && this.pattern.backgroundColor) {
              this.patternSV.deleteFile(this.pattern.recID).subscribe();
            }
            var obj = { data: res, listFile: null };
            this.dialog.close(obj);
          }
        }
      });
  }

  beforeSave(op: RequestOption) {
    var data = [];
    op.service = 'FD';
    op.assemblyName = 'ERM.Business.FD';
    op.className = 'PatternsBusiness';
    op.methodName = 'SaveAsync';
    if (this.formType == 'add') data = [this.pattern, false];
    else data = [this.pattern, true];
    op.data = data;
    return true;
  }
  checkDisable(pattern) {}

  checkActive() {
    var label = document.querySelectorAll('.symbol-label[data-color]');
    if (label) {
      var htmlE = label[0] as HTMLElement;
      if (htmlE) htmlE.classList.add('color-check');
    }
  }

  colorClick(ele, item, index) {
    this.listFile = '';
    this.removeSelectColor();
    var element = ele as HTMLElement;
    element.classList.add('color-check');
    this.pattern.backgroundColor = item.default;
    this.pattern.imageSrc = null;
    this.change.detectChanges();
  }
  removeSelectColor() {
    var label = document.querySelectorAll('.color-check');
    if (label) {
      label.forEach((ele) => {
        ele.classList.remove('color-check');
      });
    }
  }
}
