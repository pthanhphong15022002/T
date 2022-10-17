import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { FileUpload } from '@shared/models/file.model';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-properties',
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.css']
})
export class PropertiesComponent implements OnInit {

  titleDialog = 'Thông tin';
  titleExpand = 'Mở rộng';
  dialog: any;
  data: any;
  hideExtend = true;
  titleVersion = 'Phiên bản';
  titleHistory = 'Lịch sử';
  fileEditing: FileUpload;


  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() data?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.data = data.data;
  }

  ngOnInit(): void {
  }

  extendShow(): void {
    this.hideExtend = !this.hideExtend;
    var doc = document.getElementsByClassName('extend-more')[0];
    var ext = document.getElementsByClassName('ext_button')[0];
    if (doc != null) {
      if (this.hideExtend) {
        document.getElementsByClassName("codx-dialog-container")[0].setAttribute("style", "width: 550px; z-index: 1000;");
        doc.setAttribute("style", "display: none");
        ext.classList.remove("rotate-back");
      }
      else {
        document.getElementsByClassName("codx-dialog-container")[0].setAttribute("style", "width: 900px; z-index: 1000;");
        doc.setAttribute("style", "display: block");
        ext.classList.add("rotate-back");
      }
    }

    this.changeDetectorRef.detectChanges();
  }
}
