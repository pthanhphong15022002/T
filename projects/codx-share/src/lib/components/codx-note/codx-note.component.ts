import { Optional, TemplateRef } from '@angular/core';
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
  CodxInputComponent,
  SidebarModel,
  DialogRef,
  CallFuncService,
  DialogModel,
} from 'codx-core';
import { iif } from 'rxjs';
import { createTrue } from 'typescript';
import { AssignInfoComponent } from '../assign-info/assign-info.component';
import { TM_Tasks } from '../codx-tasks/model/task.model';
import { CodxTreeHistoryComponent } from '../codx-tree-history/codx-tree-history.component';
import { CO_Contents } from './model/CO_Contents.model';

@Component({
  selector: 'codx-note',
  templateUrl: './codx-note.component.html',
  styleUrls: ['./codx-note.component.scss'],
})
export class CodxNoteComponent implements OnInit, AfterViewInit {
  icon = '';
  showEmojiPicker = false;
  gridViewSetup: any;
  sets = [
    'native',
    'google',
    'twitter',
    'facebook',
    'emojione',
    'apple',
    'messenger',
  ];
  set = 'apple';
  lineType = 'TEXT';
  empty = '';
  listNoteTemp: any = {
    memo: '',
    status: null,
    textColor: null,
    format: '',
    lineType: 'TEXT',
  };
  currentElement: HTMLElement;
  currentElementColor: HTMLElement;
  elementColor: any;
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
  co_content: CO_Contents = new CO_Contents();
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

  @Input() contents: any = [
    {
      memo: '',
      status: null,
      textColor: null,
      format: null,
      lineType: 'TEXT',
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

  constructor(
    private dt: ChangeDetectorRef,
    private cache: CacheService,
    private api: ApiHttpService,
    private route: ActivatedRoute,
    private callfunc: CallFuncService,
    @Optional() dtR?: DialogRef
  ) {
    // this.dialog = dtR;
    this.cache.gridViewSetup('Contents', 'grvContents').subscribe((res) => {
      if (res) this.gridViewSetup = res;
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
    if (this.data.length > 0) {
      this.contents = this.data;
      this.setFont();
      this.dt.detectChanges();
      this.setPropertyForView();
    }
    this.getAssign('');
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
  }

  chooseType(type: any, ele: any) {
    if (!this.currentElement && ele)
      this.currentElement = ele.elRef.nativeElement;
    if (this.currentElement) {
      var input = this.currentElement.querySelector(
        '.codx-text'
      ) as HTMLElement;
      if (input) input.focus();
    }
    this.lineType = type;
    this.contents[this.id].lineType = this.lineType;
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
      this.updateContent(this.objectParentID, this.contents);
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

  chooseFont(font) {
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
    this.contents[this.id].format = this.listNoteTemp.format;
    if (this.objectParentID)
      this.updateContent(this.objectParentID, this.contents);
    this.dt.detectChanges();
  }

  checkFont(font, ele) {
    if (!this.currentElement && ele)
      this.currentElement = ele.elRef.nativeElement;
    if (this.currentElement) {
      var input = this.currentElement.querySelector(
        'input.codx-text'
      ) as HTMLElement;
      input.focus();
    }
    this.font[font] = !this.font[font];
    this.chooseFont(font);
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
              this.updateContent(this.objectParentID, this.contents);
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

  valueChange(event) {
    if (event?.data) {
      var dt = event?.data;
      var field = event?.field;
      this.listNoteTemp.lineType = this.lineType;
      this.listNoteTemp[field] = dt;
      this.contents[this.id].memo = dt;
      // if (this.mode == 'edit') this.updateContent(this.objectParentID, this.contents);
      this.id += 1;
      this.getContent.emit(this.contents);
    }
  }

  valueChangeStatus(event, index) {
    if (event?.data != null) {
      this.listNoteTemp['status'] = event?.data;
      this.contents[index].status = event?.data;
      if (this.mode == 'edit')
        this.updateContent(this.objectParentID, this.contents);
      this.getContent.emit(this.contents);
    }
  }

  keyUpEnter(event) {
    if (event?.data) {
      this.addContent(event?.data);
    }
    this.setPropertyAfterAdd();
  }

  addContent(data) {
    var checkFirstNote = false;
    if (data) {
      var obj = {
        memo: data,
        status: this.listNoteTemp.status,
        textColor: this.font.COLOR,
        format: this.listNoteTemp.format,
        lineType: this.lineType,
      };
      if (this.contents.length >= 2) {
        this.contents.pop();
        checkFirstNote = true;
      }
      this.contents.push(obj);
      // reverse
      if (checkFirstNote == false) this.contents.shift();
      var initListNote = {
        memo: '',
        status: null,
        textColor: null,
        format: null,
        lineType: this.lineType,
      };
      this.contents.push(initListNote);
      this.id = this.contents.length - 1;
      //reverse
      this.dt.detectChanges();
    }
    // if (this.mode == 'edit') {
    //   if (this.objectParentID) this.updateContent(this.objectParentID, this.contents);
    // }
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
    if (this.contents) {
      this.contents.splice(index, 1);
      if (this.mode == 'edit') {
        if (this.objectParentID)
          this.updateContent(this.objectParentID, this.contents);
      }
      this.getContent.emit(this.contents);
    }
  }

  getElement(ele: any) {
    this.currentElement = ele.elRef.nativeElement as HTMLElement;
    this.id = ele.id;
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

  clickFunction(
    type = null,
    format = null,
    ele = null,
    item = null,
    index = null
  ) {
    switch (type) {
      case 'format':
        this.chooseType(format, ele);
        break;
      case 'font':
        this.checkFont(format, ele);
        break;
      case 'delete':
        this.delete(index);
        break;
      case 'img':
        this.popupImg();
        break;
      case 'comment':
        this.comment(index);
        break;
      case 'assign':
        this.assign(index);
        break;
    }
    this.getContent.emit(this.contents);
  }

  updateContent(objectParentID, listContent) {
    this.api
      .execSv(this.service, this.assembly, this.className, this.method, [
        objectParentID,
        listContent,
      ])
      .subscribe();
  }

  comment(index) {
    this.id = index;
    this.callfunc.openForm(this.popupComment, '', 420, window.innerHeight);
  }

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
          this.updateContent(this.objectParentID, this.contents);
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
}
