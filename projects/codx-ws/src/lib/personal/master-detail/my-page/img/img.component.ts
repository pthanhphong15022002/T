import { Component } from '@angular/core';
import { FileService } from '@shared/services/file.service';
import { AuthStore, CallFuncService } from 'codx-core';
import { ViewFileDialogComponent } from 'projects/codx-common/src/lib/component/viewFileDialog/viewFileDialog.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'lib-img',
  templateUrl: './img.component.html',
  styleUrls: ['./img.component.scss']
})
export class ImgComponent {
  predicate = `ObjectType=@0 && IsDelete=@1 && CreatedBy=@2 && ReferType=@3`;
  dataValue:any;
  user:any;
  constructor(
    private auth: AuthStore,
    private fileService: FileService,
    private callfc: CallFuncService,
    private shareService: CodxShareService,
  ) 
  {
    this.user = this.auth.get();
    this.dataValue = `WP_Comments;false;${this.user?.userID};image`;
  }

  openImg(item) {
    this.fileService.getFile(item.recID).subscribe((data) => {
      this.callfc.openForm(
        ViewFileDialogComponent,
        data.fileName,
        1000,
        800,
        '',
        data,
        ''
      );
    });
  }

  getThumb(file: any) {
    if (file.pathDisk) return this.shareService.getThumbByUrl(file.pathDisk, 300);
    return '/assets/themes/wp/default/img/Image_NoData.svg';
  }
}
