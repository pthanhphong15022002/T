import {
  Component,
  TemplateRef,
  ViewChild,
  Injector,
  AfterViewInit,
} from '@angular/core';
import { ResourceModel, DialogRef, SidebarModel, UIComponent, FormModel, CallFuncService } from 'codx-core';
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
  @ViewChild('base') viewBase: ViewsComponent;
  @ViewChild('chart') chart: TemplateRef<any>;
  @ViewChild('resourceHeader') resourceHeader!: TemplateRef<any>;
  @ViewChild('resourceTootip') resourceTootip!: TemplateRef<any>;
  @ViewChild('footerButton') footerButton?: TemplateRef<any>;
  @ViewChild('footer') footerTemplate?: TemplateRef<any>;
  @ViewChild('contentTmp') contentTmp?: TemplateRef<any>;
  @ViewChild('mfButton') mfButton?: TemplateRef<any>;
  @ViewChild('itemTemplate') template!: TemplateRef<any>;
  @ViewChild('panelRightRef') panelRight?: TemplateRef<any>;

  service = 'EP';
  assemblyName = 'EP';
  entityName = 'EP_Bookings';
  predicate = 'ResourceType=@0';
  dataValue = '2';
  idField = 'RecID';
  className = 'BookingsBusiness';
  method = 'GetListBookingAsync';
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
  popupTitle='';
  funcIDName='';
  columnsGrid: any;
  constructor(
    private injector: Injector,    
    private codxEpService: CodxEpService,
    private callFuncService:CallFuncService,
    ) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
    this.codxEpService.getFormModel(this.funcID).then((res) => {
      if (res) {
        this.formModel = res;
      }
    });
    this.cache.functionList(this.funcID).subscribe(res => {
      if (res) {            
        this.funcIDName = res.customName.toString().toLowerCase();
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
         template5: this.resourceTootip,
         template6: this.mfButton,//header          
         template8: this.contentTmp,//content
         statusColorRef: 'vl003',
        },
      },{
        id: '2',
        type: ViewType.listdetail,
        sameData: true,
        active: false,
        model: {
          template: this.template,
          panelRightRef: this.panelRight,
        },
      },
      {
        sameData: true,
        id: '3',
        type: ViewType.chart,
        active: true,
        model: {
          panelLeftRef: this.chart,
        },
      },
    ];
    this.detectorRef.detectChanges();
  }

  click(evt: ButtonModel) {
    this.popupTitle=evt?.text + " " + this.funcIDName;
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
    this.viewBase.dataService.addNew().subscribe((res) => {
      let option = new SidebarModel();
      option.Width = '800px';
      option.DataService = this.viewBase?.dataService;
      option.FormModel = this.formModel;
      this.dialog = this.callFuncService.openSide(
        PopupAddBookingCarComponent,
        [this.viewBase?.dataService?.dataSelected, true,this.popupTitle],
        option
      );
    });
  }

  edit(obj?) {
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
            [this.viewBase.dataService.dataSelected, false,this.popupTitle],
            option
          );
        });
    }
  }
  delete(evt?) {
    let deleteItem = this.viewBase.dataService.dataSelected;
    if (evt) {
      deleteItem = evt;
    }
    this.viewBase.dataService.delete([deleteItem]).subscribe((res) => {
      console.log(res);
    });
  }

  closeEditForm(evt?: any) {
    if (evt) {
      this.dialog && this.dialog.close();
    }
  }

  clickMF(event, data) {
    this.popupTitle=event?.text + " " + this.funcIDName;
    console.log(event);
    switch (event?.functionID) {
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS02':
        this.delete(data);
        break;
    }
  }
  

  onSelect(obj: any) {
    console.log(obj);
  }
}
