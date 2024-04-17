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
import { Approver } from '../../../models/ApproveProcess.model';

@Component({
  selector: 'codx-approve-comment',
  templateUrl: './codx-approve-comment.component.html',
  styleUrls: ['./codx-approve-comment.component.css'],
})
export class CoDxApproveCommentComponent implements OnInit {

  dialogRef: any;
  comment:any='';
  lstApprovers:any;
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
    this.mode=dialogData?.data?.mode ?? this.mode;
  }

  ngOnInit(): void {
    
  }

  onSaveForm() {
    if(this.comment== null || this.comment?.length==0)
    {
      this.notificationsService.notify("Bình luận không được bỏ trống",'2',null);
      return;
    }
    this.dialogRef && this.dialogRef.close(this.comment);
  }

  
  valueChange(evt:any) {
    if (evt && evt?.field) {
      this.comment = evt?.data;
    }
    this.detectorRef.detectChanges();
  }

  
}
