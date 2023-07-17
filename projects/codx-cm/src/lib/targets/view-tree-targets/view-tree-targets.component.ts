import { DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormModel } from 'codx-core';

@Component({
  selector: 'codx-view-tree-targets',
  templateUrl: './view-tree-targets.component.html',
  styleUrls: ['./view-tree-targets.component.scss'],
  providers: [DecimalPipe],
})
export class ViewTreeTargetsComponent implements OnInit {
  @Input() dataTree: any;
  @Input() fmTargetLines: any;
  @Input() formModel: FormModel;
  @Output() clickMoreFunc = new EventEmitter<any>();
  @Output() changeMoreMF = new EventEmitter<any>();
  constructor(private decimalPipe: DecimalPipe) {}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    console.log(this.formModel);
  }

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
}
