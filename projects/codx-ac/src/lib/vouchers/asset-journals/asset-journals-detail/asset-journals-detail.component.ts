import {
  Component,
  EventEmitter,
  Injector,
  Input,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
import { CodxGridviewV2Component, CodxService, FormModel, UIDetailComponent } from 'codx-core';
import { fmAssetAcquisitionsLines, fmAssetDepreciationsLines, fmAssetLiquidationsLines, fmAssetRevaluationsLines, fmAssetTransfersLines } from '../../../codx-ac.service';

@Component({
  selector: 'lib-asset-journals-detail',
  templateUrl: './asset-journals-detail.component.html',
  styleUrls: ['./asset-journals-detail.component.css'],
})
export class AssetJournalsDetailComponent extends UIDetailComponent {
  @ViewChild('elementTabDetail') elementTabDetail: TabComponent;
  @ViewChild('grid') grid: CodxGridviewV2Component;

  @Input() dataSelected: any;
  @Input() formModel: any;
  @Input() gridViewSetup: any;
  @Output() changeMoreMF = new EventEmitter<any>();
  @Output() clickMoreFunc = new EventEmitter<any>();
  id: any;
  isShow = false;
  fmAssetJournalsLines: FormModel;
  loaded: boolean;
  constructor(private inject: Injector, public codxService: CodxService) {
    super(inject);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataSelected']) {
      if (
        changes['dataSelected'].currentValue != null &&
        changes['dataSelected'].currentValue?.recID
      ) {
        if (changes['dataSelected'].currentValue?.recID == this.id) return;
        this.loaded = false;

        this.dataSelected = JSON.parse(JSON.stringify(changes['dataSelected'].currentValue));
        this.id = changes['dataSelected'].currentValue?.recID;
        setTimeout(() => {
          this.loaded = true;
        }, 0);
      }
    }
  }
  onInit(): void {
    switch (this.formModel?.funcID) {
      case 'ACT811':
        this.fmAssetJournalsLines = fmAssetAcquisitionsLines;
        break;
      case 'ACT821':
        this.fmAssetJournalsLines = fmAssetRevaluationsLines;
        break;
      case 'ACT871':
        this.fmAssetJournalsLines = fmAssetLiquidationsLines;
        break;
      case 'ACT831':
        this.fmAssetJournalsLines = fmAssetTransfersLines;
        break;
      case 'ACT841':
        this.fmAssetJournalsLines = fmAssetDepreciationsLines;
        break;
      case 'ACT881':
        this.fmAssetJournalsLines = fmAssetLiquidationsLines; // Chưa có
        break;
    }
  }

  /**
   * *Hàm khởi tạo các tab detail
   * @param e
   * @param ele
   */
  createTab(e: any, ele: TabComponent) {
    this.showHideTab(this.dataSelected?.subType, ele);
  }

  selecting(event) {
    if (event.isSwiped) {
      event.cancel = true;
    }
  }

  showHideTab(type: any, ele?: TabComponent) {
    ele = this.elementTabDetail;
    if (ele) {
      ele.hideTab(0, false);
      ele.select(0);
      // switch (type) {
      //   case '1':
      //   case '3':
      //   case '4':
      //     ele.hideTab(1, true);
      //     ele.hideTab(2, true);
      //     break;
      //   case '2':
      //     ele.hideTab(1, false);
      //     ele.hideTab(2, true);
      //     break;
      //   case '9':
      //     ele.hideTab(1, false);
      //     ele.hideTab(2, false);
      //     break;
      // }
    }
  }

  clickShowTab(isShow) {
    this.isShow = isShow;
    this.detectorRef.detectChanges();
  }

  clickMF(e, data) {
    this.clickMoreFunc.emit({ e: e, data: data });
  }

  changeDataMF(e, data) {
    this.changeMoreMF.emit({ e: e, data: data });
  }
}
