import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { CodxFormComponent, DialogData, DialogRef, FormModel, NotificationsService, UIComponent } from 'codx-core';
import { VATPosting } from '../../../models/VATPosting.model';
import { CodxAcService } from '../../../codx-ac.service';

@Component({
  selector: 'lib-pop-add-vatposting',
  templateUrl: './pop-add-vatposting.component.html',
  styleUrls: ['./pop-add-vatposting.component.css']
})
export class PopAddVatpostingComponent extends UIComponent implements OnInit{
  
  //Constructor
  @ViewChild('form') public form: CodxFormComponent;
  vatPosting: VATPosting = new VATPosting();
  listVatPosting: Array<VATPosting> = [];
  headerText: any;
  title: any;
  formModel: FormModel;
  dialog!: DialogRef;
  gridViewSetup: any;
  formType: any;
  validate: any = 0;
  keyField: any = '';
  isDisableOffsetAcctID: boolean = true;
  isDisableVatAcctID: boolean = true;
  
  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private dt: ChangeDetectorRef,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ){
    super(inject);
    this.dialog = dialog;
    this.headerText = dialogData.data?.headerText;
    this.listVatPosting = dialogData.data?.listVatPosting;
    this.formType = dialogData.data?.formType;
    this.cache.gridViewSetup('VATPosting', 'grvVATPosting').subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
      }
    });
    if (dialogData.data?.data != null) {
      this.vatPosting = dialogData.data?.data;
    }
  }
  //End Constructor
  
  //Init
  onInit(): void {
  }
  //End Init

  //Event
  valueChange(e: any) {
    this.vatPosting[e.field] = e.data;

    switch(e.field){
      case 'postType':
        if(this.vatPosting.postType == '1')
          this.isDisableVatAcctID = false;
        else
          this.isDisableVatAcctID = true;
        this.dt.detectChanges();
        break;
      case 'postOffset':
        if(this.vatPosting.postOffset == '1')
          this.isDisableOffsetAcctID = false;
        else
          this.isDisableOffsetAcctID = true;
        this.dt.detectChanges();
        break;
      case 'objectType':
        this.form.formGroup?.controls['objectID'].reset();
        break;
    }
  }

  close()
  {
    this.dialog.close()
  }
  //End Event

  //Method
  onSave() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      window.localStorage.setItem(
        'vatPosting',
        JSON.stringify(this.vatPosting)
      );
      if (this.formType == 'edit') {
        this.notification.notifyCode('SYS007', 0, '');
      } else {
        this.notification.notifyCode('SYS006', 0, '');
      }
      this.dialog.close();
    }
  }

  onSaveAdd() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      this.notification.notifyCode('SYS006', 0, '');
      this.listVatPosting.push({ ...this.vatPosting });
      this.clearVatPosting();
    }
  }
  //End Method

  //Function
  checkValidate() {
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.vatPosting);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.vatPosting[keymodel[i]] == null ||
              String(this.vatPosting[keymodel[i]]).match(/^ *$/) !== null
            ) {
              this.notification.notifyCode(
                'SYS009',
                0,
                '"' + this.gridViewSetup[keygrid[index]].headerText + '"'
              );
              this.validate++;
            }
          }
        }
      }
    }
  }

  clearVatPosting() {
    this.form.formGroup.reset();
    this.vatPosting = new VATPosting();
  }
  //End Function
}
