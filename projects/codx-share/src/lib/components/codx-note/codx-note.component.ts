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
  listNote = [
    {
      memo: null,
      status: null,
      textColor: null,
      format: null,
      lineType: null,
    },
  ];
  currentElement: HTMLElement;
  font = {
    BOLD: false,
    ITALIC: false,
    UNDERLINE: false,
    COLOR: "#269a26",
  };
  format = {
    TEXT: true,
    LIST: false,
    CHECKBOX: false,
  };
  co_content: CO_Contents = new CO_Contents();
  test: any;
  color: any;

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

  ngAfterViewInit(): void {}

  onType(type: any) {
    if (type == 'TEXT') {
      this.setFormat(true, false, false);
    } else if (type == 'CHECKBOX') {
      this.setFormat(false, true, false);
    } else {
      this.setFormat(false, false, true);
    }
    this.lineType = type;
    this.dt.detectChanges();
  }

  setFormat(text = false, checkBox = false, list = false) {
    this.format.TEXT = text;
    this.format.CHECKBOX = checkBox;
    this.format.LIST = list;
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
    } else if (font == 'ITALIC') {
      if (style.fontStyle == 'normal')
        this.currentElement.style.setProperty(
          'font-style',
          'italic',
          'important'
        );
      else style.fontStyle = 'normal';
    } else if (font == 'UNDERLINE') {
      if (style.textDecorationLine == 'none')
        this.currentElement.style.setProperty(
          'text-decoration-line',
          'underline',
          'important'
        );
      else style.textDecorationLine = 'none';
    }
    this.dt.detectChanges();
  }

  checkFont(font, ele) {
    if (!this.currentElement && ele)
      this.currentElement = ele.elRef.nativeElement;
    if (this.currentElement) {
      var input = this.currentElement.querySelector(
        '.codx-text'
      ) as HTMLElement;
      input.focus();
    }

    this.font[font] = !this.font[font];
    this.chooseFont(font);
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

  valueChange(event, element = null, i = null) {
    if (event?.data) {
      var dt = event?.data;
      var field = event?.field;
      this.co_content.lineType = this.lineType;
      this.co_content[field] = dt;
    }
  }

  valueChangeStatus(event) {
    if (event?.data != null) {
      this.co_content[event?.field] = event?.data;
      if (this.co_content.memo != null) this.updateContent(this.co_content);
    }
  }

  valueChangeColor(event) {
    if (event?.data) {
      this.co_content[event?.field] = event?.data;
      if (this.currentElement) {
        var style = this.currentElement.style;
        style.color = event?.data;
        this.color = event?.data;
      }
      if (this.co_content.memo != null) this.updateContent(this.co_content);
    }
  }

  keyUpEnter(event) {
    if (event?.data) {
      this.addContent(event?.data);
    }
  }

  keyUpEnterTemp(event) {
    this.keyUpEnter(event);
    this.setFont();
    var ele = document.querySelectorAll('codx-input[type="text"]');
    if (ele) {
      let htmlE = ele[ele.length - 1] as HTMLElement;
      this.currentElement = htmlE;
      var input = this.currentElement.querySelector(
        '.codx-text'
      ) as HTMLElement;
      input.focus();
    }
  }

  addContent(data) {
    if (data) {
      this.co_content.format = null;
      this.co_content.memo = data;
      this.listNote.push(this.co_content);
      this.listNote[this.listNote.length - 1].memo = null;
      this.dt.detectChanges();
    }
    // this.api
    //   .execSv('CO', 'ERM.Business.CO', 'ContentsBusiness', 'SaveAsync', data)
    //   .subscribe((res) => {
    //     if (res) {

    //     }
    //   });
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
        // if (style.color != 'unset') this.font.COLOR = true;
        // else this.font.COLOR = false;
      }
    }
  }
}
