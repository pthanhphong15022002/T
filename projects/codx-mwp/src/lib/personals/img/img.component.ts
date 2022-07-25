import { ActivatedRoute } from '@angular/router';
import { AuthStore, CodxService, ApiHttpService, CodxListviewComponent, CacheService, AuthService } from 'codx-core';
import { Component, OnInit, ChangeDetectorRef, AfterViewInit, ViewChild } from '@angular/core';
import { ImageGridComponent } from 'projects/codx-share/src/lib/components/image-grid/image-grid.component';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { environment } from 'src/environments/environment';

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
  FILE_REFERTYPE = {
    IMAGE: "image",
    VIDEO: "video",
  }
  file_img:any[] = [];

  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
    private dt: ChangeDetectorRef,
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
      if(files.length > 0){
        files.forEach((f:any) => {
          if(f.referType == this.FILE_REFERTYPE.IMAGE && (f.thumbnail != '' || f.thumbnail != null)){
            this.file_img.push(f);
          }
        });
        this.dt.detectChanges();
      }
    })
  }
}
