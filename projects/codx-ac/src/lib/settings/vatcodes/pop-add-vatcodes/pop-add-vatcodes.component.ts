import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { CallFuncService, CodxFormComponent, DialogData, DialogModel, DialogRef, FormModel, LayoutAddComponent, NotificationsService, SidebarModel, UIComponent } from 'codx-core';
import { VATCodes } from '../../../models/VATCodes.model';
import { CodxAcService } from '../../../codx-ac.service';
import { VATPosting } from '../../../models/VATPosting.model';
import { PopAddVatpostingComponent } from '../pop-add-vatposting/pop-add-vatposting.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'lib-pop-add-vatcodes',
  templateUrl: './pop-add-vatcodes.component.html',
  styleUrls: ['./pop-add-vatcodes.component.css']
})
export class PopAddVatcodesComponent extends UIComponent implements OnInit {

  //Constructor
  @ViewChild('form') public form: LayoutAddComponent;
  headerText: any;
  title: any;
  formModel: FormModel;
  dialog!: DialogRef;
  vatCodes: VATCodes;
  listVatPosting: Array<VATPosting> = [];
  deleteListVatPosting: Array<VATPosting> = [];
  gridViewSetup: any;
  formType: any;
  validate: any = 0;
  keyField: any = '';
  fmVatPosting: FormModel = {
    formName: 'VATPosting',
    gridViewName: 'grvVATPosting',
    entityName: 'AC_VATPosting',
  };
  tabInfo: any[] = [
    { icon: 'icon-info', text: 'Thông tin chung', name: 'Description' },
    {
      icon: 'icon-settings icon-20 me-3',
      text: 'Thiết lập tài khoản',
      name: 'Establish',
    },
  ];

