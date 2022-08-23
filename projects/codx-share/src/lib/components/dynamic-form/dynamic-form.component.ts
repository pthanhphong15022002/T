import { FormGroup } from '@angular/forms';
import {
  UIComponent,
  ViewModel,
  ViewType,
  ViewsComponent,
  SidebarModel,
  DialogRef,
  CodxFormDynamicComponent,
  ButtonModel,
  CRUDService,
} from 'codx-core';
import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';

@Component({
  selector: 'codx-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss'],
})
export class DynamicFormComponent extends UIComponent {
  @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('morefunction') morefunction: TemplateRef<any>;
  service: string;
  entityName: string;
  predicate: string;
  dataValue: string;
  views: Array<ViewModel> = [];
  columnsGrid = [];
  data = [];
  dialog: DialogRef;
  buttons: ButtonModel;
  formGroup: FormGroup;
  funcID: string;
  idField: string = 'recID';
  dataSelected: any;

  constructor(private inject: Injector) {
    super(inject);
    this.funcID = this.router.snapshot.params['funcID'];
  }

  onInit(): void {
    this.buttons = {
      id: 'btnAdd',
    };
    // this.cache.functionList(this.funcID).subscribe((res) => {
    //   this.predicate = res.predicate;
    //   this.dataValue = res.dataValue;
    //   this.api
    //     .callSv('SYS', 'SYS', 'EntitiesBusiness', 'GetCacheEntityAsync', [
    //       res.entityName,
    //     ])
    //     .subscribe((res: any) => {
    //       if (res && res.msgBodyData) {
    //         var entities = res.msgBodyData[0];
    //         this.entityName = entities.tableName;
    //         var arr = entities.tableName.split('_') as any[];
    //         if (arr.length > 0) {
    //           this.service = arr[0];
    //         }
    //         this.detectorRef.detectChanges();
    //       }
    //     }); // hàm này để tạm do chưa có cache entities trên UI
    //   this.cache
    //     .gridViewSetup(res.formName, res.gridViewName)
    //     .subscribe((res) => {
    //       this.data = Object.values(res) as any[];
    //       this.data = this.data.filter((res) => {
    //         if (res.isVisible) {
    //           res['field'] = this.camelize(res.fieldName);
    //         }
    //         return res;
    //       });

    //       this.columnsGrid = this.data.sort((a, b) => {
    //         return a.columnOrder - b.columnOrder;
    //       });

    //       this.columnsGrid[this.columnsGrid.length - 1].template =
    //         this.morefunction;

    //       //Để tạm vì nhỏ quá morefc k hiện hết
    //       this.columnsGrid[this.columnsGrid.length - 1].width = '200';

    //       this.views = [
    //         {
    //           type: ViewType.grid,
    //           sameData: true,
    //           active: true,
    //           model: {
    //             resources: this.columnsGrid,
    //           },
    //         },
    //       ];
    //     });
    // });
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.grid,
        sameData: true,
        active: true,
        model: {
          resources: this.columnsGrid,
          template2: this.morefunction,
        },
      },
    ];
  }

  viewChanged(evt: any, view: ViewsComponent) {
    this.cache
      .gridViewSetup(view.function.formName, view.function.gridViewName)
      .subscribe(() => {});
  }

  clickMF(evt?: any, data?: any) {
    switch (evt.functionID) {
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS04':
        this.copy(data);
        break;
      default:
        break;
    }
  }

  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.addNew();
        break;
    }
  }

  private addNew() {
    this.viewBase.dataService.addNew().subscribe(() => {
      this.dataSelected = this.viewBase.dataService.dataSelected;
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.viewBase?.currentView?.dataService;
      option.FormModel = this.viewBase?.currentView?.formModel;
      this.dialog = this.callfc.openSide(
        CodxFormDynamicComponent,
        {
          formModel: option.FormModel,
          data: this.dataSelected,
          dataService: this.viewBase.dataService,
        },
        option
      );
    });
  }

  private edit(evt?) {
    this.dataSelected = this.viewBase.dataService.dataSelected;
    if (evt) this.dataSelected = evt;
    this.viewBase.dataService.edit(this.dataSelected).subscribe(() => {
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.viewBase?.currentView?.dataService;
      option.FormModel = this.viewBase?.currentView?.formModel;
      this.dialog = this.callfc.openSide(
        CodxFormDynamicComponent,
        {
          formModel: option.FormModel,
          data: this.dataSelected,
          dataService: this.viewBase.dataService,
        },
        option
      );
    });
  }

  private copy(evt: any) {
    this.dataSelected = this.viewBase.dataService.dataSelected;
    if (!this.dataSelected && evt) {
      this.viewBase.dataService.dataSelected = this.dataSelected = evt;
    }
    (this.viewBase.dataService as CRUDService).copy().subscribe((res) => {
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.viewBase.dataService;
      option.FormModel = this.viewBase?.currentView?.formModel;
      //this.dialog =
      this.callfc.openSide(
        CodxFormDynamicComponent,
        {
          formModel: option.FormModel,
          data: res,
          dataService: this.viewBase.dataService,
        },
        option
      );
    });
  }

  private delete(evt?) {
    let delItem = this.viewBase.dataService.dataSelected;
    if (evt) delItem = evt;
    this.viewBase.dataService.delete([delItem]).subscribe((res) => {
      this.dataSelected = res;
    });
  }

  private camelize(str) {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '');
  }
}
