import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { UIComponent, CodxFormComponent, FormModel, DialogRef, CacheService, CallFuncService, NotificationsService, DialogData, RequestOption, DialogModel } from 'codx-core';
import { CodxAcService } from '../../codx-ac.service';
import { DimensionGroups } from '../../models/DimensionGroups.model';
import { DimensionSetup } from '../../models/DimensionSetup.model';
import { PopAddDimensionSetupComponent } from '../pop-add-dimension-setup/pop-add-dimension-setup.component';

@Component({
  selector: 'lib-pop-add-dimension-groups',
  templateUrl: './pop-add-dimension-groups.component.html',
  styleUrls: ['./pop-add-dimension-groups.component.css']
})
export class PopAddDimensionGroupsComponent extends UIComponent implements OnInit {
  @ViewChild('form') form: CodxFormComponent;
  headerText: string;
  formModel: FormModel;
  dialog!: DialogRef;
  gridViewSetup: any;
  formType: any;
  dimGroupID:any;
  dimGroupName:any;
  dimensionGroups:DimensionGroups;
  dimensionSetup:DimensionSetup;
  objectDimensionSetup:Array<DimensionSetup> = [];
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
    this.formType = dialogData.data?.formType;
    this.dimensionGroups = dialog.dataService!.dataSelected;
    this.dimGroupID = '';
    this.dimGroupName = '';
    if (this.dimensionGroups.dimGroupID != null) {
        this.dimGroupID = this.dimensionGroups.dimGroupID;
        this.dimGroupName = this.dimensionGroups.dimGroupName;
        this.acService
        .loadData('ERM.Business.IV', 'DimensionSetupBusiness', 'LoadDataAsync', [
          this.dimGroupID
        ])
        .subscribe((res: any) => {
          this.objectDimensionSetup = res;
        });
    }
    this.cache.gridViewSetup('DimensionGroups', 'grvDimensionGroups').subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
      }
    });
  }

  onInit(): void {}
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
  }
  valueChange(e:any){
    this.dimensionGroups[e.field] = e.data;
  }
  valueChangeDimGroupID(e:any){
    this.dimGroupID = e.data;
    this.dimensionGroups[e.field] = e.data;
  }
  valueChangeDimGroupName(e:any){
    this.dimGroupName = e.data;
    this.dimensionGroups[e.field] = e.data;
  }
  openPopupSetup(hearder:any,type:any) {
    let index = this.objectDimensionSetup.findIndex((x) => x.dimType == type);
    if (index == -1) {
      this.dimensionSetup = null;
    }else{
      this.dimensionSetup = this.objectDimensionSetup[index];
    }
    var obj = {
      headerText: 'Thiết lập kiểm soát ' + hearder,
      type:type,
      data:this.dimensionSetup
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'DimensionSetup';
    dataModel.gridViewName = 'grvDimensionSetup';
    dataModel.entityName = 'IV_DimensionSetup';
    opt.FormModel = dataModel;
    this.cache
      .gridViewSetup('DimensionSetup', 'grvDimensionSetup')
      .subscribe((res) => {
        if (res) {
          var dialog = this.callfc.openForm(
            PopAddDimensionSetupComponent,
            '',
            550,
            900,
            '',
            obj,
            '',
            opt
          );
          dialog.closed.subscribe((x) => {
            var datadimensionSetup = JSON.parse(localStorage.getItem('datadimensionSetup'));
            if (datadimensionSetup != null) {
              let index = this.objectDimensionSetup.findIndex((x) => x.dimType == datadimensionSetup.dimType);
              if (index == -1) {
                this.objectDimensionSetup.push(datadimensionSetup);
              }else{
                this.objectDimensionSetup[index] = datadimensionSetup;
              }
            }
            window.localStorage.removeItem('datadimensionSetup');
          });
        }
      });
  }
  clearDimensionGroups(){
    this.dimGroupID = '';
    this.dimGroupName = '';
    this.dimensionGroups.active0 = false;
    this.dimensionGroups.active1 = false;
    this.dimensionGroups.active2 = false;
    this.dimensionGroups.active3 = false;
    this.dimensionGroups.active4 = false;
    this.dimensionGroups.active5 = false;
    this.dimensionGroups.active6 = false;
    this.dimensionGroups.active7 = false;
    this.dimensionGroups.active8 = false;
    this.dimensionGroups.active9 = false;
  }
  onSave(){
    if (this.dimGroupID.trim() == '' || this.dimGroupID == null) {
      this.notification.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['DimGroupID'].headerText + '"'
      );
      return;
    }
    if (this.dimGroupName.trim() == '' || this.dimGroupName == null) {
      this.notification.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['DimGroupName'].headerText + '"'
      );
      return;
    }
    if (this.formType == 'add') {
      this.dialog.dataService
        .save((opt: RequestOption) => {
          opt.methodName = 'AddAsync';
          opt.className = 'DimensionGroupsBusiness';
          opt.assemblyName = 'IV';
          opt.service = 'IV';
          opt.data = [this.dimensionGroups];
          return true;
        })
        .subscribe((res) => {
          if (res.save) {
            this.acService
              .addData('ERM.Business.IV', 'DimensionSetupBusiness', 'AddAsync', [
                this.dimGroupID,this.objectDimensionSetup,
              ])
              .subscribe((res: []) => {});
            this.dialog.close();
            this.dt.detectChanges();
          }else {
            this.notification.notifyCode(
              'SYS031',
              0,
              '"' + this.dimGroupID + '"'
            );
            return;
          }
        })
    }
    if (this.formType == 'edit') {
      this.dialog.dataService
        .save((opt: RequestOption) => {
          opt.methodName = 'UpdateAsync';
          opt.className = 'DimensionGroupsBusiness';
          opt.assemblyName = 'IV';
          opt.service = 'IV';
          opt.data = [this.dimensionGroups];
          return true;
        })
        .subscribe((res) => {
          if (res.save || res.update) {
            this.acService
              .addData('ERM.Business.IV', 'DimensionSetupBusiness', 'UpdateAsync', [
                this.dimGroupID,this.objectDimensionSetup,
              ])
              .subscribe((res: []) => {});
            this.dialog.close();
            this.dt.detectChanges();
          }else {
            this.notification.notifyCode(
              'SYS031',
              0,
              '"' + this.dimGroupID + '"'
            );
            return;
          }
        })
    }
  }
  onSaveAdd(){
    if (this.dimGroupID.trim() == '' || this.dimGroupID == null) {
      this.notification.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['DimGroupID'].headerText + '"'
      );
      return;
    }
    if (this.dimGroupName.trim() == '' || this.dimGroupName == null) {
      this.notification.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['DimGroupName'].headerText + '"'
      );
      return;
    }
    this.dialog.dataService
        .save((opt: RequestOption) => {
          opt.methodName = 'AddAsync';
          opt.className = 'DimensionGroupsBusiness';
          opt.assemblyName = 'IV';
          opt.service = 'IV';
          opt.data = [this.dimensionGroups];
          return true;
        })
        .subscribe((res) => {
          if (res.save) {
            this.clearDimensionGroups();
            this.dialog.dataService.clear();
            this.dialog.dataService.addNew().subscribe((res)=>{
              this.dimensionGroups = this.dialog.dataService!.dataSelected;
            });
          }
        })
  }
}
