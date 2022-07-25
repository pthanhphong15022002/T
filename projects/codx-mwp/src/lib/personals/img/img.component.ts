import { ActivatedRoute } from '@angular/router';
import { AuthStore, CodxService, ApiHttpService, CodxListviewComponent, CacheService } from 'codx-core';
import { Component, OnInit, ChangeDetectorRef, AfterViewInit, ViewChild } from '@angular/core';
import { ImageGridComponent } from 'projects/codx-share/src/lib/components/image-grid/image-grid.component';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';

@Component({
  selector: 'app-img',
  templateUrl: './img.component.html',
  styleUrls: ['./img.component.scss']
})
export class ImgComponent implements OnInit, AfterViewInit {

  data: any = [];
  functionList = {
    entityName: '',
    funcID: '',
  }

  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
  ) {
    this.cache.functionList('WP').subscribe(res => {
      this.functionList.entityName = res.entityName;
      this.functionList.funcID = res.functionID;
    })
  }

  ngOnInit(): void {
    this.getFile();
  }

  ngAfterViewInit() {
  }

  getFile() {
    this.api.exec<any>('ERM.Business.DM', 'FileBussiness', 'GetFilesByObjectTypeAsync', 'WP_Comments').
    subscribe((files:any[]) => {
      // if(files.length > 0){
      //   files.forEach((f:any) => {
      //     if(f.referType == this.FILE_REFERTYPE.IMAGE){
      //       this.file_img_video.push(f);
      //     }
      //     else if(f.referType == this.FILE_REFERTYPE.VIDEO){
      //       f['srcVideo'] = `${environment.apiUrl}/api/dm/filevideo/${f.recID}?access_token=${this.auth.userValue.token}`;
      //       this.file_img_video.push(f);
      //     }
      //     else{
      //       this.file_application.push(f);
      //     }
      //   });
      //   this.dt.detectChanges();
      //   this.evtGetFiles.emit(files);
      // }
    })
  }
}
