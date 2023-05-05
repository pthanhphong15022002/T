import { EPCONST } from 'projects/codx-ep/src/lib/codx-ep.constant';
import {
  Component,
  TemplateRef,
  ViewChild,
  Injector,
  ChangeDetectorRef,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  ButtonModel,
  DialogRef,
  FormModel,
  NotificationsService,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxEpService } from 'projects/codx-ep/src/public-api';
import { Device } from '../models/equipments.model';
import { PopupAddResourcesComponent } from './popup-add-resources/popup-add-resources.component';
import { PopupAddCardTransComponent } from '../car/cardTran/popup-add-cardTrans/popup-add-cardTrans.component';
import { ResourceTrans } from '../models/resource.model';
import { PopupAddQuotaComponent } from './popup-add-quota/popup-add-quota.component';
import { PopupUpdateQuantityComponent } from './popup-update-quantity/popup-update-quantity.component';
import { PopupAddStationeryComponent } from './popup-add-stationery/popup-add-stationery.component';

@Component({
  selector: 'resources-category',
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.scss'],
})
export class ResourcesComponent extends UIComponent {
  //View Child
  @ViewChild('mfCol') mfCol: TemplateRef<any>;
  @ViewChild('roomNameCol') roomNameCol: TemplateRef<any>;
  @ViewChild('carNameCol') carNameCol: TemplateRef<any>;
  @ViewChild('driverNameCol') driverNameCol: TemplateRef<any>;

  @ViewChild('locationCol') locationCol: TemplateRef<any>;
  @ViewChild('companyCol') companyCol: TemplateRef<any>;
  @ViewChild('equipmentsCol') equipmentsCol: TemplateRef<any>;
  @ViewChild('ownerCol') ownerCol: TemplateRef<any>;

  @ViewChild('noteCol') noteCol: TemplateRef<any>;
  @ViewChild('preparatorCol') preparatorCol: TemplateRef<any>;
  @ViewChild('linkCol') linkCol: TemplateRef<any>;
  @ViewChild('carCol') carCol: TemplateRef<any>;

  @ViewChild('cardNameCol') cardNameCol: TemplateRef<any>;
  @ViewChild('cardIDCol') cardIDCol: TemplateRef<any>;
  @ViewChild('cardStatus') cardStatus: TemplateRef<any>;
  @ViewChild('cardImgCol') cardImgCol: TemplateRef<any>;

  @ViewChild('columnsList') columnsList: TemplateRef<any>;
  @ViewChild('templateListCard') templateListCard: TemplateRef<any>;
  //---------------------------------------------------------//
  service = 'EP';
  assemblyName = 'EP';
  entityName = 'EP_Resources';
  idField = 'recID';
  className = 'ResourcesBusiness';
  method = 'GetListAsync';

