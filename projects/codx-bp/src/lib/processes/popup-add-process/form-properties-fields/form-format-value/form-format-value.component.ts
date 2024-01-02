import { CdkDragDrop, copyArrayItem, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CallFuncService, FormModel } from 'codx-core';

@Component({
  selector: 'codx-form-format-value',
  templateUrl: './form-format-value.component.html',
  styleUrls: ['./form-format-value.component.css']
})
export class FormFormatValueComponent implements OnInit {
  @Input() lstFields: any;
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
  }

  loadData(lstFields){
    this.lstFields = JSON.parse(JSON.stringify(lstFields));
    this.countData = this.lstFields?.filter(x => x.controlType != 'F')?.length;
    this.isPopupUserCbb = false;
    this.detectorRef.detectChanges();
  }

  clickData(data){
    this.renderData.emit({data: data});
  }

  //#region drop
  drop(event: CdkDragDrop<any[]>): void {
    const item = event.item.data;
    if (event.container === event.previousContainer) {
      moveItemInArray(this.lstFields, event.previousIndex, event.currentIndex);
      this.dropLists.emit({e: this.lstFields})
    } else {
      transferArrayItem(
        event.previousContainer.data,
        this.lstFields,
        event.previousIndex + 1,
        event.currentIndex + 1
      );
      this.dropLists.emit({ e: this.lstFields });
    }
    this.detectorRef.detectChanges();
  }
  //#endregion

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
