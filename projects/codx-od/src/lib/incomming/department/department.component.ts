import { Component, OnInit, TemplateRef, ViewChild, AfterViewInit, ChangeDetectorRef, Optional, Input } from '@angular/core';
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
  service;
  dtAgency = new agency();
  @Input() agencyID;
  @Input() dialog;
  constructor(
    private agService: AgencyService , 
    private codxService: CodxService,
    private notifySvr: NotificationsService,
    ) { 
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
    if(!this.checkRequired()) return
    this.codxService.getAutoNumber("ODT1","OD_Agencies","AgencyID").subscribe((dt:any)=>{
        this.dtAgency.Status = "1";
        this.dtAgency.AgencyID = dt;
        this.dtAgency.ParentID = this.agencyID;
        this.dtAgency.Category = "9";
        this.agService.SaveAgency(this.dtAgency).subscribe((item)=>{
          if(item.status == 0) this.dialog.close(item);
          this.notifySvr.notify(item.message);
        })
    });
  }

  //Kiểm tra field required
  checkRequired()
  {
    if(!this.dtAgency.AgencyName) {
      this.notifySvr.notifyCode('SYS009', 0, "Tên phòng ban");
      return false;
    }
    return true;
  }
}
