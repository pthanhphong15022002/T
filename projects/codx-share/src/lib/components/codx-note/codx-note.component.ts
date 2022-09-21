import { TemplateRef } from '@angular/core';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ApiHttpService,
  CacheService,
  SidebarModel,
  DialogRef,
  CallFuncService,
  AuthService,
} from 'codx-core';
import { environment } from 'src/environments/environment';
import { AssignInfoComponent } from '../assign-info/assign-info.component';
import { AttachmentComponent } from '../attachment/attachment.component';
import { TM_Tasks } from '../codx-tasks/model/task.model';
import { FileComponent } from './file/file.component';

@Component({
  selector: 'codx-note',
  templateUrl: './codx-note.component.html',
  styleUrls: ['./codx-note.component.scss'],
})
export class CodxNoteComponent implements OnInit, AfterViewInit {
  currentElement: HTMLElement;
  currentElementColor: HTMLElement;
  icon = '';
  showEmojiPicker = false;
  gridViewSetup: any;
  gridViewSetupComment: any;
  set = 'apple';
  lineType = 'TEXT';
  empty = '';
  elementColor: any;
  test: any;
  fontTemp: any;
  id = 0;
  dialog!: DialogRef;
  countResource = 0;
  listTask: any;
  popoverCrr: any;
  popoverDataSelected: any;
  vllStatus = 'TM004';
  vllApproveStatus = 'TM011';
  listTaskResourceSearch: any;
  listTaskResource: any;
  searchField = '';
  listRoles = [];
  vllRole = 'TM002';
  headerComment = '';
  checkFile = false;
  totalComment = 0;
  lstEditIV: any = new Array();
  lstViewIV: any = new Array();
  user: any = null;
  MODE_IMAGE_VIDEO = 'VIEW';
  listNoteTemp: any = {
    memo: '',
    status: null,
    textColor: null,
    format: '',
    lineType: 'TEXT',
  };
  font = {
    BOLD: false,
    ITALIC: false,
    UNDERLINE: false,
    COLOR: '#000000',
  };
  format = {
    TEXT: true,
    TITLE: false,
    LIST: false,
    CHECKBOX: false,
  };
  initListNote = {
    memo: '',
    status: null,
    textColor: null,
    format: null,
    lineType: this.lineType,
    attachments: 0,
    comments: 0,
    tasks: 0,
  };
  REFER_TYPE = {
    IMAGE: 'image',
    VIDEO: 'video',
    APPLICATION: 'application',
  };
  LINE_TYPE = {
    TEXT: 'TEXT',
    TITLE: 'TITLE',
    CHECKBOX: 'CHECKBOX',
    LIST: 'LIST',
    IMAGE: 'IMAGE',
    FILE: 'FILE',
  };

  @Input() contents: any = [
    {
      memo: '',
      status: null,
      textColor: null,
      format: null,
      lineType: 'TEXT',
      attachments: 0,
      comments: 0,
      tasks: 0,
    },
  ];
  @Input() showMenu = true;
  @Input() showMF = true;
  @Input() service = '';
  @Input() assembly = '';
  @Input() className = '';
  @Input() method = '';
  @Input() objectParentID = '';
  @Input() data = [];
  @Input() mode = 'edit';
  @Input() funcID = '';
  @Input() objectID = '';
  @Input() objectType = '';
  @Input() vllControlShare = '';
  @Input() vllRose = '';
  @Output() getContent = new EventEmitter();
  @ViewChild('input') input: any;
  @ViewChild('popupComment') popupComment: TemplateRef<any>;
  @ViewChild('popupAttachment') popupAttachment: TemplateRef<any>;
  @ViewChild('colorPicker') colorPicker: any;
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('ATM_IV') ATM_IV: AttachmentComponent;

  constructor(
    private dt: ChangeDetectorRef,
    private cache: CacheService,
    private api: ApiHttpService,
    private route: ActivatedRoute,
    private callfunc: CallFuncService,
    private auth: AuthService
  ) {
    this.cache.gridViewSetup('Contents', 'grvContents').subscribe((res) => {
      if (res) this.gridViewSetup = res;
    });
    this.cache.gridViewSetup('Comments', 'grvComments').subscribe((res) => {
      if (res) {
        this.gridViewSetupComment = res;
        this.headerComment = this.gridViewSetupComment.Comments.headerText;
      }
    });
    this.route.queryParams.subscribe((params) => {
      if (params) this.objectParentID = params.meetingID;
    });
  }

