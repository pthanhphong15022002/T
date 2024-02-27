import {
  ChangeDetectionStrategy,
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
  DialogModel,
  CRUDService,
  DataRequest,
} from 'codx-core';
import { DimensionSetupAddComponent } from '../dimension-setup-add/dimension-setup-add.component';
import { CodxAcService } from '../../../codx-ac.service';
import { Subject, map, takeUntil } from 'rxjs';

@Component({
  selector: 'lib-pop-add-dimension-groups',
  templateUrl: './dimension-groups-add.component.html',
  styleUrls: ['./dimension-groups-add.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DimensionGroupsAddComponent extends UIComponent implements OnInit
{
  //#region Contructor
  @ViewChild('form') form: CodxFormComponent;
  headerText: string;
  dataDefault: any;
  dialog!: DialogRef;
  dialogData!: DialogData;
  openPop: any = false;
  lstDimensionSetup: Array<any> = [];
  dimSetUpService: CRUDService;
  fmDimSetup: FormModel = {
    formName: 'DimSetup',
    gridViewName: 'grvDimSetup',
    entityName: 'IV_DimSetup',
  }
  private destroy$ = new Subject<void>();
  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private dt: ChangeDetectorRef,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.dialogData = { ...dialogData };
    this.dataDefault = { ...dialogData?.data?.dataDefault };
    this.headerText = this.dialogData?.data?.headerText;
    this.dimSetUpService = this.acService.createCRUDService(
      inject,
      this.fmDimSetup,
      'IV'
    );
    if (this.dataDefault.isEdit) {
      let options = new DataRequest();
      options.entityName = this.fmDimSetup.entityName;
      options.pageLoading = false;
      options.predicates = 'DimGroupID=@0';
      options.dataValues = this.dataDefault.dimGroupID;
      this.api
      .execSv('IV', 'Core', 'DataBusiness', 'LoadDataAsync', options)
      .pipe(map((r) => r?.[0] ?? [])).subscribe((res: any) => {
        if (res) {
          this.lstDimensionSetup = res || [];
        }
      })
    }
  }
  //#endregion

  //#region Init
  onInit(): void {}

  ngAfterViewInit() {
  }

  onDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnDestroy() {
    this.onDestroy();
  }
  //#endregion

  //#region Event
  valueChange(event:any,type:any){
    let field = event?.field
    let value = event?.data
    switch (field.toLowerCase()) {
      case 'active0':
      case 'active1':
      case 'active2':
      case 'active3':
      case 'active4':
      case 'active5':
      case 'active6':
      case 'active7':
      case 'active8':
      case 'active9':
        if (!value) {
          let index = this.lstDimensionSetup.findIndex(x => x.dimType == type);
          if (index > -1) {
            this.lstDimensionSetup.splice(index, 1);
          }
          let options = new DataRequest();
          options.entityName = this.fmDimSetup.entityName;
          options.pageLoading = false;
          options.predicates = 'DimGroupID=@0 and DimType=@1';
          options.dataValues = this.form.data.dimGroupID + ';' + type;
          this.api
        .execSv('IV', 'Core', 'DataBusiness', 'LoadDataAsync', options)
        .pipe(map((r) => r?.[0] ?? [])).subscribe((res:any)=>{
          if (res && res.length) {
            let data = res[0];
            this.api
              .execAction('IV_DimSetup', [data], 'DeleteAsync')
              .subscribe((res: any) => {})
          }
        })
        }
        break;
    }
  }
  openPopupSetup(hearder: any, type: any) {
    let index = this.lstDimensionSetup.findIndex(x => x.dimType == type);
    if (index == -1) {
      this.dimSetUpService.addNew().subscribe((res: any) => {
        if (res) {
          res.dimType = type;
          switch(type){
            case '0':
            case '1':
            case '2':
            case '3':
              res.dimCategory = '1';
              break;
            default:
              res.dimCategory = '2';
              break;
          }
          let data = {
            headerText: ('Thiết lập kiểm soát ' + this.form.gridviewSetup[hearder].headerText).toUpperCase(),         
            dataDefault: { ...res },          
          };
          this.cache.gridViewSetup(this.fmDimSetup.formName, this.fmDimSetup.gridViewName).subscribe((o) => {
            let option = new DialogModel();
            option.FormModel = this.fmDimSetup;
            option.DataService = this.dimSetUpService;
            let dialog = this.callfc.openForm(
              DimensionSetupAddComponent,
              '',
              550,
              850,
              '',
              data,
              '',
              option
            );
            dialog.closed.subscribe((res) => {
              if (res && res?.event) {
                this.lstDimensionSetup.push({...res?.event?.data});
                this.detectorRef.detectChanges();
              }
            })
          })
        }
      }) 
    }else{
      let dataEdit = this.lstDimensionSetup[index];
      this.dimSetUpService.edit(dataEdit).subscribe((res:any)=>{
        if (res) {
          let data = {
            headerText: ('Thiết lập kiểm soát ' + this.form.gridviewSetup[hearder].headerText).toUpperCase(),         
            dataDefault: { ...res },          
          };
          this.cache.gridViewSetup(this.fmDimSetup.formName, this.fmDimSetup.gridViewName).subscribe((o) => {
            let option = new DialogModel();
            option.FormModel = this.fmDimSetup;
            option.DataService = this.dimSetUpService;
            let dialog = this.callfc.openForm(
              DimensionSetupAddComponent,
              '',
              550,
              850,
              '',
              data,
              '',
              option
            );
            dialog.closed.subscribe((res) => {
              if (res && res?.event) {
                let data = {...res?.event?.data};
                let index = this.lstDimensionSetup.findIndex(x => x.recID == data.recID);
                if (index > -1) {
                  this.lstDimensionSetup[index] = data;
                }
              }
            })
          })  
        }
      })
    }
  }
  //#endregion

  //#region Function
  //#endregion

  //#region Method
  onSave() {
    let validate = this.form.validation();
    if(validate) return;
    this.dialog.dataService.save((opt: RequestOption) => {
      opt.methodName = (this.form.data.isAdd || this.form.data.isCopy) ? 'SaveAsync' : 'UpdateAsync';
      opt.className = 'DimGroupsBusiness';
      opt.assemblyName = 'IV';
      opt.service = 'IV';
      opt.data = (this.form.data.isAdd || this.form.data.isCopy) ? [this.form.data,this.lstDimensionSetup] : [this.form.data,this.form.preData,this.lstDimensionSetup];
      return true;
    },0, '', '', false).subscribe((res) => {
      if (res && (res.save || res.update)) {
        if (this.form.data.isAdd || this.form.data.isCopy)
            this.notification.notifyCode('SYS006');
        else 
            this.notification.notifyCode('SYS007');
        this.dialog.close();
      }
    })
  }
  onSaveAdd() {
    // this.checkValidate();
    // if (this.validate > 0) {
    //   this.validate = 0;
    //   return;
    // } else {
    //   this.dialog.dataService
    //   .save((opt: RequestOption) => {
    //     opt.methodName = 'AddAsync';
    //     opt.className = 'DimensionGroupsBusiness';
    //     opt.assemblyName = 'IV';
    //     opt.service = 'IV';
    //     opt.data = [this.dimensionGroups];
    //     return true;
    //   })
    //   .subscribe((res) => {
    //     if (res.save) {
    //       if(this.keyField == 'DimGroupID')
    //       {
    //         this.dimensionGroups.dimGroupID = res.save.dimGroupID;
    //       }
    //       this.api
    //         .exec(
    //           'ERM.Business.IV',
    //           'DimensionSetupBusiness',
    //           'AddAsync',
    //           [this.dimensionGroups.dimGroupID, this.objectDimensionSetup]
    //         )
    //         .subscribe((res) => {
    //           if (res) {
    //             this.api
    //               .exec(
    //                 'ERM.Business.IV',
    //                 'DimensionControlBusiness',
    //                 'AddAsync',
    //                 [
    //                   this.dimensionGroups.dimGroupID,
    //                   this.objectDimensionControl,
    //                 ]
    //               )
    //               .subscribe((res) => {
    //                 if (res) {
    //                   this.clearDimensionGroups();
    //                   this.dialog.dataService.clear();
    //                   this.dialog.dataService.addNew().subscribe(() => {
    //                     this.dimensionGroups =
    //                       this.dialog.dataService!.dataSelected;
    //                   });
    //                 }
    //               });
    //           }
    //         });
    //     }
    //   });
    // }
  }
  //#endregion
}
