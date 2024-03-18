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
  RequestOption,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { PopupAddAssetsComponent } from './popup-add-assets/popup-add-assets.component';

@Component({
  selector: 'lib-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.css'],
})
export class AssetsComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @ViewChild('morefunction') morefunction: TemplateRef<any>;
  // config BE
  service = 'AM';
  assemblyName = 'ERM.Business.AM';
  className = 'AssetsBusiness';
  method = 'LoadDataAsync';
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

  constructor(
    private inject: Injector,
    private shareService: CodxShareService
  ) {
    super(inject);
    this.funcID = this.router.snapshot.params['funcID']; //CMS0123
    this.cache.functionList(this.funcID).subscribe((f) => {
      if (f) {
        this.cache
          .gridViewSetup(f.formName, f.gridViewName)
          .subscribe((grv) => {
            this.grvSetup = grv;
          });
        var description = f?.defaultName ?? f?.customName;
        this.description =
          description.charAt(0).toLowerCase() + description.slice(1);
      }
    });
  }

  onInit(): void {}
  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.grid,
        sameData: true,
        active: true,
        model: {
          //resources: this.columnsGrid,
          template2: this.morefunction,
          //frozenColumns: 1,
        },
      },
    ];

    this.detectorRef.detectChanges();
  }

  selectedChange(data) {
    if (data || data?.data) this.itemSelected = data?.data ? data?.data : data;
  }

  click(evt) {
    this.titleAction = evt.text;
    switch (evt.id) {
      case 'btnAdd':
        this.add();
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
        this.edit(data);
        break;
      case 'SYS04':
        this.copy(data);
        break;
      case 'SYS05':
        this.viewDetail(data);
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

  add() {
    this.view.dataService.addNew().subscribe((res) => {
      let option = new SidebarModel();

      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '550px';
      let obj = {
        action: 'add',
        headerText: this.titleAction + ' ' + this.description,
        gridViewSetup: this.grvSetup,
      };
      let dialog = this.callfc.openSide(
        PopupAddAssetsComponent,
        obj,
        option,
        this.view.funcID
      );
    });
  }

  copy(data) {
    this.view.dataService.copy().subscribe((res) => {
      let option = new SidebarModel();

      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '550px';
      let obj = {
        action: 'copy',
        headerText: this.titleAction + ' ' + this.description,
        gridViewSetup: this.grvSetup,
      };
      let dialog = this.callfc.openSide(
        PopupAddAssetsComponent,
        obj,
        option,
        this.view.funcID
      );
    });
  }

  edit(data) {
    if (data) this.view.dataService.dataSelected = data;
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res) => {
        let option = new SidebarModel();

        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.Width = '550px';
        let obj = {
          action: 'edit',
          headerText: this.titleAction + ' ' + this.description,
          gridViewSetup: this.grvSetup,
        };
        let dialog = this.callfc.openSide(
          PopupAddAssetsComponent,
          obj,
          option,
          this.view.funcID
        );
      });
  }
  viewDetail(data) {
    let option = new SidebarModel();

    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px';
    let obj = {
      action: 'view',
      headerText: this.titleAction + ' ' + this.description,
      gridViewSetup: this.grvSetup,
    };
    let dialog = this.callfc.openSide(
      PopupAddAssetsComponent,
      obj,
      option,
      this.view.funcID
    );
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
    // this.view.dataService
    //   .delete([this.view.dataService.dataSelected], true, (opt) =>
    //     this.beforeDel(opt)
    //   )
    //   .subscribe((res) => {
    //     if (res) {
    //       this.view.dataService.onAction.next({
    //         type: 'delete',
    //         data: data,
    //       });
    //     }
    //   });
    // this.detectorRef.detectChanges();
  }

  // beforeDel(opt: RequestOption) {
  //   opt.service = 'AM';
  //   opt.assemblyName = 'ERM.Business.Core';
  //   opt.className = 'AssetsBusiness';
  //   opt.methodName = 'DeleteAsync';
  //   opt.data = [this.itemSelected];
  //   return true;
  // }
}
