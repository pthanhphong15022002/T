import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ApiHttpService, CacheService, CodxInputComponent } from 'codx-core';
import { createTrue } from 'typescript';
import { CO_Contents } from './model/CO_Contents.model';

@Component({
  selector: 'codx-note',
  templateUrl: './codx-note.component.html',
  styleUrls: ['./codx-note.component.scss'],
})
export class CodxNoteComponent implements OnInit, AfterViewInit {
  message: any;
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
  listNote: any = [
    {
      memo: '',
      status: null,
      textColor: null,
      format: null,
      lineType: 'TEXT',
    },
  ];
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
    COLOR: 'sunset',
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
  id = '0';

  @Input() showMenu = true;
  @Input() showMF = true;
  @ViewChild('input') input: any;

  constructor(
    private dt: ChangeDetectorRef,
    private cache: CacheService,
    private api: ApiHttpService
  ) {
    this.cache.gridViewSetup('Contents', 'grvContents').subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
        console.log('check gridViewSetup', this.gridViewSetup);
      }
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.input) this.currentElement = this.input.elRef.nativeElement;
    if (this.currentElement) {
      var input = this.currentElement.querySelector(
        '.codx-text'
      ) as HTMLElement;
      input.focus();
      this.currentElement.id = '0';
    }
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
    this.listNote[this.id].lineType = this.lineType;
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
  }

  setFormat(text = true, checkBox = false, list = false, title = false) {
    this.format.TEXT = text;
    this.format.CHECKBOX = checkBox;
    this.format.LIST = list;
    this.format.TITLE = title;
    if (!this.currentElement) return;
    this.currentElement.focus();
    // if (this.format.TEXT) this.currentElement.id = 'TEXT';
    // else if (this.format.LIST) this.currentElement.id = 'LIST';
    // else this.currentElement.id = 'CHECKBOX';
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
        this.currentElement.focus();
        this.listNoteTemp[event?.field] = event?.data;
        this.elementColor = elementColor;
        this.chooseColor(event?.data);
      }
      if (this.listNoteTemp.memo != null) this.updateContent(this.listNoteTemp);
    }
  }

  chooseColor(color) {
    if (!this.currentElement) return;
    this.currentElement.focus();
    this.currentElement.style.setProperty('color', color, 'important');
    this.font.COLOR = color;
    this.dt.detectChanges();
  }

  setColorForCodxColor(color) {
    if (this.elementColor)
      this.currentElementColor = this.elementColor.elRef.nativeElement;
    if (this.currentElementColor) {
      var divColor = this.currentElementColor.querySelector(
        'div.codx-colorpicker'
      ) as HTMLElement;
      var childrenDivColor = divColor.children[0] as HTMLElement;
      var grandChildrenDivColor = childrenDivColor.children[0] as HTMLElement;
      var inputColor = grandChildrenDivColor.children[1] as HTMLElement;
      this.currentElementColor = inputColor;
      this.currentElementColor.style.setProperty(
        'background-color',
        color,
        'important'
      );
    }
  }

  popupFile() {}

  addEmoji(event) {
    this.message += event.emoji.native;
    this.dt.detectChanges();
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
    this.dt.detectChanges();
  }

  valueChange(event, ele) {
    if (event?.data) {
      var dt = event?.data;
      var field = event?.field;
      this.listNoteTemp.lineType = this.lineType;
      if (event?.field != 'memo') this.listNoteTemp[field] = dt;
    }
  }

  valueChangeStatus(event) {
    if (event?.data != null) {
      this.listNoteTemp[event?.field] = event?.data;
      if (this.listNoteTemp.memo != null) this.updateContent(this.listNoteTemp);
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
        textColor: this.listNoteTemp.textColor,
        format: this.listNoteTemp.format,
        lineType: this.lineType,
      };
      if (this.listNote.length >= 2) {
        this.listNote.pop();
        checkFirstNote = true;
      }
      this.listNote.push(obj);
      // reverse
      if (checkFirstNote == false) this.listNote.shift();
      var initListNote = {
        memo: '',
        status: null,
        textColor: null,
        format: null,
        lineType: this.lineType,
      };
      this.listNote.push(initListNote);
      this.id = `${this.listNote.length - 1}`;
      //reverse
      console.log('check listNote', this.listNote);
      this.dt.detectChanges();
    }
    // this.api
    //   .execSv('CO', 'ERM.Business.CO', 'ContentsBusiness', 'SaveAsync', data)
    //   .subscribe((res) => {
    //     if (res) {

    //     }
    //   });
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
      this.setFont();
    }
  }

  updateContent(data) {
    data;
  }

  delete() {}

  refresh() {
    this.listNote = [
      {
        memo: null,
        status: null,
        textColor: null,
        format: null,
        lineType: null,
      },
    ];
    this.currentElement = null;
    this.setFont();
    this.setFormat();
    this.dt.detectChanges();
  }

  getElement(ele: any) {
    this.currentElement = ele.elRef.nativeElement as HTMLElement;
    this.id = ele.id;
    var divElement = this.currentElement.children[0] as HTMLElement;
    var inputElement = divElement.children[0] as HTMLElement;
    var colorOfInputEle = inputElement.style.color;

    if (this.listNote.length > 1) {
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
      this.lineType = this.listNote[this.id].lineType;
      if (this.listNote[this.id].lineType == 'TEXT') this.setFormat();
      else if (this.listNote[this.id].lineType == 'LIST')
        this.setFormat(false, false, true);
      else if (this.listNote[this.id].lineType == 'CHECKBOX')
        this.setFormat(false, true, false);
      else this.setFormat(false, false, false, true);
    }
    this.dt.detectChanges();
  }
}
