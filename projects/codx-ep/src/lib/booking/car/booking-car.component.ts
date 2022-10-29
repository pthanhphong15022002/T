import {
  Component,
  TemplateRef,
  ViewChild,
  Injector,
  AfterViewInit,
} from '@angular/core';
import {
  ResourceModel,
  DialogRef,
  SidebarModel,
  UIComponent,
  FormModel,
  CallFuncService,
  NotificationsService,
  AuthService,
} from 'codx-core';
import { ButtonModel, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { DataRequest } from '@shared/models/data.request';
import { PopupAddBookingCarComponent } from './popup-add-booking-car/popup-add-booking-car.component';
import { CodxEpService, ModelPage } from '../../codx-ep.service';
@Component({
  selector: 'booking-car',
  templateUrl: 'booking-car.component.html',
  styleUrls: ['booking-car.component.scss'],
})
export class BookingCarComponent extends UIComponent implements AfterViewInit {
  @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('chart') chart: TemplateRef<any>;
  @ViewChild('resourceHeader') resourceHeader!: TemplateRef<any>;
  @ViewChild('resourceTootip') resourceTootip!: TemplateRef<any>;
  @ViewChild('footerButton') footerButton?: TemplateRef<any>;
  @ViewChild('footer') footerTemplate?: TemplateRef<any>;
  @ViewChild('contentTmp') contentTmp?: TemplateRef<any>;
  @ViewChild('mfButton') mfButton?: TemplateRef<any>;
  @ViewChild('itemTemplate') template!: TemplateRef<any>;
  @ViewChild('panelRightRef') panelRight?: TemplateRef<any>;

  showToolBar = 'true';
  service = 'EP';
  assemblyName = 'EP';
  entityName = 'EP_Bookings';
  className = 'BookingsBusiness';
  method = 'GetListBookingAsync';
  idField = 'recID';
  predicate = 'ResourceType=@0';
  dataValue = '2';
  optionalData:any;
  viewType = ViewType;
  formModel: FormModel;
  modelResource?: ResourceModel;
  request?: ResourceModel;
  model = new DataRequest();
  dataSelected: any;
  isAdd = true;
  isCollapsed = true;
  dialog!: DialogRef;
  views: Array<ViewModel> = [];
  buttons: ButtonModel;
  moreFunc: Array<ButtonModel> = [];
  fields: any;
  resourceField: any;
  funcID: string;
  itemDetail;
  popupTitle = '';
  funcIDName = '';
  columnsGrid: any;
  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService,
    private callFuncService: CallFuncService,
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
        this.funcIDName = res.customName.toString().toLowerCase();
      }
    });
    this.funcID = this.router.snapshot.params['funcID'];
    this.codxEpService.getFormModel(this.funcID).then((res) => {
      if (res) {
        this.formModel = res;
      }
    });
  }

  onInit(): void {
    this.request = new ResourceModel();
    this.request.assemblyName = 'EP';
    this.request.className = 'BookingsBusiness';
    this.request.service = 'EP';
    this.request.method = 'GetListBookingAsync';
    this.request.predicate = 'ResourceType=@0';
    this.request.dataValue = '2';
    this.request.idField = 'recID';

    this.modelResource = new ResourceModel();
    this.modelResource.assemblyName = 'EP';
    this.modelResource.className = 'BookingsBusiness';
    this.modelResource.service = 'EP';
    this.modelResource.method = 'GetResourceAsync';
    this.modelResource.predicate = 'ResourceType=@0';
    this.modelResource.dataValue = '2';

    // this.model.page = 1;
    // this.model.pageSize = 200;
    // this.model.predicate = 'ResourceType=@0';
    // this.model.dataValue = '2';

    this.moreFunc = [
      {
        id: 'btnEdit',
        icon: 'icon-list-chechbox',
        text: 'Sửa',
      },
      {
        id: 'btnDelete',
        icon: 'icon-list-chechbox',
        text: 'Xóa',
      },
    ];

    this.fields = {
      id: 'bookingNo',
      subject: { name: 'title' },
      startTime: { name: 'startDate' },
      endTime: { name: 'endDate' },
      resourceId: { name: 'resourceID' },
    };

    this.resourceField = {
      Name: 'Resources',
      Field: 'resourceID',
      IdField: 'resourceID',
      TextField: 'resourceName',
      Title: 'Resources',
    };

    this.buttons = {
      id: 'btnAdd',
    };
  }

  ngAfterViewInit(): void {
    this.viewBase.dataService.methodDelete = 'DeleteBookingAsync';
    this.views = [
      {
        sameData: false,
        type: ViewType.schedule,
        active: true,
        request2: this.modelResource,
        request: this.request,
        //toolbarTemplate: this.footerButton,
        showSearchBar: false,
        model: {
          //panelLeftRef:this.panelLeft,
          eventModel: this.fields,
          resourceModel: this.resourceField,
          //template:this.cardTemplate,
          template4: this.resourceHeader,
          //template5: this.resourceTootip,
          template6: this.mfButton, //header
          template8: this.contentTmp, //content
          statusColorRef: 'vl003',
        },
      },
      {
        id: '2',
        type: ViewType.listdetail,
        sameData: true,
        active: false,
        model: {
          template: this.template,
          panelRightRef: this.panelRight,
        },
      },
      // {
      //   sameData: true,
      //   id: '3',
      //   type: ViewType.chart,
      //   active: true,
      //   model: {
      //     panelLeftRef: this.chart,
      //   },
      // },
    ];
    this.detectorRef.detectChanges();
  }
  onActionClick(evt?){
    if(evt.type=='add'){
      this.addNew(evt.data);
    }
  }
  changeDataMF(event, data:any) {        
    if(event!=null && data!=null){
      event.forEach(func => {        
        func.disabled=true;        
      });
      if(data.status=='1'){
        event.forEach(func => {
          if(func.functionID == "SYS02" /*MF sửa*/ || func.functionID == "SYS03"/*MF xóa*/ || func.functionID == "SYS04"/*MF chép*/)
          {
            func.disabled=false;
          }
        });  
      }
      else{
        event.forEach(func => {
          if(func.functionID == "SYS04"/*MF chép*/)
          {
            func.disabled=false;
          }
        });  
      }
    }
  }
  click(evt: ButtonModel) {
    this.popupTitle = evt?.text + ' ' + this.funcIDName;
    switch (evt.id) {
      case 'btnAdd':
        this.addNew();
        break;
      case 'btnEdit':
        this.edit();
        break;
      case 'btnDelete':
        this.delete();
        break;
    }
  }
  changeItemDetail(event) {
    this.itemDetail = event?.data;
  }
  setPopupTitle(mfunc) {
    this.popupTitle = mfunc + ' ' + this.funcIDName;
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

  addNew(evt?: any) {
    if(evt!=null)
    {
      this.optionalData=evt;
    }
    else{
      this.optionalData=null;
    }
    this.viewBase.dataService.addNew().subscribe((res) => {
      let option = new SidebarModel();
      option.Width = '800px';
      option.DataService = this.viewBase?.dataService;
      option.FormModel = this.formModel;
      this.dialog = this.callFuncService.openSide(
        PopupAddBookingCarComponent,
        [this.viewBase?.dataService?.dataSelected, true, this.popupTitle,this.optionalData],
        option
      );
    });
  }

  edit(obj?) {
    if (obj) {
      if (this.authService.userValue.userID != obj.owner) {
        this.notificationsService.notifyCode('TM052');
        return;
      }
      this.viewBase.dataService.dataSelected = obj;
      this.viewBase.dataService
        .edit(this.viewBase?.dataService?.dataSelected)
        .subscribe((res) => {
          this.dataSelected = this.viewBase.dataService.dataSelected;
          let option = new SidebarModel();
          option.Width = '800px';
          option.DataService = this.viewBase?.dataService;
          option.FormModel = this.formModel;
          this.dialog = this.callFuncService.openSide(
            PopupAddBookingCarComponent,
            [this.viewBase.dataService.dataSelected, false, this.popupTitle],
            option
          );
        });
    }
  }

  copy(obj?) {
    if (obj) {      
      this.viewBase.dataService.dataSelected = obj;
      this.viewBase.dataService
        .edit(this.viewBase?.dataService?.dataSelected)
        .subscribe((res) => {
          this.dataSelected = this.viewBase.dataService.dataSelected;
          let option = new SidebarModel();
          option.Width = '800px';
          option.DataService = this.viewBase?.dataService;
          option.FormModel = this.formModel;
          this.dialog = this.callFuncService.openSide(
            PopupAddBookingCarComponent,
            [this.viewBase.dataService.dataSelected, true, this.popupTitle,null,true],
            option
          );
        });
    }
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

  clickMF(event, data) {
    this.popupTitle = event?.text + ' ' + this.funcIDName;
    switch (event?.functionID) {
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS04':
        this.copy(data);
        break;
    }
  }

  onSelect(obj: any) {
    //console.log(obj);
  }
}
