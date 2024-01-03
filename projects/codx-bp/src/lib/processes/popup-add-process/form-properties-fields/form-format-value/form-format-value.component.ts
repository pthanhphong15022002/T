import { CdkDragDrop, copyArrayItem, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CallFuncService, FormModel } from 'codx-core';

@Component({
  selector: 'codx-form-format-value',
  templateUrl: './form-format-value.component.html',
  styleUrls: ['./form-format-value.component.css']
})
export class FormFormatValueComponent implements OnInit {
  @Input() subItem: any;
  @Input() dataCurrent: any;
  @Input() isShowTextHeader: boolean = false;
  @Input() formModel: FormModel = {
    formName: 'DPStepsFields',
    gridViewName: 'grvDPStepsFields',
    entityName: 'DP_Steps_Fields',
  };
  @Output() renderData = new EventEmitter<any>();
  @Output() dropLists = new EventEmitter<any>();
  datasVll = [];
  countData = 0;
  isPopupUserCbb = false;
  constructor(private detectorRef: ChangeDetectorRef, private callFc: CallFuncService){

  }

  ngOnInit(): void {
    this.isPopupUserCbb = false;
  }

  loadData(){
    this.isPopupUserCbb = false;
    this.detectorRef.detectChanges();
  }

  clickData(data){
    this.renderData.emit({data: data});
  }

  //#region popup
  openPopup(){
    this.isPopupUserCbb = true;
    this.detectorRef.detectChanges();
  }
  valueChangePop(e){
    if (this.isPopupUserCbb) this.isPopupUserCbb = false;
  }
  //#endregion

  createRangeArray(min: number, max: number): number[] {
    return Array.from({ length: max - min + 1 }, (_, index) => min + index);
  }
}
