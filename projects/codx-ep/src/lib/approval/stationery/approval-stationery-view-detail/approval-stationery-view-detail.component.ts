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
export class ApprovalStationeryViewDetailComponent extends UIComponent implements OnChanges {
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
    private codxEpService: CodxEpService,
    ) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
  }

  onInit(): void {
    throw new Error('Method not implemented.');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes?.itemDetail &&
      changes.itemDetail?.previousValue?.recID !=
        changes.itemDetail?.currentValue?.recID
    ) {
      this.api
        .exec<any>('EP', 'BookingsBusiness', 'GetBookingByIDAsync', [
          changes.itemDetail?.currentValue?.recID,
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
      case 'EPT40101':
      case 'EPT40201':
      case 'EPT40301':
        {
          //alert('Duyệt');
          this.approve(datas,"5")
        }
        break;      
      case 'EPT40105':
      case 'EPT40205':
      case 'EPT40305':
        {
          //alert('Từ chối');
          this.approve(datas,"4")
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
          .subscribe(async (res:any) => {
            if (res?.msgCodeError == null && res?.rowCount>=0) {
              if(status=="5"){
                this.notificationsService.notifyCode('ES007');//đã duyệt
                data.status="5"
              }
              if(status=="4"){
                this.notificationsService.notifyCode('ES007');//bị hủy
                data.status="4";
              }                           
              this.updateStatus.emit(data);
            } else {
              this.notificationsService.notifyCode(res?.msgCodeError);
            }
          });
      });
  }
  changeDataMF(event, data:any) {    
    if(event!=null && data!=null){
      switch(data?.status){
        case "3":
        event.forEach(func => {
          if(func.functionID == "EPT40102" 
          ||func.functionID == "EPT40103" 
          ||func.functionID == "EPT40106" 
          || func.functionID == "EPT40104")
          {
            func.disabled=true;
          }
        });
        break;
        case "4":
          event.forEach(func => {
            if(func.functionID == "EPT40102" 
            ||func.functionID == "EPT40103" 
            || func.functionID == "EPT40104"
            ||func.functionID == "EPT40105" 
            ||func.functionID == "EPT40106" 
            || func.functionID == "EPT40101"
            )
            {
              func.disabled=true;
            }
          });
        break;
        case "5":
          event.forEach(func => {
            if(func.functionID == "EPT40102" 
            ||func.functionID == "EPT40103" 
            || func.functionID == "EPT40104"
            ||func.functionID == "EPT40105" 
            ||func.functionID == "EPT40106" 
            || func.functionID == "EPT40101"
            )
            {
              func.disabled=true;
            }
          });
        break;
        case "2":
          event.forEach(func => {
            if(func.functionID == "EPT40102" 
            ||func.functionID == "EPT40103" 
            || func.functionID == "EPT40104"
            ||func.functionID == "EPT40105" 
            ||func.functionID == "EPT40106" 
            || func.functionID == "EPT40101"
            )
            {
              func.disabled=true;
            }
          });
        break;
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
