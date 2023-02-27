import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { ApiHttpService, CacheService, CallFuncService, CodxFormComponent, DialogData, DialogRef, FormModel, NotificationsService, UIComponent } from 'codx-core';
import { CodxAcService } from '../../codx-ac.service';
import { UMConversion } from '../../models/UMConversion.model';

@Component({
  selector: 'lib-pop-add-conversion',
  templateUrl: './pop-add-conversion.component.html',
  styleUrls: ['./pop-add-conversion.component.css']
})
export class PopAddConversionComponent extends UIComponent implements OnInit {
  //#region Contructor
  @ViewChild('form') public form: CodxFormComponent;
  dialog!: DialogRef;
  headerText:string;
  formModel: FormModel;
  gridViewSetup:any;
  itemID:any;
  toUMID:any;
  fromUMID:any;
  conversion:any;
  inverted:any;
  validate:any = 0;
  umconversion:UMConversion;
  constructor(
    private inject: Injector,
    cache: CacheService,
    private acService: CodxAcService,
    api: ApiHttpService,
    private dt: ChangeDetectorRef, 
    private callfunc: CallFuncService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData 
  ) {
    super(inject);
    this.dialog = dialog;
    this.headerText = dialogData.data?.headerText;
    this.itemID = '';
    this.toUMID = '';
    this.conversion = '';
    this.inverted = false;
    if (dialogData.data?.umid != null) {
      this.fromUMID = dialogData.data?.umid;
    }
    if (dialogData.data?.data != null) {
      this.umconversion = dialogData.data?.data;
      this.itemID = this.umconversion.itemID;
      this.toUMID = this.umconversion.toUMID;
      this.conversion = this.umconversion.conversion;
      this.fromUMID = this.umconversion.fromUMID;
      if (this.umconversion.fromUMID == 1) {
        this.inverted = true;
      }else{
        this.inverted = false;
      }
    }
    this.cache.gridViewSetup('UMConversion', 'grvUMConversion').subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
      }
    });
   }
//#endregion

//#region Init
   onInit(): void {
  }
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
    if (this.umconversion == null) {
      this.umconversion = this.form.formGroup.value;
      this.umconversion.fromUMID = this.fromUMID;
      this.umconversion.recID = Guid.newGuid();
      this.umconversion.inverted = 0;
    }
  }
  //#endregion

  //#region Function
  valueChangeInverted(e:any){
    this.inverted = e.data
    if (e.data) {
      this.umconversion[e.field] = 1;
    }else{
      this.umconversion[e.field] = 0;
    }  
  }
  valueChangeItemID(e:any){
    this.itemID = e.data;
    this.umconversion[e.field] = e.data;
  }
  valueChangeToUMID(e:any){
    this.toUMID = e.data;
    this.umconversion[e.field] = e.data;
  }
  valueChangeConversion(e:any){
    this.conversion = e.data;
    this.umconversion[e.field] = e.data;
  }
  checkValidate() {
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.umconversion);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.umconversion[keymodel[i]] == null ||
              this.umconversion[keymodel[i]] == ''
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
  //#endregion

  //#region CRUD
  onSave(){
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    }else{
      window.localStorage.setItem("dataumconversion",JSON.stringify(this.umconversion));
      this.dialog.close();
    }
  }
  //#endregion
}
//#region Guid
class Guid {
  static newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
}
//#endregion