  ngOnInit(): void {
    this.cache.valueList(this.vllRole).subscribe((res) => {
      if (res && res?.datas.length > 0) {
        this.listRoles = res.datas;
      }
    });
    this.user = this.auth.userValue;
    // this.getFileByObjectID('9260f180-56ce-4b44-afce-49afd10e9930');
  }

  ngAfterViewInit(): void {
    if (this.input) this.currentElement = this.input.elRef.nativeElement;
    if (this.currentElement) {
      var input = this.currentElement.querySelector(
        '.codx-text'
      ) as HTMLElement;
      input.focus();
      this.currentElement.id = '0';
    }
    if (this.data?.length > 0) {
      this.contents = this.data;
      this.id = this.contents.length - 1;
      this.dt.detectChanges();
      this.setPropertyForView();
      this.getImageVideo();
    }
  }

  getImageVideo() {
    if (this.contents?.length > 0) {
      this.contents.forEach((res) => {
        if (res.lineType == this.LINE_TYPE.IMAGE)
          this.getFileByObjectID(res.recID);
      });
    }
  }
  getFileByObjectID(recID) {
    this.api
      .execSv(
        'DM',
        'ERM.Business.DM',
        'FileBussiness',
        'GetFilesByIbjectIDAsync',
        recID
      )
      .subscribe((res: any[]) => {
        if (res.length > 0) {
          let files = res;
          files.map((e: any) => {
            if (e && e.referType == this.REFER_TYPE.VIDEO) {
              e[
                'srcVideo'
              ] = `${environment.apiUrl}/api/dm/filevideo/${e.recID}?access_token=${this.user.token}`;
            }
          });
          this.lstEditIV = res;
          this.lstViewIV.push(this.lstEditIV[0]);
          console.log('check lstViewIV', this.lstViewIV);
        }
      });
    this.dt.detectChanges();
  }

  setPropertyForView() {
    var ele: any = document.querySelectorAll('codx-input[type="text"]');
    for (let i = 0; i < this.contents.length; i++) {
      /* set title */
      if (this.contents[i].lineType == 'TITLE') {
        var divElement = ele[i + 1].children[0] as HTMLElement;
        var inputElement = divElement.children[0] as HTMLElement;
        inputElement.style.setProperty('font-size', '24px', 'important');
      }

      /* set color */
      if (this.contents[i].textColor) {
        var divElement = ele[i + 1].children[0] as HTMLElement;
        var inputElement = divElement.children[0] as HTMLElement;
        inputElement.style.setProperty(
          'color',
          this.contents[i].textColor,
          'important'
        );
      }

      /* set font */
      if (this.contents[i].format) {
        var font = this.contents[i].format.split(';');
        this.setFontProperty(font, ele[i + 1]);
      }
    }
    this.setFont();
    this.setFormat();
    this.focus(this.contents.length);
  }

  chooseType(type: any, ele: any, index = null, menu = null) {
    if (menu == true) {
      if (!this.currentElement && ele)
        this.currentElement = ele.elRef.nativeElement;
    } else this.currentElement = ele.elRef.nativeElement;
    if (this.currentElement) {
      var input = this.currentElement.querySelector(
        '.codx-text'
      ) as HTMLElement;
      if (input) input.focus();
    }
    this.lineType = type;
    if (menu == true) {
      if (this.id >= this.contents.length) this.id = this.contents.length - 1;
      this.contents[this.id].lineType = this.lineType;
    } else {
      if (index >= this.contents.length) index = this.contents.length - 1;
      this.contents[index].lineType = this.lineType;
    }
    this.listNoteTemp.lineType = this.lineType;
    if (this.lineType != 'TITLE') {
      var divElement = this.currentElement.children[0] as HTMLElement;
      var inputElement = divElement.children[0] as HTMLElement;
      inputElement.style.setProperty('font-size', '13px', 'important');
    }

    if (type == 'TEXT') {
      this.setFormat(true, false, false);
    } else if (type == 'CHECKBOX') {
      this.setFormat(false, true, false);
    } else if (type == 'LIST') {
      this.setFormat(false, false, true);
    } else this.setFormat(false, false, false, true);
    if (this.objectParentID)
      this.updateContent(this.objectParentID, this.contents).subscribe();
  }

