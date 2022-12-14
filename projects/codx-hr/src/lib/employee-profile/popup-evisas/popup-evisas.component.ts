import { FormGroup } from '@angular/forms';
import { CodxHrService } from './../../codx-hr.service';
import { Injector, ChangeDetectorRef } from '@angular/core';
import { Component, OnInit, Optional, ViewChild } from '@angular/core';
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

@Component({
  selector: 'lib-popup-evisas',
  templateUrl: './popup-evisas.component.html',
  styleUrls: ['./popup-evisas.component.css']
})
export class PopupEVisasComponent extends UIComponent implements OnInit {

  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  lstVisas: any;
  visaObj
  actionType
  headerText: ''
  funcID;
  indexSelected
  employId;
  isAfterRender = false;
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('listView') listView: CodxListviewComponent;

  constructor(
    private injector: Injector,
    private notify: NotificationsService,
    private cr: ChangeDetectorRef,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    if(!this.formModel){
      this.formModel = new FormModel();
      this.formModel.formName = 'EVisas';
      this.formModel.entityName = 'HR_EVisas';
      this.formModel.gridViewName = 'grvEVisas';
    }
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.funcID = this.dialog.formModel.funcID;
    this.actionType = data?.data?.actionType;
    this.employId = data?.data?.employeeId;
    this.lstVisas = data?.data?.lstVisas
    console.log('lst visa constructor',this.lstVisas) ;
    
    this.indexSelected = data?.data?.indexSelected != undefined?data?.data?.indexSelected:-1

    if(this.actionType === 'edit' || this.actionType === 'copy'){
      this.visaObj = JSON.parse(JSON.stringify(this.lstVisas[this.indexSelected]));
      this.formModel.currentData = this.visaObj
    }
  }

  // ngAfterViewInit(){
  //   this.dialog && this.dialog.closed.subscribe(res => {
  //     if(!res.event){
  //       this.dialog.close(this.lstVisas);
  //     }
  //   })
  // }
    initForm(){
      this.hrService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        console.log('form group vua lay ra', item);
        
        this.formGroup = item;  
        if(this.actionType === 'add'){
          this.hrService.getEmployeeVisaModel().subscribe(p => {
            this.visaObj = p;
            this.formModel.currentData = this.visaObj
            // this.dialog.dataService.dataSelected = this.data
        })
        }
        this.formGroup.patchValue(this.visaObj)
        this.isAfterRender = true
    });
  }

  onInit(): void {
    this.initForm();
  }

  onSaveForm(){
    if(this.actionType === 'copy' || this.actionType === 'add'){
      delete this.visaObj.recID
    }
    this.visaObj.employeeID = this.employId 
    
    if(this.actionType === 'add' || this.actionType === 'copy'){
      this.hrService.AddEmployeeVisaInfo(this.visaObj).subscribe(p => {
        if(p != null){
          this.visaObj.recID = p.recID;
          this.notify.notifyCode('SYS007')
          this.lstVisas.push(JSON.parse(JSON.stringify(this.visaObj)));
          console.log('list visa', this.lstVisas);
          
          if(this.listView){
            (this.listView.dataService as CRUDService).add(this.visaObj).subscribe();
          }
          // this.dialog.close(p)
        }
        else this.notify.notifyCode('DM034')
      });
    }
    else{
      this.hrService.updateEmployeeVisaInfo(this.formModel.currentData).subscribe(p => {
        if(p != null){
          this.notify.notifyCode('SYS007')
          this.lstVisas[this.indexSelected] = p;
          if(this.listView){
            (this.listView.dataService as CRUDService).update(this.lstVisas[this.indexSelected]).subscribe()
          }
          // this.dialog.close(this.data);
        }
        else this.notify.notifyCode('DM034')
      });
    }
    
  }

  click(data) {
    console.log('formdata', data);
    this.visaObj = data;
    this.formModel.currentData = JSON.parse(JSON.stringify(this.visaObj)) 
    // this.indexSelected = this.lstVisas.indexOf(this.visaObj)
    this.indexSelected = this.lstVisas.findIndex(p => p.recID == this.visaObj.recID);
    this.actionType ='edit'
    this.formGroup?.patchValue(this.visaObj);
    this.cr.detectChanges();
  }

  afterRenderListView(evt){
    this.listView = evt;
    console.log(this.listView);
  }

}