  lblAdd: any;
  lblEdit: any;
  lblAccountSetting: any;
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api

  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private dt: ChangeDetectorRef,
    private notification: NotificationsService,
    private callfunc: CallFuncService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ){
    super(inject);
    this.dialog = dialog;
    this.headerText = dialogData.data?.headerText;
    this.vatCodes = dialog.dataService!.dataSelected;
    this.keyField = this.dialog.dataService!.keyField;
    this.formType = dialogData.data?.formType;
    this.cache.gridViewSetup('VATCodes', 'grvVATCodes').subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
      }
    });
  }
  // End Constructor
  

  //Inir
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
    this.cache.message('AC0038').subscribe((res) => {
      if (res) {
        this.lblAccountSetting = res?.customName.toLowerCase();
      }
    });
  }

  ngAfterViewInit()
  {
    this.api.exec('AC', 'VATPostingBusiness', 'LoadDataByIDAsync',[this.vatCodes.vatid])
    .subscribe((res: any) => {
      if(res && res.length > 0)
      {
        this.listVatPosting = res;
      }
    });

    (this.form.form as CodxFormComponent).onAfterInit.subscribe((res:any)=>{
      if(res){
        this.setValidateForm();
      }
    })
  }
  //End init

  //Event
  valueChange(e: any)
  {
    switch(e.field)
    {
      case 'vatid':
        this.vatCodes.vatid = e.data;
        break;
      case 'vatName':
        this.vatCodes.vatName = e.data;
        break;
      case 'taxGroup':
        this.vatCodes.taxGroup = e.data;
        break;
      case 'vatPct':
        this.vatCodes.vatPct = e.data;
        break;
      case 'taxDirection':
        this.vatCodes.taxDirection = e.data;
        break;
      case 'invoiceType':
        this.vatCodes.invoiceType = e.data;
        break;
      case 'formula':
        this.vatCodes.formula = e.data;
        break;
      case 'taxableObject':
        this.vatCodes.taxableObject = e.data;
        break;
      case 'stop':
        this.vatCodes.stop = e.data;
        break;
    }
  }
  //End Event

  //Method
  onSave(){
    if (this.formType == 'add' || this.formType == 'copy') {
      (this.form.form as CodxFormComponent)
      // this.dialog.dataService
        .save(null, 0, '', 'SYS006', true,{allowCompare:false}).pipe(takeUntil(this.destroy$))
        .subscribe((res) => {
          if (res.save) {
            this.api
              .exec(
                'ERM.Business.AC',
                'VATPostingBusiness',
                'UpdateAsync',
                [
                  res.save.data.vatid,
                  this.listVatPosting,
                  this.deleteListVatPosting,
                ]
              )
              .subscribe((res: []) => {
                if (res) {
                  this.dialog.close();
                  this.dt.detectChanges();
                }
              });
          }
      });
    }
    if (this.formType == 'edit') {
      (this.form.form as CodxFormComponent)
      .save(null, 0, '', '', true,{allowCompare:false}).pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res && res.update.data != null) {
          this.api
            .exec(
              'ERM.Business.AC',
              'VATPostingBusiness',
              'UpdateAsync',
              [
                res.update.data.vatid,
                this.listVatPosting,
                this.deleteListVatPosting,
              ]
            )
            .subscribe((res: []) => {
              if (res) {
                this.dialog.close();
                this.dt.detectChanges();
              }
            });
        }
      });
    }
  }

  openPopupAddVatPosting()
  {
    this.title = this.lblAdd + ' ' + this.lblAccountSetting;
    var obj = {
      formType: 'add',
      headerText: this.title,
      listVatPosting: this.listVatPosting
    };
    let opt = new DialogModel();
    opt.FormModel = this.fmVatPosting;
    this.cache
    .gridViewSetup('VATPosting', 'grvVATPosting')
    .subscribe((res) => {
      if (res) {
        var dialogexchange = this.callfc.openForm(
          PopAddVatpostingComponent,
          '',
          500,
          650,
          '',
          obj,
          '',
          opt
        );
        dialogexchange.closed.subscribe(() => {
          var vatPosting = JSON.parse(
            localStorage.getItem('vatPosting')
          );
          if(vatPosting)
            this.listVatPosting.push(vatPosting);
          window.localStorage.removeItem('vatPosting');
        });
      }
    });
  }

  onEditVatPosting(data: any)
  {
    this.title = this.lblEdit + ' ' + this.lblAccountSetting;
    var obj = {
      headerText: this.title,
      data: { ...data },
      formType: 'edit',
    };
    let opt = new DialogModel();
    opt.FormModel = this.fmVatPosting;
    this.cache
      .gridViewSetup('VATPosting', 'grvVATPosting')
      .subscribe((res) => {
        if (res) {
          var dialogexchangeedit = this.callfc.openForm(
            PopAddVatpostingComponent,
            '',
            500,
            650,
            '',
            obj,
            '',
            opt
          );
          dialogexchangeedit.closed.subscribe(() => {
            var vatPosting = JSON.parse(
              localStorage.getItem('vatPosting')
            );
            if (vatPosting != null) {
              let index = this.listVatPosting.findIndex(
                (x) => x.recID == vatPosting.recID
              );
              this.listVatPosting[index] = vatPosting;
            }
            window.localStorage.removeItem('vatPosting');
          });
        }
      });
  }

  onDeleteVatPosting(data: any)
  {
    let index = this.listVatPosting.findIndex((x) => x.recID == data.recID);
    this.listVatPosting.splice(index, 1);
    this.deleteListVatPosting.push(data);
  }
  //End Method

  //Function
  //End Function

  //#region Function
  /**
   * *Hàm thay đổi validate form
   */
  setValidateForm(){
    let rVATID = true;
    let lsRequire :any = [];
    if(this.form.form.data?._keyAuto == 'VATID') rVATID = false; //? thiết lập không require khi dùng đánh số tự động tài khoản
    lsRequire.push({field : 'VATID',isDisable : false,require:rVATID});
    this.form.form.setRequire(lsRequire);
  }
  //#endregion Function
}