  setFormat(text = true, checkBox = false, list = false, title = false) {
    this.format.TEXT = text;
    this.format.CHECKBOX = checkBox;
    this.format.LIST = list;
    this.format.TITLE = title;
    if (!this.currentElement) return;
    this.currentElement.focus();
    if (this.format.TITLE) {
      var divElement = this.currentElement.children[0] as HTMLElement;
      var inputElement = divElement.children[0] as HTMLElement;
      inputElement.style.setProperty('font-size', '24px', 'important');
      this.listNoteTemp.lineType = this.lineType;
    }
  }

  setFont(bold = false, italic = false, underline = false) {
    this.font.BOLD = bold;
    this.font.ITALIC = italic;
    this.font.UNDERLINE = underline;
  }

  chooseFont(font, index = null, menu = null) {
    if (!this.currentElement) return;
    this.currentElement.focus();
    var style = this.currentElement.style;
    if (font == 'BOLD') {
      if (style.fontWeight == 'normal')
        this.currentElement.style.setProperty(
          'font-weight',
          'bolder',
          'important'
        );
      else style.fontWeight = 'normal';
      this.listNoteTemp.format = this.listNoteTemp.format + 'bolder;';
    } else if (font == 'ITALIC') {
      if (style.fontStyle == 'normal')
        this.currentElement.style.setProperty(
          'font-style',
          'italic',
          'important'
        );
      else style.fontStyle = 'normal';
      this.listNoteTemp.format = this.listNoteTemp.format + 'italic;';
    } else if (font == 'UNDERLINE') {
      if (style.textDecorationLine == 'none')
        this.currentElement.style.setProperty(
          'text-decoration-line',
          'underline',
          'important'
        );
      else style.textDecorationLine = 'none';
      this.listNoteTemp.format = this.listNoteTemp.format + 'underline;';
    }
    if (menu == true) {
      if (this.id >= this.contents.length) this.id = this.contents.length - 1;
      this.contents[this.id].format = this.listNoteTemp.format;
    } else {
      if (index >= this.contents.length) index = this.contents.length - 1;
      this.contents[index].format = this.listNoteTemp.format;
    }
    if (this.objectParentID)
      this.updateContent(this.objectParentID, this.contents).subscribe();
    this.dt.detectChanges();
  }

  checkFont(font, ele, index = null, menu = null) {
    if (menu == true) {
      if (!this.currentElement && ele)
        this.currentElement = ele.elRef.nativeElement;
    } else this.currentElement = ele.elRef.nativeElement;
    if (this.currentElement) {
      var input = this.currentElement.querySelector(
        'input.codx-text'
      ) as HTMLElement;
      input.focus();
    }
    this.font[font] = !this.font[font];
    this.chooseFont(font, index, menu);
  }

  valueChangeColor(event, ele, elementColor) {
    if (event?.data) {
      if (!this.currentElement && ele)
        this.currentElement = ele.elRef.nativeElement;
      if (this.currentElement) {
        this.currentElement = this.currentElement.querySelector(
          'input.codx-text'
        ) as HTMLElement;
        if (this.currentElement) this.currentElement.focus();
        this.listNoteTemp[event?.field] = event?.data;
        if (this.id >= this.contents.length) this.id = this.contents.length - 1;
        /*Set lại color cho memo khi edit color*/
        this.contents[this.id].textColor = event?.data;
        /*Set lại color cho memo khi edit color*/
        this.elementColor = elementColor;
        this.chooseColor(event?.data);
        var value: any = this.currentElement;
        if (value) {
          this.contents[this.id].textCorlor = event?.data;
          if (this.mode == 'edit') {
            if (this.objectParentID)
              this.updateContent(
                this.objectParentID,
                this.contents
              ).subscribe();
          }
        }
      }
      this.getContent.emit(this.contents);
    }
  }

  chooseColor(color) {
    if (!this.currentElement) return;
    this.currentElement.focus();
    this.currentElement.style.setProperty('color', color, 'important');
    this.font.COLOR = color;
    this.dt.detectChanges();
  }

