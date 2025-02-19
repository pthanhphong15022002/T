import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { CodxFormComponent, DialogData, DialogRef, NotificationsService, UIComponent } from 'codx-core';

@Component({
  selector: 'lib-popup-multiselectvll',
  templateUrl: './popup-multiselectvll.component.html',
  styleUrls: ['./popup-multiselectvll.component.css']
})
export class PopupMultiselectvllComponent extends UIComponent implements OnInit{

  lstData: any;
  dialog: any;
  lstDataSelected: any =[];
  vllName: any;
  headerText: '';
  isAfterRender = false;
  formModel: '';
  @ViewChild('form') form: CodxFormComponent;
  constructor(
    private injector: Injector,
    private notify: NotificationsService,
    private cr: ChangeDetectorRef,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog
    debugger
    this.headerText = data?.data?.headerText;
    this.vllName = data?.data?.vllName;
    this.formModel = data?.data?.formModel;
    this.lstDataSelected = data?.data?.dataSelected? data?.data?.dataSelected.split(';') : []
  }

  onInit(): void {
    this.cache.valueList(this.vllName).subscribe((res)=>{
      this.lstData=res.datas

      for(let i = 0; i < this.lstData.length; i++){
          this.lstData[i].checked = false;
      }

      if(this.lstDataSelected.length > 0){
        for(let i = 0; i< this.lstData.length; i++){
          for(let j = 0; j < this.lstDataSelected.length; j++){
            if(this.lstData[i].value == this.lstDataSelected[j]){
              this.lstData[i].checked = true;
              continue;
            }
          }
        }
      }

    this.isAfterRender = true;
    })
  }

  onSaveForm(){
    this.dialog && this.dialog.close(this.lstDataSelected.join(';'));
  }

  onChangeSelect(event, data){
    if(event.data == true && data.checked == false){
      this.lstDataSelected.push(data.value);
      for(let i = 0; i < this.lstData.length; i++){
        if(this.lstData[i].value == data.value){
          this.lstData[i].checked = true;
        }
      }
    }
    else if(event.data == false && data.checked == true){
      let index = this.lstDataSelected.indexOf(data.value);
      this.lstDataSelected.splice(index,1);
      for(let i = 0; i < this.lstData.length; i++){
        if(this.lstData[i].value == data.value){
          this.lstData[i].checked = false;
        }
      }
    }
  }

  onClickUnSelectAll(){
    this.lstDataSelected = []
    for(let i = 0; i < this.lstData.length; i++){
        this.lstData[i].checked = false;
    }
    this.cr.detectChanges()
  }
}
