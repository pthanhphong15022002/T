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
    this.headerText = data?.data?.headerText;
    this.vllName = data?.data?.vllName;
    this.formModel = data?.data?.formModel;
    this.lstDataSelected = data?.data?.dataSelected? data?.data?.dataSelected.split(';') : []
  }

  onInit(): void {
    this.cache.valueList(this.vllName).subscribe((res)=>{
      this.lstData=res.datas
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
    })
  }

  onSaveForm(){
    this.dialog && this.dialog.close(this.lstDataSelected.join(';'));
  }

  onChangeSelect(event, data){
    if(event.data == true){
      this.lstDataSelected.push(data.value);
    }
    else if(event.data == false){
      let index = this.lstDataSelected.indexOf(data.value);
      this.lstDataSelected.splice(index,1);
    }
  }
}
