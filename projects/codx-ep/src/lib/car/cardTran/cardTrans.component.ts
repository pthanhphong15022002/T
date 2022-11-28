import { FormGroup } from '@angular/forms';
import { AfterViewInit, Component, inject, Injector, TemplateRef, ViewChild } from '@angular/core';
import { UIComponent, FormModel, ViewType, ButtonModel, AuthService, SidebarModel, DialogRef, CallFuncService } from 'codx-core';
import { CodxEpService } from '../../codx-ep.service';
import { PopupAddCardTransComponent } from './popup-add-cardTrans/popup-add-cardTrans.component';

@Component({
  selector: 'booking-cardTran',
  templateUrl: 'cardTrans.component.html',
  styleUrls: ['cardTrans.component.scss'],
})
export class CardTransComponent
  extends UIComponent
  implements AfterViewInit {
  @ViewChild('tranTypeCol') tranTypeCol: TemplateRef<any>;
  @ViewChild('userIDCol') userIDCol: TemplateRef<any>;
  @ViewChild('createByCol') createByCol: TemplateRef<any>;
  @ViewChild('transDateCol') transDateCol: TemplateRef<any>;
  @ViewChild('cardTranTmp') cardTranTmp: TemplateRef<any>;
  service = 'EP';
  assemblyName = 'EP';
  entityName = 'EP_ResourceTrans';
  idField = 'recID';
  className = 'ResourceTransBusiness';
  method = 'GetListAsync';
  viewType = ViewType;
  funcID: any;
  formModel: FormModel;
  columnGrids: any;
  views: any;
  popupDialog: any;
  dialog: DialogRef;
  button: ButtonModel;
  fGroupResourceTran: FormGroup;
  id: any;
  popupTitle: any;
  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService,
    private authService: AuthService,
    private callFuncService: CallFuncService,
  ) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
    this.cache.functionList(this.funcID).subscribe((res) => {
      if (res) {
        this.popupTitle = res.defaultName.toString();
      }
    });
    this.codxEpService.getFormModel(this.funcID).then((res) => {
      if (res) {
        this.formModel = res;

      }
    });
  }
  onInit(): void {

    this.initForm();
    this.button = {
      id: 'btnAdd',
    }
  }
  viewChanged(evt: any) {
    this.funcID = this.router.snapshot.params['funcID'];
    this.cache.functionList(this.funcID).subscribe((res) => {
      if (res) {
        this.popupTitle = res.defaultName.toString();
      }
    });
    this.codxEpService.getFormModel(this.funcID).then((res) => {
      if (res) {
        this.formModel = res;

      }
    });
  }
  initForm() {
    this.codxEpService
      .getFormGroup(
        this.formModel?.formName,
        this.formModel?.gridViewName
      )
      .then((item) => {
        this.fGroupResourceTran = item;
      });
  }
  ngAfterViewInit(): void { }
  onLoading(evt: any) {
    let formModel = this.view.formModel;
    if (formModel) {
      this.cache
        .gridViewSetup(formModel?.formName, formModel?.gridViewName)
        .subscribe((gv) => {
          this.columnGrids = [
            {
              field: 'transType',
              headerText: gv?.TransType?.headerText,
              width: "100",
              template: this.tranTypeCol,
              headerTextAlign: 'Center',
              textAlign: 'Center',
            },
            {
              field: 'transDate',
              headerText: gv?.TransDate?.headerText,
              width: 200,
              template: this.transDateCol,
            },
            {
              field: 'userID',
              headerText: gv?.UserID?.headerText,
              width: 250,
              template: this.userIDCol,
            },
            {
              field: 'note',
              headerText: gv?.Note?.headerText,
              width: "200",
            },
            {
              field: 'createdBy',
              headerText: gv?.CreatedBy?.headerText,
              width: 250,
              template: this.createByCol,
            },
          ];
          this.views = [
            {
              sameData: true,
              type: ViewType.grid,
              active: true,
              model: {
                resources: this.columnGrids,
              },
            },
          ];
          this.detectorRef.detectChanges();
        });
    }

  }
  openPopupCardFunction(template: any) {

    let time = new Date();
    this.popupDialog = this.callfc.openForm(template, '', 550, 560);
    this.detectorRef.detectChanges();
  }
  click(evt: ButtonModel) {
    //this.popupTitle = evt?.text + ' ' + this.funcIDName;
    switch (evt.id) {
      case 'btnAdd':
        this.addNew()
        break;

    }
  }
  addNew() {
    this.view.dataService.addNew().subscribe((res) => {
      this.dialog = this.callFuncService.openForm(
        PopupAddCardTransComponent, '', 550, 450, this.funcID,
        [this.view.dataService.dataSelected, this.formModel, this.popupTitle, this.funcID, this.view.dataService]

      );
      this.dialog.closed.subscribe((returnData) => {
        this.view.dataService.clear();
        this.view.dataService.dataSelected = null;
      });
    });
  }
  createCardTrans() {
    this.fGroupResourceTran.patchValue({
      userID: '',
      transDate: '',
      note: '',
      resourceType: '2',
      createBy: this.authService.userValue.userID,
      transType: '',
      status: '1',
      resourceID: '',
    });
    this.api
      .execSv(
        'EP',
        'ERM.Business.EP',
        'ResourceTransBusiness',
        'AddResourceTransAsync',
        [this.fGroupResourceTran.value]
      )
      .subscribe((res) => {
        if (res) {
          // this.selectedCard.status=currTrans;
          // this.view.dataService.update(this.selectedCard).subscribe((res) => {});          
          // this.popupDialog.close();
          // this.notificationsService.notify('Cấp/Trả thẻ thành công', '1', 0); //EP_TEMP Đợi messcode từ BA         
        }
      });
  }
}
