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
 
  @Input() permissions = [];
  @Input() isSettingMode = false;  
  user: import("codx-core").UserModel | null;
  dialog: DialogRef;
  approvers=[];

  constructor(
    // private esService: CodxEsService,
    private auth: AuthStore,
    private codxShareService: CodxShareService,
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
    // if(this.permissions?.length>0){
    //   this.permissions.forEach(per=>{
    //     if(per?.objectType !=null){
    //       this.approvers.push({
    //         approver:per?.objectID,
    //         roleType:per?.objectType,
    //         refID:per?.recID,
    //       })
    //     }
    //   });
    //   this.codxShareService.getApproverByRole(this.approvers,this.isSettingMode,this.t)
    // }
  }


  
}
