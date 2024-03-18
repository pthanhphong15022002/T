import {
  AfterViewInit,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ButtonModel,
  CRUDService,
  CodxFormDynamicComponent,
  SidebarModel,
  UIComponent,
  Util,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'lib-water-clock',
  templateUrl: './water-clock.component.html',
  styleUrls: ['./water-clock.component.css'],
})
export class WaterClockComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @ViewChild('morefunction') morefunction: TemplateRef<any>;
  @ViewChild('templetOldMonthHeader') templetOldMonthHeader: TemplateRef<any>;

  // config BE
  service = 'AM';
  assemblyName = 'ERM.Business.AM';
  className = 'AssetsBusiness';
  method = 'LoadDataWaterClockAsync';
  entityName = 'AM_Assets';

  idField = 'AssetID';

  itemSelected: any;
  grvSetup: any;
  views: Array<ViewModel> = [];
  button: ButtonModel[] = [
    {
      id: 'btnAdd',
    },
  ];
  titleAction: any;

  description: string;
  arrFieldIsVisible: any[];
  columnGrids: any[];

  constructor(inject: Injector, private shareService: CodxShareService) {
    super(inject);
    this.funcID = this.router.snapshot.params['funcID']; //CMS0128
    this.cache.functionList(this.funcID).subscribe((f) => {
      if (f) {
        this.cache
          .gridViewSetup(f.formName, f.gridViewName)
          .subscribe((grv) => {
            this.grvSetup = grv;
            // lay grid view - view gird he thong
            let arrField = Object.values(this.grvSetup).filter(
              (x: any) => x.isVisible
            );

            if (Array.isArray(arrField)) {
              this.arrFieldIsVisible = arrField
                .sort((x: any, y: any) => x.columnOrder - y.columnOrder)
                .map((x: any) => x.fieldName);
            }
            this.getColumsGrid(this.grvSetup);
          });
        var description = f?.defaultName ?? f?.customName;
        this.description =
          description.charAt(0).toLowerCase() + description.slice(1);
      }
    });
  }

  onInit(): void {}

  ngAfterViewInit(): void {
    // this.views = [
    //   {
    //     type: ViewType.grid,
    //     sameData: true,
    //     active: true,
    //     model: {
    //       //resources: this.columnsGrid,
    //       template2: this.morefunction,
    //       //frozenColumns: 1,
    //     },
    //   },
    //  ];

    this.detectorRef.detectChanges();
  }

  selectedChange(data) {
    if (data || data?.data) this.itemSelected = data?.data ? data?.data : data;
  }

  click(evt) {
    this.titleAction = evt.text;
    switch (evt.id) {
      case 'btnAdd':
        this.add(evt);
        break;
    }
  }

  changeDataMF(e: any, data: any) {}

  clickMF(e, data) {
    if (!data) return;
    this.titleAction = e.text;
    this.itemSelected = data;
    switch (e.functionID) {
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS03':
        this.edit(data, e);
        break;
      case 'SYS04':
        this.copy(data, e);
        break;
      case 'SYS05':
        this.viewDetail(data, e);
        break;
      default:
        this.shareService.defaultMoreFunc(
          e,
          data,
          null,
          this.view.formModel,
          this.view.dataService,
          this
        );
        break;
    }
  }

  add(mFunc?) {
    this.view.dataService.addNew().subscribe((res) => {
      this.itemSelected = this.view.dataService.dataSelected;
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.currentView?.formModel;

      var dialog = this.callfc.openSide(
        CodxFormDynamicComponent,
        {
          formModel: option.FormModel,
          data: this.itemSelected,
          function: mFunc,
          dataService: this.view.dataService,
          isAddMode: true,
          titleMore: 'Thêm',
        },
        option
      );
    });
  }

  viewDetail(data: any, mFunc?) {
    if (data) this.view.dataService.dataSelected = this.itemSelected = data;
    let option = new SidebarModel();
    option.Width = '550px';
    option.DataService = this.view?.dataService;
    option.FormModel = this.view?.currentView?.formModel;
    this.callfc.openSide(
      CodxFormDynamicComponent,
      {
        formModel: option.FormModel,
        data: this.itemSelected,
        function: mFunc,
        dataService: this.view.dataService,
        isAddMode: false,
        titleMore: mFunc ? mFunc.text : '',
        isView: true,
      },
      option
    );
  }
  copy(evt: any, mFunc?) {
    if (evt) {
      this.view.dataService.dataSelected = this.itemSelected = evt;
    }
    this.view.dataService.copy().subscribe((res) => {
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.view.dataService;
      option.FormModel = this.view?.currentView?.formModel;

      this.callfc.openSide(
        CodxFormDynamicComponent,
        {
          formModel: option.FormModel,
          data: res,
          function: mFunc,
          dataService: this.view.dataService,
          titleMore: mFunc ? mFunc.text : '',
        },
        option
      );
    });
  }
  edit(data: any, mFunc?) {
    if (data) this.view.dataService.dataSelected = this.itemSelected = data;
    this.view.dataService.edit(this.itemSelected).subscribe(() => {
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      this.callfc.openSide(
        CodxFormDynamicComponent,
        {
          formModel: option.FormModel,
          data: this.itemSelected,
          function: mFunc,
          dataService: this.view.dataService,
          isAddMode: false,
          titleMore: mFunc ? mFunc.text : '',
        },
        option
      );
    });
  }

  delete(data: any) {
    this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete([this.view.dataService.dataSelected])
      .subscribe((res) => {
        this.view.dataService.onAction.next({
          type: 'delete',
          data: data,
        });
      });
  }

  onLoading(e) {}

  getColumsGrid(grvSetup) {
    if (this.arrFieldIsVisible?.length > 0) {
      this.arrFieldIsVisible.forEach((key) => {
        let field = Util.camelize(key);
        let template: any;
        let templateHeader: any;
        let colums: any;
        if (grvSetup[key].isTemplate != '0') {
          switch (key) {
            case 'IndexLastMonth':
              templateHeader = this.templetOldMonthHeader;
              break;
          }
        }

        if (template || templateHeader) {
          colums = {
            headerTemplate: templateHeader,
            field: field,
            headerText: grvSetup[key].headerText,
            width: grvSetup[key].width,
            template: template,
          };
        } else {
          colums = {
            field: field,
            headerText: grvSetup[key].headerText,
            width: grvSetup[key].width,
          };
        }
        this.columnGrids.push(colums);
      });
    }

    this.views = [
      {
        type: ViewType.grid,
        sameData: true,
        active: false,
        model: {
          resources: this.columnGrids,
          template2: this.morefunction,
        },
      },
    ];
  }
}
