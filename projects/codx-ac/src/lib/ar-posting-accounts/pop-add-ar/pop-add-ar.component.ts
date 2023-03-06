import { L } from '@angular/cdk/keycodes';
import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  UIComponent,
  CodxFormComponent,
  FormModel,
  DialogRef,
  CacheService,
  CallFuncService,
  NotificationsService,
  DialogData,
  RequestOption,
} from 'codx-core';
import { CodxAcService } from '../../codx-ac.service';
import { ARPostingAccounts } from '../../models/ARPostingAccounts.model';

@Component({
  selector: 'lib-pop-add-ar',
  templateUrl: './pop-add-ar.component.html',
  styleUrls: ['./pop-add-ar.component.css'],
})
export class PopAddArComponent extends UIComponent implements OnInit {
  //#region Contructor
  @ViewChild('form') form: CodxFormComponent;
  headerText: any;
  formModel: FormModel;
  dialog!: DialogRef;
  gridViewSetup: any;
  formType: any;
  subheaderText: any;
  arposting: ARPostingAccounts;
  moduleID: any;
  postType: any;
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
    if (
      dialogData.data?.moduleID != null &&
      dialogData.data?.postType != null
    ) {
      this.moduleID = dialogData.data?.moduleID;
      this.postType = dialogData.data?.postType;
      this.arposting.moduleID = this.moduleID;
      this.arposting.postType = this.postType;
    }
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
//#endregion

//#region Init
  onInit(): void {}
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
  }
  //#endregion

  //#region Event
  valueChange(e: any) {
    this.arposting[e.field] = e.data;
  }
  valueChangeCustLevel(e: any) {
    this.arposting.custSelection = '';
    if (e.data == '3') {
      this.gridViewSetup['CustSelection'].isRequire = false;
    }else{
      this.gridViewSetup['CustSelection'].isRequire = true;
    }
    this.arposting[e.field] = e.data;
  }
  valueChangeItemLevel(e: any) {
    this.arposting.itemSelection = '';
    if (e.data == '4') {
      this.gridViewSetup['ItemSelection'].isRequire = false;
    }else{
      this.gridViewSetup['ItemSelection'].isRequire = true;
    }
    this.arposting[e.field] = e.data;
  }
  //#endregion

  //#region Function
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
  validateRules() {
    this.gridViewSetup['PmtMethodID'].isRequire = false;
    this.gridViewSetup['CurrencyID'].isRequire = false;
    this.gridViewSetup['RecvAcctID'].isRequire = false;
  }
  //#endregion

  //#region Method
  onSave() {
    if (this.arposting.moduleID == 2) {
      this.validateRules();
    }
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      if (this.formType == 'add') {
        this.dialog.dataService
          .save((opt: RequestOption) => {
            opt.methodName = 'AddAsync';
            opt.className = 'ARPostingAccountsBusiness';
            opt.assemblyName = 'AC';
            opt.service = 'AC';
            opt.data = [this.arposting];
            return true;
          })
          .subscribe((res) => {
            if (res.save) {
              this.dialog.close();
              this.dt.detectChanges();
            } else {
              this.notification.notify('Thiết lập đã tồn tại', '2');
              return;
            }
          });
      }
      if (this.formType == 'edit') {
        this.dialog.dataService
          .save((opt: RequestOption) => {
            opt.methodName = 'UpdateAsync';
            opt.className = 'ARPostingAccountsBusiness';
            opt.assemblyName = 'AC';
            opt.service = 'AC';
            opt.data = [this.arposting];
            return true;
          })
          .subscribe((res) => {
            if (res.save || res.update) {
              this.dialog.close();
              this.dt.detectChanges();
            }
          });
      }
    }
  }
  onSaveAdd() {
    if (this.arposting.moduleID == 2) {
      this.validateRules();
    }
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      this.dialog.dataService
        .save((opt: RequestOption) => {
          opt.methodName = 'AddAsync';
          opt.className = 'ARPostingAccountsBusiness';
          opt.assemblyName = 'AC';
          opt.service = 'AC';
          opt.data = [this.arposting];
          return true;
        })
        .subscribe((res) => {
          if (res.save) {
              this.form.formGroup.reset();
              this.dialog.dataService.clear();
              this.dialog.dataService.addNew().subscribe((res) => {
              this.arposting = this.dialog.dataService.dataSelected;
              this.arposting.moduleID = this.moduleID;
              this.arposting.postType = this.postType;
            });
          } else {
            this.notification.notify('Thiết lập đã tồn tại', '2');
            return;
          }
        });
    }
  }
  //#endregion
}
