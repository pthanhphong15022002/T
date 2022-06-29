import { Component, OnInit, TemplateRef, ViewChild, AfterViewInit, ChangeDetectorRef, Optional, Input } from '@angular/core';
import { permissionDis, updateDis , dispatch, inforSentEMail, extendDeadline } from '../../models/dispatch.model';
import { AgencyService } from '../../services/agency.service';
import { DispatchService } from '../../services/dispatch.service';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { DataRequest, DialogData, NotificationsService } from 'codx-core';
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
  @ViewChild('attachment') attachment: AttachmentComponent
  data : any;
  @Input() dialog      : any
  @Input() view : any
  dtDisUpdate = new updateDis();
  currentDate = new Date();
  updateForm = new FormGroup({
    updateOn: new FormControl(),
    percentage : new FormControl(),
    percentage100 : new FormControl(),
    comment : new FormControl(),
    reporting: new FormControl(),
  });
  constructor(
    private odService: DispatchService , 
    private notifySvr: NotificationsService
  ) 
  { 
  }
  ngOnInit(): void {
    this.data = this.view.dataService.dataSelected;
    this.dtDisUpdate.recID = this.data.recID;
    this.dtDisUpdate.percentage = this.data.percentage;
    this.dtDisUpdate.updatedOn = this.data.updatedOn;
  }
  changeValue100Percentage(val:any)
  {
    debugger;
  }
  onSaveUpdate()
  {
    this.dtDisUpdate.updatedOn = this.updateForm.get('updateOn').value;
    this.dtDisUpdate.percentage = this.updateForm.get('percentage').value;
    this.dtDisUpdate.comment =  this.updateForm.get('comment').value
    this.dtDisUpdate.reporting = this.updateForm.get('reporting').value == null ? false : this.updateForm.get('reporting').value == null;
    if(this.updateForm.get('percentage100').value) this.dtDisUpdate.percentage = 100;
    //Bùa khúc này
    this.dtDisUpdate.updatedOn = new Date();
    this.odService.updateResultDispatch(this.dtDisUpdate).subscribe((item)=>{
      if(item.status == 0) 
      {
        this.close();
        this.view.dataService.setDataSelected(item.data);
      }
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
