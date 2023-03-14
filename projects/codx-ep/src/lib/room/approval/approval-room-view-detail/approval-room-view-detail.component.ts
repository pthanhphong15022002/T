import {
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  AuthService,
  DataRequest,
  NotificationsService,
  UIComponent,
  ViewsComponent,
} from 'codx-core';
import { CodxEpService } from '../../../codx-ep.service';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { Permission } from '@shared/models/file.model';
@Component({
  selector: 'approval-room-view-detail',
  templateUrl: 'approval-room-view-detail.component.html',
  styleUrls: ['approval-room-view-detail.component.scss'],
})
export class ApprovalRoomViewDetailComponent
  extends UIComponent
  implements OnChanges
{
  @ViewChild('itemDetailTemplate') itemDetailTemplate;
  @ViewChild('subTitleHeader') subTitleHeader;
  @ViewChild('attachment') attachment;
  @Output('updateStatus') updateStatus: EventEmitter<any> = new EventEmitter();
  @ViewChild('reference') reference: TemplateRef<ElementRef>;
  @Output('approve') approve: EventEmitter<any> = new EventEmitter();  
  @Output('reject') reject: EventEmitter<any> = new EventEmitter(); 
  @Output('undo') undo: EventEmitter<any> = new EventEmitter();
  @Input() itemDetail: any;
  @Input() funcID;
  @Input() formModel;
  @Input() data: any;
  @Input() hideMF = false;
  @Input() hideFooter = false;
  firstLoad = true;
  id: string;
  itemDetailDataStt: any;
  itemDetailStt: any;
  active = 1;
  files = [];

  tabControl: TabModel[] = [];
  listFilePermission=[];
  isEdit=true;
  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService,
    private authService: AuthService,
    private notificationsService: NotificationsService
  ) {
    super(injector);
  }

  onInit(): void {
    this.itemDetailStt = 1;
  }
  ngAfterViewInit(): void {
    this.tabControl = [
      { name: 'History', textDefault: 'Lịch sử', isActive: true },
      { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
      { name: 'Comment', textDefault: 'Bình luận', isActive: false },

      { name: 'Approve', textDefault: 'Xét duyệt', isActive: false },
    ];
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
        ])
        .subscribe((res) => {
          if (res) {
            this.itemDetail = res;
            this.listFilePermission = [];
            if (res?.bookingAttendees != null && res?.bookingAttendees != '') {
              let listAttendees = res.bookingAttendees.split(';');
              listAttendees.forEach((item) => {
                if (item != '') {
                  let tmpPer = new Permission();
                  tmpPer.objectID = item; //
                  tmpPer.objectType = 'U';
                  tmpPer.read = true;
                  tmpPer.share = true;
                  tmpPer.download = true;
                  tmpPer.isActive = true;
                  this.listFilePermission.push(tmpPer);
                }
              });
            }
            if (res?.listApprovers != null && res?.listApprovers.length > 0) {
              res.listApprovers.forEach((item) => {
                if (item != '') {
                  let tmpPer = new Permission();
                  tmpPer.objectID = item; //
                  tmpPer.objectType = 'U';
                  tmpPer.read = true;
                  tmpPer.share = true;
                  tmpPer.download = true;
                  tmpPer.isActive = true;
                  this.listFilePermission.push(tmpPer);
                }
              });
            }
            this.isEdit = false;
            // for (let u of res.bookingAttendees) {
            //   if (
            //     res?.createdBy == this.authService?.userValue?.userID ||
            //     this.authService?.userValue?.userID == u?.userID
            //   ) {
            //     this.isEdit = true;
            //   }
            // }       
            this.detectorRef.detectChanges();
          }
        });
      this.files = [];
      

      this.detectorRef.detectChanges();
    }
    this.setHeight();
    this.active = 1;
  }

  showHour(date: any) {
    let temp = new Date(date);
    let time =
      ('0' + temp.getHours()).toString().slice(-2) +
      ':' +
      ('0' + temp.getMinutes()).toString().slice(-2);
    return time;
  }
  
  changeDataMF(event, data: any) {
    if (event != null && data != null) {
      event.forEach((func) => {
        if (func.functionID == 'SYS04' /*Copy*/) {
          func.disabled = true;
        }
      });
      if (data.approveStatus == '3') {
        event.forEach((func) => {
          if (
            func.functionID == 'EPT40101' /*MF Duyệt*/ ||
            func.functionID == 'EPT40105' /*MF từ chối*/
          ) {
            func.disabled = false;
          }
          if (func.functionID == 'EPT40106' /*MF Thu Hồi*/) {
            func.disabled = true;
          }
        });
      } else {
        event.forEach((func) => {
          if (
            func.functionID == 'EPT40101' /*MF Duyệt*/ ||
            func.functionID == 'EPT40105' /*MF từ chối*/
          ) {
            func.disabled = true;
          }
          if (func.functionID == 'EPT40106' /*MF Thu Hồi*/) {
            func.disabled = false;
          }
        });
      }
    }
  }

  clickMF(value, datas: any = null) {
    let funcID = value?.functionID;
    switch (funcID) {
      case 'EPT40101':
        {
          //alert('Duyệt');
          this.approve.emit(datas);
        }
        break;
      case 'EPT40105':
        {
          //alert('Từ chối');
          this.reject.emit(datas);
        }
        break;
      case 'EPT40106':
        {
          //alert('Thu hồi');
          this.undo.emit(datas);
        }
        break;
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
