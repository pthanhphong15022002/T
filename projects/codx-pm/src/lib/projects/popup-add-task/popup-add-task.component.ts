import { AfterViewInit, ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewEncapsulation } from "@angular/core";
import { NotificationsService, AuthService, CacheService, AuthStore, DialogData, DialogRef, DialogModel, CallFuncService } from "codx-core";
import { CodxCommonService } from "projects/codx-common/src/lib/codx-common.service";
import { CodxShareService } from "projects/codx-share/src/public-api";
import { L10n,setCulture } from '@syncfusion/ej2-base';
import { PopupSelectUserComponent } from "../popup-select-user/popup-select-user.component";
@Component({
  selector: 'popup-add-task',
  templateUrl: './popup-add-task.component.html',
  styleUrls: ['./popup-add-task.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PopupAddTaskComponent implements OnInit, AfterViewInit{

  formModel:any;
  title:string='Thêm mới công việc';
  dialog:any;
  data:any;
  funcID:string;
  projectData:any;
  projectMemberType:any;
  fields: any ={ text: 'objectName', value: 'objectID' }
  listRoles:any=[];
  constructor(
    injector: Injector,
    private notificationsService: NotificationsService,
    private codxShareService: CodxShareService,
    private codxCommonService: CodxCommonService,
    private authService: AuthService,
    private cacheService: CacheService,
    private changeDetectorRef: ChangeDetectorRef,
    private authStore: AuthStore,
    protected callfc: CallFuncService,

    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    this.dialog = dialogRef;
    this.formModel = this.dialog?.formModel;
    this.funcID = this.formModel?.funcID;
    this.data = dialogData.data[0];
    if(dialogData.data[2]){
      this.projectData = dialogData.data[2];
      if(this.projectData.settings){
        let memberType = this.projectData.settings.find((x:any)=> x.fieldName=="MemberType");
        if(memberType){
          this.projectMemberType = memberType.fieldValue;
        }
      }
    }
    this.cacheService.valueList('PM013').subscribe((res:any)=>{
      if(res && res.datas){
        this.listRoles = res.datas
      }
    })
  }
  ngOnInit(): void {
    L10n.load({
      'vi-VN': {
      'multi-select': {
              'noRecordsTemplate': "Không có dữ liệu",
              'actionFailureTemplate': "Thất bại",
              'overflowCountTemplate': "+${count} ..",
              'totalCountTemplate': "${count} được chọn"
          }
      }
  });
  }
  ngAfterViewInit(): void {

  }

  valueChange(e:any){

  }
  valueDateChange(e:any){

  }

  selectUser(){
    let option = new DialogModel;
    option.zIndex=9999;
    let dialog = this.callfc.openForm(PopupSelectUserComponent,'',500,600,'',{projectData:this.projectData,projectMemberType:this.projectMemberType},'',option);
    dialog.closed.subscribe((res:any)=>{
      if(res.event){
        debugger
      }
    })
  }
}
