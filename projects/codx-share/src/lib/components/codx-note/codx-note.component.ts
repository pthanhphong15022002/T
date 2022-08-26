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
  };
  format = {
    TEXT: true,
    LIST: false,
    CHECKBOX: false,
  };
  co_content: CO_Contents = new CO_Contents();

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

  getElementFirst() {
    var ele = document.getElementsByClassName('memo');
    if (ele) {
      let htmlE = ele[ele.length - 1] as HTMLElement;
      htmlE.focus();
      this.currentElement = htmlE;
    }
  }

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
    var style = this.currentElement.style;
    if (font == 'BOLD') {
      if (!style.fontWeight)
        // this.currentElement.setAttribute(
        //   'style',
        //   'font-weight: bolder !important'
        // );
        style.fontWeight = 'bolder';
      else style.fontWeight = '';
    } else if (font == 'ITALIC') {
      if (!style.fontStyle) style.fontStyle = 'italic';
      else style.fontStyle = '';
    } else if (font == 'UNDERLINE') {
      if (!style.textDecorationLine) style.textDecorationLine = 'underline';
      else style.textDecorationLine = '';
    }
    this.dt.detectChanges();
  }

  checkFont(font) {
    this.font[font] = !this.font[font];
    if (this.listNote.length <= 1) this.getElementFirst();
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
    var ele = document.getElementsByClassName('memo');
    if (ele) {
      let htmlE = ele[ele.length - 1] as HTMLElement;
      htmlE.focus();
      this.currentElement = htmlE;
    }
  }

  addContent(data) {
    if (data) {
      this.listNote.push(data);
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
    this.setFont();
    this.setFormat();
    this.dt.detectChanges();
  }

  getElement(ele: any) {
    this.currentElement = ele.elRef.nativeElement as HTMLElement;
    if (this.listNote.length > 1) {
      var style: any = this.currentElement.style;
      if (style.length == 0) this.setFont();
      else {
        for (let i = 0; i < style.length; i++) {
          if (style[i] == 'font-weight') this.font.BOLD = true;
          else if (style[i] == 'font-style') this.font.ITALIC = true;
          else this.font.UNDERLINE = true;
        }
      }
    }
  }
}
