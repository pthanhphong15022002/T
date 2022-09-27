import {
  Component,
  TemplateRef,
  Injector,
  ViewChild,
  Input,
  AfterViewInit,
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
  @ViewChild('view') viewBase: ViewsComponent;
  
  @ViewChild('resourceNameCol') resourceNameCol: TemplateRef<any>;
  @ViewChild('locationCol') locationCol: TemplateRef<any>;
  @ViewChild('ownerCol') ownerCol: TemplateRef<any>;  
  @ViewChild('carCol') carCol: TemplateRef<any>;
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

  views: Array<ViewModel> = [];
  moreFuncs: Array<ButtonModel> = [];
  buttons: ButtonModel;

  vllDevices=[];
  carsEquipments=[];
  funcID: string;
  columnsGrid;
  dataSelected: any;
  dialog!: DialogRef;
  formModel: FormModel;
  columnGrids: any;
  // fGroupAddDriver: FormGroup;
  // dialogRef: DialogRef;
  isAfterRender = false;

  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService,
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
  //   this.codxEpService.getFormModel(this.funcID).then((fModel) => {
  //     this.cache
  //       .gridViewSetup(fModel.formName, fModel.gridViewName)
  //       .subscribe((gv) => {
  //         console.log(gv);
  //       });

  //     this.columnsGrid = [
  //       {
  //         field: 'resourceID',
  //         headerText: 'Mã lái xe', //gv['resourceID'].headerText,
  //       },
  //       {
  //         field: 'icon',
  //         headerText: 'Ảnh đại diện',
  //         template: this.avatar,
  //       },
  //       {
  //         field: 'resourceName',
  //         headerText: 'Tên lái xe',
  //       },
  //       // {
  //       //   headerText: 'Tình trạng',
  //       //   template: this.statusCol,
  //       // // },
  //       // {
  //       //   headerText: 'Xếp hạng',
  //       //   template: this.rankingCol,
  //       // },
  //       {
  //         headerText: 'Nguồn',
  //         template: this.categoryCol,
  //       },
  //       {
  //         headerText: 'Người điều phối',
  //         width: '20%',
  //         template: this.owner,
  //       },
  //     ];

  //     this.views = [
  //       {
  //         sameData: true,
  //         type: ViewType.grid,
  //         active: true,
  //         model: {
  //           resources: this.columnsGrid,
  //         },
  //       },
  //     ];
  //     this.detectorRef.detectChanges();
  //   });
  // }
  ngAfterViewInit(): void {
    this.buttons = {
      id: 'btnAdd',
    };
    this.codxEpService.getFormModel(this.funcID).then((formModel) => {
      this.cache
        .gridViewSetup(formModel?.formName, formModel?.gridViewName)
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
              headerText: gv['Note'].headerText,
              //width: gv['Note'].width,
              field: 'note',
              headerTextAlign: 'Center',  
              textAlign: 'Center',            
            },
            {
              headerText: gv['LinkID'].headerText,
              //width:gv['Owner'].width,
              width: 200,
              template: this.carCol,
              headerTextAlign: 'Center',
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
              text: 'Danh mục lái xe',
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
        PopupAddDriversComponent,
        [this.dataSelected, true],
        option
      );
    });
  }

  edit(obj?) {
    if (obj) {
      this.viewBase.dataService.dataSelected.data = obj;
      this.viewBase.dataService
        .edit(this.viewBase.dataService.dataSelected)
        .subscribe((res) => {
          this.dataSelected = this.viewBase.dataService.dataSelected;
          let option = new SidebarModel();
          option.Width = '550px';
          option.DataService = this.viewBase?.dataService;
          option.FormModel = this.formModel;
          this.dialog = this.callfc.openSide(
            PopupAddDriversComponent,
            [this.viewBase.dataService.dataSelected, false],
            option
          );
        });
    }
  }

  // delete(obj?) {
  //   if (obj) {
  //     this.viewBase.dataService.delete([obj], true).subscribe((res) => {
  //       console.log(res);
  //     });
  //   }
  // }

  // delete(data?: any) {
  //   this.viewBase.dataService.methodDelete = 'DeleteResourceAsync';
  //   this.viewBase.dataService.dataSelected = data;
  //   this.viewBase.dataService
  //     .delete([this.viewBase.dataService.dataSelected], true)
  //     .subscribe((res) => {
  //       if (res) {
  //         this.codxEpService.deleteFile(data.recID, this.formModel.entityName, true);
  //       }
  //     });
  // }
  delete(obj?) {
    this.viewBase.dataService.methodDelete = 'DeleteResourceAsync';
    if (obj) {
      this.viewBase.dataService.delete([obj], true).subscribe((res) => {
        if (res) {          
          this.api
          .execSv(
            'DM',
            'ERM.Business.DM',
            'FileBussiness',
            'DeleteByObjectIDAsync',
            [obj.recID, 'EP_Rooms', true]
          )
          .subscribe();
        this.detectorRef.detectChanges();
      }
      });
    }
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

  
}
