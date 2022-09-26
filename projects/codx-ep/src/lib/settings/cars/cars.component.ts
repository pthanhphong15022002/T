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
  @ViewChild('view') viewBase: ViewsComponent;

  @ViewChild('resourceNameCol') resourceNameCol: TemplateRef<any>;
  @ViewChild('locationCol') locationCol: TemplateRef<any>;
  @ViewChild('equipmentsCol') equipmentsCol: TemplateRef<any>;
  @ViewChild('ownerCol') ownerCol: TemplateRef<any>;  
  @ViewChild('preparatorCol') preparatorCol: TemplateRef<any>;

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
  buttons: ButtonModel;
  moreFuncs: Array<ButtonModel> = [];
  dialog!: DialogRef;
  isAdd = true;
  funcID: string;
  columnsGrid: any;
  grView: any;
  formModel: FormModel;
  //fGroupAddDriver: FormGroup;
  dialogRef: DialogRef;
  isAfterRender = false;
  str: string;
  dataSelected: any;
  devices: any;
  carsEquipments=[];
  temp: string;
  columnGrids: any;
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
      }
    });
  }
  onInit(): void {
    //this.viewBase.dataService.methodDelete = 'DeleteResourceAsync';
    
    this.cache.valueList('EP012').subscribe((res) => {
      this.vllDevices = res.datas;
      this.vllDevices.forEach((item) => {
        let device = new Device();
        device.id = item.value;
        device.text = item.text;       
        this.carsEquipments.push(device);
        this.carsEquipments = JSON.parse(JSON.stringify(this.carsEquipments));
      });
    });
    
  }

  // ngAfterViewInit(): void {
  //   this.buttons = {
  //     id: 'btnAdd',
  //   };
  //   this.columnGrids = [
  //     // {
  //     //   field: 'resourceID',
  //     //   headerText: 'Mã xe',
  //     // },
  //     // {
  //     //   field: 'icon',
  //     //   headerText: 'Ảnh đại diện',
  //     //   template: this.avatar,
  //     // },
  //     // {
  //     //   field: 'resourceName',
  //     //   headerText: 'Tên xe',
  //     // },
  //     // {
  //     //   field: 'capacity',
  //     //   headerText: 'Số chỗ',
  //     // },
  //     // {
  //     //   headerText: 'Người điều phối',
  //     //   width: '20%',
  //     //   template: this.owner,
  //     // },
  //   ];
  //   this.views = [
  //     {
  //       sameData: true,
  //       id: '1',
  //       text: 'Danh mục xe',
  //       type: ViewType.grid,
  //       active: true,
  //       model: {
  //         resources: this.columnGrids,
  //       },
  //     },
  //   ];
  //   this.changeDetectorRef.detectChanges();
  // }

  ngAfterViewInit(): void {
    this.buttons = {
      id: 'btnAdd',
    };
    this.codxEpService.getFormModel(this.funcID).then((formModel) => {
      this.cache
        .gridViewSetup(this.formModel?.formName, this.formModel?.gridViewName)
        .subscribe((gv) => {
          this.columnGrids = [
            {
              field: 'resourceName',
              headerText: gv['ResourceName'].headerText,
              width: '300',//gv['ResourceID'].width,
              template: this.resourceNameCol,
            },
            {
              headerText: gv['Category'].headerText,
              //width: gv['Location'].width,
              field: 'category',
              template: this.locationCol,
            },
            {
              headerText: gv['Equipments'].headerText,
              //width: gv['Equipments'].width,
              field: 'equipments',
              template: this.equipmentsCol,
              headerTextAlign: 'Center',
              textAlign: 'Center',
            },          
            {
              headerText: gv['Note'].headerText,
              //width: gv['Note'].width,
              field: 'note',
              headerTextAlign: 'Center',  
              textAlign: 'Center',            
            },
            {
              headerText: 'Lái xe',//gv['Owner'].headerText,
              //width:gv['Owner'].width,
              width: 200,
              template: this.preparatorCol,
              headerTextAlign: 'Center',
            },
            {
              headerText: gv['Owner'].headerText,
              //width:gv['Owner'].width,
              width: 200,
              template: this.ownerCol,
              headerTextAlign: 'Center',
            },
          ];
          this.views = [
            {
              sameData: true,
              id: '1',
              text: 'Danh mục xe',
              type: ViewType.grid,
              active: true,
              model: {
                resources: this.columnGrids,
              },
            },
          ];
          this.detectorRef.detectChanges();
        });
    });
    this.detectorRef.detectChanges();
  }
  openPopupDevice(template: any,lstEquipments? ) {    
    this.carsEquipments.forEach(element => {
      element.isSelected=false;
    });
    this.carsEquipments.forEach(element => {
      lstEquipments.forEach(item=>{
        if(element.id==item.equipmentID){
          element.isSelected=true;
        }
      })
    });
    var dialog = this.callfc.openForm(template, '', 550, 430);
    this.detectorRef.detectChanges();
  }
  click(event: ButtonModel) {
    switch (event.id) {
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
    this.viewBase.dataService.addNew().subscribe((res) => {
      this.dataSelected = this.viewBase.dataService.dataSelected;
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.viewBase?.dataService;
      option.FormModel = this.formModel;
      this.dialog = this.callfc.openSide(
        PopupAddCarsComponent,
        [this.dataSelected, true],
        option
      );
    });
  }

  edit(obj?) {
    if (obj) {
      this.viewBase.dataService.dataSelected = obj;
      this.viewBase.dataService
        .edit(this.viewBase.dataService.dataSelected)
        .subscribe((res) => {
          this.dataSelected = this.viewBase.dataService.dataSelected;
          let option = new SidebarModel();
          option.Width = '550px';
          option.DataService = this.viewBase?.dataService;
          option.FormModel = this.formModel;
          this.dialog = this.callfc.openSide(
            PopupAddCarsComponent,
            [this.viewBase.dataService.dataSelected, false],
            option
          );
        });
    }
  }

  delete(obj?) {
    this.viewBase.dataService.methodDelete = 'DeleteResourceAsync';
    if (obj) {
      this.viewBase.dataService.delete([obj], true).subscribe((res) => {
        console.log(res);
      });
    }
  }

  onSelect(obj: any) {
    console.log(obj);
  }

  clickMF(event, data) {
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

  closeDialog(evt?) {
    this.dialog && this.dialog.close();
  }
}
