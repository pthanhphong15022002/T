import { Component, OnInit, ChangeDetectorRef, Input, OnChanges, SimpleChanges } from '@angular/core';

import { FormBuilder } from '@angular/forms';
import { NotificationsService } from 'codx-core';

import { objectPara } from '../viewFileDialog/alertRule.model';
import { SystemDialogService } from '../viewFileDialog/systemDialog.service';

@Component({
  selector: 'thumbnail',
  templateUrl: './thumbnail.component.html',
  styleUrls: ['./thumbnail.component.scss']
})
export class ThumbnailComponent implements OnInit, OnChanges {
  @Input() data: any;
  files: any;
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private systemDialogService: SystemDialogService,
  ) {

  }
  ngOnInit(): void {
    //this.formdata = new FormGroup({});
    //alert(this.recID);
    // console.log(this.data);
    this.files = JSON.parse(this.data);
    this.changeDetectorRef.detectChanges();
  }

  openFile(data) {
    //if (this.checkReadRight() ) {
    var obj = new objectPara();
    obj.fileID = data.recID;
    obj.fileName = data.fileName;
    obj.extension = data.extension;
    obj.data = JSON.parse(this.data);
    this.changeDetectorRef.detectChanges();
    this.systemDialogService.onOpenViewFileDialog.next(obj);
    // this.fileService.getFile(obj.fileID, true).subscribe(item => {
    //   if (item) {
    //     this.changeDetectorRef.detectChanges();
    //     this.systemDialogService.onOpenViewFileDialog.next(obj);
    //   }
    // })
  }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    this.files = JSON.parse(this.data);
    this.changeDetectorRef.detectChanges();
  }

  getExtension(ext) {
    ext = ext.substring(1);
    ext = ext.toLocaleLowerCase();
    return `../../../assets/demos/dms/${ext}.svg`;
  }

}
