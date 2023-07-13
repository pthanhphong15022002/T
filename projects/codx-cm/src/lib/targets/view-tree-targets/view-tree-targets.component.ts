import { DecimalPipe } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'codx-view-tree-targets',
  templateUrl: './view-tree-targets.component.html',
  styleUrls: ['./view-tree-targets.component.scss'],
  providers: [DecimalPipe],

})
export class ViewTreeTargetsComponent {

  @Input() dataTree: any;
  @Input() fmTargetLines:any;
  constructor(    private decimalPipe: DecimalPipe,
    ){

  }

  clickTreeNode(evt:any, ){
    evt.stopPropagation();
    evt.preventDefault();
  }

  targetToFixed(data) {
    return data ? this.decimalPipe.transform(data, '1.0-0') : '0';
  }

  selectionChange(parent) {
    if (!parent.isItem) {
      parent.data.items = parent.data.items;
    }
  }
}
