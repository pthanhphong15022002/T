import { ChangeDetectorRef, Component, ElementRef, OnInit, Optional, ViewChild } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-popup-add-dynamic-process',
  templateUrl: './popup-add-dynamic-process.component.html',
  styleUrls: ['./popup-add-dynamic-process.component.scss'],
})
export class PopupAddDynamicProcessComponent implements OnInit {
  @ViewChild('status') status: ElementRef;

  dialog: any;
  currentTab = 0; //Bước hiện tại
  processTab = 0; // Tổng bước đã đi qua

  newNode: number; //vị trí node mới
  oldNode: number; // Vị trí node cũ

  isShow = false; //Check mở form
  isAddNew = true;
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
  @Optional() dialog: DialogRef,
  @Optional() data: DialogData) {
    this.dialog = dialog;
  }

  ngOnInit(): void {
    // this.updateNodeStatus(0,1);
  }

  //#region onSave
  onSave(){

  }
  //#endregion

  //#region Change Tab
  //Click từng tab - mặc định thêm mới = 0
  clickTab(tabNo) {
    //if (tabNo <= this.processTab && tabNo != this.currentTab) {
      if (tabNo != this.currentTab) {
      this.updateNodeStatus(this.currentTab, tabNo);
      this.currentTab = tabNo;
    }
  }

  //Quay lại
  // previous(currentTab) {
  //   let oldNode = currentTab;
  //   this.updateNodeStatus(oldNode, newNode);
  //   this.currentTab--;
  // }

  //Tiếp tục qua tab
  // async continue(currentTab) {
  //   if (this.currentTab > 2) return;

  //   let oldNode = currentTab;
  //   let newNode = oldNode + 1;

  //   switch (currentTab) {
  //     case 0:
  //       this.updateNodeStatus(oldNode, newNode);
  //       this.currentTab++;
  //       this.totalTab == 0 && this.totalTab++;
  //       break;
  //     case 1:
  //       this.newNode = newNode;
  //       this.oldNode = oldNode;
  //       this.updateNodeStatus(oldNode, newNode);
  //       this.currentTab++;
  //       this.totalTab == 1 && this.totalTab++;
  //       this.changeDetect.detectChanges();
  //       break;
  //     case 2:
  //       this.updateNodeStatus(oldNode, newNode);
  //       this.currentTab++;
  //       this.totalTab == 2 && this.totalTab++;
  //       this.changeDetect.detectChanges();
  //       break;
  //   }

  //   this.changeDetect.detectChanges();
  // }


  //Setting class status Active
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
    if (oldNode > newNode && this.currentTab == this.processTab) {
    } else {
      (nodes[oldNode] as HTMLElement).classList.add('approve-disabled');
    }
  }

  continue(currentTab) {
    if (this.currentTab > 1) return;
    let oldNode = currentTab;
    let newNode = oldNode + 1;
    switch (currentTab) {
      case 0:
       // Phuc làm ở đây
            this.updateNodeStatus(oldNode, newNode);
            this.currentTab++;
            this.processTab++;
        break;
      case 1:
        // Bảo + Thuận làm ở đây

        this.updateNodeStatus(oldNode, newNode);
            this.currentTab++;
            this.processTab++;
        break;

      case 2:
         // Thảo làm ở đây
        this.updateNodeStatus(oldNode, newNode);

        this.currentTab++;
        this.processTab++;
        break;
    }
    this.changeDetectorRef.detectChanges();
  }

  previous(currentTab) {
    let oldNode = currentTab;
    let newNode = oldNode - 1;
    this.updateNodeStatus(oldNode, newNode);
    this.currentTab--;
  }
  saveAndClose(){

  }
}
