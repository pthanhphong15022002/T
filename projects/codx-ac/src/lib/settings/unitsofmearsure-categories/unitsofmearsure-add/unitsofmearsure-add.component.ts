import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  CacheService,
  CallFuncService,
  CodxFormComponent,
  DataRequest,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  LayoutAddComponent,
  NotificationsService,
  RequestOption,
  UIComponent,
} from 'codx-core';
import { ConversionAddComponent } from '../conversion-add/conversion-add.component';
import { CodxAcService, fmUMConversion } from '../../../codx-ac.service';
import { Subject, map, takeUntil } from 'rxjs';

@Component({
  selector: 'lib-pop-add-mearsure',
  templateUrl: './unitsofmearsure-add.component.html',
  styleUrls: ['./unitsofmearsure-add.component.css'],
})
export class UnitsOfMearSureAdd extends UIComponent implements OnInit {
  //#region Contructor
  @ViewChild('form') form: LayoutAddComponent;
  dialog!: DialogRef;
  dialogData?: DialogData
  dataDefault: any;
  headerText: any;
  funcName: any;
  tabInfo: any[] = [
    {
      icon: 'icon-info',
      text: 'Thông tin chung',
      name: 'Description',
    },
    {
      icon: 'icon-rule',
      text: 'Thông tin quy đổi',
      name: 'conversion',
    },
  ];
  lblAdd: any;
  lblEdit: any;
  lblConversion: any;
  UMConversionSV:any;
  lstUMConversion:any = [];
  firstload:any = true;
  fmUMConversion:any = fmUMConversion;
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
    this.dataDefault = {...dialogData?.data?.dataDefault};
    this.UMConversionSV = this.acService.createCRUDService(
      inject,
      this.fmUMConversion,
      'BS'
    );

  }
  //#endregion

  //#region Init
  onInit(): void {
    this.cache.message('AC0033').subscribe((res) => {
      if (res) {
        this.lblAdd = res?.customName;
      }
    });

    this.cache.message('AC0034').subscribe((res) => {
      if (res) {
        this.lblEdit = res?.customName;
      }
    });
    this.cache.message('AC0040').subscribe((res) => {
      if (res) {
        this.lblConversion = res?.customName.toLowerCase();
      }
    });
  }
  ngAfterViewInit() {
  }
  //#endregion

  //#region Event
  //#endregion

  //#region Function
  setTitle(event) {
    this.headerText = this.dialogData?.data?.headerText;
    this.dt.detectChanges();
  }

  openFormConversion() {
    let validate = this.form.form.validation()
    if(validate) return;
    this.UMConversionSV.addNew().subscribe((res: any) => {
      if (res) {
        res.fromUMID = this.form.data.umid;
        let data :any = {
          headerText: (this.lblAdd + ' ' + 'đơn vị quy đổi').toUpperCase(),
          dataDefault:{...res}
        };
        this.cache.gridViewSetup(this.fmUMConversion.formName,this.fmUMConversion.gridViewName).subscribe((o)=>{
          let option = new DialogModel();
          option.FormModel = this.fmUMConversion;
          option.DataService = this.UMConversionSV;
          let dialog = this.callfc.openForm(
            ConversionAddComponent,
            '',
            500,
            400,
            '',
            data,
            '',
            option
          );
          dialog.closed.subscribe((res) => {
            if (res.event != null) {
              this.lstUMConversion.push({...res?.event});
              this.detectorRef.detectChanges();
            }
          });
        })
      }
    })
  }

  editConversion(dataEdit){
    this.UMConversionSV.edit({ ...dataEdit }).subscribe((res: any) => {
      if (res) {
        res.fromUMID = this.form.data.umid;
        let data: any = {
          headerText: ('Chỉnh sửa' + ' ' + 'đơn vị quy đổi').toUpperCase(),
          dataDefault: { ...res }
        };
        this.cache.gridViewSetup(this.fmUMConversion.formName, this.fmUMConversion.gridViewName).subscribe((o) => {
          let option = new DialogModel();
          option.FormModel = this.fmUMConversion;
          option.DataService = this.UMConversionSV;
          let dialog = this.callfc.openForm(
            ConversionAddComponent,
            '',
            500,
            400,
            '',
            data,
            '',
            option
          );
          dialog.closed.subscribe((res) => {
            if (res && res?.event) {
              let data = res?.event;
              let index = this.lstUMConversion.findIndex((x) => x.recID == data.recID);
              if (index > -1) {
                this.lstUMConversion[index] = data;
              }
              this.detectorRef.detectChanges();
            }
          });
        })
      }
    })
  }

  deleteConversion(dataDelete:any){
    this.UMConversionSV.delete([dataDelete], true,null,null,null,null,null,false).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res && !res?.error) {
        let index = this.lstUMConversion.findIndex((x) => x.recID == dataDelete.recID);
        if (index > -1) {
          this.lstUMConversion.splice(index, 1);
          this.detectorRef.detectChanges();
        }
      }
    });
  }
  
  tabChange(event){
    let tabname = event?.nextId.toLowerCase();
    switch(tabname){
      case 'conversion':
        if (this.form.form.data.isEdit) {
          if (this.firstload) {
            let options = new DataRequest();
            options.entityName = 'BS_UMConversion';
            options.pageLoading = false;
            options.predicates = 'FromUMID=@0';
            options.dataValues = this.form.form.data.umid;
            this.api
              .execSv('BS', 'Core', 'DataBusiness', 'LoadDataAsync', options)
              .pipe(map((r) => r?.[0] ?? [])).subscribe((res: any) => {
                this.lstUMConversion = res;
                this.firstload = false;
                this.detectorRef.detectChanges();
              })
          }
        }
        break;
    }
  }
  //#endregion

  //#region Method
  onSave(type) {
    this.form.form.save((opt: RequestOption) => {
      opt.methodName = (this.form.form.data.isAdd || this.form.form.data.isCopy) ? 'SaveAsync' : 'UpdateAsync';
      opt.className = 'UnitsOfMearsureBusiness';
      opt.assemblyName = 'BS';
      opt.service = 'BS';
      opt.data = [this.form.form.data,this.lstUMConversion];
      return true;
    }, 0, '', '', false).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (!res) return;
      if (res.hasOwnProperty('save')) {
        if (res.save.hasOwnProperty('data') && !res.save.data) return;
      }
      if (res.hasOwnProperty('update')) {
        if (res.update.hasOwnProperty('data') && !res.update.data) return;
      }
      if (this.form.form.data.isAdd || this.form.form.data.isCopy)
        this.notification.notifyCode('SYS006');
      else
        this.notification.notifyCode('SYS007');
      this.dialog.close();
    })
  }
  onSaveAdd() {
    // this.checkValidate();
    // if (this.validate > 0) {
    //   this.validate = 0;
    //   return;
    // } else {
    //   this.dialog.dataService
    //     .save((opt: RequestOption) => {
    //       opt.methodName = 'AddAsync';
    //       opt.className = 'UnitsOfMearsureBusiness';
    //       opt.assemblyName = 'BS';
    //       opt.service = 'BS';
    //       opt.data = [this.unitsofmearsure];
    //       return true;
    //     })
    //     .subscribe((res) => {
    //       if (res.save) {
    //         this.api
    //           .exec('ERM.Business.BS', 'UMConversionBusiness', 'AddAsync', [
    //             this.objectUmconversion,
    //           ])
    //           .subscribe((res) => {
    //             if (res) {
    //               this.clearUnitsofmearsure();
    //               this.dialog.dataService.addNew().subscribe((res) => {
    //                 this.form.formGroup.patchValue(res);
    //                 this.unitsofmearsure =
    //                   this.dialog.dataService!.dataSelected;
    //               });
    //             }
    //           });
    //       } else {
    //         this.notification.notifyCode(
    //           'SYS031',
    //           0,
    //           '"' + this.unitsofmearsure.umid + '"'
    //         );
    //         return;
    //       }
    //     });
    // }
  }
  //#endregion
}
