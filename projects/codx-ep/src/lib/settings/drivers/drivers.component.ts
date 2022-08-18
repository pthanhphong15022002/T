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
  @ViewChild('view') viewBase: ViewsComponent;  
  @ViewChild('rankingCol') rankingCol: TemplateRef<any>;
  @ViewChild('statusCol') statusCol: TemplateRef<any>;
  @ViewChild('categoryCol') categoryCol: TemplateRef<any>;  
  @ViewChild('icon', { static: true }) icon: TemplateRef<any>;
 
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

  funcID: string;
  columnsGrid;
  dataSelected: any;
  dialog!: DialogRef;

  constructor(  
    private cacheService: CacheService,
    private changeDetectorRef: ChangeDetectorRef,
    private callFuncService: CallFuncService,
    private activedRouter: ActivatedRoute,
    private codxEpService: CodxEpService
    ) {
      this.funcID = this.activedRouter.snapshot.params['funcID'];
    }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.viewBase.dataService.methodDelete = 'DeleteResourceAsync';
    this.viewBase.dataService.methodSave = 'AddEditItemAsync';
    this.viewBase.dataService.methodUpdate = 'AddEditItemAsync';

    this.buttons = {
      id: 'btnAdd',
    };

    this.codxEpService.getFormModel(this.funcID).then((formModel) => {
      this.cacheService
        .gridViewSetup(formModel?.formName, formModel?.gridViewName)
        .subscribe((gv) => {
          console.log(gv);

          this.columnsGrid = [
            {
              field: 'resourceID',
              headerText: 'Mã lái xe',//gv['resourceID'].headerText,
            },
            // {
            //   field: 'icon',
            //   headerText: "Ảnh đại diện",
            //   template: this.icon,
            // },
            {
              field: 'resourceName',
              headerText: 'Tên lái xe',
            }, 
            {
              headerText: 'Tình trạng',
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
      option.DataService = this.viewBase?.currentView?.dataService;
      option.FormModel = this.viewBase?.currentView?.formModel;
      this.dialog = this.callFuncService.openSide(
        PopupAddDriversComponent,
        [this.dataSelected, true],
        option
      );
    });
  }

  edit(obj?) {
    if (obj) {
      this.viewBase.dataService.dataSelected = obj;
      this.viewBase.dataService.edit(this.viewBase.dataService.dataSelected).subscribe((res) => {
        this.dataSelected = this.viewBase.dataService.dataSelected;
        let option = new SidebarModel();
        option.Width = '550px';
        option.DataService = this.viewBase?.currentView?.dataService;
        option.FormModel = this.viewBase?.currentView?.formModel;
        this.dialog = this.callFuncService.openSide(
          PopupAddDriversComponent,
          [this.viewBase.dataService.dataSelected, false],
          option
        );
      });
    }
  }

  delete(obj?) {    
    if (obj) {
      this.viewBase.dataService.delete([obj], true)
      .subscribe((res) => {
        console.log(res);
      });
    }    
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
