import {
  Component,
  TemplateRef,
  Injector,
  ViewChild,
  Input,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import {
  ButtonModel,
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
import { PopupAddDriversComponent } from './popup-add-drivers/popup-add-drivers.component';

@Component({
  selector: 'setting-drivers',
  templateUrl: './drivers.component.html',
  styleUrls: ['./drivers.component.scss'],
})
export class DriversComponent extends UIComponent implements AfterViewInit {
  @ViewChild('resourceNameCol') resourceNameCol: TemplateRef<any>;
  @ViewChild('locationCol') locationCol: TemplateRef<any>;
  @ViewChild('ownerCol') ownerCol: TemplateRef<any>;
  @ViewChild('carCol') carCol: TemplateRef<any>;
  @ViewChild('noteCol') noteCol: TemplateRef<any>;
  @ViewChild('equipmentsCol') equipmentsCol: TemplateRef<any>;

  @Input() data!: any;

  service = 'EP';
  assemblyName = 'EP';
  entityName = 'EP_Resources';
  predicate = 'ResourceType=@0';
  dataValue = '3';
  idField = 'recID';
  className = 'ResourcesBusiness';
  method = 'GetListAsync';
  viewType = ViewType;
  views: Array<ViewModel> = [];
  moreFuncs: Array<ButtonModel> = [];
  buttons: ButtonModel;

  vllDevices = [];
  carsEquipments = [];
  funcID: string;
  columnsGrid;
  dataSelected: any;
  dialog!: DialogRef;
  formModel: FormModel;
  columnGrids: any;
  grvDrivers: any;
  funcIDName: any;
  popupTitle = '';

  isAfterRender = false;
  popupClosed =true;

  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService,
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
          this.grvDrivers = gv;
          this.columnGrids = [
            {
              field: 'resourceName',
              headerText: gv['ResourceName'].headerText,
              template: this.resourceNameCol,
              width: '20%',
            },
            {
              headerText: gv['CompanyID'].headerText,
              field: 'company',
              template: this.locationCol,
            },

            {
              headerText: gv['LinkID'].headerText,
              //width:gv['Owner'].width,
              template: this.carCol,
              width: '20%',
            },
            // {
            //   headerText: gv['Equipments'].headerText,
            //   width: 200,//gv['Equipments'].width,
            //   field: 'equipments',
            //   template: this.equipmentsCol,
            //   headerTextAlign: 'Center',
            //   textAlign: 'Center',
            // },
            {
              headerText: gv['Owner'].headerText,
              //width:gv['Owner'].width,
              template: this.ownerCol,
            },
            {
              headerText: gv['Note'].headerText,
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
    if (this.popupClosed) {
      this.view.dataService.addNew().subscribe((res) => {
        this.popupClosed = false;
        this.dataSelected = this.view.dataService.dataSelected;
        let option = new SidebarModel();
        option.Width = '550px';
        option.DataService = this.view?.dataService;
        option.FormModel = this.formModel;
        this.dialog = this.callfc.openSide(
          PopupAddDriversComponent,
          [this.dataSelected, true, this.popupTitle],
          option
        );
        this.dialog.closed.subscribe((x) => {
          this.popupClosed = true;
          if (!x.event) this.view.dataService.clear();
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
  }

  edit(obj?) {
    if (obj) {
      if (this.popupClosed) {
        this.view.dataService.dataSelected = obj;
        this.view.dataService
          .edit(this.view.dataService.dataSelected)
          .subscribe((res) => {
            this.popupClosed = false;
            this.dataSelected = this.view?.dataService?.dataSelected;
            let option = new SidebarModel();
            option.Width = '550px';
            option.DataService = this.view?.dataService;
            option.FormModel = this.formModel;
            this.dialog = this.callfc.openSide(
              PopupAddDriversComponent,
              [this.view.dataService.dataSelected, false, this.popupTitle],
              option
            );
            this.dialog.closed.subscribe((x) => {
              this.popupClosed = true;
              if (!x.event) this.view.dataService.clear();
              if (x?.event) {
                x.event.modifiedOn = new Date();
                this.view.dataService.update(x.event).subscribe((res) => {});
              }
            });
          });
      }
    }
  }

  copy(obj?) {
    if (obj) {
      if (this.popupClosed) {
        this.view.dataService.dataSelected = obj;
        this.view.dataService
          .edit(this.view.dataService.dataSelected)
          .subscribe((res) => {
            this.popupClosed = false;
            this.dataSelected = this.view?.dataService?.dataSelected;
            let option = new SidebarModel();
            option.Width = '550px';
            option.DataService = this.view?.dataService;
            option.FormModel = this.formModel;
            this.dialog = this.callfc.openSide(
              PopupAddDriversComponent,
              [this.view.dataService.dataSelected, true, this.popupTitle],
              option
            );
            this.dialog.closed.subscribe((x) => {
              this.popupClosed = true;
              if (!x.event) this.view.dataService.clear();
              if (x?.event) {
                x.event.modifiedOn = new Date();
                this.view.dataService.update(x.event).subscribe((res) => {});
              }
            });
          });
      }
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
              [obj.recID, 'EP_Resources', true]
            )
            .subscribe();
          this.detectorRef.detectChanges();
        }
      });
    }
  }
}
