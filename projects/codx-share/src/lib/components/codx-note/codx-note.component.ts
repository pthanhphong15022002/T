import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ApiHttpService, CacheService } from 'codx-core';
import { createTrue } from 'typescript';
import { CO_Contents } from './model/CO_Contents.model';

@Component({
  selector: 'codx-note',
  templateUrl: './codx-note.component.html',
  styleUrls: ['./codx-note.component.scss'],
})
export class CodxNoteComponent implements OnInit {
  message: any;
  showEmojiPicker = false;
  font: any;
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

  co_content: CO_Contents = new CO_Contents();

  @Input() showMenu = true;
  @Input() showMF = true;

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

  onType(type) {
    this.lineType = type;
    this.dt.detectChanges();
  }

  isBOLD = false;
  isITALIC = false;
  isUNDERLINE = false;

  chooseFont(font) {
    if (font) {
      if (font == 'BOLD') {
        document.getElementById('font').style.fontWeight = 'bolder';
        if (this.isBOLD) {
          document.getElementById('font').style.fontWeight = '';
        }
        this.isBOLD = !this.isBOLD;
      } else if (font == 'ITALIC') {
        document.getElementById('font').style.fontStyle = 'italic';
        if (this.isITALIC) {
          document.getElementById('font').style.fontStyle = '';
        }
        this.isITALIC = !this.isITALIC;
      } else if (font == 'UNDERLINE') {
        document.getElementById('font').style.textDecoration = 'underline';
        if (this.isUNDERLINE) {
          document.getElementById('font').style.textDecoration = '';
        }
        this.isUNDERLINE = !this.isUNDERLINE;
      }
      this.dt.detectChanges();
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

  valueChange(event, item = null, i = null) {
    if (event?.data) {
      var dt = event?.data;
      var field = event?.field;
      this.co_content.lineType = this.lineType;
      this.co_content[field] = dt;
      this.addContent(this.co_content);
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
      document.getElementById('font').style.color = event?.data;
      if (this.co_content.memo != null) this.updateContent(this.co_content);
    }
  }

  keyUpEnter(event) {
    if (event?.data) {
      // this.addContent(event?.data);
    }
  }

  addContent(data) {
    if (data) {
      this.listNote.push(data);
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
    debugger;
  }

  delete() {}
}