  popupImg() {}

  addEmoji(event) {
    if (this.id >= this.contents.length) this.id = this.contents.length - 1;
    this.listNoteTemp.memo = '';
    if (
      this.contents[this.id].memo == null ||
      this.contents[this.id].memo == ''
    )
      this.contents[this.id].memo = this.listNoteTemp.memo;
    this.contents[this.id].memo += event.emoji.native;
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
    this.dt.detectChanges();
  }

  valueChange(event, item?) {
    if (event?.data) {
      var dt = event?.data;
      var field = event?.field;
      this.listNoteTemp.lineType = this.lineType;
      this.listNoteTemp[field] = dt;
      //if (this.id < this.contents.length) {
      // dt1 = JSON.parse(JSON.stringify(this.contents));
      // dt1[this.id].memo = dt;
      //this.contents[this.id].memo = dt;
      //}
      if (this.mode == 'edit')
        this.updateContent(this.objectParentID, this.contents).subscribe();
      // this.id += 1;
      this.getContent.emit(this.contents);
      console.log('check contents', this.contents);
    }
  }

  valueChangeStatus(event, index) {
    if (event?.data != null) {
      this.listNoteTemp['status'] = event?.data;
      this.contents[index].status = event?.data;
      if (this.mode == 'edit')
        this.updateContent(this.objectParentID, this.contents).subscribe();
      this.getContent.emit(this.contents);
    }
  }

  keyUpEnter(event, index) {
    if (event?.data) {
      this.addContent(event?.data, index);
    }
    if (this.contents.length > 1) this.setPropertyAfterAdd();
  }

  addContent(data, index) {
    var checkFirstNote = false;
    if (data) {
      // if (index !== this.contents.length - 1) {
      //   this.checkIndex = true;
      //   return;
      // }
      if (index >= this.contents.length) index = this.contents.length - 1;
      if (
        this.contents[index]?.status !== null ||
        this.contents[index]?.format !== null
      ) {
        this.listNoteTemp.status = this.contents[index]?.status;
        this.listNoteTemp.format = this.contents[index]?.format;
      }
      this.generateGuid();
      var recID = JSON.parse(JSON.stringify(this.guidID));
      var obj = {
        memo: data,
        status: this.listNoteTemp.status,
        textColor: this.font.COLOR,
        format: this.listNoteTemp.format,
        lineType: this.lineType,
        recID: recID,
      };
      if (this.contents.length >= 2) {
        this.contents.pop();
        checkFirstNote = true;
      }
      this.contents.push(obj);
      // reverse
      if (checkFirstNote == false) this.contents.shift();
      var dtTemp = JSON.parse(JSON.stringify(this.initListNote));
      dtTemp.lineType = this.lineType;
      this.contents.push(dtTemp);
      this.id = this.contents.length - 1;
      //reverse
      this.dt.detectChanges();
    }
    if (this.mode == 'edit') {
      if (this.objectParentID)
        this.updateContent(this.objectParentID, this.contents).subscribe();
    }
    this.getContent.emit(this.contents);
  }

  setPropertyAfterAdd() {
    var ele = document.querySelectorAll('codx-input[type="text"]');
    if (ele) {
      let htmlE = ele[ele.length - 1] as HTMLElement;
      this.currentElement = htmlE;
      var input = this.currentElement.querySelector(
        'input.codx-text'
      ) as HTMLElement;
      input.focus();

      var htmlElementBefore = ele[ele.length - 2] as HTMLElement;
      var lstFormat = this.listNoteTemp.format.split(';');
      this.setFontProperty(lstFormat, htmlElementBefore);
      /*set property cho lineTpe là TITLE*/
      if (this.listNoteTemp.lineType == 'TITLE') {
        var divLastElement = ele[ele.length - 1].children[0] as HTMLElement;
        var divElement = ele[ele.length - 2].children[0] as HTMLElement;

        var inputLastElement = divLastElement.children[0] as HTMLElement;
        inputLastElement.style.setProperty('font-size', '24px', 'important');
        var inputElement = divElement.children[0] as HTMLElement;
        inputElement.style.setProperty('font-size', '24px', 'important');
      }
      /*set property cho lineTpe là TITLE*/

      this.listNoteTemp.format = '';
      var codxInputElement = ele[ele.length - 2] as HTMLElement;
      var divElement = codxInputElement.children[0] as HTMLElement;
      var inputElement = divElement.children[0] as HTMLElement;
      inputElement.style.setProperty('color', this.font.COLOR, 'important');

      this.font.COLOR = '#000000';
      var lastCodxInputElement = ele[ele.length - 1] as HTMLElement;
      var lastDivElement = lastCodxInputElement.children[0] as HTMLElement;
      var lastInputElement = lastDivElement.children[0] as HTMLElement;
      lastInputElement.style.setProperty('color', this.font.COLOR, 'important');
      this.setColorForCodxColor(this.font.COLOR);
      this.setFont();
    }
  }

