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
  @ViewChild('attachment') attachment: AttachmentComponent
  @Input() view : any
  @Output() save = new EventEmitter<any>();
  dtDisUpdate = new updateDis();
  currentDate = new Date();
  updateForm :FormGroup;
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
  }
  ngOnInit(): void {
    this.updateForm = this.formBuilder.group(
      {
        updateOn: [new Date() , Validators.required],
        percentage: [this.data?.percentage  , Validators.required],
        percentage100 : false,
        comment: '',
        reporting: false
      }
    )
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
  get f(): { [key: string]: AbstractControl } {
    return this.updateForm.controls;
  }
  onSaveUpdate()
  {
    
    this.submitted = true;
    if(this.updateForm.invalid) return;
    if(this.updateForm.get('percentage100').value) this.updateForm.value.percentage = 100;
    delete this.updateForm.value.percentage100;
    this.updateForm.value.recID = this.data.recID;
    this.odService.updateResultDispatch(this.updateForm.value).subscribe((item)=>{
      if(item.status == 0) this.dialog.close(item.data);
      this.notifySvr.notify(item.message);
    }) 
  }
  fileAdded(event) { 
    console.log(event);
  }
  addFile() {
    this.attachment.openPopup();  
  }
  close()
  {
    this.dialog.close();
  }
  onFormSubmit(): void {
    console.log('Name:' + this.updateForm.get('updateOn').value);
  }
}
