import { ChangeDetectorRef, Component, Input, OnInit, Optional, ViewChild } from '@angular/core';
import { extendDeadline } from '../../models/dispatch.model';
import { DispatchService } from '../../services/dispatch.service';
import { CodxFormComponent, DataRequest, DialogData, NotificationsService } from 'codx-core';
import { FormControl, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-od-deadline',
  templateUrl: './deadline.component.html',
  styleUrls: ['./deadline.component.scss']
})
export class ExtendDeadlineComponent implements OnInit {
  recID             : any
  @Input() dialog : any
  @Input() data : any
  @Input() formModel : any;
  @ViewChild("form") form : CodxFormComponent;
  dtExtendDeadline  = new extendDeadline();
  deadlineForm = new FormGroup({
    extendOn: new FormControl(''),
    reason : new FormControl()
  });
  constructor(
    private odService: DispatchService , 
    private notifySvr: NotificationsService,
  ) 
  { 
  }
  ngOnInit(): void {
    this.deadlineForm.get("extendOn").setValue(this.data?.deadline);
  }
  onSave()
  {
    this.deadlineForm.value.recID = this.data.recID;
    if(this.deadlineForm.value.extendOn == null)this.deadlineForm.value.extendOn = new Date();
    this.odService.extendDeadLinee(this.deadlineForm.value).subscribe((item)=>{
      if(item.status == 0)
        this.dialog.close(item?.data);
        
      this.notifySvr.notify(item.message);
    })
  }
}
