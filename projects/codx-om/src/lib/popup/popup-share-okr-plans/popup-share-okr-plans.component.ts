import {
  AfterViewInit,
  Component,
  Injector,
  OnInit,
  Optional,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import {
  AuthStore,
  DialogData,
  DialogRef,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { CodxOmService } from '../../codx-om.service';
import { Shares } from '../../model/okr.model';

@Component({
  selector: 'popup-share-okr-plans',
  templateUrl: './popup-share-okr-plans.component.html',
  styleUrls: ['./popup-share-okr-plans.component.scss'],
})
export class PopupShareOkrPlanComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  dialogRef: any;
  type: any = 'add';
  gridView: any;
  formModel: any;
  okrPlans: any;
  userID: any;
  objRequied = [];
  shareGroup: FormGroup;
  data = {
    from: [],
    to: [],
  };
  //Chờ c thương thiết lập vll
  //Giả lập vll
  //OM003
  vll = {
    datas: [
      {
        value: '9',
        text: 'Tất cả',
        icon: 'All.svg',
      },
      {
        value: '4;P',
        text: 'Phòng & Quản lý của tôi',
        icon: 'MyDeptManagement.svg',
      },
      {
        value: '4',
        text: 'Phòng của tôi',
        icon: 'MyDept.svg',
      },
      {
        value: 'P',
        text: 'Quản lý của tôi',
        icon: 'MyManagement.svg',
      },
    ],
  };
  headerText: any;
  sharesData: any;
  planRecID: any;
  fgShares: any;
  isAfterRender=false;
  userData=[];
  listShareTo=[];
  listCCTo=[];
  shareObj: {
    objectType: any; objectID: any; permission: string; //readonly
    read: number; write: number; share: number; startedOn: any; expiredOn: any; note: any;
  };
  listUser=[];
  okrsShares: any[];
  constructor(
    inject: Injector,
    private codxOmService: CodxOmService,
    private formBuilder: FormBuilder,
    private notifySvr: NotificationsService,
    private auth: AuthStore,
    @Optional() dialogData?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialogRef = dialog;
    this.headerText = dialogData?.data[0];
    this.gridView = dialogData?.data[1];
    this.formModel = dialogData?.data[2];
    this.planRecID = dialogData?.data[3];
    this.sharesData = dialogData?.data[4];
  }

  
  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  ngAfterViewInit(): void {}

  onInit(): void {
    this.getCacheData();
    this.userID = this.auth.get().userID;
    //this.getKeyRequied();
    this.shareGroup = this.formBuilder.group({
      note: '',
      write: false,
      share: false,
      startedOn: null,
      expiredOn: null,
    });
    this.getData();
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Cache Data--------------------------------//
  //---------------------------------------------------------------------------------//
   getCacheData(){
    //this.fgShares=this.codxService.buildFormGroup(this.formModel?.formName,this.formModel?.gridViewName,this.formModel?.entityName,this.sharesData);
    this.fgShares=this.codxOmService.getFormGroup(this.formModel?.formName,this.formModel?.gridViewName).then(res=>{
      if(res){
        this.fgShares=res;
        this.fgShares.patchValue(this.sharesData);
        this.isAfterRender=true;
      }
    })
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Data Func---------------------------------//
  //---------------------------------------------------------------------------------//
    getData(){
      this.codxOmService.getOKRPlansByID(this.planRecID).subscribe(res=>{
        if(res){
          this.okrPlans=res;
        }
      })
    }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Event------------------------------------//
  //---------------------------------------------------------------------------------//
  changeInput(value: any, type: any) {
    if (!value?.data) return;
    if (type == 'from'){
      this.listShareTo.push(value?.data);
      this.listShareTo=this.filterArray(this.listShareTo);
    }else {
      this.listCCTo.push(value?.data);
      this.listCCTo=this.filterArray(this.listCCTo);
    } 
  }

  valueChange(evt: any) {
    if (evt?.field && evt?.data!=null) {
      this.sharesData[evt?.field]=evt?.data;
      this.detectorRef.detectChanges();
    }
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Event----------------------------------//
  //---------------------------------------------------------------------------------//

  //---------------------------------------------------------------------------------//
  //-----------------------------------Validate Func---------------------------------//
  //---------------------------------------------------------------------------------//

  
  filterArray(arr) {
    return [...new Map(arr.map((item) => [item['id'], item])).values()];
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Logic Func-------------------------------------//
  //---------------------------------------------------------------------------------//


  onSaveForm() {
    if(this.sharesData?.expiredOn<this.sharesData?.startedOn){
      this.notifySvr.notify('Ngày hiệu lực không được lớn hơn ngày hết hạn','2',null);
    }
    //if (this.checkRequied()) return;
    this.listUser=[];
    for(let obj of this.listShareTo){
      this.listUser.push(obj[0]);
    }    
    if(this.listUser.length>0){
      this.okrsShares = [];
      for (var item of this.listUser) {
        let tmpShare = new Shares()
        tmpShare.objectType = item[0]?.objectType,
        tmpShare.objectID = item[0]?.id,
        tmpShare.permission= "2", //readonly
        tmpShare.read= 1,
        tmpShare.write= this.sharesData.write ? 1 : 0,
        tmpShare.share= this.sharesData.share ? 1 : 0,
        tmpShare.startedOn= this.sharesData.startedOn,
        tmpShare.expiredOn= this.sharesData.expiredOn,
        tmpShare.note= this.sharesData.note

        this.okrsShares.push(tmpShare);
      }
      this.codxOmService
        .shareOKRPlans(this.okrPlans.recID, this.okrsShares)
        .subscribe((item) => {
          if(item){
            this.notifySvr.notifyCode('SYS034'); 
            this.dialogRef && this.dialogRef.close(true);
          }
          else return;
        });
    }
    else{
      
      this.notifySvr.notify('Đối tượng chia sẻ không được bỏ trống','2',null);
    }
    
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Func-----------------------------------//
  //---------------------------------------------------------------------------------//


  //---------------------------------------------------------------------------------//
  //-----------------------------------Popup-----------------------------------------//
  //---------------------------------------------------------------------------------//
  

  
  
}
