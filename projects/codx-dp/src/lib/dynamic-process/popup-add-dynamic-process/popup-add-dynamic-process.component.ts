import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-popup-add-dynamic-process',
  templateUrl: './popup-add-dynamic-process.component.html',
  styleUrls: ['./popup-add-dynamic-process.component.css'],
})
export class PopupAddDynamicProcessComponent implements OnInit {
  @ViewChild('status') status: ElementRef;

  dialog: any;
  currentTab = 0; //Bước hiện tại
  totalTab = 0; // Tổng bước đã đi qua

  newNode: number; //vị trí node mớis
  oldNode: number; // Vị trí node cũ
  isAddNew = true;
  constructor(
    private changeDetect: ChangeDetectorRef,
    @Optional() dialog: DialogRef,
    @Optional() data: DialogData) {
    this.dialog = dialog;
  }

  ngOnInit(): void {
    // this.updateNodeStatus(0,1);
  }

  //#region Change Tab
  clickTab(tabNo) {
    let newNo = tabNo;
    let oldNo = this.currentTab;

    if (tabNo <= this.totalTab && tabNo != this.currentTab) {
      this.updateNodeStatus(oldNo, newNo);
      this.currentTab = tabNo;
    }
  }

  previous(currentTab) {
    let oldNode = currentTab;
    let newNode = oldNode - 1;
    this.updateNodeStatus(oldNode, newNode);
    this.currentTab--;
  }

  async continue(currentTab) {
    if (this.currentTab > 2) return;

    let oldNode = currentTab;
    let newNode = oldNode + 1;

    switch (currentTab) {
      case 0:
        this.updateNodeStatus(oldNode, newNode);
        this.currentTab++;
        this.totalTab == 0 && this.totalTab++;
        break;
      case 1:
        this.newNode = newNode;
        this.oldNode = oldNode;
        this.updateNodeStatus(oldNode, newNode);
        this.currentTab++;
        this.totalTab == 1 && this.totalTab++;
        this.changeDetect.detectChanges();
        break;
      case 2:
        this.updateNodeStatus(oldNode, newNode);
        this.currentTab++;
        this.totalTab == 2 && this.totalTab++;
        this.changeDetect.detectChanges();
        break;
    }

    this.changeDetect.detectChanges();
  }

  updateNodeStatus(oldNode: number, newNode: number) {
    let nodes = Array.from(
      (this.status.nativeElement as HTMLElement).childNodes
    );

    let newClassName = (nodes[newNode] as HTMLElement).className;
    switch (newClassName) {
      case 'stepper-item':
        (nodes[newNode] as HTMLElement).classList.add('active');

        break;
      case 'stepper-item approve-disabled':
        (nodes[newNode] as HTMLElement).classList.remove('approve-disabled');
        (nodes[newNode] as HTMLElement).classList.add('approve');
        break;
    }

    let oldClassName = (nodes[oldNode] as HTMLElement).className;
    switch (oldClassName) {
      case 'stepper-item approve':
        (nodes[oldNode] as HTMLElement).classList.remove('approve');
        break;
      case 'stepper-item active':
        (nodes[oldNode] as HTMLElement).classList.remove('active');
        break;
    }
    if (oldNode > newNode && this.currentTab == this.totalTab) {
    } else {
      (nodes[oldNode] as HTMLElement).classList.add('approve-disabled');
    }
  }
  //#endregion
}
