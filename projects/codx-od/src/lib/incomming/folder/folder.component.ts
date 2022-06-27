import { Component, OnInit, ViewChild, ChangeDetectorRef, Input, Output, EventEmitter, Optional } from '@angular/core';
import { inforSentEMail, assignTask } from '../../models/dispatch.model';
import { DispatchService } from '../../services/dispatch.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AuthStore, CacheService, DataRequest, DialogData, NotificationsService, ViewsComponent } from 'codx-core';
@Component({
  selector: 'app-od-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.scss']
})
export class FolderComponent implements OnInit {  
  @Input() dialog : any
  @Input() data : any
  personalFolder: any;
  recID             : any
  deadlineForm = new FormGroup({
    extendOn: new FormControl(),
    reason : new FormControl()
  });
  constructor(
    private odService: DispatchService , 
    private notifySvr: NotificationsService,
  ) 
  { 
  }
  ngOnInit(): void {
    //debugger;
    //console.log(this.data);
    this.recID = this.data.recID;
  }

  saveFolder()
  {
    //console.log(this.personalFolder);   
    this.odService.addToFolder(this.recID, this.personalFolder).subscribe(item => {      
      this.notifySvr.notify(item.message);      
      this.dialog.close();  
    });    
  }

  changeValue(event: any) {    
    this.personalFolder = event?.data[0];
    //console.log(event);
    //this.disEdit.agencyName = this.dispatch.AgencyName = event.data
  }

  addFile() {
    // this.attachment.openPopup();  
  }

  getJSONString(data) {
    return JSON.stringify(data);
  }

  close() {
   // this.viewbase.currentView.closeSidebarRight();
  }

}
