import {
  CacheService,
  DialogData,
  DialogRef,
  ApiHttpService,
  NotificationsService,
  AuthStore,
} from 'codx-core';
import {
  Component,
  OnInit,
  Optional,
  ViewChild,
  TemplateRef,
  ChangeDetectorRef,
} from '@angular/core';

@Component({
  selector: 'codx-add-approvers',
  templateUrl: './codx-add-approvers.component.html',
  styleUrls: ['./codx-add-approvers.component.css'],
})
export class CoDxAddApproversComponent implements OnInit {

  dialogRef: any;
  approvers:any;
  mode = '1';//1:Chọn người Ủy quyền ký duyệt,2:Chọn người chỉ định duyệt
  constructor(
    private detectorRef: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    // private cache: CacheService,
    // private apiHttpService: ApiHttpService,
    // private authStore: AuthStore,
    @Optional() dialogData?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialogRef=dialog;
    this.mode=dialogData?.data?.mode;
  }

  ngOnInit(): void {
    
  }

  onSaveForm() {
    if(this.approvers==null || this.approvers=='')
    {
      this.notificationsService.notify("Người duyệt ko đc bỏ trống!",'2',null);
      return;
    }
    this.dialogRef && this.dialogRef.close([this.approvers]);
  }

  
  valueChange(evt:any) {
    if (evt && evt?.field) {
      this.approvers = evt?.data;
    }
    this.detectorRef.detectChanges();
  }

  
}
