import { Component, OnInit, TemplateRef, ViewChild, AfterViewInit, ChangeDetectorRef, Input, Optional } from '@angular/core';

import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { CodxService, DialogData, NotificationsService } from 'codx-core';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { AgencyService } from '../../services/agency.service';
import { agency } from '../../models/agency.model';
@Component({
  selector: 'app-od-agency',
  templateUrl: './agency.component.html',
  styleUrls: ['./agency.component.scss']
})
export class AgencyComponent implements OnInit {
  @Input() dialog;
  @Input() data;
  agencyForm = new FormGroup({
    agencyName: new FormControl(),
    category: new FormControl(),
    address: new FormControl(),
    contactName: new FormControl(),
    jobTitle: new FormControl(),
    phone: new FormControl(),
    email: new FormControl(),
  });
  public dtAgency = new agency();
  constructor(
    private agService: AgencyService , 
    private codxService: CodxService,
    private notifySvr: NotificationsService,
    ) {
     }
  ngOnInit(): void {
    //this.formdata = new FormGroup({});
  }
  changeValueCategory(event:any)
  {
    this.dtAgency.Category = event
  }
  onSave()
  {
    debugger;
    this.codxService.getAutoNumber("ODT3","OD_Agencies","AgencyID").subscribe((dt:any)=>{
        this.agencyForm.value.agencyID = dt;
        this.agService.SaveAgency(this.agencyForm.value).subscribe(item=>{
          if(item.status == 0) this.dialog.close();
          this.notifySvr.notify(item.message);
        })
    });
   
  }
}
