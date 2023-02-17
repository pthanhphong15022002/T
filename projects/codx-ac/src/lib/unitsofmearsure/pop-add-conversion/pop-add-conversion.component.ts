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
  @ViewChild('form') public form: CodxFormComponent;
  dialog!: DialogRef;
  headerText:string;
  formModel: FormModel;
  gridViewSetup:any;
  itemID:any;
  toUMID:any;
  fromUMID:any;
  conversion:any;
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
    if (dialogData.data?.umid != null) {
      this.fromUMID = dialogData.data?.umid;
    }
    if (dialogData.data?.data != null) {
      this.umconversion = dialogData.data?.data;
      this.itemID = this.umconversion.itemID;
      this.toUMID = this.umconversion.toUMID;
      this.conversion = this.umconversion.conversion;
      this.fromUMID = this.umconversion.fromUMID;
    }
    this.cache.gridViewSetup('UMConversion', 'grvUMConversion').subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
      }
    });
   }

   onInit(): void {
  }
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
    if (this.umconversion == null) {
      this.umconversion = this.form.formGroup.value;
      this.umconversion.fromUMID = this.fromUMID;
      this.umconversion.recID = Guid.newGuid();
    }
    
  }
  valueChange(e:any){
    this.umconversion[e.field] = e.data;
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
  onSave(){
    if (this.itemID.trim() == '' || this.itemID == null) {
      this.notification.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['ItemID'].headerText + '"'
      );
      return;
    }
    if (this.toUMID.trim() == '' || this.toUMID == null) {
      this.notification.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['ToUMID'].headerText + '"'
      );
      return;
    }
    if (this.conversion.trim() == '' || this.conversion == null) {
      this.notification.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['ToUMID'].headerText + '"'
      );
      return;
    }
    // window.localStorage.setItem("dataumconversion",JSON.stringify(this.umconversion));
    // this.dialog.close();
    console.log(this.umconversion);
  }

}
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
