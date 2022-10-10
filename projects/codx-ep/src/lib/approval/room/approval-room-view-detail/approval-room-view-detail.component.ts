import {
  Component,
  Injector,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { DataRequest, UIComponent, ViewsComponent } from 'codx-core';
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
        .exec<any>('EP', 'BookingsBusiness', 'GetBookingByIDAsync', [
          changes.itemDetail?.currentValue?.recID,
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

  openFormFuncID(value, datas: any = null) {
    
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
          alert('Duyệt');
          this.approve(value,"5")
        }
        break;
      case 'EPT40102':
      case 'EPT40201':
      case 'EPT40301':
        {
          alert('Ký');
        }
        break;
      case 'EPT40103':
      case 'EPT40203':
      case 'EPT40303':
        {
          alert('Đồng thuận');
        }
        break;
      case 'EPT40104':
      case 'EPT40204':
      case 'EPT40304':
        {
          alert('Đóng dấu');
        }
        break;
      case 'EPT40105':
      case 'EPT40205':
      case 'EPT40305':
        {
          alert('Từ chối');
          this.approve(value,"4")
        }
        break;
      case 'EPT40106':
      case 'EPT40206':
      case 'EPT40306':
        {
          alert('Làm lại');
          this.approve(value,"2")
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
            'EP_Bookings',            
            data?.recID,//ApprovelTrans.RecID
            status,//Status : 5 - Duyệt
          )
          .subscribe((res) => {
            var x= res;
            // if (res?.msgCodeError == null && res?.rowCount) {
            //   this.notificationsService.notifyCode('ES007');
            // } else {
            //   this.notificationsService.notifyCode(res?.msgCodeError);
            // }
          });
      });
  }
  changeDataMF(event, data: any) {}

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
