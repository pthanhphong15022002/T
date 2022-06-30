import { Component, OnInit, TemplateRef, ViewChild, AfterViewInit, ChangeDetectorRef, Optional } from '@angular/core';
import { agency } from '../../models/agency.model';
import { permissionDis, updateDis , dispatch, inforSentEMail, extendDeadline } from '../../models/dispatch.model';
import { AgencyService } from '../../services/agency.service';
import { DispatchService } from '../../services/dispatch.service';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { CodxService, DialogData, NotificationsService } from 'codx-core';
import { Dialog } from '@syncfusion/ej2-angular-popups';
@Component({
  selector: 'app-od-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.scss']
})
export class DepartmentComponent implements OnInit {
  playerName: string;
  formGroup;
  agencyID;
  service;
  dtAgency = new agency();
  dialog: Dialog;
  constructor(
    private agService: AgencyService , 
    private codxService: CodxService,
    private notifySvr: NotificationsService,
    @Optional() data?: DialogData,
    @Optional() dialog?: Dialog
    ) { 
      this.agencyID = data?.data;
      this.dialog = dialog;
    }
  ngOnInit(): void {
    //this.formdata = new FormGroup({});
  }
  changeValueNote(event:any)
  {
    this.dtAgency.Note = event
  }
  saveAgency()
  {
   
    this.codxService.getAutoNumber("ODT1","OD_Agencies","AgencyID").subscribe((dt:any)=>{
        this.dtAgency.Status = "1";
        this.dtAgency.AgencyID = dt;
        this.dtAgency.ParentID = this.agencyID;
        this.dtAgency.Category = "9";
        this.agService.SaveAgency(this.dtAgency).subscribe((item)=>{
          if(item.status == 0) this.dialog.hide(item);
          this.notifySvr.notify(item.message);
        })
    });
  }
}
