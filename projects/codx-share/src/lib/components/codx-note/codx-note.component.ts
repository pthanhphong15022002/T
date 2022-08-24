import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ApiHttpService, CacheService } from 'codx-core';

@Component({
  selector: 'codx-note',
  templateUrl: './codx-note.component.html',
  styleUrls: ['./codx-note.component.css'],
})
export class CodxNoteComponent implements OnInit {

  message: any;
  showEmojiPicker = false;
  lineType = 'text';
  empty = '';
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
      // this.addContent(event?.data);
    }
  }

  keyUpEnter(event) {
    if (event?.data) {
      // this.addContent(event?.data);
    }
  }

  addContent(data) {
    debugger;
    this.api
      .execSv('CO', 'ERM.Business.CO', 'ContentsBusiness', 'SaveAsync', data)
      .subscribe((res) => {
        if (res) {

        }
      });
  }
}
