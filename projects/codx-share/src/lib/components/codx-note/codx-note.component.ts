import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CacheService } from 'codx-core';

@Component({
  selector: 'codx-note',
  templateUrl: './codx-note.component.html',
  styleUrls: ['./codx-note.component.css']
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
    'messenger'
  ]
  set = 'apple';

  constructor(private dt: ChangeDetectorRef,
    private cache: CacheService,

    ) { 
      this.cache.gridViewSetup('Contents', 'grvContents').subscribe(res => {
        if(res) {
          this.gridViewSetup = res;
          console.log("check gridViewSetup", this.gridViewSetup);
        }
      })
    }

  ngOnInit(): void {
  }

  onType(type) {

  }

  popupFile() {

  }

  addEmoji(event) {
    this.message += event.emoji.native;
    this.dt.detectChanges();
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
    this.dt.detectChanges();
  }

  valueChange(event, item = null, i = null) {

  }

  onUpdateNote(event) {

  }

  addNote() {
    
  }
}
