import { filter } from 'rxjs';
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
  listFieldConvert;
  indexRemote;
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
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
    this.datas = this.datas?.map(item => ({...item,show: false, hover: false,field: null}))
    this.listFields = this.listFields?.map(item => ({title: item?.title, recID: item?.recID}));
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

  onClick(item){
    if(this.itemOld && this.itemOld != item){
      this.itemOld.hover = false;
      let index = this.listFields?.findIndex(x => x.recID == this.indexRemote?.recID);
      if(index >= 0){
        this.listFields?.splice(index, 1);
      }
      if(item?.field){
        let check = this.listFields?.some(x => x.recID == item?.field?.recID);
        if(!check){
          this.listFields.push(item?.field);
        }
      }
    }
    item.show = false;
    item.hover = true;
    this.itemOld = item;
    this.changeDetectorRef.detectChanges();
  }
  onMouseLeave(item){
    if(item?.field){
      let index = this.listFields.findIndex(x => x.recID == item?.field?.recID);
      if(index >= 0){
        this.listFields?.splice(index,1);
      }
    }
    item.show = false;
  }
  onMouseEnter(item){
    if(item?.field){
      let check = this.listFields.some(x => x.recID == item?.field?.recID);
      if(!check){
        this.listFields.push(item?.field);
      }
    }
    item.show = true;
  }
  handleDivClick(event: Event,item) {
    event.stopPropagation(); // Ngăn chặn lan truyền của sự kiện click
    // Thực hiện các hành động khi click vào div
    item.show = true;
    console.log('Clicked inside div!');
  }

  fieldIDChange(event, item){
    if(event){
      let index = this.listFields?.findIndex(x => x.recID == event);
      if(index >= 0){
        if(item.field && !this.listFields?.some(x => x.recID == item?.field?.recID) ){
          this.listFields.push(item.field);
        }
        item.field = this.listFields[index];
        this.indexRemote = this.listFields[index];
      }
    }
  }
  saveData() {
    let data = this.datas?.filter(x => x.field);
    let fields = [];
    let fieldIDs = [];
    if(data?.length > 0){
      fields = data?.map(x => (x.field?.recID + '/' + x?.fieldName))
      fieldIDs = data?.map(x => (x.field?.recID))
    }
    this.dialog.close({fields, fieldIDs});
  }
  
  close(){
    this.dataSelect.check = false;
    this.dialog.close();
  }
  // @HostListener('document:mousemove', ['$event'])
  // onMouseMove(event: MouseEvent) {
  //    consthoveredElement = event.target as HTMLElement;
  //   const hoveredElementClasses = hoveredElement.classList;
  //   console.log('Classes of hovered element:', hoveredElementClasses);
  // }
}
