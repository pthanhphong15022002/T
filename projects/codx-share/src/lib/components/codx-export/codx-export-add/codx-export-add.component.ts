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
import { FormControl, FormGroup, Validators , FormBuilder, AbstractControl } from '@angular/forms';
import { ApiHttpService, CodxService, DataRequest, DialogData, DialogRef, NotificationsService } from 'codx-core';
import { map } from 'rxjs';
import { AttachmentComponent } from '../../attachment/attachment.component';

@Component({
  selector: 'codx-export-add',
  templateUrl: './codx-export-add.component.html',
  styleUrls: ['./codx-export-add.component.scss'],
})
export class CodxExportAddComponent implements OnInit, OnChanges
{
  @ViewChild('attachment') attachment: AttachmentComponent
  data: any;
  dialog: any;
  lblExtend: string = '';
  headerText: any;
  exportAddForm : FormGroup;
  submitted = false;
  fileCount = 0;
  @Output() setDefaultValue = new EventEmitter();
  constructor(
    private formBuilder: FormBuilder,
    private api: ApiHttpService,
    private notifySvr: NotificationsService,
    private codxService: CodxService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  {
    if(dt.data?.type == "add")
    {
      this.headerText = "Thêm Excel Template";
    }

    else if(dt.data?.type == "edit")
    {
      this.headerText = "Chỉnh sửa Excel Template";
    }
    this.data = dialog.dataService;
    this.dialog = dialog;
    //this.data = dt.data;
  }
  ngOnInit(): void {
    this.exportAddForm = this.formBuilder.group(
      {
        templateName: [this.data?.templateName , Validators.required],
        description: [this.data?.description , Validators.required],
        pWControl: this.data?.pWControl,
        pWDefault: this.data?.pWDefault,
        isDefault: this.data?.isDefault != null ? this.data?.isDefault : false,
        covertPDF: this.data?.covertPDF != null ? this.data?.covertPDF : false,
        sheetIndex: this.data?.sheetIndex,
        headerRow: this.data?.headerRow,
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
  ngOnChanges(changes: SimpleChanges) {}
  openFormUploadFile()
  {
    this.attachment.uploadFile();
  }
  onSave()
  {
    // this.submitted = true;
    // if(this.exportAddForm.invalid) return;
    // if(this.fileCount>0)
    // {
    //   this.api
    //   .execActionData<any>(
    //     'AD_ExcelTemplates',
    //     [this.exportAddForm.value],
    //     'SaveAsync'
    //   ).subscribe(item=>{
    //     if(item[0] == true)
    //     {
    //       this.notifySvr.notifyCode("RS002");
    //       this.attachment.objectId = item[1][0].recID;
    //       this.attachment.saveFiles();
    //       this.dialog.close(item[0]);
    //     }
    //     else this.notifySvr.notify("Thêm không thành công");
    //   })
    // }
    // else this.notifySvr.notifyCode("DM001");
    
  }
  getfileCount(e:any)
  {
    this.fileCount = e;
  }
}
