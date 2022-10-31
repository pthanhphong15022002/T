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
  selector: 'approval-room-view-detail',
  templateUrl: 'approval-room-view-detail.component.html',
  styleUrls: ['approval-room-view-detail.component.scss'],
})
export class ApprovalRoomViewDetailComponent extends UIComponent implements OnChanges {
  @ViewChild('itemDetailTemplate') itemDetailTemplate;  
  @ViewChild('subTitleHeader') subTitleHeader;
  @ViewChild('attachment') attachment;  
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
  files = [];

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
        this.files=[];
        this.api.execSv(
          'DM',
          'ERM.Business.DM',
          'FileBussiness',
          'GetFilesForOutsideAsync',
          [this.funcID, this.itemDetail.recID, 'EP_Bookings']
        ).subscribe((res:[])=>{
          if(res){
            console.log(res);
            this.files=res;
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
      // event.forEach(func => {        
      //   func.disabled=true;        
      // });
      if(data.status=='3'){
        event.forEach(func => {
          if(func.functionID == "EPT40101" /*MF Duyệt*/ || func.functionID == "EPT40105"/*MF từ chối*/ )
          {
            func.disabled=false;
          }
        });  
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