  setFontProperty(lstFormat, htmlElementBefore) {
    lstFormat.forEach((res) => {
      if (res == 'bolder') {
        htmlElementBefore.style.setProperty(
          'font-weight',
          'bolder',
          'important'
        );
        this.font.BOLD = !this.font.BOLD;
      } else if (res == 'italic') {
        htmlElementBefore.style.setProperty(
          'font-style',
          'italic',
          'important'
        );
        this.font.ITALIC = !this.font.ITALIC;
      } else if (res == 'underline') {
        htmlElementBefore.style.setProperty(
          'text-decoration-line',
          'underline',
          'important'
        );
        this.font.UNDERLINE = !this.font.UNDERLINE;
      }
    });
  }

  delete(index) {
    if (this.contents?.length > 1) {
      if (this.contents) {
        this.contents.splice(index, 1);
        if (index >= this.contents.length) index = this.contents.length - 1;
        if (this.mode == 'edit') {
          if (this.objectParentID) {
            this.updateContent(this.objectParentID, this.contents).subscribe();
            if (this.contents[index]?.recID != undefined)
              this.deleteFileByObjectID(this.contents[index]?.recID, true);
          }
        }
      }
    }
    // if (this.contents?.length == 1) {
    //   var item = JSON.parse(JSON.stringify(this.initListNote));
    //   item.lineType = 'TEXT';
    //   this.contents.push(item);
    // }
    this.getContent.emit(this.contents);
    this.countFileAdded = 0;
    this.focus(this.contents.length);
    this.dt.detectChanges();
  }

  deleteFileByObjectID(fileID: string, deleted: boolean) {
    if (fileID) {
      this.api
        .execSv(
          'DM',
          'ERM.Business.DM',
          'FileBussiness',
          'DeleteByObjectIDAsync',
          [fileID, this.objectType, deleted]
        )
        .subscribe();
    }
  }

  getElement(ele: any, index = null) {
    var element = document.querySelectorAll('codx-input[type="text"]');
    if (index >= element.length) index = element.length - 1;
    let htmlE = element[index] as HTMLElement;
    // this.currentElement = ele.elRef.nativeElement as HTMLElement;
    this.currentElement = htmlE;
    this.id = index;
    var divElement = this.currentElement.children[0] as HTMLElement;
    var inputElement = divElement.children[0] as HTMLElement;
    var colorOfInputEle = inputElement.style.color;

    if (this.contents.length > 1) {
      var style: any = this.currentElement.style;
      var len = Object.keys(this.font).length || 0;
      for (let i = 0; i < len - 1; i++) {
        if (style.fontWeight != 'normal') this.font.BOLD = true;
        else this.font.BOLD = false;
        if (style.fontStyle != 'normal') this.font.ITALIC = true;
        else this.font.ITALIC = false;
        if (style.textDecorationLine != 'none') this.font.UNDERLINE = true;
        else this.font.UNDERLINE = false;
        this.setColorForCodxColor(colorOfInputEle);
      }
      if (this.id >= this.contents.length) this.id = this.contents.length - 1;
      this.lineType = this.contents[this.id].lineType;
      if (this.contents[this.id].lineType == 'TEXT') this.setFormat();
      else if (this.contents[this.id].lineType == 'LIST')
        this.setFormat(false, false, true);
      else if (this.contents[this.id].lineType == 'CHECKBOX')
        this.setFormat(false, true, false);
      else this.setFormat(false, false, false, true);
    }
    this.dt.detectChanges();
  }

