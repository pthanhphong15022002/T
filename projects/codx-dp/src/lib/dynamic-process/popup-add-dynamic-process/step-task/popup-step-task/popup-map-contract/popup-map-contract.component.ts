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
export class PopupMapContractComponent implements OnInit {
  @ViewChild('form') form: CodxFormComponent;

  dialog: DialogRef;
  datas: any;
  titleAction = '';
  data: any;
  entityName = 'entityName'; //test
  formModelField: FormModel = {
    gridViewName: 'grvDPStepsFields',
    formName: 'DPStepsFields',
    entityName: 'DP_Steps_Fields',
  };
  dataRef = [];
  dataSelect;
  fieldsFields = { text: 'title', value: 'recID' };
  listField;
  grvOld;
  listFieldConvert;
  indexRemote;

  grvContracts;
  listFieldIDChoose;
  listFieldShow;
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.datas = dt?.data?.datas;
    this.titleAction = dt?.data?.titleAction;
    this.listField = dt?.data?.listFields;
  }

  ngOnInit(): void {
    this.grvContracts = JSON.parse(JSON.stringify(this.datas));
    this.listField = this.listField?.map(item => ({title: item?.title, recID: item?.recID, fieldName: null}));
    this.listFieldIDChoose = this.grvContracts?.filter(x => x.field)?.map(y => y?.field?.recID);
    this.setListFieldShow();
  }

  setListFieldShow(){
    this.listFieldShow = [];
    for(let field of this.listField){
      if(!this.listFieldIDChoose?.some(x => x == field?.recID)){
        this.listFieldShow?.push(field);
      }
    }
  }

  onClickCombobox(grv){
    if(this.grvOld != grv){
      if(this.grvOld){
        this.grvOld.show = false;
        if(this.grvOld?.field && this.listFieldShow?.some(x => x.recID == this.grvOld?.field?.recID)){
          let indexGrv = this.listFieldShow?.findIndex(x => x.recID == this.grvOld?.field?.recID);
          if(indexGrv >= 0){
            this.listFieldShow?.splice(indexGrv,1);
          }
        }
      }
      if(grv?.field && !this.listFieldShow?.some(x => x.recID == grv?.field?.recID)){
        this.listFieldShow.unshift({...grv?.field});
      }
      this.grvOld = grv;
      grv.show = true;
      this.changeDetectorRef.markForCheck();
    }
  }


  fieldIDChange(event, grv){
    if(event){
      let data = event?.value;
      if(data){
        let field = this.listFieldShow?.find(x => x.recID == data);
        if(field) grv.field = field;
      }else{
        grv.field = null;
        this.indexRemote = null;
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
    this.dialog.close(this.grvContracts);
  }
  
  close(){
    this.dataSelect.check = false;
    this.dialog.close();
  }
}
