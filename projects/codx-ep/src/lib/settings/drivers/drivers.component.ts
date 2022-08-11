import {
  Component,
  OnInit,
  TemplateRef,
  Injector,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  Input,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  ButtonModel,
  CacheService,
  CallFuncService,
  DialogRef,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { CodxEpService } from '../../codx-ep.service';
import { PopupAddDriversComponent } from './popup-add-drivers/popup-add-drivers.component';

@Component({
  selector: 'setting-drivers',
  templateUrl: './drivers.component.html',
  styleUrls: ['./drivers.component.scss']
})
export class DriversComponent  implements OnInit, AfterViewInit {  
  @Input() data!: any;

  @ViewChild('view') viewBase: ViewsComponent;  
  @ViewChild('rankingCol') rankingCol: TemplateRef<any>;
  @ViewChild('statusCol') statusCol: TemplateRef<any>;
  @ViewChild('categoryCol') categoryCol: TemplateRef<any>;

  service = 'EP';
  assemblyName = 'EP';
  entityName = 'EP_Resources';
  predicate = 'ResourceType=@0';
  dataValue = '3';
  idField = 'recID';
  className = 'ResourcesBusiness';
  method = 'GetListAsync';

  funcID: string;
  columnGrids: any;
  columnsGrid;

  views: Array<ViewModel> = [];
  moreFuncs: Array<ButtonModel> = [];
  buttons: ButtonModel;

  itemSelected: any;
  dataSelected: any;

  dialog!: DialogRef;
  dialogAddDriver: FormGroup;

  constructor(  
    private cacheSv: CacheService,
    private cr: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private activedRouter: ActivatedRoute,
    private callFunc: CallFuncService,
    private epService: CodxEpService
    ) {
        this.funcID = this.activedRouter.snapshot.params['funcID'];
    }

  ngOnInit(): void {
    this.dialogAddDriver.addControl('code',new FormControl('')  ); }

  ngAfterViewInit(): void {
    this.viewBase.dataService.methodDelete = 'DeleteResourceAsync';
    // this.viewBase.dataService.methodSave = 'AddNewAsync';
    // this.viewBase.dataService.methodUpdate = 'EditResourceAsync';
    this.cacheSv
        .gridViewSetup('Resources', 'grvResources')
        .subscribe((gv) => {
          console.log(gv);          
        });
    this.columnsGrid = [
      {
        field: 'resourceID',
        headerText: 'Mã lái xe',
        template: '',
      },
      {
        field: 'resourceName',
        headerText: 'Tên lái xe',
        template: '',
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
    this.buttons = {
      id: 'btnAdd',
    };

    this.epService.getFormModel(this.funcID).then((formModel) => {
      this.dialogAddDriver.addControl(
        'code',
        new FormControl(this.data.code)
      );  
      
    });
    this.moreFuncs = [
      {
        id: 'btnEdit',
        icon: 'icon-list-checkbox',
        text: 'Chỉnh sửa',
      },
      {
        id: 'btnDelete',
        icon: 'icon-list-checkbox',
        text: 'Xóa',
      },
    ];
  }

  onInit(): void { }

  click(evt: ButtonModel) {
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
    this.viewBase.dataService.addNew().subscribe((res) => {
      this.dataSelected = this.viewBase.dataService.dataSelected;
      let option = new SidebarModel();
      option.Width = '800px';
      option.DataService = this.viewBase?.currentView?.dataService;
      option.FormModel = this.viewBase?.currentView?.formModel;
      this.dialog = this.callFunc.openSide(
        PopupAddDriversComponent,
        [this.dataSelected, true],
        option
      );
    });
  }

  edit(evt?) {
    let item = this.viewBase.dataService.dataSelected;
    if (evt) {
      item = evt;
    }
    this.viewBase.dataService.edit(item).subscribe((res) => {
      this.dataSelected = this.viewBase.dataService.dataSelected;
      let option = new SidebarModel();
      option.Width = '800px';
      option.DataService = this.viewBase?.currentView?.dataService;
      option.FormModel = this.viewBase?.currentView?.formModel;
      this.dialog = this.callFunc.openSide(
        PopupAddDriversComponent,
        [item, false],
        option
      );
    });
  }

  delete(evt?) {
    let deleteItem = this.viewBase.dataService.dataSelected;
    if (evt) {
      deleteItem = evt;
    }
    this.viewBase.dataService.delete([deleteItem], true).subscribe((res) => {
      console.log(res);
    });
  }

  clickMF(event, data) {
    console.log(event)
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
