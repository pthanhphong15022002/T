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
  CacheService,
  DialogData,
  DialogRef,
  ImageViewerComponent,
  NotificationsService,
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
  colorimg = '';
  vll: any;
  dialog!: DialogRef;
  header = '';
  formModel: any;
  formType = '';
  listFile: any;
  REFER_TYPE = {
    IMAGE: 'image',
    VIDEO: 'video',
    APPLICATION: 'application',
  };

  @ViewChild('uploadImage') uploadImage: ImageViewerComponent;
  @ViewChild('attachment') attachment: AttachmentComponent;
  // @Input() cardType: string;
  cardType: string;
  constructor(
    private patternSV: PatternService,
    private changedr: ChangeDetectorRef,
    private at: ActivatedRoute,
    private notificationsService: NotificationsService,
    private cache: CacheService,
    private api: ApiHttpService,
    @Optional() dt: DialogRef,
    @Optional() data: DialogData
  ) {
    this.dialog = dt;
    this.formModel = this.dialog?.formModel;
    this.formType = data.data?.formType;
    if (this.formType == 'edit')
      this.pattern = JSON.parse(JSON.stringify(data.data?.dataUpdate));
    else {
      this.pattern.backgroundColor = '#caf7e3';
      this.pattern.textColor = '';
      this.pattern.headerColor = '';
    }
    this.cache.valueList('L1447').subscribe((res) => {
      if (res) {
        this.vll = res.datas;
        this.changedr.detectChanges();
      }
    });
  }

  ngOnInit(): void {
    this.patternSV.recID.subscribe((recID) => {
      this.colorimg = this.patternSV.colorimg;
      if (recID) {
        this.isEdit = true;
        this.api
          .execSv<any>(
            'FD',
            'ERM.Business.FD',
            ' PatternsBusiness',
            'GetAsync',
            [recID]
          )
          .subscribe((res) => {
            if (res) Object.assign(this.pattern, res);
            this.changedr.detectChanges();
            this.checkActive();
          });
      } else if (!this.patternSV.load) {
        this.isEdit = false;
        this.pattern.cardType = this.cardType;
        this.changedr.detectChanges();
        this.checkActive();
      }
    });
    this.at.queryParams.subscribe((params) => {
      if (params.funcID) {
        let functionID = params.funcID;
        this.cardType = functionID.substr(-1);
      }
    });
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
      debugger;
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

  valueChange(e, element) {
    if (e) this.pattern[e.field] = e.data;
  }

  valueChangeColor(e, element = null) {
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
    // this.changedr.detectChanges();
    // this.uploadImage.handleFileInput(event);
  }

  savePattern() {
    this.pattern;
    debugger;
    // if (this.uploadImage?.imageUpload?.fileName) { this.pattern.fileName = ""; this.pattern.backgroundColor = ""; }
    // // this.pattern.updateColumn = this.inputsv.updateColumn;
    // if (!this.pattern.patternName) { this.notificationsService.notify("Vui lòng nhập mô tả"); return }
    // this.api.execSv<any>("FED", "FED", "patternsBusiness", "SaveAsync", [this.pattern, this.isEdit]).subscribe(res => {
    //   //console.log(res);
    //   if (res) {
    //     if (this.uploadImage) {
    //       this.uploadImage.updateFileDirectReload(res.patternID).subscribe((result) => {
    //         this.patternSV.component.reLoadData(res);
    //         this.closeCreate();
    //         this.notificationsService.notify("Hệ thống thực thi thành công");
    //         return;
    //       });
    //     }
    //     else {
    //       this.patternSV.component.reLoadData(res);
    //       this.notificationsService.notify("Hệ thống thực thi thành công");
    //       this.closeCreate();
    //     }
    //   }
    // });
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
    // this.changedr.detectChanges();
  }

  colorClick(ele, item, index) {
    // var $label = $('.symbol-label[data-color]', $('.patternt'));
    // $label.removeClass('color-check');
    // $(ele).addClass('color-check');
    // var color = $(ele).data('color');
    // this.pattern.backgroundColor = color;
    // this.pattern.fileName = "";
    // this.changedr.detectChanges();
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
    this.changedr.detectChanges();
  }
}
