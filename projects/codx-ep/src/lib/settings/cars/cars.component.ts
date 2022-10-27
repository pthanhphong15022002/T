import {
  Component,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  Input,
  Injector,
} from '@angular/core';
import {
  ButtonModel,
  CacheService,
  CodxGridviewComponent,
  DialogRef,
  FormModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { Device } from '../../booking/car/popup-add-booking-car/popup-add-booking-car.component';
import { CodxEpService } from '../../codx-ep.service';
import { PopupAddCarsComponent } from './popup-add-cars/popup-add-cars.component';

@Component({
  selector: 'setting-cars',
  templateUrl: 'cars.component.html',
  styleUrls: ['cars.component.scss'],
})
export class CarsComponent extends UIComponent implements AfterViewInit {
  //@ViewChild('view') viewBase: ViewsComponent;

  @ViewChild('resourceNameCol') resourceNameCol: TemplateRef<any>;
  @ViewChild('locationCol') locationCol: TemplateRef<any>;
  @ViewChild('equipmentsCol') equipmentsCol: TemplateRef<any>;
  @ViewChild('ownerCol') ownerCol: TemplateRef<any>;
  @ViewChild('linkCol') linkCol: TemplateRef<any>;

  @Input() data!: any;

  service = 'EP';
  assemblyName = 'EP';
  entityName = 'EP_Resources';
  predicate = 'ResourceType=@0';
  dataValue = '2';
  idField = 'recID';
  className = 'ResourcesBusiness';
  method = 'GetListAsync';

  vllDevices = [];
  views: Array<ViewModel> = [];
  viewType = ViewType;
  buttons: ButtonModel;
  moreFuncs: Array<ButtonModel> = [];
  dialog!: DialogRef;
  isAdd = true;
  funcID: string;
  columnsGrid: any;
  grView: any;
  formModel: FormModel;
  funcIDName: any;
  dialogRef: DialogRef;
  isAfterRender = false;
  str: string;
  dataSelected: any;
  devices: any;
  carsEquipments = [];
  temp: string;
  columnGrids: any;
  grvCars: any;
  popupTitle = '';
  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService,
    private cacheService: CacheService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
    this.codxEpService.getFormModel(this.funcID).then((res) => {
      if (res) {
        this.formModel = res;
        this.isAfterRender = true;
        this.cache.functionList(this.funcID).subscribe((res) => {
          if (res) {
            this.funcIDName = res.customName.toString().toLowerCase();
          }
        });
      }
    });
  }
  onInit(): void {
    //this.view.dataService.methodDelete = 'DeleteResourceAsync';

    this.cache.valueList('EP012').subscribe((res) => {
      this.vllDevices = res.datas;
      this.vllDevices.forEach((item) => {
        let device = new Device();
        device.id = item.value;
        device.text = item.text;
        device.icon = item.icon;
        this.carsEquipments.push(device);
        this.carsEquipments = JSON.parse(JSON.stringify(this.carsEquipments));
      });
    });
  }
  ngAfterViewInit(): void {
    this.buttons = {
      id: 'btnAdd',
    };

    this.detectorRef.detectChanges();
  }
  onLoading(evt: any) {
    let formModel = this.view.formModel;
    if (formModel) {
      this.cache
        .gridViewSetup(formModel?.formName, formModel?.gridViewName)
        .subscribe((gv) => {
          this.grvCars = gv;
          this.columnGrids = [
            {
              field: 'resourceName',
              headerText: gv['ResourceName'].headerText,
              template: this.resourceNameCol,
              width: '25%',
            },
            {
              headerText: gv['CompanyID'].headerText,
              width: '15%',
              field: 'companyID',
              template: this.locationCol,
            },
            {
              headerText: gv['Equipments'].headerText,
              width: '10%', //gv['Equipments'].width,
              field: 'equipments',
              template: this.equipmentsCol,
              headerTextAlign: 'Center',
              textAlign: 'Center',
            },
            {
              headerText: gv['Note'].headerText,
              textAlign: 'center',
              width: '20%',
              field: 'note',
            },
            {
              headerText: gv['LinkID'].headerText,
              width: '15%', //width:gv['Owner'].width,
              template: this.linkCol,
            },
            {
              headerText: gv['Owner'].headerText,
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
              },
            },
          ];
          this.detectorRef.detectChanges();
        });
    }
  }
  openPopupDevice(template: any, lstEquipments?) {
    this.carsEquipments.forEach((element) => {
      element.isSelected = false;
    });
    this.carsEquipments.forEach((element) => {
      lstEquipments.forEach((item) => {
        if (element.id == item.equipmentID) {
          element.isSelected = true;
        }
      });
    });
    var dialog = this.callfc.openForm(template, '', 550, 350);
    this.detectorRef.detectChanges();
  }

  clickMF(event, data) {
    console.log(event);
    this.popupTitle = event?.text + ' ' + this.funcIDName;
    switch (event?.functionID) {
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS02':
        this.delete(data);
        break;
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

  addNew() {
    this.view.dataService.addNew().subscribe((res) => {
      this.dataSelected = this.view.dataService.dataSelected;
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.view?.dataService;
      option.FormModel = this.formModel;
      this.dialog = this.callfc.openSide(
        PopupAddCarsComponent,
        [this.dataSelected, true, this.popupTitle],
        option
      );
      this.dialog.closed.subscribe((x) => {
        if (x.event == null && this.view.dataService.hasSaved)
          this.view.dataService
            .delete([this.view.dataService.dataSelected])
            .subscribe((x) => {
              this.changeDetectorRef.detectChanges();
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
          this.dataSelected = this.view?.dataService?.dataSelected;
          let option = new SidebarModel();
          option.Width = '550px';
          option.DataService = this.view?.dataService;
          option.FormModel = this.formModel;
          this.dialog = this.callfc.openSide(
            PopupAddCarsComponent,
            [this.view.dataService.dataSelected, false, this.popupTitle],
            option
          );
          this.dialog.closed.subscribe((x) => {
            if (x?.event) {
              x.event.modifiedOn = new Date();
              this.view.dataService.update(x.event).subscribe((res) => {});
            }
          });
        });
    }
  }

  delete(obj?) {
    this.view.dataService.methodDelete = 'DeleteResourceAsync';
    if (obj) {
      this.view.dataService.delete([obj], true).subscribe((res) => {
        if (res) {
          this.api
            .execSv(
              'DM',
              'ERM.Business.DM',
              'FileBussiness',
              'DeleteByObjectIDAsync',
              [obj.recID, 'EP_Cars', true]
            )
            .subscribe();
          this.detectorRef.detectChanges();
        }
      });
    }
  }

  copy(evt) {
    this.view.dataService.dataSelected = evt?.data;
    this.view.dataService.copy().subscribe((res: any) => {
      if (!res) return;
      this.view.dataService.dataSelected = res;
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      this.dialog = this.callfc.openSide(
        PopupAddCarsComponent,
        {
          data: evt?.data,
          isAdd: false,
          //headerText: evt.text + ' ' + this.funcList?.customName ?? '',
          type: 'copy',
          oldRecID: evt?.data?.recID,
        },
        option
      );
      this.dialog.closed.subscribe((x) => {
        if (!res?.event) this.view.dataService.clear();
        if (x.event == null) {
          this.view.dataService
            .remove(this.view.dataService.dataSelected)
            .subscribe();
        }
      });
    });
  }
}
