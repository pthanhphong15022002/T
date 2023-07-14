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
import {
  FormControl,
  FormGroup,
  Validators,
  FormBuilder,
  AbstractControl,
} from '@angular/forms';
import { FileService } from '@shared/services/file.service';
import {
  ApiHttpService,
  CacheService,
  CodxService,
  DataRequest,
  DialogData,
  DialogRef,
  NotificationsService,
} from 'codx-core';
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
  refID: any; // Thảo thêm để thêm biến lưu cho temEx
  refType: any; // Thảo thêm để thêm biến lưu cho temEx
  fileCount = 0;
  module: any;
  @ViewChild('attachment') attachment: AttachmentComponent;
  @Output() setDefaultValue = new EventEmitter();
  constructor(
    private formBuilder: FormBuilder,
    private api: ApiHttpService,
    private cache: CacheService,
    private notifySvr: NotificationsService,
    private file: FileService,
    private codxService: CodxService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.action = dt.data?.action;
    this.type = dt.data?.type;
    this.refID = dt.data?.refID; // Thảo thêm để thêm biến lưu cho temEx
    this.refType = dt.data?.refType; // Thảo thêm để thêm biến lưu cho temEx

    if (this.action == 'add') {
      this.headerText = 'Thêm ' + this.type + ' Template';
    } else if (this.action == 'edit') {
      this.headerText = 'Chỉnh sửa ' + this.type + ' Template';
    }
    this.data = dialog.dataService;
    this.dialog = dialog;
    //this.data = dt.data;
  }
  ngOnInit(): void {
    this.module =
      this.type == 'excel' ? 'AD_ExcelTemplates' : 'AD_WordTemplates';
    if (this.type == 'excel') {
      this.exportAddForm = this.formBuilder.group({
        templateName: [this.data?.templateName, Validators.required],
        description: this.data?.description,
        pWControl: this.data?.pWControl,
        pWDefault: this.data?.pWDefault,
        isDefault: this.data?.isDefault != null ? this.data?.isDefault : false,
        covertPDF: this.data?.covertPDF != null ? this.data?.covertPDF : false,
        sheetIndex: [
          this.data?.sheetIndex != null ? this.data?.sheetIndex : 0,
          Validators.required,
        ],
        headerRow: [this.data?.headerRow, Validators.required],
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
        groupTotal3: this.data?.groupTotal3,
      });
    } else {
      this.api
        .execSv('SYS', 'AD', 'WordTemplatesBusiness', 'GetDefaultAsync', [
          'WordTemplates',
          'grvWordTemplates',
          this.action == 'add',
        ])
        .subscribe((res: any) => {
          if (!res) return;
          var gridview = res.gridview;
          this.cache.setGridView('grvWordTemplates', gridview);
          var gridviewSetup = res.gridviewSetup;
          this.cache.setGridViewSetup(
            'WordTemplates',
            'grvWordTemplates',
            gridviewSetup
          );
          if (this.action == 'add') {
            this.data = res.data;
            this.exportAddForm = this.formBuilder.group({
              templatetID: [this.data?.templatetID],
              templateName: [this.data?.templateName, Validators.required],
              description: this.data?.description,
              pWControl: '',
              pWDefault: '',
              owner: this.data?.owner,
              buid: this.data?.buid,
              createdOn: this.data?.createdOn,
            });
          } else {
            this.exportAddForm = this.codxService.buildFormGroup(
              'WordTemplates',
              'grvWordTemplates',
              'AD_WordTemplates',
              this.data
            );
            // this.exportAddForm.addControl('pWControl', new FormControl(''));
            // this.exportAddForm.addControl('pWDefault', new FormControl(''));
          }
        });
    }
  }
  get f(): { [key: string]: AbstractControl } {
    return this.exportAddForm.controls;
  }
  ngOnChanges(changes: SimpleChanges) {}
  openFormUploadFile() {
    this.attachment.uploadFile();
  }
  onSave() {
    this.submitted = true;
    if (this.exportAddForm.invalid) return;
    if (this.type == 'excel') {
      this.exportAddForm.value.owner = 'a';
      this.exportAddForm.value.buid = 'a';
      //Thêm mới
      if (this.action == 'add') {
        this.exportAddForm.value.refID = this.refID; // Thảo thêm để thêm biến lưu cho temEx
        this.exportAddForm.value.refType = this.refType; // Thảo thêm để thêm biến lưu cho temEx
        if (this.fileCount > 0) {
          this.api
            .execSv(
              'SYS',
              'AD',
              'ExcelTemplatesBusiness',
              'SaveTemplateAsync',
              this.exportAddForm.value
            )
            .subscribe((item) => {
              if (item && item[0]) {
                this.notifySvr.notifyCode('RS002');
                this.attachment.objectId = item[1].recID;
                this.attachment.saveFiles();
                this.dialog.close([item[1], this.type]);
              } else this.notifySvr.notifyCode('SYS023');
            });
        } else this.notifySvr.notifyCode('OD022');
      }
      //Chỉnh sửa
      else if (this.action == 'edit') {
        this.exportAddForm.value.recID = this.data.recID;
        this.exportAddForm.value.refID = this.data.refID; // Thảo thêm để thêm biến lưu cho temEx
        this.exportAddForm.value.refType = this.data.refType; // Thảo thêm để thêm biến lưu cho temEx
        this.api
          .execActionData<any>(
            'AD_ExcelTemplates',
            [this.exportAddForm.value],
            'UpdateAsync'
          )
          .subscribe((item) => {
            debugger;
            if (item[0] == true) {
              this.notifySvr.notifyCode('RS002');
              this.attachment.objectId = item[1][0].recID;
              if (this.fileCount > 0) {
                /* this.file.deleteFileByObjectIDType(this.idCrrFile,"AD_ExcelTemplates",true).subscribe(item=>{
                  console.log(item);
                }); */
                this.file
                  .deleteFileToTrash(this.idCrrFile, '', true)
                  .subscribe();
                this.attachment.objectId = item[1][0].recID;
                this.attachment.saveFiles();
              }
              this.dialog.close([item[1][0], this.type]);
            } else this.notifySvr.notify('SYS021');
          });
      }
    } else {
      if (this.action == 'add') {
        this.api
          .execActionData(
            'AD_WordTemplates',
            [this.exportAddForm.value],
            'SaveAsync'
          )
          .subscribe((item) => {
            if (item && item.length > 1) {
              this.notifySvr.notifyCode('RS002');
              this.attachment.objectId = item[1][0].recID;
              this.attachment.saveFiles();
              this.dialog.close([item[1][0], this.type]);
            } else this.notifySvr.notifyCode('SYS023');
          });
      } else {
        this.exportAddForm.value.docFile = null;
        this.exportAddForm.value.xmlFile = null;
        this.exportAddForm.value.xmlSchemaFile = null;
        this.exportAddForm.value.xsltStylessheet = null;
        if (!this.exportAddForm.value.isDefault)
          this.exportAddForm.value.isDefault = false;
        if (!this.exportAddForm.value.isLocal)
          this.exportAddForm.value.isLocal = false;
        if (!this.exportAddForm.value.isSystem)
          this.exportAddForm.value.isSystem = false;
        this.api
          .execActionData<any>(
            'AD_WordTemplates',
            [this.exportAddForm.value],
            'UpdateAsync'
          )
          .subscribe((item) => {
            debugger;
            if (!item) return;
            if (item[0] == true) {
              this.notifySvr.notifyCode('RS002');
              this.attachment.objectId = item[1][0].recID;
              if (this.fileCount > 0) {
                /* this.file.deleteFileByObjectIDType(this.idCrrFile,"AD_ExcelTemplates",true).subscribe(item=>{
                  console.log(item);
                }); */
                this.file
                  .deleteFileToTrash(this.idCrrFile, '', true)
                  .subscribe();
                this.attachment.objectId = item[1][0].recID;
                this.attachment.saveFiles();
              }
              this.dialog.close([item[1][0], this.type]);
            } else this.notifySvr.notify('SYS021');
          });
      }
    }
  }
  getfileCount(e: any) {
    this.fileCount = e.data.length;
  }
  getFile(e: any) {
    if (!e || (e && e.length == 0)) return;
    this.idCrrFile = e[0].recID;
  }
}
