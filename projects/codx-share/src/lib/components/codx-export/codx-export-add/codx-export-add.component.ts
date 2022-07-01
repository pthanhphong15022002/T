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
import { ApiHttpService, DataRequest, DialogData, DialogRef, NotificationsService } from 'codx-core';
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
  @Input() openMore: boolean = false;
  dialog: any;
  lblExtend: string = '';
  headerText: any;
  exportAddForm : FormGroup;
  submitted = false;
  @Output() setDefaultValue = new EventEmitter();
  constructor(
    private formBuilder: FormBuilder,
    private api: ApiHttpService,
    private notifySvr: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  {
    this.dialog = dialog;
    this.data = dt.data;
  }
  ngOnInit(): void {
    this.headerText = this.data?.headerText;
    this.exportAddForm = this.formBuilder.group(
      {
        templateName: ['' , Validators.required],
        description: ['' , Validators.required],
        pWControl: "",
        pWDefault: "",
        isDefault: false,
        covertPDF: false,
        sheetIndex: 0,
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
    this.submitted = true;
    if(this.exportAddForm.invalid) return;
    this.api
        .execAction<any>(
          'AD_ExcelTemplates',
          [this.exportAddForm.value],
          'SaveAsync'
        ).subscribe(item=>{
          if(item)
          {
            this.notifySvr.notifyCode("RS002");
            this.dialog.close(item);
          }
        })
  }
}
