import {
  Component,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { DataRequest, NotificationsService, UIComponent, ViewsComponent } from 'codx-core';
import { CodxEpService } from '../../../codx-ep.service';

@Component({
  selector: 'approval-car-view-detail',
  templateUrl: 'approval-car-view-detail.component.html',
  styleUrls: ['approval-car-view-detail.component.scss'],
})
export class ApprovalCarViewDetailComponent extends UIComponent implements OnChanges {
  @ViewChild('itemDetailTemplate') itemDetailTemplate;  
  @ViewChild('subTitleHeader') subTitleHeader;
  @Output('updateStatus') updateStatus: EventEmitter<any> = new EventEmitter();
  @Input() itemDetail: any;
  @Input() funcID;
  @Input() formModel;
  @Input() data: any;
  @Input() override view: ViewsComponent;
  @Input() hideMF = false;
  @Input() hideFooter = false;
  firstLoad = true;
  id: string;
  itemDetailDataStt: any;
  itemDetailStt: any;
  active = 1;  

  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService,    
    private notificationsService: NotificationsService,
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
        changes.itemDetail?.currentValue?.recID,changes.itemDetail?.currentValue?.approvalTransRecID,
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
    // if (!datas) datas = this.data;
    // else {
    //   var index = this.view.dataService.data.findIndex((object) => {
    //     return object.recID === datas.recID;
    //   });
    //   datas = this.view.dataService.data[index];
    // }
    switch (funcID) {
      case 'EPT40201':
      case 'EPT40201':
      case 'EPT40301':
        {
          //alert('Duyệt');
          this.approve(datas,"5")
        }
        break;      
      case 'EPT40205':
      case 'EPT40205':
      case 'EPT40305':
        {
          //alert('Từ chối');
          this.approve(datas,"4")
        }
        break;
      case 'EPT40206':
      case 'EPT40206':
      case 'EPT40306':
        {
          //alert('Làm lại');
          this.approve(datas,"2")
        }
        break;
      default:
        '';
        break;
    }
  }
  approve(data:any, status:string){
    this.codxEpService
      .getCategoryByEntityName(this.formModel.entityName)
      .subscribe((res: any) => {
        this.codxEpService
          .approve(            
            data?.approvalTransRecID,//ApprovelTrans.RecID
            status,
          )
          .subscribe((res:any) => {
            if (res?.msgCodeError == null && res?.rowCount>=0) {
              if(status=="5"){
                this.notificationsService.notifyCode('ES007');//đã duyệt
                data.status="5"
              }
              if(status=="4"){
                this.notificationsService.notifyCode('ES007');//bị hủy
                data.status="4";
              }
              if(status=="2"){
                this.notificationsService.notifyCode('ES007');//làm lại
                data.status="2"
              }
              this.updateStatus.emit(data);
            } else {
              this.notificationsService.notifyCode(res?.msgCodeError);
            }
          });
      });
  } 

  
  changeDataMF(event, data: any) {
    
    if(event!=null && data!=null){
      switch(data?.status){
        case "3":
        event.forEach(func => {
          if(func.functionID == "EPT40202" 
          ||func.functionID == "EPT40203" 
          || func.functionID == "EPT40204")
          {
            func.disabled=true;
          }
        });
        break;
        case "4":
          event.forEach(func => {
            if(func.functionID == "EPT40202" 
            ||func.functionID == "EPT40203" 
            || func.functionID == "EPT40204"
            ||func.functionID == "EPT40205" 
            ||func.functionID == "EPT40206" 
            || func.functionID == "EPT40201"
            )
            {
              func.disabled=true;
            }
          });
        break;
        case "5":
          event.forEach(func => {
            if(func.functionID == "EPT40202" 
            ||func.functionID == "EPT40203" 
            || func.functionID == "EPT40204"
            ||func.functionID == "EPT40205" 
            ||func.functionID == "EPT40206" 
            || func.functionID == "EPT40201"
            )
            {
              func.disabled=true;
            }
          });
        break;
        case "2":
          event.forEach(func => {
            if(func.functionID == "EPT40202" 
            ||func.functionID == "EPT40203" 
            || func.functionID == "EPT40204"
            ||func.functionID == "EPT40205" 
            ||func.functionID == "EPT40206" 
            || func.functionID == "EPT40201"
            )
            {
              func.disabled=true;
            }
          });
        break;
      }
    }
  }
  clickChangeItemDetailDataStatus(stt) {
    this.itemDetailDataStt = stt;
  }

  clickChangeItemViewStatus(stt, recID) {
    this.itemDetailStt = stt;
  }

  setHeight() {
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
