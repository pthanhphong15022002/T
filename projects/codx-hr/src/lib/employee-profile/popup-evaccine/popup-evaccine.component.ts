import { O } from '@angular/cdk/keycodes';
import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  CodxFormComponent,
  CodxListviewComponent,
  CRUDService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { CodxHrService } from '../../codx-hr.service';
@Component({
  selector: 'lib-popup-evaccine',
  templateUrl: './popup-evaccine.component.html',
  styleUrls: ['./popup-evaccine.component.scss'],
})
export class PopupEVaccineComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  data: any;
  listData: any; // 
  funcID: string;
  idField: string = 'recID';
  actionType: string;
  employeeId: string;

  oldVaccineTypeID : string; // xử lí binding data main view
  isAfterRender = false;
  headerText: string;
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('listView') listView: CodxListviewComponent;

  constructor(
    private injector: Injector,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.employeeId = data?.data?.employeeId;
    this.actionType = data?.data?.actionType;
    this.funcID = data?.data?.funcID;
    this.listData = data?.data?.listData;

    console.log('list', this.listData);
    

    if (this.actionType === 'edit' || this.actionType === 'copy') {
      this.data = JSON.parse(JSON.stringify(data?.data?.vaccineSelected));
    }
  }

  onInit(): void {
    this.hrService.getFormModel(this.funcID).then((formModel) => {
      if (formModel) {
        this.formModel = formModel;
        this.hrService
          .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
          .then((formGroup) => {
            if (formGroup) {
              this.formGroup = formGroup;
              this.initForm();
            }
          });
      }
    });
  }

  initForm() {
    if (this.actionType == 'add') {
      this.hrService
        .getDataDefault(
          this.formModel.funcID,
          this.formModel.entityName,
          this.idField
        )
        .subscribe((res) => {
          if (res && res.data) {
            this.data = res?.data;
            this.data.employeeID = this.employeeId;
            this.formModel.currentData = this.data;
            this.formGroup.patchValue(this.data);
            this.cr.detectChanges();
            this.isAfterRender = true;
          } else {
            this.notify.notify('Error');
        }
      });
    } else {
      this.oldVaccineTypeID = this.data.vaccineTypeID

      this.formModel.currentData = this.data;
      this.formGroup.patchValue(this.data);
      this.cr.detectChanges();;
      this.isAfterRender = true;
    }
  }

  onSaveForm(isClose: boolean) {
    // if (this.formGroup.invalid) {
    //   this.hrService.notifyInvalid(this.formGroup, this.formModel);
    //   return;
    // }

    if (this.actionType == 'add' || this.actionType == 'copy') {
      this.hrService.addEVaccine(this.data).subscribe((res) => {
        if (res) {
          this.data = res;
          (this.listView.dataService as CRUDService).add(res).subscribe();
          this.updateListData(this.data, this.actionType);
          this.actionType = 'edit';
          if (isClose) {
            this.dialog && this.dialog.close();
          }
        }
      });
    } else if (this.actionType == 'edit') {
      this.hrService.editEVaccine(this.data).subscribe((res) => {
        if (res) {
          this.data = res;
          this.updateListData(this.data, this.actionType);
          (this.listView.dataService as CRUDService).update(res).subscribe();
          if (isClose) {
            this.dialog && this.dialog.close();
          }
        }
      });
    }

    this.cr.detectChanges();
  }

  afterRenderListView(event: any) {
    this.listView = event;
    console.log(this.listView);
  }

  updateListData(data: any, actionType: string){
    let grpVType = this.listData.filter(p => p.vaccineTypeID == this.data.vaccineTypeID)
    if(grpVType)
    

    if(actionType == 'add' || actionType == 'copy'){
      if(grpVType){
        let lstVaccine = grpVType[0].vaccines;        
        lstVaccine.push(this.data)
        lstVaccine.sort((a, b) =>Date.parse(b.injectDate) - Date.parse(a.injectDate))
      }
      else{
        let obj = {vaccineTypeID: this.data.vaccineTypeID, vaccines: [this.data]}
        this.listData.push(obj);
      }
    }
    else if(actionType == 'edit'){
      console.log(this.data.vaccineTypeID);
      console.log(this.oldVaccineTypeID);

      if(this.data.vaccineTypeID == this.oldVaccineTypeID){
        let oldGrpType = this.listData.filter(p => p.vaccineTypeID == this.oldVaccineTypeID)
        if(oldGrpType){
          let index = grpVType[0].vaccines.findIndex(p=> p.recID == this.data.recID);
          if(index > -1){
            grpVType[0].vaccines.splice(index, 1);
          }
        }
      }
    }
    console.log(this.listData);
    console.log(data);
    
    

  }

  click(data) {
    if(data){
      this.data = data;
      this.oldVaccineTypeID = this.data.oldVaccineTypeID

      this.formModel.currentData = this.data;
      this.formGroup.patchValue(this.data);
      this.cr.detectChanges();
    }
  }
}
