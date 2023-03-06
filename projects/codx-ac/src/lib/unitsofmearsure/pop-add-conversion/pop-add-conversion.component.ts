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
  validate:any = 0;
  type:any;
  umconversion:UMConversion = new UMConversion();
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
    this.type = dialogData.data?.type;
    if (dialogData.data?.umid != null) {
      this.umconversion.fromUMID = dialogData.data?.umid;
    }
    if (dialogData.data?.data != null) {
      this.umconversion = dialogData.data?.data;
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
  }
  //#endregion

  //#region Function
  valueChangeInverted(e:any){
    if (e.data) {
      this.umconversion[e.field] = 1;
    }else{
      this.umconversion[e.field] = 0;
    }  
  }
  valueChange(e:any){
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
      if (this.type == 'edit') {
        this.notification.notifyCode('SYS007', 0, '');
      }else{
        this.notification.notifyCode('SYS006', 0, '');
      }
      window.localStorage.setItem("dataumconversion",JSON.stringify(this.umconversion));
      this.dialog.close();
    }
  }
  //#endregion
}
