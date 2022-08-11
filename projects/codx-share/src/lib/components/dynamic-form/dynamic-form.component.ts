import {
  UIComponent,
  FormModel,
  ViewModel,
  LayoutService,
  ViewType,
  ViewsComponent,
} from 'codx-core';
import {
  Component,
  Injector,
  Input,
  TemplateRef,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'codx-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss'],
})
export class DynamicFormComponent extends UIComponent {
  @Input() funcID: string;
  @ViewChild('template') template: TemplateRef<any>;
  views: Array<ViewModel> = [];
  columnsGrid: any;
  formName: string;
  gridViewName: string;
  data: any;
  showToolBar = 'true';
  service = 'EP';
  assemblyName = 'EP';
  entityName = 'EP_Resources';
  predicate = 'ResourceType=@0';
  dataValue = '1';
  idField = 'recID';
  className = 'ResourcesBusiness';
  method = 'GetListAsync';

  constructor(private inject: Injector, private layout: LayoutService) {
    super(inject);
  }

  onInit(): void {
    this.cache.functionList(this.funcID).subscribe((res) => {
      this.formName = res.formName;
      this.gridViewName = res.gridViewName;
    });
    this.cache
      .gridViewSetup(this.formName, this.gridViewName)
      .subscribe((res) => {
        this.data = Object.values(res);
        this.data.map((res) => {
          this.data = [
            ...this.data,
            {
              headerText: res.headerText,
              width: res.width,
              field: this.camelize(res.fieldName),
            },
          ];
        });
        this.columnsGrid = this.data;
      });
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.grid,
        sameData: false,
        active: true,
        model: {
          resources: this.columnsGrid,
        },
      },
    ];
  }

  viewChanged(evt: any, view: ViewsComponent) {
    var module = view.function!.module;
    var formName = view.function!.formName;
    this.cache.functionList(module).subscribe((f) => {
      if (f) {
        this.layout.setUrl(f.url);
        this.layout.setLogo(f.smallIcon);
      }
    });
  }

  camelize(str) {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '');
  }
}
