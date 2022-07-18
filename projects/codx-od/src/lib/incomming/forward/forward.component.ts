import { Component, OnInit, Input, Output, EventEmitter, Optional } from '@angular/core';
import { DispatchService } from '../../services/dispatch.service';
import { FormGroup, FormControl } from '@angular/forms';
import { ApiHttpService, AuthStore, DialogData, DialogRef, NotificationsService, ViewsComponent } from 'codx-core';
import { formatBytes, getJSONString } from '../../function/default.function';
import { forwarDis } from '../../models/dispatch.model';
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
  gridViewSetup     : any;
  formatBytes = formatBytes;
  getJSONString = getJSONString;
  data : any;
  @Input() viewbase: ViewsComponent;
 
  @Output() save : EventEmitter<any> = new EventEmitter();
  forwardForm = new FormGroup({
    userID: new FormControl(),
    comment : new FormControl()
  });
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
  changeValueUserID(event: any)
  {
    this.forwardForm.controls['userID'].setValue(event.data.value);
  }
  onSave()
  {
    this.forwardForm.value.userID = this.forwardForm.value.userID.join(";");
    this.odService.forwardDispatch(this.dialog.dataService.dataSelected.recID , this.forwardForm.value).subscribe((item)=>{
      if(item.status==0) this.dialog.close(item.data);
      this.notifySvr.notify(item.message);
    })
  }
}
