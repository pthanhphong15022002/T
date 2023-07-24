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
  selector: 'codx-add-esignfile',
  templateUrl: './codx-add-esignfile.component.html',
  styleUrls: ['./codx-add-esignfile.component.css'],
})
export class CodxAddESignFileComponent implements OnInit {

  dialogRef: any;
  headerText='Thêm người duyệt';
  approvers:any;
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
