import { environment } from 'src/environments/environment';
import { ViewEncapsulation } from '@angular/core';
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
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
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
  checkFile = false;

  @ViewChild('uploadImage') uploadImage: ImageViewerComponent;
  @ViewChild('attachment') attachment: AttachmentComponent;
  // @Input() cardType: string;
  cardType: string;
  constructor(
    private patternSV: PatternService,
    private change: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    private cache: CacheService,
    private auth: AuthService,
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
      this.patternSV
        .getFileByObjectID(this.pattern.recID)
        .subscribe((res: any[]) => {
          if (res.length > 0) {
            this.listFile = res;
            this.checkFile = true;
          }
        });
    } else {
      this.pattern.backgroundColor = '#caf7e3';
      this.pattern.textColor = '#a4aca4';
      this.pattern.headerColor = '#a4aca4';
    }
    this.cache.valueList('L1447').subscribe((res) => {
      if (res) {
        this.vll = res.datas;
        this.change.detectChanges();
      }
    });
    this.getCardType(this.formModel?.functionID);
  }

  ngOnInit(): void {
    // this.patternSV.recID.subscribe((recID) => {
    //   this.colorImage = this.patternSV.colorImage;
    //   if (recID) {
    //     this.isEdit = true;
    //     this.api
    //       .execSv<any>(
    //         'FD',
    //         'ERM.Business.FD',
    //         'PatternsBusiness',
    //         'GetAsync',
    //         [recID]
    //       )
    //       .subscribe((res) => {
    //         if (res) Object.assign(this.pattern, res);
    //         this.change.detectChanges();
    //         this.checkActive();
    //       });
    //   } else if (!this.patternSV.load) {
    //     this.isEdit = false;
    //     this.pattern.cardType = this.cardType;
    //     this.change.detectChanges();
    //     this.checkActive();
    //   }
    // });
    // this.at.queryParams.subscribe((params) => {
    //   if (params.funcID) {
    //     let functionID = params.funcID;
    //     this.cardType = functionID.substr(-1);
    //   }
    // });
  }

  ngAfterViewInit() {
    this.checkActive();
  }

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
      this.listFile = files;
      console.log("check listFile", this.listFile)
    }
  }

  closeCreate(): void {
    // this.pattern = new pattern();
    // this.pattern.cardType = this.cardType;
    // this.pattern.headerColor = "#918e8e";
    // this.pattern.textColor = "#918e8e";
    // $('#create_card').removeClass('offcanvas-on');
    // $('#cardImageInput').val('');
  }

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
    // this.attachment.uploadFile();
  }

  async handleFileInput(event) {
    // var $elm = $('.symbol-label[data-color]', $('.patternt'));
    // $elm.removeClass('color-check');
    // $('label.symbol-label').addClass('color-check');
    // //if (!this.pattern.patternID) return;
    // this.pattern.backgroundColor = "";
    // this.pattern.fileName = event.currentTarget.files[0].name;
    // this.change.detectChanges();
    // this.uploadImage.handleFileInput(event);
  }

  savePattern() {
    if (!this.pattern.patternName) {
      this.notificationsService.notify('Vui lòng nhập mô tả');
      return;
    }
    if (
      this.formType == 'edit' &&
      this.pattern.backgroundColor &&
      this.checkFile
    )
      this.patternSV.deleteFile(this.pattern.recID);
    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt), -1)
      .subscribe(async (res) => {
        if (res.save || res.update) {
          var dt = res.save ? res.save : res.update;
          if (this.listFile && this.listFile?.length > 0) {
            this.listFile[0].objectID = dt.recID;
            this.listFile[0].objectId = dt.recID;
            this.attachment.objectId = dt.recID;
            this.attachment.fileUploadList = this.listFile;
            (await this.attachment.saveFilesObservable()).subscribe(
              (result: any) => {
                if (result.data) {
                  this.change.detectChanges();
                }
              }
            );
            this.attachment.saveFiles();
          }
          var obj = { data: res, listFile: this.listFile };
          this.dialog.close(obj);
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

  checkDisable(pattern) {
    // if (pattern.isDefault)
    //   return true;
    // return false;
  }

  checkActive() {
    var label = document.querySelectorAll('.symbol-label[data-color]');
    if (label) {
      var htmlE = label[0] as HTMLElement;
      if (htmlE) htmlE.classList.add('color-check');
    }
    // var $elm = $('.symbol-label', $('.patternt'));
    // $elm.removeClass('color-check');
    // var elecolor = null;
    // var color = "";
    // if (!this.pattern.backgroundColor && this.isEdit) {
    //   elecolor = $('span[data-color="image"]').closest(".symbol-label");
    //   this.pattern.backgroundColor = "";
    // }
    // else {
    //   if (this.pattern.backgroundColor) {
    //     elecolor = $('.symbol-label[data-color="' + this.pattern.backgroundColor + '"]', $('.patternt'));
    //     if (elecolor.length === 0)
    //       elecolor = $('kendo-colorpicker.symbol-label');
    //   } else {
    //     elecolor = $('.symbol-label[data-color]', $('.patternt')).first();
    //     color = elecolor.data('color');
    //     this.pattern.backgroundColor = color;
    //     this.pattern.fileName = "";
    //   }
    // }
    // if (elecolor != null && elecolor.length > 0)
    //   elecolor.addClass('color-check');
    // this.change.detectChanges();
  }

  colorClick(ele, item, index) {
    // var $label = $('.symbol-label[data-color]', $('.patternt'));
    // $label.removeClass('color-check');
    // $(ele).addClass('color-check');
    // var color = $(ele).data('color');
    // this.pattern.backgroundColor = color;
    // this.pattern.fileName = "";
    // this.change.detectChanges();
    this.listFile = '';
    var label = document.querySelectorAll('.symbol-label[data-color]');
    if (label) {
      label.forEach((ele) => {
        if (ele.className == 'symbol-label pointer color-check')
          ele.classList.remove('color-check');
      });
    }
    var element = ele as HTMLElement;
    element.classList.add('color-check');
    this.pattern.backgroundColor = item.default;
    this.change.detectChanges();
  }
}
