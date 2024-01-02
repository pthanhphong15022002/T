import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  CodxFormComponent,
  DialogData,
  DialogRef,
  FormModel,
} from 'codx-core';

import { DP_Steps_Fields } from 'projects/codx-dp/src/lib/models/models';

@Component({
  selector: 'popup-map-contract',
  templateUrl: './popup-map-contract.component.html',
  styleUrls: ['./popup-map-contract.component.scss'],
})
export class PopupMapContractComponent implements OnInit, AfterViewInit {
  @ViewChild('form') form: CodxFormComponent;

  dialog: DialogRef;
  datas: any;
  titleAction = '';
  data: any;
  listField = []; //mảng field
  entityName = 'entityName'; //test
  formModelField: FormModel = {
    gridViewName: 'grvDPStepsFields',
    formName: 'DPStepsFields',
    entityName: 'DP_Steps_Fields',
  };
  dataRef = [];
  dataSelect;
  fieldsFields = { text: 'title', value: 'recID' };
  listFields;
  itemOld;
  constructor(
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.datas = dt?.data?.datas;
    this.dataRef = dt?.data?.dataRef ?? [];
    this.titleAction = dt?.data?.titleAction;
    this.listFields = dt?.data?.listFields;
  }

  ngAfterViewInit(): void {}
  ngOnInit(): void {
    this.datas = this.datas?.map(item => ({...item,show: false, hover: false}))
  }


  selectField(field) {
    field.check = true;
    if(this.dataSelect){
      this.dataSelect.check = false;
    }
    this.dataSelect = field;
  }

  check(recID) {
    let idx = this.dataRef.findIndex((x) => x.recID == recID);
    return idx != -1;
  }

  saveData() {
    this.dialog.close(this.dataSelect);
  }
  close(){
    this.dataSelect.check = false;
    this.dialog.close();
  }
  onClick(item){
    item.hover = true;
    if(this.itemOld && this.itemOld != item){
      this.itemOld.hover = false;
    }
    this.itemOld = item;
  }
  onMouseLeave(item){
    item.show = false;
  }
  onMouseEnter(item){
    item.show = true;
    if(this.itemOld){

    }
  }
  handleDivClick(event: Event,item) {
    event.stopPropagation(); // Ngăn chặn lan truyền của sự kiện click
    // Thực hiện các hành động khi click vào div
    item.show = true;
    console.log('Clicked inside div!');
  }

  // @HostListener('document:mousemove', ['$event'])
  // onMouseMove(event: MouseEvent) {
  //    consthoveredElement = event.target as HTMLElement;
  //   const hoveredElementClasses = hoveredElement.classList;
  //   console.log('Classes of hovered element:', hoveredElementClasses);
  // }
}
