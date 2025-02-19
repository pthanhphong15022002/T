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
  DialogModel,
  FormModel,
  NotificationsService,
  SidebarModel,
  UIComponent,
  Util,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { PopupAddAssetsComponent } from '../assets/popup-add-assets/popup-add-assets.component';
import { PopupAddWaterClockComponent } from './popup-add-water-clock/popup-add-water-clock.component';
import { PopupAddHistoryWaterClockComponent } from './popup-add-history-water-clock/popup-add-history-water-clock.component';
import { ViewWaterClockDetailComponent } from './view-water-clock-detail/view-water-clock-detail.component';

@Component({
  selector: 'lib-water-clock',
  templateUrl: './water-clock.component.html',
  styleUrls: ['./water-clock.component.css'],
})
export class WaterClockComponent
  extends UIComponent
  implements OnInit, AfterViewInit {
  @ViewChild('templateDetail') templateDetail: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any>;
  @ViewChild('morefunction') morefunction: TemplateRef<any>;
  @ViewChild('viewDetails') viewDetails: ViewWaterClockDetailComponent;
  @ViewChild('templetOldMonthHeader') templetOldMonthHeader: TemplateRef<any>;

  // config BE
  service = 'AM';
  assemblyName = 'ERM.Business.AM';
  className = 'AssetsBusiness';
  method = "GetWaterClockCustomerAsync"; //'LoadDataWaterClockAsync';
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
  //Lich sử
  formModelHistory: FormModel = {
    formName: 'CMWaterClock',
    gridViewName: 'grvCMWaterClock',
    entityName: 'AM_Assets',
    funcID: 'CMS0129'
  };
  //Bảng giá 
  formModelPrice: FormModel = {
    formName: 'CMWaterClockCost',
    gridViewName: 'grvCMWaterClockCost',
    entityName: 'AM_Assets',
    funcID: 'CMS0130'
  };
  constructor(inject: Injector, private shareService: CodxShareService, private notiService: NotificationsService) {
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
            // this.getColumsGrid(this.grvSetup);
          });
        var description = f?.defaultName ?? f?.customName;
        this.description =
          description.charAt(0).toLowerCase() + description.slice(1);
      }
    });
  }

  onInit(): void { }

  ngAfterViewInit(): void {
    if (this.funcID == 'CMS0129')
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
        //view thêm
        {
          type: ViewType.listdetail,
          active: false,
          sameData: true,
          model: {
            template: this.itemTemplate,
            panelRightRef: this.templateDetail,
          },
        },
      ]; else
      if (this.funcID == 'CMS0128')
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
    this.detectorRef.detectChanges();
  }
  changeDataMF(e: any, data: any) { }

  // //CRUD custorm
  click(evt) {
    this.titleAction = evt.text;
    switch (evt.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }

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
      case 'CMS0129_1':
        this.addWaterClockHis(e.text, data);
        break;
      case 'CMS0129_2':
        this.addWaterClockCost(e.text, data);
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
        PopupAddWaterClockComponent,
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
          PopupAddWaterClockComponent,
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
      PopupAddWaterClockComponent,
      obj,
      option,
      this.view.funcID
    );
  }

  delete(data: any) {
    this.view.dataService.dataSelected = data;
    this.notiService.alertCode('TM003').subscribe((confirm) => {
      if (confirm?.event && confirm?.event?.status == 'Y') {
        this.api.exec<any>("AM", "AssetsBusiness", "DeletedWaterClockAsync", data.assetID).subscribe(res => {
          if (res) this.view.dataService.onAction.next({
            type: 'delete',
            data: data,
          });
        })
      }
    })

    // this.view.dataService
    //   .delete([this.view.dataService.dataSelected])
    //   .subscribe((res) => {
    //     this.view.dataService.onAction.next({
    //       type: 'delete',
    //       data: data,
    //     });
    //   });
  }

  onLoading(e) { }

  getColumsGrid(grvSetup) {
    this.columnGrids = [];
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

  clickMoreFunction(e) {
    this.clickMF(e.e, e.data);
  }
  eventChangeMF(e) {
    this.changeDataMF(e.e, e.data);
  }
  /**
   * up chốt sô đồng hồ nước
   */
  addWaterClockHis(title, data) {
    this.setDefault(title, data, "CMS0128")
  }

  setDefault(title, parent, funcID) {
    let service = 'AM';
    let acembly = "AM";
    let classMethol = 'AssetsBusiness';
    let methol = 'GetDefaultWaterClockAsync';
    let data = [funcID, parent.assetID]
    this.api
      .execSv<any>(service, acembly, classMethol, methol, data)
      .subscribe((response: any) => {
        if (response) {
          let data = response.data;
          let dataLastMonth = response.dataLastMonth;
          if (!response.isEdit) {
            data['_uuid'] = data['assetID'] ?? Util.uid();
            data['idField'] = 'assetID';
            data['parentID'] = parent.assetID;
            data['refID'] = parent.refID;
            data['siteID'] = parent.siteID;

            let isClockHis = data['assetCategory'] == "WaterClock"
            let formmodel = isClockHis ? this.formModelHistory : this.formModelPrice
            this.cache.gridViewSetup(formmodel.formName, formmodel.gridViewName).subscribe(grv => {
              let option = new DialogModel();
              option.DataService = this.view.dataService;
              option.FormModel = formmodel;
              let obj = {
                data: data,
                action: 'add',
                headerText: title,
                gridViewSetup: grv,
                parent: parent
              };
              let height = isClockHis ? 750 : 450
              let dialogHis = this.callfc.openForm(
                PopupAddHistoryWaterClockComponent,
                null,
                600,
                height,
                '',
                obj,
                "",
                option
              );
              dialogHis.closed.subscribe(res => {
                if (res && res.event) {
                  if (this.viewDetails) {
                    if (isClockHis) this.viewDetails.addGridHis(res.event);
                    else this.viewDetails.addGridCost(res.event);
                  }
                }
              })
            })
          } else {
            this.editHis(data, title, dataLastMonth)
          }
        }
      });
  }

  editHis(data, title, dataLastMonth) {
    this.cache.gridViewSetup(this.formModelHistory.formName, this.formModelHistory.gridViewName).subscribe(grv => {
      let option = new DialogModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.formModelHistory;
      let obj = {
        data: data,
        action: 'edit',
        headerText: title,
        gridViewSetup: grv,
        parent: this.itemSelected,
        dataLastMonth: dataLastMonth
      };
      let dialogHis = this.callfc.openForm(
        PopupAddHistoryWaterClockComponent,
        null,
        600,
        750,
        '',
        obj,
        "",
        option
      );
      dialogHis.closed.subscribe(res => {
        if (res && res.event) {
          if (this.viewDetails) {
            this.viewDetails.updateGridHis(res.event);
          }
        }
      })
    });
  }

  updateParent(e) {
    this.itemSelected = e;
    this.view.dataService.update(this.itemSelected).subscribe();
  }
  /**
   * update Price Water
   */
  addWaterClockCost(title, data) {
    this.setDefault(title, data, "CMS0130")
  }
}
