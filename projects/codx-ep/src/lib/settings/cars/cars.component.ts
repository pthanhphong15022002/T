import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  Input,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  ButtonModel,
  CacheService,
  CallFuncService,
  CodxGridviewComponent,
  DialogRef,
  FormModel,
  SidebarModel,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { CodxEpService } from '../../codx-ep.service';
import { PopupAddCarsComponent } from './popup-add-cars/popup-add-cars.component';

@Component({
  selector: 'setting-cars',
  templateUrl: 'cars.component.html',
  styleUrls: ['cars.component.scss'],
})
export class CarsComponent implements OnInit, AfterViewInit {
  @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('gridView') gridView: CodxGridviewComponent;
  @ViewChild('gridTemplate') grid: TemplateRef<any>;
  @ViewChild('itemTemplate') template!: TemplateRef<any>;
  @ViewChild('statusCol') statusCol: TemplateRef<any>;
  @ViewChild('rankingCol') rankingCol: TemplateRef<any>;
  @ViewChild('categoryCol') categoryCol: TemplateRef<any>;
  @ViewChild('icon', { static: true }) icon: TemplateRef<any>;

  @Input() data!: any;

  service = 'EP';
  assemblyName = 'EP';
  entityName = 'EP_Resources';
  predicate = 'ResourceType=@0';
  dataValue = '2';
  idField = 'recID';
  className = 'ResourcesBusiness';
  method = 'GetListAsync';

  views: Array<ViewModel> = [];
  buttons: ButtonModel;
  moreFunc: Array<ButtonModel> = [];

  dialog!: DialogRef;
  isAdd = true;
  funcID: string;
  columnsGrid;
  grView:any;
  formModel: FormModel;
  // fGroupAddDriver: FormGroup;
  // dialogRef: DialogRef;
  isAfterRender = false;
  str:string;
  dataSelected: any;
  devices: any;
  tmplstDevice = [];

  constructor(
    private callFuncService: CallFuncService,
    private activedRouter: ActivatedRoute,
    private codxEpService: CodxEpService,
    private cacheService: CacheService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    this.codxEpService.getFormModel(this.funcID).then((res) => {
      if (res) {
        this.formModel = res;
        this.isAfterRender = true;
      }
    });
    
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.viewBase.dataService.methodDelete = 'DeleteResourceAsync';

    this.buttons = {
      id: 'btnAdd',
    }; 
    this.codxEpService.getFormModel(this.funcID).then((fModel) => {
      this.cacheService
        .gridViewSetup(fModel.formName, fModel.gridViewName)
        .subscribe((gv) => {
          this.grView=gv;          
          });
          this.columnsGrid = [
            {
              field: 'resourceID',
              headerText: 'Mã xe',
            },
            // {
            //   field: 'icon',
            //   headerText: "Ảnh đại diện",
            //   template: this.icon,
            // },
            {
              field: 'resourceName',
              headerText: 'Tên xe',
            },
            {
              field: 'capacity',
              headerText: 'Số chỗ',
            },        
            {
              field: 'code',
              headerText: 'Biển số',
            },
            {
              headerText: 'Trạng thái',
              template: this.statusCol,
            },
            {
              headerText: 'Xếp hạng',
              template: this.rankingCol,
            },
            {
              headerText: 'Nguồn',
              template: this.categoryCol,
            },
          ];
      
          this.views = [
            {
              sameData: true,
              type: ViewType.grid,
              active: true,
              model: {
                resources: this.columnsGrid,
              },
            },        
          ];
          this.changeDetectorRef.detectChanges();
      });  
      
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
      option.FormModel = this.viewBase?.formModel;
      this.dialog = this.callFuncService.openSide(
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
          option.FormModel = this.viewBase?.formModel;
          this.dialog = this.callFuncService.openSide(
            PopupAddCarsComponent,
            [this.viewBase.dataService.dataSelected, false],
            option
          );
        });
    }
  }

  delete(obj?) {
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
