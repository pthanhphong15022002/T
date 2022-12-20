import {
  Component,
  Injector,
  TemplateRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import {
  NotificationsService,
  UIComponent,
  ViewModel,
  ViewType,
  FormModel,
} from 'codx-core';
import { CodxEpService } from '../../codx-ep.service';

@Component({
  selector: 'approval-stationery',
  templateUrl: 'approval-stationery.component.html',
  styleUrls: ['approval-stationery.component.scss'],
})
export class ApprovalStationeryComponent
  extends UIComponent
  implements AfterViewInit
{
  @ViewChild('itemTemplate') itemTemplate!: TemplateRef<any>;
  @ViewChild('panelRightRef') panelRight?: TemplateRef<any>;
  views: Array<ViewModel> | any = [];
  funcID: string;
  service = 'EP';
  assemblyName = 'EP';
  entity = 'EP_Bookings';
  className = 'BookingsBusiness';
  method = 'GetListApprovalAsync';
  idField = 'recID';
  predicate = 'ResourceType=@0';
  datavalue = '6';
  taskViewStt;
  jobs;
  itemDetail;
  preStepNo;
  button;
  itemSelected: any;
  formModel: FormModel;

  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService,
    private notificationsService: NotificationsService
  ) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
    this.codxEpService.getFormModel(this.funcID).then((res) => {
      if (res) {
        this.formModel = res;
      }
    });
  }

  onInit(): void {
    this.button = {
      id: 'btnAdd',
    };
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.listdetail,
        sameData: true,
        active: true,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.panelRight,
        },
      },
    ];
    this.detectorRef.detectChanges();
  }

  click(event) {}

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
      case 'EPT40301':
        {
          //alert('Duyệt');
          this.approve(datas, '5');
        }
        break;
      case 'EPT40305':
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
      .getCategoryByEntityName(this.formModel.entityName)
      .subscribe((res: any) => {
        this.codxEpService
          .approve(
            data?.approvalTransRecID, //ApprovelTrans.RecID
            status,
            '',
            ''
          )
          .subscribe((res: any) => {
            if (res?.msgCodeError == null && res?.rowCount >= 0) {
              if (status == '5') {
                this.notificationsService.notifyCode('SYS034'); //đã duyệt
                data.approveStatus = '5';
                data.status = '5';
              }
              if (status == '4') {
                this.notificationsService.notifyCode('SYS034'); //bị hủy
                data.approveStatus = '4';
                data.status = '4';
              }
              this.view.dataService.update(data).subscribe();
            } else {
              this.notificationsService.notifyCode(res?.msgCodeError);
            }
          });
      });
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
            func.functionID == 'EPT40301' /*MF Duyệt*/ ||
            func.functionID == 'EPT40302' /*MF từ chối*/
          ) {
            func.disabled = false;
          }
        });
      } else {
        event.forEach((func) => {
          if (
            func.functionID == 'EPT40301' /*MF Duyệt*/ ||
            func.functionID == 'EPT40302' /*MF từ chối*/
          ) {
            func.disabled = true;
          }
        });
      }
    }
  }
  updateStatus(data: any) {
    this.view.dataService.update(data).subscribe();
  }

  closeAddForm(event) {}

  changeItemDetail(event) {
    let recID = '';
    if (event?.data) {
      recID = event.data.recID;
      this.itemDetail = event?.data;
    } else if (event?.recID) {
      recID = event.recID;
      this.itemDetail = event;
    }
    this.getDetailApprovalBooking(recID);
  }

  getDetailApprovalBooking(id: any) {
    this.api
      .exec<any>('EP', 'BookingsBusiness', 'GetApprovalBookingByIDAsync', [
        this.itemDetail?.recID,
        this.itemDetail?.approvalTransRecID,
      ])
      .subscribe((res) => {
        if (res) {
          this.itemDetail = res;
          this.detectorRef.detectChanges();
        }
      });
  }

  setStyles(resourceType) {
    let styles = {};
    switch (resourceType) {
      case '1':
        styles = {
          backgroundColor: '#104207',
          color: 'white',
        };
        break;
      case '2':
        styles = {
          backgroundColor: '#29b112',
          color: 'white',
        };
        break;
      case '6':
        styles = {
          backgroundColor: '#053b8b',
          color: 'white',
        };
        break;
      default:
        styles = {};
        break;
    }

    return styles;
  }

  setIcon(resourceType) {
    let icon: string = '';
    switch (resourceType) {
      case '1':
        icon = 'icon-calendar_today';
        break;
      case '2':
        icon = 'icon-directions_car';
        break;
      case '6':
        icon = 'icon-desktop_windows';
        break;
      default:
        icon = '';
        break;
    }

    return icon;
  }
}
