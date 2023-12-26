import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Optional,
  ViewChild,
} from '@angular/core';
import { CallFuncService, DialogData, DialogModel, DialogRef, FormModel } from 'codx-core';
import { FormPropertiesFieldsComponent } from './form-properties-fields/form-properties-fields.component';

@Component({
  selector: 'lib-popup-add-process',
  templateUrl: './popup-add-process.component.html',
  styleUrls: ['./popup-add-process.component.scss'],
})
export class PopupAddProcessComponent {
  @ViewChild('status') status: ElementRef;

  dialog: any;
  data: any;
  action = 'add';
  currentTab = 0; //Tab hiện tại
  processTab = 0; // Tổng bước đã quua
  newNode: number; //vị trí node mới
  oldNode: number; // Vị trí node cũ
  constructor(
    private detectorRef: ChangeDetectorRef,
    private callfc: CallFuncService,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    this.dialog = dialog;
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  //#region setting created tab
  clickTab(tabNo: number) {
    let newNo = tabNo;
    let oldNo = this.currentTab;
    // if (tabNo <= this.processTab && tabNo != this.currentTab) { //cmt tạm để làm cho xong rồi bắt sau
      this.updateNodeStatus(oldNo, newNo);
      this.currentTab = tabNo;
    // }
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
    if (this.currentTab > 3) return;
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
      case 2:
        this.updateNodeStatus(oldNode, newNode);
        this.currentTab++;
        this.processTab++;
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

  //#region form setting properties
  formPropertieFields(){
    let option = new DialogModel();
    option.IsFull = true;
    option.zIndex = 1010;
    let formModelField = new FormModel();
    formModelField.formName = "DPStepsFields";
    formModelField.gridViewName = "grvDPStepsFields";
    formModelField.entityName = "DP_Steps_Fields";
    formModelField.userPermission = this.dialog?.formModel?.userPermission;
    option.FormModel = formModelField;
    let data = {};
    let popupDialog = this.callfc.openForm(
      FormPropertiesFieldsComponent,
      '',
      null,
      null,
      '',
      data,
      '',
      option
    );
    popupDialog.closed.subscribe((dg) => {
      if(dg){

      }
    })
  }
  //#endregion
}