  setColorForCodxColor(color) {
    this.elementColor = this.colorPicker;
    if (color == '' || color == null) color = '#000000';
    if (this.elementColor)
      this.currentElementColor = this.elementColor.elRef.nativeElement;
    if (this.currentElementColor) {
      var divColor = this.currentElementColor.querySelector(
        'div.codx-colorpicker'
      ) as HTMLElement;
      var divElement = divColor.children[0] as HTMLElement;
      var divChildElement = divElement.children[1] as HTMLElement;
      var buttonElement = divChildElement.children[0] as HTMLElement;
      var spanElement = buttonElement.children[0] as HTMLElement;
      var colorOfSpanEle = spanElement.children[0] as HTMLElement;

      this.currentElementColor = colorOfSpanEle;
      this.currentElementColor.style.setProperty(
        'background-color',
        color,
        'important'
      );
    }
  }

  focus(index) {
    var ele = document.querySelectorAll('codx-input[type="text"]');
    if (ele) {
      if (index >= ele.length) index = ele.length - 1;
      let htmlE = ele[index] as HTMLElement;
      this.currentElement = htmlE;
      var input = this.currentElement.querySelector(
        'input.codx-text'
      ) as HTMLElement;
      input.focus();
    }
  }

  clickFunction(
    type = null,
    format = null,
    ele = null,
    item = null,
    index = null,
    menu = null,
    attachmentEle = null
  ) {
    switch (type) {
      case 'format':
        this.chooseType(format, ele, index, menu);
        break;
      case 'font':
        this.checkFont(format, ele, index, menu);
        break;
      case 'delete':
        this.delete(index);
        break;
      case 'img':
        this.popupImg();
        break;
      case 'comment':
        this.comment(index);
        this.contents
        break;
      case 'assign':
        this.assign(index);
        this.contents
        break;
      case 'attachment':
        if (menu == false) this.openPopupAttachment(index);
        else this.popup(this.id, attachmentEle);
        break;
      case 'image':
        this.uploadFileIV(this.id, attachmentEle);
        break;
    }
    this.getContent.emit(this.contents);
  }

  IDTempIV = 0;
  uploadFileIV(index, attachmentEle) {
    if (attachmentEle) this.ATM_IV = attachmentEle;
    if (this.ATM_IV) this.ATM_IV.uploadFile();
    this.IDTempIV = index;
  }

  selectedIV(e: any) {
    if (this.IDTempIV >= this.contents.length)
      this.IDTempIV = this.contents.length - 1;
    let obj = JSON.parse(JSON.stringify(this.contents));
    let initListNote = {
      memo: '',
      status: null,
      textColor: null,
      format: null,
      lineType: this.lineType,
      attachments: 0,
      comments: 0,
      tasks: 0,
      // recID: '',
    };
    this.generateGuid();
    obj[this.IDTempIV].lineType = 'IMAGE';
    obj[this.IDTempIV].attachments += 1;
    let recID = JSON.parse(JSON.stringify(this.guidID));
    obj[this.IDTempIV].recID = recID;
    e.data[0].objectID = recID;
    let item = JSON.parse(JSON.stringify(initListNote));
    item.lineType = 'TEXT';
    item.attachments = 0;
    obj.push(item);

    let listFileTemp;
    this.updateContent(this.objectParentID, obj).subscribe(async (res: any) => {
      if (res) {
        // up file
        if (e.data.length > 0) {
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
          listFileTemp = files;
          // let lstIVTemp = JSON.parse(JSON.stringify(this.lstEditIV));
          if (this.lstViewIV.length > 0) {
            if (this.MODE_IMAGE_VIDEO == 'VIEW')
              this.lstEditIV = this.lstViewIV;
            this.lstEditIV.push(files[0]);
          } else this.lstEditIV.push(files[0]);
        }
        if (listFileTemp) {
          this.ATM_IV.fileUploadList = listFileTemp;
          // this.ATM_IV.fileUploadList[0]['objectID'] = listFileTemp[0].objectID;
          this.ATM_IV.fileUploadList[0].objectId = listFileTemp[0].objectID;
        }
        console.log('check this.ATM_IV.fileUpload', this.ATM_IV.fileUploadList);
        (await this.ATM_IV.saveFilesObservable()).subscribe((result: any) => {
          if (result) {
            this.contents = obj;
            this.MODE_IMAGE_VIDEO = 'EDIT';
            this.dt.detectChanges();
            this.focus(this.contents.length - 1);
          }
        });
      }
    });
    this.id += 1;
    this.dt.detectChanges();
  }

