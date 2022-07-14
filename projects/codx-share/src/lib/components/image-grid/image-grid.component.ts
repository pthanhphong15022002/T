import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, SimpleChange, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { Subscription } from 'rxjs';
import 'lodash';
import { FilesService } from 'codx-core';
import { ErmComponent } from '../ermcomponent/erm.component';
@Component({
  selector: 'codx-image-grid',
  templateUrl: './image-grid.component.html',
  styleUrls: ['./image-grid.component.scss'],
})
export class ImageGridComponent extends ErmComponent implements OnInit {

  @Input() files: any = [];
  @Input() database: boolean = false;
  @Input() changed: number = 0;
  @Input() images: Array<any> = [];
  @Input() objectID:string = "";
  @Input() showBtnRemove: boolean = false;
  @Output() viewDetail = new EventEmitter();

  fileLength: number;
  @ViewChild('video') video: ElementRef;
  private subscription: Subscription = new Subscription();
  constructor(
    private injector: Injector,
    private fileSv: FilesService,
    private sanitizer: DomSanitizer,
    private df: ChangeDetectorRef
  ) {
    super(injector);
  }

  ngOnInit() {
    if(this.objectID){
      this.getFile();
    } 
  }


  ngOnChanges(changes: { [propName: string]: SimpleChange }) {
    if (this.files && this.files.length) {
      this.getFile();
    }
  }


  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getFile() {
    const t = this;
    if (this.database) {
      const paths = this.files.map(o => o.fileName);
      this.api.execSv<any>('WP', 'WP', 'CommentBusiness', 'GetFile', JSON.stringify(paths)).subscribe(res => {
        if (res) {
          let tmpImg = [];
          let ext = [".flv", ".mkv", ".webm", ".vob", ".ogv", ".gif", ".avi", ".wmv", ".mp4", ".m4p", ".m4v", ".mpg", ".mpeg", ".3gp"]
          for (let i = 0; i < res.length; i++) {
            let json = JSON.parse(res[i].content);
            var bytes = this.fileSv.base64ToArrayBuffer(json);
            let blob = new Blob([bytes], { type: res[i].mimeType });
            let url = window.URL.createObjectURL(blob);
            let category = ext.includes(res[i].extension.toLowerCase()) ? "10" : "9";
            let fileByte = this.sanitizer.bypassSecurityTrustUrl(`url(${url})`);
            if (category == "10")
              fileByte = this.sanitizer.bypassSecurityTrustUrl(url);
            res[i].fileName = fileByte;
            res[i].category = category;
            tmpImg.push(res[i]);
          }
          this.images = tmpImg;
          this.df.detectChanges();
        }
      })
    }
    else {
      t.images = t.files;
    };
  }

  openDetail(data) {
    this.viewDetail.emit(data);
  }


  removeImg(){
    
  }
}
