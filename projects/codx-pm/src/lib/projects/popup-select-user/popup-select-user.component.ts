import { Component, ViewEncapsulation, OnInit, AfterViewInit, Injector, ChangeDetectorRef, Optional } from "@angular/core";
import { NotificationsService, AuthService, CacheService, AuthStore, DialogData, DialogRef } from "codx-core";
import { CodxCommonService } from "projects/codx-common/src/lib/codx-common.service";
import { CodxShareService } from "projects/codx-share/src/public-api";

@Component({
  selector: 'popup-select-user',
  templateUrl: './popup-select-user.component.html',
  styleUrls: ['./popup-select-user.component.scss'],
})
export class PopupSelectUserComponent implements OnInit, AfterViewInit{

  formModel:any;
  dialog:any;
  data:any;
  funcID:string;
  projectMemberType:any;
  projectData:any;
  title:string='';
  fields: any ={ text: 'objectName', value: 'objectID' }
  selectedUser:any=[];
  constructor(
    injector: Injector,
    private notificationsService: NotificationsService,
    private codxShareService: CodxShareService,
    private codxCommonService: CodxCommonService,
    private authService: AuthService,
    private cacheService: CacheService,
    private changeDetectorRef: ChangeDetectorRef,
    private authStore: AuthStore,

    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    this.dialog = dialogRef;
    this.formModel = this.dialog?.formModel;
    this.funcID = this.formModel?.funcID;
    this.projectData = dialogData.data.projectData;
    this.projectMemberType = dialogData.data.projectMemberType;

  }
  ngOnInit(): void {

  }
  ngAfterViewInit(): void {

  }
  valueChange(e:any){
    this.selectedUser = e;
  }

  apply(){
    if(this.selectedUser.length)
      this.dialog.close(this.selectedUser);
  }
}