  updateContent(objectParentID, listContent) {
    return this.api.execSv(
      this.service,
      this.assembly,
      this.className,
      this.method,
      [objectParentID, listContent]
    );
  }

  comment(index) {
    this.id = index;
    this.callfunc.openSide(this.popupComment);
    console.log('check ');
  }

  totalCommentChange(e) {}

  assign(index) {
    var task = new TM_Tasks();
    task.refID = this.contents[index].recID;
    task.refType = this.objectType;
    task.taskName = this.contents[index].memo;
    var vllControlShare = this.vllControlShare;
    var vllRose = this.vllRose;
    var title = '';
    let option = new SidebarModel();
    var objFormModel = {
      entityName: this.objectType,
    };
    option.FormModel = objFormModel;
    option.Width = '550px';
    this.dialog = this.callfunc.openSide(
      AssignInfoComponent,
      [task, vllControlShare, vllRose, title],
      option
    );
    this.dialog.closed.subscribe((e) => {
      if (e.event) {
        var dt = e.event;
        if (dt[0] == true && dt[1].length > 0) {
          this.contents[index].tasks++;
          this.updateContent(this.objectParentID, this.contents).subscribe();
          this.dt.detectChanges();
        }
      }
    });
  }

  getAssign(recID) {
    this.api
      .execSv<any>(
        'TM',
        'ERM.Business.TM',
        'TaskBusiness',
        'GetListTaskByRefIDAsync',
        recID
      )
      .subscribe((res) => {});
  }

  popoverListTask(recID) {
    this.countResource = 0;
    this.api
      .execSv<any>(
        'TM',
        'ERM.Business.TM',
        'TaskBusiness',
        'GetListTaskByRefIDAsync',
        recID
      )
      .subscribe((res) => {
        if (res) {
          this.listTask = res;
          this.countResource = res.length;
        }
      });
  }

  popoverEmpList(p: any, task) {
    this.listTaskResourceSearch = [];
    this.countResource = 0;
    if (this.popoverCrr) {
      if (this.popoverCrr.isOpen()) this.popoverCrr.close();
    }
    if (this.popoverDataSelected) {
      if (this.popoverDataSelected.isOpen()) this.popoverDataSelected.close();
    }
    this.api
      .execSv<any>(
        'TM',
        'ERM.Business.TM',
        'TaskResourcesBusiness',
        'GetListTaskResourcesByTaskIDAsync',
        task.taskID
      )
      .subscribe((res) => {
        if (res) {
          this.listTaskResource = res;
          this.listTaskResourceSearch = res;
          this.countResource = res.length;
          p.open();
          this.popoverCrr = p;
        }
      });
  }

  searchName(e) {
    var listTaskResourceSearch = [];
    this.searchField = e;
    if (this.searchField.trim() == '') {
      this.listTaskResourceSearch = this.listTaskResource;
      return;
    }
    this.listTaskResource.forEach((res) => {
      var name = res.resourceName;
      if (name.toLowerCase().includes(this.searchField.toLowerCase())) {
        listTaskResourceSearch.push(res);
      }
    });
    this.listTaskResourceSearch = listTaskResourceSearch;
  }

  openPopupAttachment(index) {
    this.id = index;
    var dt = {
      data: this.contents[index],
      funcID: this.funcID,
      objectType: this.objectType,
    };
    this.dialog = this.callfunc.openSide(FileComponent, dt);
    this.dialog.closed.subscribe((res) => {
      if (res.event?.data) {
        this.contents[index].attachments += res.event?.data.length;
        this.updateContent(this.objectParentID, this.contents).subscribe();
      }
    });
  }

  IDTemp = 0;
  popup(index, attachmentEle) {
    if (attachmentEle) this.attachment = attachmentEle;
    if (this.attachment) {
      this.attachment.uploadFile();
      this.checkFile = true;
    }
    this.IDTemp = index;
  }

