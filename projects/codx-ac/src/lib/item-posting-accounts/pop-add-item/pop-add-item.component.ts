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
import { IVPostingAccounts } from '../../models/IVPostingAccounts.model';

@Component({
  selector: 'lib-pop-add-item',
  templateUrl: './pop-add-item.component.html',
  styleUrls: ['./pop-add-item.component.css'],
})
export class PopAddItemComponent extends UIComponent implements OnInit {
  //#region Contructor
  @ViewChild('form') form: CodxFormComponent;
  headerText: any;
  formModel: FormModel;
  dialog!: DialogRef;
  gridViewSetup: any;
  formType: any;
  subheaderText: any;
  moduleID: any;
  postType: any;
  validate: any = 0;
  itemposting: IVPostingAccounts;
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
    this.itemposting = dialog.dataService!.dataSelected;
    if (
      dialogData.data?.moduleID != null &&
      dialogData.data?.postType != null
    ) {
      this.moduleID = dialogData.data?.moduleID;
      this.postType = dialogData.data?.postType;
      this.itemposting.moduleID = this.moduleID;
      this.itemposting.postType = this.postType;
    }
    this.formType = dialogData.data?.formType;
    this.subheaderText = dialogData.data?.subheaderText;
    this.cache
      .gridViewSetup('IVPostingAccounts', 'grvIVPostingAccounts')
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
    this.itemposting[e.field] = e.data;
  }
  valueChangeCust(e: any) {
    this.itemposting.custSelection = '';
    if (e.field == 'custLevel' && e.data == '3') {
      this.gridViewSetup['CustSelection'].isRequire = false;
    } else {
      this.gridViewSetup['CustSelection'].isRequire = true;
    }
    this.itemposting[e.field] = e.data;
  }
  valueChangeItemLevel(e: any) {
    this.itemposting.itemSelection = '';
    if (e.data == '4') {
      this.gridViewSetup['ItemSelection'].isRequire = false;
    } else {
      this.gridViewSetup['ItemSelection'].isRequire = true;
    }
    this.itemposting[e.field] = e.data;
  }
  //#endregion

  //#region Function
  checkValidate() {
    if (this.itemposting.itemLevel == '4') {
      this.gridViewSetup['ItemSelection'].isRequire = false;
    }
    if (this.itemposting.custLevel == '3') {
      this.gridViewSetup['CustSelection'].isRequire = false;
    }
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.itemposting);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.itemposting[keymodel[i]] == null ||
              this.itemposting[keymodel[i]] == ''
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

  //#region Method
  onSave() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      if (this.formType == 'add' || this.formType == 'copy') {
        this.dialog.dataService
          .save((opt: RequestOption) => {
            opt.methodName = 'AddAsync';
            opt.className = 'IVPostingAccountsBusiness';
            opt.assemblyName = 'AC';
            opt.service = 'AC';
            opt.data = [this.itemposting];
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
            opt.className = 'IVPostingAccountsBusiness';
            opt.assemblyName = 'AC';
            opt.service = 'AC';
            opt.data = [this.itemposting];
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
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      this.dialog.dataService
        .save((opt: RequestOption) => {
          opt.methodName = 'AddAsync';
          opt.className = 'IVPostingAccountsBusiness';
          opt.assemblyName = 'AC';
          opt.service = 'AC';
          opt.data = [this.itemposting];
          return true;
        })
        .subscribe((res) => {
          if (res.save) {
            this.dialog.dataService.clear();
            this.dialog.dataService.addNew().subscribe((res) => {
              this.form.formGroup.patchValue(res);
              this.itemposting = this.dialog.dataService.dataSelected;
              this.itemposting.moduleID = this.moduleID;
              this.itemposting.postType = this.postType;
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
