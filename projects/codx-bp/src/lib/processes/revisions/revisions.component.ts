import { Component, Input, OnInit, Optional, ViewChild, ChangeDetectorRef } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { BP_Processes, BP_ProcessRevisions } from '../../models/BP_Processes.model';

@Component({
  selector: 'lib-revisions',
  templateUrl: './revisions.component.html',
  styleUrls: ['./revisions.component.css']
})
export class RevisionsComponent implements OnInit {
  @ViewChild('attachment') attachment: AttachmentComponent;
  @Input() process = new BP_Processes();

  revisions: any;
  headerText= "";
  data: any;
  dialog: any;
  recID: any;
  more: any;
  comment = '';

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data;
    this.dialog = dialog;
    this.more = this.data.more;
    this.process = this.data.data;
    this.revisions = this.process.versions;
    this.headerText = this.more.customName;
  }

  ngOnInit(): void {
  }


  //#region event
  valueChange(e){
    this.process.versionNo = e.data;
  }

  valueComment(e){
    if (e?.data) {
      this.comment = e?.data ? e?.data : '';
    }
    this.changeDetectorRef.detectChanges;
  }
  //#endregion
}