  fileCounts(e: any) {
    if (this.IDTemp >= this.contents.length)
      this.IDTemp = this.contents.length - 1;
    let obj = JSON.parse(JSON.stringify(this.contents));
    let initListNote = {
      memo: '',
      status: null,
      textColor: null,
      format: null,
      lineType: this.lineType,
      attachments: 0,
      comments: 0,
      tasks: 0,
      // recID: '',
    };
    if (e.data.length > 1) {
      obj.splice(this.IDTemp, 1);
      e.data.forEach((dt) => {
        this.generateGuid();
        let item = JSON.parse(JSON.stringify(initListNote));
        item.lineType = 'FILE';
        item.attachments += 1;
        let recID = JSON.parse(JSON.stringify(this.guidID));
        item.recID = recID;
        dt.objectID = item.recID;
        obj.push(item);
      });
    } else {
      this.generateGuid();
      obj[this.IDTemp].lineType = 'FILE';
      obj[this.IDTemp].attachments += 1;
      let recID = JSON.parse(JSON.stringify(this.guidID));
      obj[this.IDTemp].recID = recID;
      e.data[0].objectID = recID;
    }
    console.log('check file', e.data);
    let item = JSON.parse(JSON.stringify(initListNote));
    item.lineType = 'TEXT';
    item.attachments = 0;
    obj.push(item);
    this.updateContent(this.objectParentID, obj).subscribe(async (res: any) => {
      if (res) {
        // up file
        this.attachment.fileUploadList = e.data;
        (await this.attachment.saveFilesObservable()).subscribe(
          (result: any) => {
            if (result) {
              this.contents = obj;
              this.dt.detectChanges();
              this.focus(this.contents.length - 1);
            }
          }
        );
      }
    });
    this.id += 1;
    console.log('check id', this.id);
    this.dt.detectChanges();
  }

  countFileAdded = 0;
  // fileCount(e, attachmentEle) {
  //   this.attachment = attachmentEle;
  //   let initListNote = {
  //     memo: '',
  //     status: null,
  //     textColor: null,
  //     format: null,
  //     lineType: this.lineType,
  //     attachments: 0,
  //     comments: 0,
  //     tasks: 0,
  //     recID: '',
  //   };
  //   if (e.data.length > 1) {
  //     this.contents.splice(this.IDTemp, 1);
  //     e.data.forEach((dt) => {
  //       this.getMongoObjectId();
  //       let item = JSON.parse(JSON.stringify(initListNote));
  //       item.lineType = 'FILE';
  //       item.attachments += 1;
  //       let recID = JSON.parse(JSON.stringify(this.mongoObjectId));
  //       item.recID = recID;
  //       dt.objectID = item.recID;
  //       this.contents.push(item);
  //     });
  //   } else {
  //     this.getMongoObjectId();
  //     this.contents[this.IDTemp].lineType = 'FILE';
  //     this.contents[this.IDTemp].attachments += 1;
  //     let recID = JSON.parse(JSON.stringify(this.mongoObjectId));
  //     this.contents[this.IDTemp].recID = recID;
  //     e.data[0].objectID = recID;
  //   }
  //   console.log('check file', e.data);
  //   let item = JSON.parse(JSON.stringify(initListNote));
  //   item.lineType = 'TEXT';
  //   item.attachments = 0;
  //   this.attachment.fileUploadList = e.data;
  //   this.contents.push(item);
  //   console.log('check contents', this.contents);
  //   this.dt.detectChanges();
  //   this.updateContent(this.objectParentID, this.contents).subscribe(
  //     async (res: any) => {
  //       if (res) {
  //         this.focus(this.contents.length - 1);
  //       }
  //     }
  //   );
  //   this.id += 2;
  //   console.log('check id', this.id);
  //   this.dt.detectChanges();
  // }

  // mongoObjectId: any;
  // getMongoObjectId() {
  //   var timestamp = ((new Date().getTime() / 1000) | 0).toString(16);
  //   this.mongoObjectId =
  //     timestamp +
  //     'xxxxxxxxxxxxxxxx'
  //       .replace(/[x]/g, function () {
  //         return ((Math.random() * 16) | 0).toString(16);
  //       })
  //       .toLowerCase();
  // }

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
