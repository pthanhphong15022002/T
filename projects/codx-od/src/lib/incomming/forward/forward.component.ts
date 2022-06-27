import { Component, OnInit, TemplateRef, ViewChild, AfterViewInit, ChangeDetectorRef, Input, Output, EventEmitter, Optional } from '@angular/core';
import { agency } from '../../models/agency.model';
import { permissionDis, updateDis , dispatch, inforSentEMail, extendDeadline, forwarDis } from '../../models/dispatch.model';
import { AgencyService } from '../../services/agency.service';
import { DispatchService } from '../../services/dispatch.service';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { ApiHttpService, AuthStore, CacheService, DialogData, DialogRef, NotificationsService, ViewsComponent } from 'codx-core';
import { IncommingComponent } from '../incomming.component';
import { extractContent, formatBytes, getJSONString } from '../../function/default.function';
@Component({
  selector: 'app-od-forward',
  templateUrl: './forward.component.html',
  styleUrls: ['./forward.component.scss']
})
export class ForwardComponent implements OnInit {
  files: any;
  title: any = "Chuyển tiếp";
  user: any;
  forward = new forwarDis();
  dialog: any;
  formatBytes = formatBytes;
  getJSONString = getJSONString;
  data : any;
  @Input() viewbase: ViewsComponent;
  @Input() gridViewSetup     : any;
  @Output() save : EventEmitter<any> = new EventEmitter();
  constructor(
    private api: ApiHttpService,
    private odService: DispatchService,
    private notifySvr: NotificationsService,
    private authStore: AuthStore,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data;
    this.dialog = dialog;
  }
    
  ngOnInit(): void {
    //this.formdata = new FormGroup({});
    this.user = this.authStore.get();
    this.gridViewSetup = this.data["gridViewSetup"];
    this.files = this.data?.files;
  }

  close()
  {
    //this.viewbase.currentView.closeSidebarRight();
  }

  valueChangeTo(val:any)
  {
    if(val?.data != null) this.forward.userID = val?.data.join(";");
  }

  valueChangeComment(val:any)
  {
    this.forward.comment = extractContent(val?.data);
  }

  saveForward()
  {
    this.odService.forwardDispatch(this.dialog.dataService.dataSelected.recID , this.forward).subscribe((item)=>{
      if(item.status==0) this.dialog.close(item.data);
      this.notifySvr.notify(item.message);
    })
  }
}
