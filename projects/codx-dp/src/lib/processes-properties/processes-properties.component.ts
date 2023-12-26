import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-processes-properties',
  templateUrl: './processes-properties.component.html',
  styleUrls: ['./processes-properties.component.scss'],
})
export class ProcessesPropertiesComponent implements OnInit, AfterViewInit {
  @ViewChild('status') status: ElementRef;

  dialog: any;
  data: any;
  action = 'add';
  currentTab = 0; //Tab hiện tại
  processTab = 0; // Tổng bước đã quua
  newNode: number; //vị trí node mới
  oldNode: number; // Vị trí node cũ
  dataCurrent: any = {id: 'id0', name: 'Forms', icon: 'icon-i-clipboard'};
  lstDataLeft = [
    {
      id: '1',
      name: 'Cơ bản',
      datas: [
        { id: 'id0', name: 'Forms', icon: 'icon-i-clipboard' },
        { id: 'id1', name: 'Văn bản', icon: 'icon-i-layout-text-sidebar' },
        { id: 'id2', name: 'Danh sách', icon: 'icon-i-list-check' },
        { id: 'id3', name: 'Dữ liệu liên kết', icon: 'icon-wb_cloudy' },
        { id: 'id4', name: 'Ngày', icon: 'icon-today' },
        { id: 'id5', name: 'Tệp đính kèm', icon: 'icon-attach_file' },
        { id: 'id6', name: 'Số', icon: 'icon-i-bootstrap' },
        { id: 'id7', name: 'Yes/no', icon: 'icon-switch_left' },
        { id: 'id8', name: 'Người', icon: 'icon-person' },
        { id: 'id9', name: 'Chia sẻ', icon: 'icon-i-people' },
      ],
    },
    {
      id: '2',
      name: 'Nâng cao',
      datas: [
        { id: 'id10', name: 'Xếp hạng', icon: 'icon-i-star' },
        { id: 'id11', name: 'Bảng', icon: 'icon-i-table' },
        { id: 'id12', name: 'Tiến độ', icon: 'icon-i-battery-half' },
        { id: 'id13', name: 'Số điện thoại', icon: 'icon-i-telephone' },
        { id: 'id14', name: 'Email', icon: 'icon-email' },
        { id: 'id15', name: 'Địa chỉ', icon: 'icon-location_on' },
        { id: 'id16', name: 'Công thức', icon: 'icon-i-calculator-fill' },
      ],
    },
    {
      id: '3',
      name: 'Form nhập liệu',
      datas: [
        { id: 'id17', name: 'Email', icon: 'icon-email' },
        { id: 'id18', name: 'Địa chỉ', icon: 'icon-location_on' },
        { id: 'id19', name: 'Công thức', icon: 'icon-i-calculator-fill' },
      ],
    },
  ];

  lstStepFields = [];
  constructor(
    private detectorRef: ChangeDetectorRef,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    this.dialog = dialog;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {}

  //#region setting created tab
  clickTab(tabNo: number) {
    let newNo = tabNo;
    let oldNo = this.currentTab;
    if (tabNo <= this.processTab && tabNo != this.currentTab) {
      this.updateNodeStatus(oldNo, newNo);
      this.currentTab = tabNo;
    }
    this.detectorRef.detectChanges();
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
    if (
      oldNode > newNode &&
      this.currentTab == this.processTab &&
      this.action != 'edit'
    ) {
    } else {
      (nodes[oldNode] as HTMLElement).classList.add('approve-disabled');
    }
  }
  async continue(currentTab) {
    if (currentTab == 0) {
      //check điều kiện để continue
    }
    if (this.currentTab > 2) return;
    let oldNode = currentTab;
    let newNode = oldNode + 1;
    switch (currentTab) {
      case 0:
        this.updateNodeStatus(oldNode, newNode);
        this.currentTab++;
        this.processTab == 0 && this.processTab++;
        break;
      case 1:
        this.newNode = newNode;
        this.oldNode = oldNode;
        this.updateNodeStatus(oldNode, newNode);
        this.processTab++;
        this.currentTab++;
        break;
    }
    // this.changeDetectorRef.detectChanges();
    this.detectorRef.markForCheck();
  }

  previous(currentTab) {
    let oldNode = currentTab;
    let newNode = oldNode - 1;
    this.updateNodeStatus(oldNode, newNode);
    this.currentTab--;
  }
  //#endregion

  //#region change actived
  changeActived(data) {
    this.dataCurrent = data;
    this.detectorRef.markForCheck();
  }
  //#endregion
}
