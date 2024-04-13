import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ApiHttpService, CodxGridviewV2Component, FormModel } from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/public-api';

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
  serviceHistory = "AM"
  assemblyNameHisttory = "ERM.Business.AM"
  classNameHisttory = "AssetsBusiness"
  methodHisttory = "LoadDataWaterClockAsync"

  predicatesHis = 'ParentID=@0';
  dataValuesHis = '';
  idCrr: any

  constructor(
    private detectorRef: ChangeDetectorRef,
    private shareService: CodxShareService,
    private api: ApiHttpService) {

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

  clickMFHis(e, data) {

  }
  changeDataMFHis(e, data) {

  }

  loadGridHis(data) {
    if (this.gridHistory) this.gridHistory.addRow(data, 0, true);
  }
}
