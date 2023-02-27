import { L } from '@angular/cdk/keycodes';
import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { UIComponent, CodxFormComponent, FormModel, DialogRef, CacheService, CallFuncService, NotificationsService, DialogData } from 'codx-core';
import { CodxAcService } from '../../codx-ac.service';
import { ARPostingAccounts } from '../../models/ARPostingAccounts.model';

@Component({
  selector: 'lib-pop-add-ar',
  templateUrl: './pop-add-ar.component.html',
  styleUrls: ['./pop-add-ar.component.css']
})
export class PopAddArComponent extends UIComponent implements OnInit {
  @ViewChild('form') form: CodxFormComponent;
  headerText: any;
  formModel: FormModel;
  dialog!: DialogRef;
  gridViewSetup: any;
  formType: any;
  subheaderText:any;
  moduleID:any;
  postType:any;
  arposting:ARPostingAccounts;
  validate: any = 0;
  constructor(
    private inject: Injector,
    cache: CacheService,
    private acService: CodxAcService,
    private dt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) { 
    super(inject);
    this.dialog = dialog;
    this.headerText = dialogData.data?.headerText;
    this.arposting = dialog.dataService!.dataSelected;
    this.moduleID = dialogData.data?.moduleID;
    this.postType = dialogData.data?.postType;
    this.formType = dialogData.data?.formType;
    this.subheaderText = dialogData.data?.subheaderText;
    this.cache
      .gridViewSetup('ARPostingAccounts', 'grvARPostingAccounts')
      .subscribe((res: []) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
  }

  onInit(): void {}
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
  }
  valueChange(e: any) {
    this.arposting[e.field] = e.data;
    console.log(e.data);
  }
  checkValidate() {
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.arposting);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.arposting[keymodel[i]] == null ||
              this.arposting[keymodel[i]] == ''
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
  onSave(){
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    }else{
      console.log(this.arposting);
    }
  }
  onSaveAdd(){

  }
}
