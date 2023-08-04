import { CodxCmService } from 'projects/codx-cm/src/projects';
import { AfterViewInit, Component, Injector, Optional } from '@angular/core';
import {
  AuthStore,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { stringify } from 'querystring';

@Component({
  selector: 'lib-popup-bant-deal',
  templateUrl: './popup-bant-deal.component.html',
  styleUrls: ['./popup-bant-deal.component.scss'],
})
export class PopupBantDealComponent
  extends UIComponent
  implements AfterViewInit
{

  dialogRef: DialogRef;
  formModel: FormModel;
  title = '';
  customerID: string = '';

  gridViewSetup: any;
  data:any;
  lstContactDelete: any;
  lstContactDeal: any;
  customerIDOld: any;

  lstContactCustomer: any[] = [];
  lstContactOld: any[] = [];

  constructor(
    private injector: Injector,
    private notificationsService: NotificationsService,
    private authStore: AuthStore,
    private codxCmService: CodxCmService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.dialogRef = dialogRef;
    this.title = dialogData?.data.headerTitle;
    this.gridViewSetup = dialogData?.data.gridViewSetup;
    this.data =JSON.parse(JSON.stringify(dialogData?.data.data));
    this.formModel = dialogData?.data.formModel;
    this.extecuteQuery()

    this.customerID = this.data?.customerID;
    this.customerIDOld = this.data?.customerID;

  }

  ngAfterViewInit(): void {}

  onInit(): void {}
  async extecuteQuery(){
   await  this.getListContactByDealID(this.customerID);
  }

 async getListContactByDealID(objectID) {
    this.codxCmService.getListContactByObjectID(objectID).subscribe((res) => {
      if (res && res.length > 0) {
        this.lstContactDeal = res;
        this.lstContactOld = JSON.parse(JSON.stringify(res));
      }
    });
  }


  valueChangeDate($event) {
    if ($event) {
      this.data[$event.field] = $event.data.fromDate;
    }
  }
  valueChange($event){
    if ($event) {
      this.data[$event.field] = $event.data;
    }
  }
  lstContactDeleteEmit(e){
    this.lstContactDelete = e;
  }
  lstContactEmit(e) {
    this.lstContactDeal = e;
    // if (!this.isCheckContact) this.isCheckContact = true;
  }
  onSaveForm() {
   let datas = [
      this.data,
      this.customerIDOld,
      this.lstContactDeal,
      this.lstContactDelete,
    ];
    this.codxCmService.updateContentBANT(datas).subscribe((res)=>{
      if(res){
        this.dialogRef.close(res[0]);
      }
    })
  }


}