  //---------------------------------------------------------//
  views: Array<ViewModel> = [];
  formModel: FormModel;
  viewType = ViewType;
  columnGrids: any;
  dialog!: DialogRef;
  buttons = {
    id: 'btnAdd',
  };
  //---------------------------------------------------------//
  vllDevices = [];
  funcID: string;
  resourceEquipments = [];
  moreFunc: any;
  funcIDName: any;
  popupTitle = '';
  resourceGridView: any;
  isPriceVisible = false;
  popupComponent:any;
  //---------------------------------------------------------//
  fmGetCard: FormModel;
  fmReturnCard: FormModel;
  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService,
    private notificationsService: NotificationsService
  ) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  onInit(): void {
    this.getCacheData();
    
    if(this.funcID==EPCONST.FUNCID.S_Category){
      this.popupComponent= PopupAddStationeryComponent;
    }
    else{
      this.popupComponent= PopupAddResourcesComponent;
    }
  }

  ngAfterViewInit(): void {  

    this.view.dataService.methodDelete = 'DeleteResourceAsync';
    this.detectorRef.detectChanges();
  }
  onLoading(evt: any) {
    let formModel = this.view?.formModel;
    if (formModel) {
      this.cache
        .gridViewSetup(formModel?.formName, formModel?.gridViewName)
        .subscribe((gv) => {
          this.resourceGridView = gv;
          switch (this.funcID) {
            case EPCONST.FUNCID.R_Category:
              this.roomCategory();
              break;
            case EPCONST.FUNCID.C_Category:
              this.carCategory();
              break;
            case EPCONST.FUNCID.DR_Category:
              this.driverCategory();
              break;
            case EPCONST.FUNCID.CA_Category:
              this.cardCategory();
              break;
            case EPCONST.FUNCID.S_Category:
              this.stationeryCategory();
              break;
          }
          this.detectorRef.detectChanges();
        });
    }
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Cache Data--------------------------------//
  //---------------------------------------------------------------------------------//
  getCacheData() {
    this.codxEpService.getFormModel(this.funcID).then((res) => {
      if (res) {
        this.formModel = res;
        this.cache.functionList(this.funcID).subscribe((res) => {
          if (res) {
            this.funcIDName = res.customName.toString().toLowerCase();
          }
        });
      }
    });

    this.cache.valueList('EP012').subscribe((res) => {
      this.vllDevices = res.datas;
      this.vllDevices.forEach((item) => {
        let device = new Device();
        device.id = item.value;
        device.text = item.text;
        device.icon = item.icon;
        this.resourceEquipments.push(device);
        this.resourceEquipments = JSON.parse(
          JSON.stringify(this.resourceEquipments)
        );
      });
    });

    this.codxEpService.getEPStationerySetting('1').subscribe((res: any) => {
      if (res) {
        let dataValue = res.dataValue;
        let json = JSON.parse(dataValue);
        this.isPriceVisible = json.ShowUnitPrice ?? false;
      }
    });
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Event------------------------------------//
  //---------------------------------------------------------------------------------//
  clickMF(event, data) {
    this.popupTitle = event?.text + ' ' + this.funcIDName;
    switch (event?.functionID) {
      case EPCONST.MFUNCID.Delete:
        this.delete(data);
        break;
      case EPCONST.MFUNCID.Edit:
        this.edit(data);
        break;
      case EPCONST.MFUNCID.Copy:
        this.copy(data);
        break;
      case EPCONST.MFUNCID.CA_GetCard:
        this.cardTrans(EPCONST.FUNCID.CA_Get, event?.text, data);
        break;
      case EPCONST.MFUNCID.CA_ReturnCard:
        this.cardTrans(EPCONST.FUNCID.CA_Return, event?.text, data);
        break;
      case EPCONST.MFUNCID.CA_History:
        this.historyCard(event?.data?.url + '/' + data?.recID);
        break;
      case EPCONST.MFUNCID.S_UpdateQuantity:
        this.updateQuantity(data);
        break;
      case EPCONST.MFUNCID.S_Quota:
        this.addQuota(data);
        break;
    }
  }
  click(evt: ButtonModel) {
    this.popupTitle = evt?.text + ' ' + this.funcIDName;
    switch (evt.id) {
      case 'btnAdd':
        this.addNew();
        break;
    }
  }
  changeDataMF(e: any, data: any) {
    if (e != null && data != null) {
      e.forEach((func) => {
        if (
          func.functionID == EPCONST.MFUNCID.Edit ||
          func.functionID == EPCONST.MFUNCID.Delete ||
          func.functionID == EPCONST.MFUNCID.Copy
        ) {
          func.disabled = false;
        }

        if (data.status == '1') {
          e.forEach((func) => {
            if (func.functionID == EPCONST.MFUNCID.CA_GetCard /*MF cấp*/) {
              func.disabled = true;
            }
          });
        } else {
          e.forEach((func) => {
            if (func.functionID == EPCONST.MFUNCID.CA_ReturnCard /*MF trả*/) {
              func.disabled = true;
            }
          });
        }
      });
    }
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Func-----------------------------------//
  //---------------------------------------------------------------------------------//
  roomCategory() {
    this.columnGrids = [
      {
        field: '',
        headerText: '',
        width: 40,
        template: this.mfCol,
        textAlign: 'Center',
      },
      {
        field: 'resourceName',
        headerText: this.resourceGridView['ResourceName'].headerText,
        width: '25%',
        template: this.roomNameCol,
      },
      {
        headerText: this.resourceGridView['Location'].headerText,
        width: '15%', //width: gv['Location'].width,
        field: 'location',
        template: this.locationCol,
      },
      {
        headerText: this.resourceGridView['Equipments'].headerText,
        width: '10%', //gv['Equipments'].width,
        field: 'equipments',
        template: this.equipmentsCol,
      },
      {
        headerText: this.resourceGridView['Note'].headerText,
        width: '20%', //width: gv['Note'].width,
        template: this.noteCol,
        field: 'note',
      },
      {
        headerText: this.resourceGridView['Owner'].headerText,
        width: '15%',
        template: this.ownerCol,
      },
      {
        headerText: this.resourceGridView['Preparator'].headerText,
        width: '15%',
        template: this.preparatorCol,
      },
    ];
    this.views = [
      {
        sameData: true,
        type: ViewType.grid,
        active: true,
        model: {
          resources: this.columnGrids,
          hideMoreFunc: true,
        },
      },
    ];
  }

  carCategory() {
    this.columnGrids = [
      {
        field: '',
        headerText: '',
        width: 40,
        template: this.mfCol,
        textAlign: 'Center',
      },
      {
        field: 'resourceName',
        headerText: this.resourceGridView['ResourceName'].headerText,
        template: this.carNameCol,
        width: '25%',
      },
      {
        headerText: this.resourceGridView['CompanyID'].headerText,
        width: '15%',
        field: 'companyID',
        template: this.companyCol,
      },
      {
        headerText: this.resourceGridView['Equipments'].headerText,
        width: '10%', //gv['Equipments'].width,
        field: 'equipments',
        template: this.equipmentsCol,
        //headerTextAlign: 'Center',
        // textAlign: 'Center',
      },
      {
        headerText: this.resourceGridView['Note'].headerText,
        //textAlign: 'center',
        width: '20%',
        template: this.noteCol,
        field: 'note',
      },
      {
        headerText: this.resourceGridView['LinkID'].headerText,
        width: '15%', //width:gv['Owner'].width,
        template: this.linkCol,
      },
      {
        headerText: this.resourceGridView['Owner'].headerText,
        width: '15%', //width:gv['Owner'].width,
        template: this.ownerCol,
      },
    ];
    this.views = [
      {
        sameData: true,
        type: ViewType.grid,
        active: true,
        model: {
          resources: this.columnGrids,
          hideMoreFunc: true,
        },
      },
    ];
  }

  driverCategory() {
    this.columnGrids = [
      {
        field: '',
        headerText: '',
        width: 40,
        template: this.mfCol,
        textAlign: 'center',
      },
      {
        field: 'resourceName',
        headerText: this.resourceGridView['ResourceName'].headerText,
        template: this.driverNameCol,
        width: '20%',
      },
      {
        headerText: this.resourceGridView['CompanyID'].headerText,
        field: 'company',
        template: this.companyCol,
      },

      {
        headerText: this.resourceGridView['LinkID'].headerText,
        //width:gv['Owner'].width,
        template: this.carCol,
        width: '20%',
      },
      {
        headerText: this.resourceGridView['Owner'].headerText,
        //width:gv['Owner'].width,
        template: this.ownerCol,
      },
      {
        headerText: this.resourceGridView['Note'].headerText,
        field: 'note',
        template: this.noteCol,
      },
    ];
    this.views = [
      {
        sameData: true,
        type: ViewType.grid,
        active: true,
        model: {
          resources: this.columnGrids,
          hideMoreFunc: true,
        },
      },
    ];
  }

  cardCategory() {
    this.columnGrids = [
      {
        field: '',
        headerText: '',
        width: 40,
        template: this.mfCol,
        textAlign: 'center',
      },
      {
        field: 'resourceID',
        template: this.cardIDCol,
        headerText: this.resourceGridView['ResourceID'].headerText,
      },
      {
        field: 'resourceName',
        template: this.cardNameCol,
        headerText: this.resourceGridView['ResourceName'].headerText,
        width: '20%',
      },
      {
        headerText: this.resourceGridView['Icon'].headerText,
        template: this.cardImgCol,
        textAlign: 'Center',
        headerTextAlign: 'Center',
        width: '15%',
      },
      {
        field: 'status',
        headerText: this.resourceGridView['Status'].headerText,
        textAlign: 'Center',
        headerTextAlign: 'Center',
        template: this.cardStatus,
      },
      {
        field: 'note',
        template: this.noteCol,
        headerText: this.resourceGridView['Note'].headerText,
      },
      {
        headerText: this.resourceGridView['Owner'].headerText,
        template: this.ownerCol,
      },
    ];
    this.views = [
      {
        sameData: true,
        type: ViewType.grid,
        active: true,
        model: {
          resources: this.columnGrids,
          hideMoreFunc: true,
        },
      },
    ];
  }

  stationeryCategory() {
    this.views = [
      {
        type: ViewType.card,
        sameData: true,
        active: true,
        model: {
          template: this.templateListCard,
        },
      },
      {
        type: ViewType.list,
        sameData: true,
        active: false,
        model: {
          template: this.columnsList,
        },
      },
    ];
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Popup-----------------------------------------//
  //---------------------------------------------------------------------------------//

  openPopupDevice(template: any, lstEquipments?) {
    this.resourceEquipments.forEach((element) => {
      element.isSelected = false;
    });
    this.resourceEquipments.forEach((element) => {
      lstEquipments.forEach((item) => {
        if (element.id == item.equipmentID) {
          element.isSelected = true;
        }
      });
    });
    let dialog = this.callfc.openForm(template, '', 550, 560);
    this.detectorRef.detectChanges();
  }

  addNew() {
    this.view.dataService.addNew().subscribe((res) => {
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.view?.dataService;
      option.FormModel = this.formModel;
      this.view.dataService.dataSelected=res;
      let dialog = this.callfc.openSide(
        this.popupComponent,
        [
          this.view?.dataService?.dataSelected,
          true,
          this.popupTitle,
          this.funcID,
        ],
        option
      );
      dialog.closed.subscribe((x) => {
        if (!x.event) this.view.dataService.clear();
        if (x.event == null && this.view.dataService.hasSaved)
          this.view.dataService
            .delete([this.view.dataService.dataSelected])
            .subscribe((x) => {
              this.detectorRef.detectChanges();
            });
        else if (x.event) {
          x.event.modifiedOn = new Date();
          this.view.dataService.update(x.event).subscribe();
        }
      });
    });
  }

  edit(obj?) {
    if (obj) {
      this.view.dataService.dataSelected = obj;
      this.view.dataService
        .edit(this.view.dataService.dataSelected)
        .subscribe((res) => {
          let option = new SidebarModel();
          option.Width = '550px';
          option.DataService = this.view?.dataService;
          option.FormModel = this.formModel;
          this.dialog = this.callfc.openSide(
            this.popupComponent,
            [
              this.view?.dataService?.dataSelected,
              false,
              this.popupTitle,
              this.funcID,
            ],
            option
          );
          this.dialog.closed.subscribe((x) => {
            if (!x.event) this.view.dataService.clear();
            if (x?.event) {
              x.event.modifiedOn = new Date();
              this.view.dataService.update(x.event).subscribe();
            }
          });
        });
    }
  }

  copy(obj?) {
    if (obj) {
      this.view.dataService.dataSelected = obj;
      this.view.dataService
        .copy(this.view.dataService.dataSelected)
        .subscribe((res) => {
          let option = new SidebarModel();
          option.Width = '550px';
          option.DataService = this.view?.dataService;
          option.FormModel = this.formModel;
          this.dialog = this.callfc.openSide(
            this.popupComponent,
            [
              this.view?.dataService?.dataSelected,
              true,
              this.popupTitle,
              this.funcID,
            ],
            option
          );
          this.dialog.closed.subscribe((x) => {
            if (!x.event) this.view.dataService.clear();
            if (x?.event) {
              x.event.modifiedOn = new Date();
              this.view.dataService.update(x.event).subscribe();
            }
          });
        });
    }
  }

  delete(obj?) {
    if (obj) {
      this.view.dataService.delete([obj], true).subscribe((res) => {
        if (res) {
          this.api
            .execSv(
              'DM',
              'ERM.Business.DM',
              'FileBussiness',
              'DeleteByObjectIDAsync',
              [obj.recID, 'EP_Resources', true]
            )
            .subscribe();
          this.detectorRef.detectChanges();
        }
      });
    }
  }

  historyCard(url: any) {
    this.codxService.navigate('', url);
  }

  cardTrans(funcID: string, popupTitle: string, data: any) {
    let curTran = new ResourceTrans();
    curTran.resourceID = data.resourceID;

    let dialog = this.callfc.openForm(
      PopupAddCardTransComponent,
      '',
      550,
      450,
      funcID,
      [curTran, funcID, popupTitle, null]
    );
    dialog.closed.subscribe((res) => {
      if (res?.event) {
        data.status = res?.event?.transType;
        this.view.dataService.update(data).subscribe();
      }
    });
  }
  addQuota(data) {
    this.callfc.openForm(PopupAddQuotaComponent, '', 500, null, '', [data]);
  }

  updateQuantity(data) {
    this.callfc
      .openForm(PopupUpdateQuantityComponent, '', 500, null, '', [
        data,
        this.view.dataService,
      ])
      .closed.subscribe((x) => {
        if (!x.event) this.view.dataService.clear();
        if (x.event == null && this.view.dataService.hasSaved)
          this.view.dataService
            .delete([this.view.dataService.dataSelected])
            .subscribe((x) => {
              this.detectorRef.detectChanges();
            });
        else if (x.event) {
          x.event.modifiedOn = new Date();
          this.view.dataService.update(x.event).subscribe();
        }
      });
  }
}
