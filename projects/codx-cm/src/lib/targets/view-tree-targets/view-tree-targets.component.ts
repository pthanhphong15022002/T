import { Component, Input } from '@angular/core';

@Component({
  selector: 'codx-view-tree-targets',
  templateUrl: './view-tree-targets.component.html',
  styleUrls: ['./view-tree-targets.component.scss']
})
export class ViewTreeTargetsComponent {

  @Input() dataTree: any;
  @Input() fmTargetLines:any;
  constructor(){

  }

  clickTreeNode(evt:any, ){
    evt.stopPropagation();
    evt.preventDefault();
  }
}
