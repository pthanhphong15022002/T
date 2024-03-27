
import { Subject, filter, takeUntil } from 'rxjs';
import {
  ChangeDetectorRef,
  Component,
  Injector,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  AuthService,
  AuthStore,
  CacheService,
  CRUDService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  UIComponent,
  Util,
} from 'codx-core';
import { EPCONST } from 'projects/codx-ep/src/lib/codx-ep.constant';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';
import { CodxShareService } from 'projects/codx-share/src/lib/codx-share.service';
import { CodxBookingService } from 'projects/codx-share/src/lib/components/codx-booking/codx-booking.service';
import { ResponseModel } from 'projects/codx-common/src/lib/models/ApproveProcess.model';
import { BookingItems } from '../../models/bookingItems.model';
const _addMF = EPCONST.MFUNCID.Add;
const _copyMF = EPCONST.MFUNCID.Copy;
const _editMF = EPCONST.MFUNCID.Edit;
const _viewMF = EPCONST.MFUNCID.View;
const _EPParameters = EPCONST.PARAM.EPParameters;
const _EPRoomParameters = EPCONST.PARAM.EPRoomParameters;
const _EPStationeryParameters = EPCONST.PARAM.EPStationeryParameters;

export class Device {
  id;
  text = '';
  isSelected = false;
  icon = '';
  createdBy = null;
  createdOn = null;
}

