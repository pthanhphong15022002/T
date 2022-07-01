import { Component, OnInit, ChangeDetectorRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CallFuncService } from 'codx-core';
import { objectPara } from '../viewFileDialog/alertRule.model';
import { SystemDialogService } from '../viewFileDialog/systemDialog.service';
import { ViewFileDialogComponent } from '../viewFileDialog/viewFileDialog.component';
@Component({
  selector: 'thumbnail',
  templateUrl: './thumbnail.component.html',
  styleUrls: ['./thumbnail.component.scss']
})
export class ThumbnailComponent implements OnInit, OnChanges {
  @Input() files: any;
 // files: any;  
  constructor(    
    private changeDetectorRef: ChangeDetectorRef,
    private systemDialogService: SystemDialogService,
    private callfc: CallFuncService,
  ) {

  }
  ngOnInit(): void {    
   // this.files = JSON.parse(this.data);
    this.changeDetectorRef.detectChanges();
  }

  openFile(file) {
    this.callfc.openForm(ViewFileDialogComponent, file.fileName, 1000, 800, "", file, "");
    //if (this.checkReadRight() ) {
    // var obj = new objectPara();
    // obj.fileID = data.recID;
    // obj.fileName = data.fileName;
    // obj.extension = data.extension;
    // obj.data = JSON.parse(this.data);
    // this.changeDetectorRef.detectChanges();
    // this.systemDialogService.onOpenViewFileDialog.next(obj);
    // this.fileService.getFile(obj.fileID, true).subscribe(item => {
    //   if (item) {
    //     this.changeDetectorRef.detectChanges();
    //     this.systemDialogService.onOpenViewFileDialog.next(obj);
    //   }
    // })
  }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
 //   this.files = JSON.parse(this.data);
    this.changeDetectorRef.detectChanges();
  }

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  getExtension(ext) {
    ext = ext.substring(1);
    ext = ext.toLocaleLowerCase();
    return `../../../assets/demos/dms/${ext}.svg`;
  }

}
