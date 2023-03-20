import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Optional,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { FileService } from '@shared/services/file.service';
import { ApiHttpService, CodxService, DataRequest, DialogData, DialogRef, NotificationsService } from 'codx-core';
import { type } from 'os';
import { map } from 'rxjs';
import { AttachmentComponent } from '../../attachment/attachment.component';

@Component({
  selector: 'codx-export-add',
  templateUrl: './codx-export-add.component.html',
  styleUrls: ['./codx-export-add.component.scss'],
})
export class CodxExportAddComponent implements OnInit, OnChanges {
  idCrrFile: any;
  type: any;
  action: any;
  data: any;
  dialog: any;
  lblExtend: string = '';
  headerText: any;
  exportAddForm: FormGroup;
  submitted = false;
  fileCount = 0;
  module: any;
  @ViewChild('attachment') attachment: AttachmentComponent
  @Output() setDefaultValue = new EventEmitter();
  constructor(
    private formBuilder: FormBuilder,
    private api: ApiHttpService,
    private notifySvr: NotificationsService,
    private file: FileService,
    private codxService: CodxService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.action = dt.data?.action;
    this.type = dt.data?.type;
    if (this.action == "add") {
      this.headerText = "Thêm " + this.type + " Template";
    }
    else if (this.action == "edit") {
      this.headerText = "Chỉnh sửa " + this.type + " Template";
    }
    this.data = dialog.dataService;
    this.dialog = dialog;
    //this.data = dt.data;
  }
  ngOnInit(): void {
    this.module = this.type == "excel" ? "AD_ExcelTemplates" : "AD_WordTemplates"
    this.exportAddForm = this.formBuilder.group(
      {
        templateName: [this.data?.templateName, Validators.required],
        description: this.data?.description,
        pWControl: this.data?.pWControl,
        pWDefault: this.data?.pWDefault,
        isDefault: this.data?.isDefault != null ? this.data?.isDefault : false,
        covertPDF: this.data?.covertPDF != null ? this.data?.covertPDF : false,
        sheetIndex: [this.data?.sheetIndex!= null ? this.data?.sheetIndex : 0,Validators.required],
        headerRow: [this.data?.headerRow,Validators.required],
        headerColumn: this.data?.headerColumn,
        splitPagesOn: this.data?.splitPagesOn,
        splitPagesMode: this.data?.splitPagesMode,
        rowNoIndex: this.data?.rowNoIndex,
        rowNoReset: this.data?.rowNoReset,
        groupName1: this.data?.groupName1,
        groupName2: this.data?.groupName2,
        groupName3: this.data?.groupName3,
        groupTotal1: this.data?.groupTotal1,
        groupTotal2: this.data?.groupTotal2,
        groupTotal3: this.data?.groupTotal3
      }
    );
  }
  get f(): { [key: string]: AbstractControl } {
    return this.exportAddForm.controls;
  }
  ngOnChanges(changes: SimpleChanges) { }
  openFormUploadFile() {
    this.attachment.uploadFile();
  }
  onSave() {
    this.submitted = true;
    if (this.exportAddForm.invalid) return;
    this.exportAddForm.value.owner = "a";
    this.exportAddForm.value.buid = "a";
    //Thêm mới
    if (this.action == "add") {
      if (this.fileCount > 0) {
        debugger
        this.api
          .execSv(
            "SYS",
            "AD",
            "ExcelTemplatesBusiness",
            "SaveTemplateAsync",
            this.exportAddForm.value
          ).subscribe(item => {
            if (item && item[0]) {
              this.notifySvr.notifyCode("RS002");
              this.attachment.objectId = item[1].recID;
              this.attachment.saveFiles();
              this.dialog.close([item[1], this.type]);
            }
            else this.notifySvr.notifyCode("SYS023");
          })
      }
      else this.notifySvr.notifyCode("OD022");
    }
    //Chỉnh sửa
    else if (this.action == "edit") {
      this.exportAddForm.value.recID = this.data.recID
      this.api
        .execActionData<any>(
          'AD_ExcelTemplates',
          [this.exportAddForm.value],
          'UpdateAsync'
        ).subscribe(item => {
          debugger
          if (item[0] == true) {
            this.notifySvr.notifyCode("RS002");
            this.attachment.objectId = item[1][0].recID;
            if (this.fileCount > 0) {
              /* this.file.deleteFileByObjectIDType(this.idCrrFile,"AD_ExcelTemplates",true).subscribe(item=>{
                console.log(item);
              }); */
              this.file.deleteFileToTrash(this.idCrrFile, "", true).subscribe();
              this.attachment.objectId = item[1][0].recID;
              this.attachment.saveFiles();
            }
            this.dialog.close([item[1][0], this.type]);
          }
          else this.notifySvr.notify("SYS021");
        })
    }
  }
  getfileCount(e: any) {
    this.fileCount = e.data.length;
  }
  getFile(e: any) {
    this.idCrrFile = e[0].recID
  }
}
