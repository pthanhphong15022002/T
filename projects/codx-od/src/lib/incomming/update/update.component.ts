import { Component, OnInit, TemplateRef, ViewChild, AfterViewInit, ChangeDetectorRef, Optional, Input, EventEmitter, Output } from '@angular/core';
import { permissionDis, updateDis , dispatch, inforSentEMail, extendDeadline } from '../../models/dispatch.model';
import { AgencyService } from '../../services/agency.service';
import { DispatchService } from '../../services/dispatch.service';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { DataRequest, DialogData, DialogRef, NotificationsService } from 'codx-core';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { extractContent } from '../../function/default.function';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
@Component({
  selector: 'app-od-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss']
})
export class UpdateExtendComponent implements OnInit {
  submitted = false
  dialog      : any
  data : any
  formModel: any ;
  preValue: any;
  @ViewChild('attachment') attachment: AttachmentComponent
  @Input() view : any
  @Output() save = new EventEmitter<any>();
  dtDisUpdate = new updateDis();
  currentDate = new Date();
  updateForm :FormGroup;
  fileCount: 0 
  percentage100 = false;
  constructor(
    private odService: DispatchService,
    private notifySvr : NotificationsService,
    private formBuilder: FormBuilder,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  { 
    this.data = dt.data['data'];
    this.dialog = dialog;
    this.formModel = dialog?.formModel
  }
  ngOnInit(): void {
    this.updateForm = this.formBuilder.group(
      {
        updateOn: [this.currentDate , Validators.required],
        percentage: [this.data?.percentage  , Validators.min(1)],
        comment: '',
        reporting: false
      }
    )
    if(this.data?.percentage == 100) this.percentage100 = true;
    this.onChanges();
    /* updateOn: new FormControl(),
    percentage : new FormControl(),
    percentage100 : new FormControl(),
    comment : new FormControl(),
    reporting: new FormControl(), */
    /* this.updateForm.get("updateOn").setValue(new Date());
    this.updateForm.get("reporting").setValue(false);
    this.updateForm.get("percentage").setValue(this.data?.percentage);
    if(this.data?.percentage == 100) this.updateForm.get("percentage100").setValue(true); */
  }
  onChanges(): void {
    this.updateForm.get('percentage').valueChanges.subscribe(val => {
      if(val == 100) return;
      this.preValue = val;
    });
  }
  valueChangeDate(event:any)
  {
    this.updateForm.controls[event?.field].setValue(event?.data.fromDate);
  }
  valueChangePercentage100(e:any)
  {
    if(e?.data)
      this.updateForm.controls['percentage'].setValue(100);
    else this.updateForm.controls['percentage'].setValue(this.preValue);
    /* if()
    this.updateForm.value.percentage */
  }
  get f(): { [key: string]: AbstractControl } {
    return this.updateForm.controls;
  }
  onSave()
  {
    this.submitted = true;
    if(this.updateForm.invalid) return;
    this.updateForm.value.recID = this.data.recID;
    this.odService.updateResultDispatch(this.updateForm.value).subscribe((item)=>{
      if(item.status == 0) this.dialog.close(item.data);
      this.notifySvr.notify(item.message);
    }) 
  }
  fileAdded(event) { 
    console.log(event);
  }
  getfileCount(e:any)
  {
    this.fileCount = e.data.length;
  }
  openFormUploadFile()
  {
    this.attachment.uploadFile();
  }
}