@Component({
  selector: 'add-receipt-resource',
  templateUrl: './add-receipt-resource.component.html',
  styleUrls: ['./add-receipt-resource.component.scss'],
})
export class AddReceiptResourceComponent extends UIComponent {
  @ViewChild('form') form: any;
  data: any;
  dialogRef: DialogRef;
  formModel: FormModel;
  grView:any;
  tabControl = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'Comment', textDefault: 'Bình luận', isActive: false },
    { name: 'Approve', textDefault: 'Xét duyệt', isActive: false },
  ];
  tabInfo = [
    {
      icon: 'icon-info',
      text: 'Thông tin phiếu',
      name: 'tabGeneralInfo',
    },
    {
      icon: 'icon-layers',
      text: 'Thông tin khác',
      name: 'tabMoreInfo',
    },
  ];
  user: import("codx-core").UserModel;
  funcType: string;
  onSaving: any;
  isEP: any;
  returnData: any;
  approvalRule: string;
  isPopupStationeryCbb: boolean;
  categoryID: string;
  viewOnly=false;
  lstStationery=[];
  listUM: any;
  popupTitle: any;
  
  constructor(
    injector: Injector,
    private notificationsService: NotificationsService,
    private codxBookingService: CodxBookingService,
    private codxShareService: CodxShareService,
    private codxCommonService: CodxCommonService,
    private authService: AuthService,
    private changeDetectorRef: ChangeDetectorRef,
    private authStore: AuthStore,

    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.data = dialogData?.data?.data ;
    this.funcType = dialogData?.data?.funcType ;
    this.popupTitle = dialogData?.data?.popupTitle ;
    this.viewOnly = dialogData?.data?.viewOnly ;
    if(this.data &&(this.funcType==_addMF || !(this.data?.items?.length>0))){
      this.data.items =[];
    }
    this.dialogRef = dialogRef;
    this.formModel = this.dialogRef?.formModel;
    this.funcID = this.formModel?.funcID;
    this.user = this.authStore.get();
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  onInit(): void {
    this.getCacheData();
    
  }

  ngAfterViewInit(): void {}

  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Cache Data--------------------------------//
  //---------------------------------------------------------------------------------//
  getCacheData() {
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Data Func---------------------------------//
  //---------------------------------------------------------------------------------//
  
  //---------------------------------------------------------------------------------//
  //-----------------------------------Event-----------------------------------------//
  //---------------------------------------------------------------------------------//
  valueChange(event) {
    if (event?.field) {
      if (event.data instanceof Object) {
        this.data[event.field] = event.data.value;
      } else {
        this.data[event.field] = event.data;
      }
      if(event?.field=='reasonName' && event?.components?.itemsSelected?.length>0){
        this.data.reasonID = event?.components?.itemsSelected[0]?.ReasonID;
      }
    }
    this.changeDetectorRef.detectChanges();
  }

  closePopUpCbb() {
    this.isPopupStationeryCbb = false;
  }

  //Stationery & Room

  valueCbxStationeryChange(event?) {
    if (event == null) {
      this.isPopupStationeryCbb = false;
      return;
    }
    event.dataSelected.forEach((item) => {
      let tmpSta = new BookingItems();
      (tmpSta.itemID = item.ResourceID),
        (tmpSta.quantity = 1),
        (tmpSta.issueQuantity = 1),
        (tmpSta.itemName = item.ResourceName),
        (tmpSta.umid = item.UMID),
        (tmpSta.umName = item.UMID),
        (tmpSta.objectType = 'EP_Resources'),
        (tmpSta.objectID = item.RecID);
      let tmpUM = this.listUM?.filter((obj) => {
        return obj?.umid == tmpSta?.umid;
      });
      if (tmpUM != null && tmpUM?.length > 0) {
        tmpSta.umName = tmpUM[0]?.umName;
      }
      this.data?.items.push(tmpSta);
    });
    this.data.items = [
      ...new Map(
        this.data?.items.map((item) => [item['itemID'], item])
      ).values(),
    ];

    this.changeDetectorRef.detectChanges();
    this.isPopupStationeryCbb = false;
  }

  valueQuantityChange(event?) {
    if (event?.data != null && event?.field) {
      if (event?.data < 0) {
        event.data = 0;
      }
      this.lstStationery.forEach((item) => {
        if (item.itemID === event?.field) {
          item.quantity = event.data;
        }
      });
      this.changeDetectorRef.detectChanges();
    }
    // this.lstStationery = this.lstStationery.filter((item) => {
    //   return item.quantity != 0;
    // });
  }

  deleteStationery(itemID: any) {
    if (this.viewOnly) {
      return;
    }
    if (itemID != null && this.lstStationery != null) {
      this.lstStationery = this.lstStationery.filter((item) => {
        return item?.itemID != itemID;
      });
    }
  }
 

  //---------------------------------------------------------------------------------//
  //-----------------------------------Validate Func---------------------------------//
  //---------------------------------------------------------------------------------//
  beforeSave(option: RequestOption) {
    this.data.owner = this.user?.userID;
    this.data.resourceType = "6";
    this.data.category = "0";//Nhập kho VPP
    option.methodName = 'AddUpdateAsync';
    let isAdd = true;
    if (this.funcType == _editMF) {
      isAdd = false;
    }
    option.data = [
      this.data,
      isAdd,
    ];
    return true;
  }

  onSaveForm(approval: boolean = false) {
    if (
      approval &&
      this.funcType == _editMF &&
      this.authService?.userValue?.userID != this.data.createdBy
    ) {
      this.notificationsService.notifyCode('SYS032');
      return;
    }
    if (!this.onSaving) {
      this.onSaving = true;
      if (this.funcType == _addMF) {
        this.data.requester = this.authService?.userValue?.userName;
      }
      this.startSave(approval);
     
    } else {
      this.onSaving = false;
      return;
    }
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Logic Func-------------------------------------//
  //---------------------------------------------------------------------------------//

  startSave(approval) {
    if (false) {
    } else {
      this.dialogRef.dataService
        .save(
          (opt: RequestOption) => this.beforeSave(opt),
          0,
          null,
          null,
          !approval
        )
        .subscribe(async (res) => {
          if (res.save || res.update) {
            if (!res.save) {
              this.returnData = res.update;
            } else {
              this.returnData = res.save;
            }
            
              if (approval) {
                this.startImport();
              } else {
                this.dialogRef && this.dialogRef.close(this.returnData);
              }
            
          } else {
            this.onSaving = false;
            return;
          }
        });
    }
  }


  startRelease() {
    if (this.approvalRule != '0') {
      this.codxBookingService
        .getProcessByCategoryID(this.categoryID)
        .subscribe((category: any) => {
          this.codxCommonService.codxReleaseDynamic(
            'EP',
            this.returnData,
            category,
            this.formModel?.entityName,
            this.formModel.funcID,
            this.returnData?.title,
            (res: ResponseModel) => {
              if (res?.msgCodeError == null && res?.rowCount) {
                this.returnData.approveStatus =
                  res.returnStatus ?? EPCONST.A_STATUS.Released;
                this.returnData.write = false;
                this.returnData.delete = false;
                (this.dialogRef.dataService as CRUDService)
                  .update(this.returnData,true)
                  .subscribe();
                this.notificationsService.notifyCode('SYS034');
                
                this.dialogRef && this.dialogRef.close(this.returnData);
              } else {
                this.notificationsService.notifyCode(res?.msgCodeError);
                // Thêm booking thành công nhưng gửi duyệt thất bại
                this.dialogRef && this.dialogRef.close(this.returnData);
              }
            },
            this.returnData?.createdBy,
          );
        });
    } 
  }

  startImport(){
    if(this.returnData){
      this.codxBookingService.resourceTrans(this.returnData?.recID,"1").subscribe(res=>{
        if(res){          
          this.notificationsService.notifyCode('SYS034');          
          this.dialogRef && this.dialogRef.close(res);
        }
        else{
          this.onSaving=false;

        }
        this.detectorRef.detectChanges();
      });
    }
  }
  
  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Func-----------------------------------//
  //---------------------------------------------------------------------------------//

  
  filterArray(arr) {
    return [...new Map(arr.map((item) => [item['userID'], item])).values()];
  }
  
  //---------------------------------------------------------------------------------//
  //-----------------------------------Popup-----------------------------------------//
  //---------------------------------------------------------------------------------//

  

  openStationeryPopup() {
    this.isPopupStationeryCbb = true;
  }
}
