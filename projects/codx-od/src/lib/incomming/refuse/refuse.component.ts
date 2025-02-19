import { Component, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DialogData, DialogRef, NotificationsService } from 'codx-core';
import { DispatchService } from '../../services/dispatch.service';

@Component({
  selector: 'lib-refuse',
  templateUrl: './refuse.component.html',
  styleUrls: ['./refuse.component.css']
})
export class RefuseComponent implements OnInit {
  dialog:any;
  data:any;
  status: any;
  headerText:any;
  funcID:any;
  constructor(
    private notifySvr : NotificationsService,
    private odService: DispatchService,
    private formBuilder: FormBuilder,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) { 
    if(dt?.data?.data) this.data = dt?.data?.data
    if(dt?.data?.headerText) this.headerText = dt?.data?.headerText
    if(dt?.data?.status) this.status = dt?.data?.status
    if(dt?.data?.funcID) this.funcID = dt?.data?.funcID
    this.dialog = dialog;
  }
  updateForm :FormGroup;
  ngOnInit(): void {
    this.updateForm = this.formBuilder.group(
      {
        comment: '',
      }
    )
  }
  onSave()
  {
    this.odService.complete(this.data.recID,this.updateForm.value.comment,this.status,this.funcID).subscribe((item)=>{
      if(item.status == 0) this.dialog.close(item.data);
      this.notifySvr.notify(item.message);
    }) 
  }
}
