import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ApiHttpService, CRUDService, CacheService, CallFuncService, CodxGridviewV2Component, DialogModel, FormModel } from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { PopupAddHistoryWaterClockComponent } from '../popup-add-history-water-clock/popup-add-history-water-clock.component';

@Component({
  selector: 'lib-view-water-clock-detail',
  templateUrl: './view-water-clock-detail.component.html',
  styleUrls: ['./view-water-clock-detail.component.css']
})
export class ViewWaterClockDetailComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild("gridHistory") gridHistory: CodxGridviewV2Component;
  @Input() itemSelected: any;
  @Input() hideMF: any = false;
  @Input() formModel: FormModel;

  @Output() clickMoreFunction = new EventEmitter<any>();
  @Output() eventChangeMF = new EventEmitter<any>();
  tabControl = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true, template: null },
    {
      name: 'Comment',
      textDefault: 'Thảo luận',
      isActive: false,
      template: null,
    },
    {
      name: 'Attachment',
      textDefault: 'Đính kèm',
      isActive: false,
      template: null,
    },
  ];
  idTabShow: any
  listTabRight = [

  ]
  isShow = false;
  //Lich sử
  formModelHistory: FormModel = {
    formName: 'CMWaterClock',
    gridViewName: 'grvCMWaterClock',
    entityName: 'AM_Assets',
    funcID: 'CMS0129'
  };
  //Bảng giá => Đoi Khanh thiết lập
  formModelPrice: FormModel = {
    formName: 'CMWaterClock',
    gridViewName: 'grvCMWaterClock',
    entityName: 'AM_Assets',
    funcID: 'CMS0129'
  };
  serviceAM = "AM"
  assemblyNameAM = "ERM.Business.AM"
  classNameAM = "AssetsBusiness"
  methodAM = "LoadDataWaterClockAsync"

  predicatesHis = 'ParentID=@0';
  dataValuesHis = '';
  idCrr: any

  constructor(
    private detectorRef: ChangeDetectorRef,
    private shareService: CodxShareService,
    private cache: CacheService,
    private api: ApiHttpService,
    private callfc: CallFuncService
  ) {

  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.itemSelected && this.itemSelected && this.idCrr != this.itemSelected.assetID) {
      if (this.gridHistory) {
        setTimeout(() => {
          this.gridHistory.refresh();
        }, 100);
      }
      this.idCrr = this.itemSelected.assetID
    }
  }
  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    // this.loadData();
  }
  changeDataMF(e, data) {
    this.eventChangeMF.emit({ e: e, data: data });
  }

  clickMF(e, data) {
    this.clickMoreFunction.emit({ e: e, data: data });
  }

  navChange() {

  }

  clickShowTab(isShow) {
    this.isShow = isShow;
    this.detectorRef.detectChanges();
  }


  changeDataMFHis(e, data) {

  }

  loadGridHis(data) {
    if (this.gridHistory) this.gridHistory.addRow(data, 0, true);
  }
  clickMFHis(e, data) {
    if (!data) return;
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
      // case 'SYS05':
      //   this.viewDetail(data);
      //   break;
      default:
        this.shareService.defaultMoreFunc(
          e,
          data,
          null,
          this.gridHistory.formModel,
          this.gridHistory.dataService,
          this
        );
        break;
    }
  }

  edit(data) {
    (this.gridHistory.dataService as CRUDService).addNew().subscribe((res) => {
      this.cache.gridViewSetup(this.formModelHistory.formName, this.formModelHistory.gridViewName).subscribe(grv => {
        let option = new DialogModel();
        option.DataService = this.gridHistory.dataService;
        option.FormModel = this.formModelHistory;
        let obj = {
          data: data,
          action: 'edit',
          headerText: '',
          gridViewSetup: grv,
          parent: this.itemSelected
        };
        let dialogHis = this.callfc.openForm(
          PopupAddHistoryWaterClockComponent,
          null,
          600,
          600,
          '',
          obj,
          "",
          option
        );
        dialogHis.closed.subscribe(res => {
          if (res && res.event) {
            this.loadGridHis(res.event);
          }
        })
      });
    })
  }

  copy(data) {
    (this.gridHistory.dataService as CRUDService).copy().subscribe((res) => {
      this.cache.gridViewSetup(this.formModelHistory.formName, this.formModelHistory.gridViewName).subscribe(grv => {
        let option = new DialogModel();
        option.DataService = this.gridHistory.dataService;
        option.FormModel = this.formModelHistory;
        let obj = {
          data: data,
          action: 'copy',
          headerText: '',
          gridViewSetup: grv,
          parent: this.itemSelected
        };
        let dialogHis = this.callfc.openForm(
          PopupAddHistoryWaterClockComponent,
          null,
          600,
          600,
          '',
          obj,
          "",
          option
        );
      })
    });
  }

  delete(data: any) {
    this.api.exec<any>("AM", "AssetsBusiness", "DeletedWaterClockAsync", data.assetID).subscribe(res => {
      if (res) this.gridHistory.deleteRow(data, true);
    })

    // (this.gridHistory.dataService as CRUDService).onAction.next({
    //   type: 'delete',
    //   data: data,
    // });

  }


}
