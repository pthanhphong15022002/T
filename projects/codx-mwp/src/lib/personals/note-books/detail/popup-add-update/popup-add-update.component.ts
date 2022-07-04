import { ApiHttpService, AuthStore, DialogData, DialogRef } from 'codx-core';
import { Component, OnInit, ChangeDetectorRef, Input, Optional, ViewChild } from '@angular/core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { AttachmentService } from 'projects/codx-share/src/lib/components/attachment/attachment.service';
import { Notes } from '@shared/models/notes.model';

@Component({
  selector: 'app-popup-add-update',
  templateUrl: './popup-add-update.component.html',
  styleUrls: ['./popup-add-update.component.scss']
})
export class PopupAddUpdate implements OnInit {

  title: any;
  memo: any;
  recID: any
  dialog: any;
  lstNote: any = [];
  checkUpdate = false;
  formType = '';
  readOnly = false;
  data: any;
  header = 'Thêm mới chi tiết sổ tay';

  note : Notes = new Notes();

  @ViewChild('attachment') attachment: AttachmentComponent

  constructor(private api: ApiHttpService,
    private changeDetectorRef: ChangeDetectorRef,
    public atSV: AttachmentService,
    private authStore: AuthStore,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef,
  ) {
    this.dialog = dialog;
    this.formType = dt?.data[1];
    if(this.formType == 'edit') {
      this.header = 'Cập nhật chi tiết sổ tay';
      this.note = dialog.dataService.dataSelected;
      this.data = dialog.dataService.dataSelected;
    }
    // this.recID = data.data?.recID;
    // this.lstNote = data.data?.lstNote;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    console.log("check attachment", this.attachment);
  }

  valueChange(e) {
    if (e) {
      var field = e.field;
      var dt = e.data;
      this.note[field] = dt?.value ? dt?.value : dt;
    }
  }
  
  saveNoteBookDetails() {
    if(this.formType == 'add') this.addNoteBookDetails();
    else this.updateNote();
  }

  addNoteBookDetails() {
    this.note.transID = '628b54be8549d257de3f4fa9';
    this.api.exec<any>(
      'ERM.Business.WP',
      'NoteBooksBusiness',
      'CreateNoteBookDetailsAsync',
      [this.note]
    ).subscribe((res) => {
      if (res) {
        this.dialog.close();
        this.dialog.dataService.data.push(res);
        this.changeDetectorRef.detectChanges();
      }
    })
  }

  updateNote() {
    this.api.exec<any>(
      'ERM.Business.WP',
      'NoteBooksBusiness',
      'UpdateNoteBookDetailAsync',
      [this.data?.recID, this.note]
    ).subscribe((res) => {
      if (res) {
        this.dialog.close();
        this.changeDetectorRef.detectChanges();
      }
    })
  }

  popup(evt: any) {
    this.attachment.uploadFile();
  }

  fileAdded(e) {
    this.attachment.saveFiles();
  }
}
