import { Component, OnInit, AfterViewInit, Injector, ChangeDetectorRef, Optional } from "@angular/core";
import { NotificationsService, AuthService, CacheService, AuthStore, DialogData, DialogRef } from "codx-core";
import { CodxCommonService } from "projects/codx-common/src/lib/codx-common.service";
import { CodxShareService } from "projects/codx-share/src/public-api";

@Component({
  selector: 'popup-add-memo',
  templateUrl: './popup-add-memo.component.html',
  styleUrls: ['./popup-add-memo.component.scss'],
})
export class PopupAddMemoComponent implements OnInit, AfterViewInit{

  formModel:any;
  dialog:any;
  data:any;
  funcID:string;
  title:string='';
  fields: any ={ text: 'objectName', value: 'objectID' }
  selectedUser:any=[];
  roleType:any;
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
    this.data = dialogData.data?.data

  }
  ngOnInit(): void {

  }
  ngAfterViewInit(): void {

  }

  valueChange(e:any){
    this.data = e.data;
  }

  apply(){
    this.dialog.close(this.data)
  }
}
