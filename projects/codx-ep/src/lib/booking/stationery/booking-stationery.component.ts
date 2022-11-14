import { CodxEpService } from 'projects/codx-ep/src/public-api';
import {
  CacheService,
  CallFuncService,
  DialogModel,
  UIComponent,
  FormModel,
  AuthService,
} from 'codx-core';
import {
  AfterViewInit,
  Component,
  Injector,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ButtonModel,
  DataRequest,
  DialogRef,
  NotificationsService,
  SidebarModel,
  ViewModel,
  ViewType,
} from 'codx-core';
import { PopupRequestStationeryComponent } from './popup-request-stationery/popup-request-stationery.component';

@Component({
  selector: 'stationery',
  templateUrl: './booking-stationery.component.html',
  styleUrls: ['./booking-stationery.component.scss'],
})
export class BookingStationeryComponent
  extends UIComponent
  implements AfterViewInit
{
  @ViewChild('chart') chart: TemplateRef<any>;

  @ViewChild('itemTemplate') itemTemplate!: TemplateRef<any>;
  @ViewChild('panelRightRef') panelRight?: TemplateRef<any>;
  viewType = ViewType;
  views: Array<ViewModel> = [];
  button: ButtonModel;
  dataSelected: any;
  columnsGrid: any;
  dialog!: DialogRef;
  model: DataRequest;
  funcID: string;
  service = 'EP';
  assemblyName = 'EP';
  entity = 'EP_Bookings';
  className = 'BookingsBusiness';
  method = 'GetListBookingAsync';
  idField = 'recID';
  predicate = 'ResourceType=@0';
  dataValue = '6';
  funcIDName = '';
  popupTitle = '';
  formModel: FormModel;
  itemDetail;
  popupClosed = true;

  constructor(
    private injector: Injector,
    private callFuncService: CallFuncService,
    private codxEpService: CodxEpService,
    private cacheService: CacheService,
    private notificationsService: NotificationsService,
    private authService: AuthService
  ) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
    this.codxEpService.getFormModel(this.funcID).then((res) => {
      if (res) {
        this.formModel = res;
      }
    });
    this.cache.functionList(this.funcID).subscribe((res) => {
      if (res) {
        this.funcIDName =
          res.customName.charAt(0).toLowerCase() + res.customName.slice(1);
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

  click(evt: any) {
    this.popupTitle = evt?.text + ' ' + this.funcIDName;
    switch (evt.id) {
      case 'btnAdd':
        this.addNewRequest();
        break;
      case 'btnAddNew':
        //this.openRequestList();
        break;
    }
  }
  clickMF(event, data) {
    this.popupTitle = event?.text + ' ' + this.funcIDName;
    switch (event?.functionID) {
      case 'SYS02': //Xoa
        this.delete(data);
        break;
      case 'SYS03': //Sua.
        this.edit(data);
        break;
      case 'SYS04': //Copy.
        this.copy(data);
        break;
      case 'EPT40303': //Cap phat
        this.allocate(data);
        break;
    }
  }

  changeDataMF(event, data: any) {
    if (event != null && data != null && this.funcID == 'EPT32') {
      event.forEach((func) => {
        if (
          func.functionID == 'SYS02' /*MF sửa*/ ||
          func.functionID == 'SYS03' /*MF xóa*/ ||
          func.functionID == 'SYS04' /*MF chép*/
        ) {
          func.disabled = true;
        }
      });
    }
  }

  addNewRequest() {
    if (true) {
      this.view.dataService.addNew().subscribe((res) => {
        this.popupClosed = false;
        let option = new SidebarModel();
        option.DataService = this.view?.dataService;
        option.FormModel = this.formModel;
        let dialogModel = new DialogModel();
        dialogModel.IsFull = true;
        this.callfc.openForm(
          PopupRequestStationeryComponent,
          this.popupTitle,
          700,
          650,
          this.funcID,
          {
            isAddNew: true,
            formModel: this.formModel,
            option: option,
            title: this.popupTitle,
          },
          '',
          dialogModel
        );
        this.dialog?.closed.subscribe((returnData) => {
          this.popupClosed = true;
          if (!returnData.event) this.view.dataService.clear();
        });
      });
    }
  }

  edit(evt: any) {
    if (evt) {
      if (this.authService.userValue.userID != evt?.owner) {
        this.notificationsService.notifyCode('TM052');
        return;
      }

      if (true) {
        this.view.dataService.dataSelected = evt;
        this.view.dataService
          .edit(this.view.dataService.dataSelected)
          .subscribe((res) => {
            this.popupClosed = false;
            let option = new SidebarModel();
            option.DataService = this.view?.dataService;
            option.FormModel = this.formModel;
            let dialogModel = new DialogModel();
            dialogModel.IsFull = true;
            this.callfc.openForm(
              PopupRequestStationeryComponent,
              this.popupTitle,
              700,
              650,
              this.funcID,
              {
                isAddNew: false,
                formModel: this.formModel,
                option: option,
                title: this.popupTitle,
              },
              '',
              dialogModel
            );
            this.dialog?.closed.subscribe((returnData) => {
              this.popupClosed = true;
              if (!returnData.event) this.view.dataService.clear();
            });
          });
      }
    }
  }

  copy(evt: any) {
    if (evt) {
      if (true) {
        this.view.dataService.dataSelected = evt;
        this.view.dataService
          .copy(this.view.dataService.dataSelected)
          .subscribe((res) => {
            this.popupClosed = false;
            let option = new SidebarModel();
            option.DataService = this.view?.dataService;
            option.FormModel = this.formModel;
            let dialogModel = new DialogModel();
            dialogModel.IsFull = true;
            this.callfc.openForm(
              PopupRequestStationeryComponent,
              this.popupTitle,
              700,
              650,
              this.funcID,
              {
                isAddNew: true,
                formModel: this.formModel,
                option: option,
                title: this.popupTitle,
              },
              '',
              dialogModel
            );
            this.dialog?.closed.subscribe((returnData) => {
              this.popupClosed = true;
              if (!returnData.event) this.view.dataService.clear();
            });
          });
      }
    }
  }

  allocate(evt: any) {
    this.api
      .exec('EP', 'ResourceTransBusiness', 'AllocateAsync', [evt.recID])
      .subscribe((dataItem) => {
        if (dataItem) {
          this.view.dataService.update(dataItem).subscribe((res) => {
            if (res) {
              this.notificationsService.notify('Cấp phát thành công', '1', 0);
            }
          });
          this.detectorRef.detectChanges();
        }
      });
  }

  setPopupTitle(mfunc) {
    this.popupTitle = mfunc + ' ' + this.funcIDName;
  }

  delete(evt?) {
    let deleteItem = this.view.dataService.dataSelected;
    if (evt) {
      deleteItem = evt;
      if (this.authService.userValue.userID != evt?.owner) {
        this.notificationsService.notifyCode('TM052');
        return;
      }
    }
    this.view.dataService.delete([deleteItem]).subscribe((res) => {
      if (!res) {
        this.notificationsService.notifyCode('SYS022');
      }
    });
  }

  closeEditForm(evt?: any) {
    if (evt) {
      this.dialog && this.dialog.close();
    }
  }

  getDetailBooking(id: any) {
    this.api
      .exec<any>(
        'EP',
        'BookingsBusiness',
        'GetBookingByIDAsync',
        this.itemDetail?.recID
      )
      .subscribe((res) => {
        if (res) {
          this.itemDetail = res;
          this.detectorRef.detectChanges();
        }
      });
  }

  changeItemDetail(event) {
    let recID = '';
    if (event?.data) {
      recID = event.data.recID;
      this.itemDetail = event?.data;
    } else if (event?.recID) {
      recID = event.recID;
      this.itemDetail = event;
    }
    this.getDetailBooking(recID);
  }

  closeAddForm(event) {}
}
