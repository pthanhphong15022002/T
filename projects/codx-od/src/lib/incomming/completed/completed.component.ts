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
  selector: 'app-od-completed',
  templateUrl: './completed.component.html',
  styleUrls: ['./completed.component.scss']
})
export class CompletedComponent implements OnInit {
  dialog      : any
  data : any
  formModel: any ;
  complatedForm :FormGroup;
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
    this.complatedForm = this.formBuilder.group(
      {
        comment: [''],
      }
    )
   
  }
  onSave()
  {
    this.odService.complete(this.data?.recID,this.complatedForm.value.comment,"7").subscribe((item)=>{
      if(item.status == 0) this.dialog.close(item.status);
      this.notifySvr.notify(item.message);
    }) 
  }

}
