import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  Injector,
  EventEmitter,
  Output,
} from '@angular/core';
import { NotificationsService, UIComponent, ViewsComponent } from 'codx-core';
import { CodxEpService } from '../../../codx-ep.service';

@Component({
  selector: 'approval-stationery-view-detail',
  templateUrl: 'approval-stationery-view-detail.component.html',
  styleUrls: ['approval-stationery-view-detail.component.scss'],
})
export class ApprovalStationeryViewDetailComponent
  extends UIComponent
  implements OnChanges
{
  @Input() itemDetail: any;
  @Output('updateStatus') updateStatus: EventEmitter<any> = new EventEmitter();
  @Input() funcID;
  @Input() formModel;
  @Input() override view: ViewsComponent;
  @Input() hideMF = false;
  @Input() hideFooter = false;
  itemDetailDataStt: any;
  itemDetailStt: any;
  active = 1;

  constructor(
    private injector: Injector,
    private notificationsService: NotificationsService,
    private codxEpService: CodxEpService
  ) {
    super(injector);
  }

  onInit(): void {
    this.itemDetailStt = 1;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes?.itemDetail &&
      changes.itemDetail?.previousValue?.recID !=
        changes.itemDetail?.currentValue?.recID
    ) {
      this.api
        .exec<any>('EP', 'BookingsBusiness', 'GetApprovalBookingByIDAsync', [
          changes.itemDetail?.currentValue?.recID,
          changes.itemDetail?.currentValue?.approvalTransRecID,
        ])
        .subscribe((res) => {
          if (res) {
            this.itemDetail = res;
            this.detectorRef.detectChanges();
          }
        });
      this.detectorRef.detectChanges();
    }
    this.setHeight();
    this.active = 1;
  }

  clickMF(value, datas: any = null) {
    let funcID = value?.functionID;

    switch (funcID) {
      case 'EPT40301':
        {
          //alert('Duyệt');
          this.approve(datas, '5');
        }
        break;

      case 'EPT40302':
        {
          //alert('Từ chối');
          this.approve(datas, '4');
        }
        break;
      default:
        '';
        break;
    }
  }
  approve(data: any, status: string) {
    this.codxEpService
      .approve(
        data?.approvalTransRecID, //ApprovelTrans.RecID
        status
      )
      .subscribe(async (res: any) => {
        if (res?.msgCodeError == null && res?.rowCount >= 0) {
          if (status == '5') {
            this.notificationsService.notifyCode('ES007'); //đã duyệt
            data.status = '5';
          }
          if (status == '4') {
            this.notificationsService.notifyCode('ES007'); //bị hủy
            data.status = '4';
          }
          this.updateStatus.emit(data);
        } else {
          this.notificationsService.notifyCode(res?.msgCodeError);
        }
      });
  }
  changeDataMF(event, data:any) {        
    if(event!=null && data!=null){
      event.forEach(func => {       
        if(func.functionID == "SYS04"/*Copy*/) 
        {
          func.disabled=true;        
        }
      });
      if(data.status=='3'){
        event.forEach(func => {
          if(func.functionID == "EPT40301" /*MF Duyệt*/ || func.functionID == "EPT40302"/*MF từ chối*/ )
          {
            func.disabled=false;
          }
        });  
      }
      else{
        event.forEach(func => {
          if(func.functionID == "EPT40301" /*MF Duyệt*/ || func.functionID == "EPT40302"/*MF từ chối*/ )
          {
            func.disabled=true;
          }
        }); 
      }
    }
  }

  getDetailBooking(id: string) {}

  private setHeight() {
    let main,
      header = 0;
    let ele = document.getElementsByClassName(
      'codx-detail-main'
    ) as HTMLCollectionOf<HTMLElement>;
    if (ele) {
      main = Array.from(ele)[0]?.offsetHeight;
    }

    let eleheader = document.getElementsByClassName(
      'codx-detail-header'
    ) as HTMLCollectionOf<HTMLElement>;
    if (ele) {
      header = Array.from(eleheader)[0]?.offsetHeight;
    }

    let nodes = document.getElementsByClassName(
      'codx-detail-body'
    ) as HTMLCollectionOf<HTMLElement>;
    if (nodes.length > 0) {
      Array.from(
        document.getElementsByClassName(
          'codx-detail-body'
        ) as HTMLCollectionOf<HTMLElement>
      )[0].style.height = main - header - 27 + 'px';
    }
  }
}
