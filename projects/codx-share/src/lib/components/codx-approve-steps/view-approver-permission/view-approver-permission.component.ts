import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Optional,
} from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  DialogData,
  DialogRef,
  NotificationsService,
} from 'codx-core';
// import { Approvers } from 'projects/codx-es/src/lib/codx-es.model';
// import { CodxEsService } from 'projects/codx-es/src/public-api';
import { CodxShareService } from '../../../codx-share.service';

@Component({
  selector: 'view-approver-permission',
  templateUrl: './view-approver-permission.component.html',
  styleUrls: ['./view-approver-permission.component.scss'],
})
export class ViewApproverPermissionComponent implements OnInit, AfterViewInit {
 
  @Input() hideTabQuery = true;
  @Input() isSettingMode = true;  
  user: import("codx-core").UserModel | null;
  dialog: DialogRef;


  constructor(
    // private esService: CodxEsService,
    private auth: AuthStore,
    private codxService: CodxShareService,
    private cr: ChangeDetectorRef,
    private notifySvr: NotificationsService,
    private cache: CacheService,
    private callfc: CallFuncService,
    private api: ApiHttpService,
  ) {
    this.user = this.auth.get();    
  }

  ngAfterViewInit(): void {
    
  }

  ngOnInit(): void {
    
  }


  
}
