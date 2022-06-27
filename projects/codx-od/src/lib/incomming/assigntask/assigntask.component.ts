import { Component, OnInit, TemplateRef, ViewChild, AfterViewInit, ChangeDetectorRef, Optional, Input, Output, EventEmitter } from '@angular/core';
import { agency } from '../../models/agency.model';
import { permissionDis, updateDis , dispatch, inforSentEMail, extendDeadline, assignTask } from '../../models/dispatch.model';
import { AgencyService } from '../../services/agency.service';
import { DispatchService } from '../../services/dispatch.service';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { AuthStore, CacheService, DataRequest, DialogData, NotificationsService, ViewsComponent } from 'codx-core';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { extractContent, formatBytes } from '../../function/default.function';
import { DateTime } from '@syncfusion/ej2-angular-charts';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
@Component({
  selector: 'app-od-assigntask',
  templateUrl: './assigntask.component.html',
  styleUrls: ['./assigntask.component.scss']
})
export class AssignTaskComponent implements OnInit {
  @Input() viewbase: ViewsComponent;
  @Input() data : any;
  @Input() gridViewSetup     : any;
  @Output() save : EventEmitter<any> = new EventEmitter();
  options: DataRequest = new DataRequest();
  dataAssign = new assignTask();
  inforEmail = new inforSentEMail();
  userFrom           : any;
  userTo           : any; 
  description: any;
  formDate: DateTime;
  report: any;
  email: any;
  user: any;
  saveTemplate: any;
  roles: any;
  lstUser : object[] | any = [];
  @ViewChild('attachment') attachment: AttachmentComponent;  
  formatBytes = formatBytes;
  constructor(  
    private odService: DispatchService , 
    private cr: ChangeDetectorRef , 
    private formBuilder: FormBuilder,
    private cache: CacheService,
    private authStore: AuthStore,
    private notifySvr: NotificationsService,
  ) 
  { 
    this.options.pageLoading = false;
    this.options.pageSize = 1;
    this.options.funcID = "";
    this.options.srtDirections = ""
  }
  ngOnInit(): void {
    this.user = this.authStore.get();
    this.cache.valueList("TM001").subscribe((item) => {
      //console.log(1);
      if (item) {
        this.roles = item.datas;
        this.odService.Roles.next(this.getJSONString(this.roles));
        this.cr.detectChanges();
      }
    })
  }

  addFile() {
    this.attachment.openPopup();  
  }

  changeValueReport(event) {
    this.dataAssign.isReport = event?.data.checked
  }

  fileAdded(event) { 
    console.log(event);
  }
  
  changeValueSaveTemplate(event) {
    this.inforEmail.saveTemplate = event?.data.checked
  }

  changeValueEmail(event) {
    this.email = event?.data
  }

  changeValueDescription(val: any)
  {
    this.inforEmail.content = extractContent(val?.data.value);
  }

  changeValueChangeTo(val:any)
  {
    this.inforEmail.to = val;
  }
  
  changeValueFormDate(val:any)
  {
    this.dataAssign.date = val?.data
  }

  changeValueChangeFrom(val:any)
  {
    this.inforEmail.from = val;
  }
  changeValueSubject(val:any)
  {
    this.inforEmail.subject = val?.data;
  }
  getJSONString(data) {
    return JSON.stringify(data);    
  }
  changeValueOwner(e:any)
  {
    this.lstUser = e;
  }
  close()
  {
    //this.viewbase.currentView.closeSidebarRight();
  }
  saveAssignTask()
  {
    this.dataAssign.recID = this.data.recID;
    this.inforEmail.from = this.user?.userID;
    this.dataAssign.inforSentEmail = this.inforEmail;
    if(this.inforEmail.to.length>0) this.inforEmail.to = this.inforEmail.to.toString().replace(",",";");
    this.odService.assignTask (this.dataAssign).subscribe((item)=>
    {
      if (item.status == 0) {
        this.close();
        this.save.emit(item);
      }
      this.notifySvr.notify(item.message);
    })
  }
}
