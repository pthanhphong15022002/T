import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { CallFuncService, CodxFormComponent, DialogData, DialogModel, DialogRef, FormModel, NotificationsService, SidebarModel, UIComponent } from 'codx-core';
import { VATCodes } from '../../../models/VATCodes.model';
import { CodxAcService } from '../../../codx-ac.service';
import { VATPosting } from '../../../models/VATPosting.model';
import { PopAddVatpostingComponent } from '../pop-add-vatposting/pop-add-vatposting.component';

@Component({
  selector: 'lib-pop-add-vatcodes',
  templateUrl: './pop-add-vatcodes.component.html',
  styleUrls: ['./pop-add-vatcodes.component.css']
})
export class PopAddVatcodesComponent extends UIComponent implements OnInit {

  //Constructor
  @ViewChild('form') public form: CodxFormComponent;
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
    this.validate = 0;
    this.checkValidate();
    if (this.validate > 0) {
      return;
    } else {
      if (this.formType == 'add' || this.formType == 'copy') {
        this.dialog.dataService
          .save(null, 0, '', 'SYS006', true)
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
        this.dialog.dataService.save(null, 0, '', '', true).subscribe((res) => {
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
  }

  openPopupAddVatPosting()
  {
    this.title = 'Thêm thiết lập hạch toán';
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
    this.title = 'Chỉnh sửa thiết lập hạch toán';
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
  checkValidate() {
    //Note: Tự động khi lưu, Không check BatchNo
    let ignoredFields: string[] = [];
    if (this.keyField == 'VATID') {
      ignoredFields.push(this.keyField);
    }
    ignoredFields = ignoredFields.map((i) => i.toLowerCase());
    //End Node

    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.vatCodes);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        if (ignoredFields.includes(keygrid[index].toLowerCase())) {
          continue;
        }
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.vatCodes[keymodel[i]] == null ||
              String(this.vatCodes[keymodel[i]]).match(/^ *$/) !== null
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
  //End Function
}


