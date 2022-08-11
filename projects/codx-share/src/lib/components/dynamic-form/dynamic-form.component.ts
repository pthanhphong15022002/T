import { UIComponent, ViewModel, LayoutService, ViewType, ViewsComponent } from 'codx-core';
import { Component, Injector, Input, TemplateRef, ViewChild } from '@angular/core';

@Component({
  selector: 'codx-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss'],
})
export class DynamicFormComponent extends UIComponent {
  @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('morefunction') morefunction: TemplateRef<any>;;
  @Input() className: string = 'ResourcesBusiness';
  @Input() method: string = 'GetListAsync';
  @Input() service: string = 'EP';
  @Input() assemblyName: string = 'EP';
  views: Array<ViewModel> = [];
  columnsGrid: any[] = []
  data: any[] = []
  funcID: string;
  predicate: string = "ResourceType=@0";
  dataValue: string = "1";

  constructor(
    private inject: Injector,
  ) {
    super(inject)
    console.log('className', this.className)
    console.log('method', this.method)
    console.log('service', this.service)
    console.log('assemblyName', this.assemblyName)
  }

  onInit(): void {
    this.funcID = this.router.snapshot.params['funcID'];
  }

  ngAfterViewInit(): void {
    this.cache.functionList(this.funcID).subscribe(res => {
      this.predicate = res.predicate
      this.dataValue = res.dataValue
      this.cache.gridViewSetup(res.formName, res.gridViewName).subscribe(res => {
        this.data = Object.values(res) as any[];
        this.data = this.data.filter((res, index) => {
          if (res.isVisible) {
            res['field'] = this.camelize(res.fieldName);
          }
          return res
        })

        this.columnsGrid = this.data.sort((a, b) => {
          return a.columnOrder - b.columnOrder
        });

        this.columnsGrid[this.columnsGrid.length - 1].template = this.morefunction

        this.views = [
          {
            type: ViewType.grid,
            sameData: true,
            active: true,
            model: {
              resources: this.columnsGrid,
            },
          },
        ];
      })
    })
  }

  viewChanged(evt: any, view: ViewsComponent) {
    this.cache.gridViewSetup(view.function.formName, view.function.gridViewName).subscribe(res => {
      console.log(res);
    })
  }

  clickMF(evt?: any, data?: any) {
    switch (evt.functionID) {
      case 'edit':
        this.edit(data);
        break;
      case 'delete':
        this.delete(data);
        break;
      default:
        break;
    }
  }

  edit(evt?) {
    // this.dataSelected = this.viewBase.dataService.dataSelected;
    // if (evt) this.dataSelected = evt;
    // this.viewBase.dataService.edit(this.dataSelected).subscribe((res) => {
    //   let option = new SidebarModel();
    //   option.Width = '800px';
    //   option.DataService = this.viewBase?.currentView?.dataService;
    //   option.FormModel = this.viewBase?.currentView?.formModel;
    //   this.dialog = this.callFunc.openSide(
    //     PopupAddCarsComponent,
    //     [this.dataSelected, false],
    //     option
    //   );
    // });
  }

  delete(evt?) {
    // let delItem = this.viewBase.dataService.dataSelected;
    // if (evt) delItem = evt;
    // this.viewBase.dataService.delete([delItem]).subscribe((res) => {
    //   this.dataSelected = res;
    // });
  }

  camelize(str) {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '');
  }
}
