import { DecimalPipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { SliderComponent } from '@syncfusion/ej2-angular-inputs';
import { AuthStore, CodxTreeviewComponent, FormModel } from 'codx-core';

@Component({
  selector: 'codx-view-tree-targets',
  templateUrl: './view-tree-targets.component.html',
  styleUrls: ['./view-tree-targets.component.scss'],
  providers: [DecimalPipe],
})
export class ViewTreeTargetsComponent implements OnInit {
  @ViewChild('treeView') treeView: CodxTreeviewComponent;
  @Input() dataTree: any;
  @Input() fmTargetLines: any;
  @Input() formModel: FormModel;
  @Input() viewCurrent: any;
  @Input() hidenMF = false;
  @Input() userID: any;
  @Output() clickMoreFunc = new EventEmitter<any>();
  @Output() changeMoreMF = new EventEmitter<any>();
  @Output() eventClickShow = new EventEmitter<any>();

  constructor(
    private decimalPipe: DecimalPipe,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  clickTreeNode(evt: any) {
    evt.stopPropagation();
    evt.preventDefault();
  }

  targetToFixed(data) {
    return Math.round(data);
  }

  selectionChange(parent) {
    if (!parent.isItem) {
      parent.data.items = parent.data.items;
    }
  }

  clickMF(e, data) {
    this.clickMoreFunc.emit({ e: e, data: data });
  }

  changeDataMF(e, data) {
    this.changeMoreMF.emit({ e: e, data: data, type: 'tree' });
  }

  clickShowGrid(item, isShow: boolean) {
    item.isCollapse = isShow;
    if (item != null && item?.items != null) {
      item?.items.forEach((res) => {
        res.isCollapse = isShow;
      });
    }
    this.changeDetectorRef.detectChanges();
  }

  formatValue(data) {
    let dataRt = data.toFixed(2);
    return parseFloat(dataRt);
  }

  async delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  checkPerm(item) {
    return item?.salespersonID?.split(';')?.includes(this.userID);
  }
}
