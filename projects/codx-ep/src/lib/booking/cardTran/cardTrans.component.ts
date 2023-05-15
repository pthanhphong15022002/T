import { FormGroup } from '@angular/forms';
import { AfterViewInit, Component, inject, Injector, TemplateRef, ViewChild } from '@angular/core';
import { UIComponent, FormModel, ViewType, ButtonModel, AuthService, SidebarModel, DialogRef, CallFuncService } from 'codx-core';
import { CodxEpService } from '../../codx-ep.service';
import { PopupAddCardTransComponent } from './popup-add-cardTrans/popup-add-cardTrans.component';
import { ResourceTrans } from '../../models/resource.model';

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
  @ViewChild('noteCol') noteCol: TemplateRef<any>;
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
    this.button = {
      id: 'btnAdd',
    }
    
  }
  
  ngAfterViewInit(): void { }
  onLoading(evt: any) {
    let formModel = this.view.formModel;
    if (formModel) {
      this.cache
        .gridViewSetup(formModel?.formName, formModel?.gridViewName)
        .subscribe((gv) => {
          if(gv){
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
                template: this.noteCol,
              },
              {
                field: 'createdBy',
                headerText: gv?.CreatedBy?.headerText,
                width: 250,
                template: this.createByCol,
              },
            ];
          }
          
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
  viewChanged(evt: any) {
    this.funcID = this.router.snapshot.params['funcID'];
    this.cache.functionList(this.funcID).subscribe((res) => {
      if (res) {
        this.popupTitle = res?.defaultName.toString();
      }
    });
    this.codxEpService.getFormModel(this.funcID).then((res) => {
      if (res) {
        this.formModel = res;

      }
    });
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
      let curTran = new ResourceTrans();
      let dialog = this.callfc.openForm(
        PopupAddCardTransComponent,
        '',
        550,
        550,
        this.funcID,
        [curTran, this.funcID, this.popupTitle, null]
      );
      dialog.closed.subscribe((res) => {
        if (res?.event) {
          this.view.dataService.add(res?.event).subscribe();
        }
      });
    });
    
  }
  
}
