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
  columnsGrid: any;

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
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.viewBase.dataService.methodDelete = 'DeleteResourceAsync';

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
              headerText: 'Tên lái xe', //gv['resourceID'].headerText,
            },
            // {
            //   field: 'icon',
            //   headerText: "Ảnh đại diện",
            //   template: this.icon,
            // },
            {
              field: 'resourceName',
              headerText: gv['ResourceName'].headerText,
            },
            {
              field: 'code',
              headerText: 'Biển số',
            },
            {
              headerText: gv['Status'].headerText,
              template: this.statusCol,
            },
            {
              headerText: gv['Ranking'].headerText,
              template: this.rankingCol,
            },
            {
              headerText: 'Nguồn',
              template: this.categoryCol,
            },
          ];

          this.views = [
            {
              id: '1',
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
      option.Width = '800px';
      option.DataService = this.viewBase?.currentView?.dataService;
      option.FormModel = this.viewBase?.currentView?.formModel;
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
          option.Width = '800px';
          option.DataService = this.viewBase?.currentView?.dataService;
          option.FormModel = this.viewBase?.currentView?.formModel;
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
