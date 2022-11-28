import { FormGroup } from '@angular/forms';
import { title } from 'process';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Injector,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  AuthService,
  ButtonModel,
  DialogRef,
  FormModel,
  NotificationsService,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { PopupAddEpCardsComponent } from './popup-add-epCards/popup-add-epCards.component';
import { Router } from '@angular/router';
import { AnyAaaaRecord } from 'dns';
import { CodxEpService } from '../../../codx-ep.service';

@Component({
  selector: 'setting-epCards',
  templateUrl: 'epCards.component.html',
  styleUrls: ['epCards.component.scss'],
})
export class EpCardsComponent extends UIComponent implements AfterViewInit {
  @ViewChild('avatarCol') avatarCol: TemplateRef<any>;
  @ViewChild('ownerCol') ownerCol: TemplateRef<any>;
  @ViewChild('statusCol') statusCol: TemplateRef<any>;
  @ViewChild('cardTranTmp') cardTranTmp: TemplateRef<any>;
  funcID: string;
  viewType = ViewType;
  views: Array<ViewModel> = [];
  buttons: ButtonModel;
  moreFuncs: Array<ButtonModel> = [];
  formModel: FormModel;
  dialog!: DialogRef;
  columnGrids: any;
  dataSelected: any;
  funcIDName: any;
  grvEpCards: any;
  isAfterRender = false;
  popupTitle = '';
  service = 'EP';
  assemblyName = 'EP';
  entityName = 'EP_Resources';
  idField = 'recID';
  className = 'ResourcesBusiness';
  method = 'GetListAsync';
  allocationCard = 1;
  returnCard = 2;
  currCardID: any;
  currTrans: number;
  cardTranReturnFM: FormModel;
  cardTranReceiveFM: FormModel;
  cardTranReturnGRV: any;
  cardTranReceiveGRV: any;
  curPopupGrv: any;
  curPopupFM: FormModel;
  curPopupFG: FormGroup;
  cardTranReturnFG: FormGroup;
  cardTranReceiveFG: FormGroup;
  //biến lưu data cho popup
  cardUserID: string;
  cardDate: any;
  cardNote: any;
  popupDialog: any;
  selectedCard:any;
  popupClosed=true;
  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService,
    private routers: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    private authService: AuthService
  ) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
    this.codxEpService.getFormModel(this.funcID).then((res) => {
      if (res) {
        this.formModel = res;
        this.isAfterRender = true;
        this.cache.functionList(this.funcID).subscribe((res) => {
          if (res) {
            this.funcIDName = res.customName.toString().toLowerCase();
          }
        });
      }
    });
  }

  onInit(): void {
    //this.view.dataService.methodDelete = 'DeleteResourceAsync';
  }

  ngAfterViewInit(): void {
    this.buttons = {
      id: 'btnAdd',
    };
    this.codxEpService.getFormModel('EPT22').then((ept22) => {
      if (ept22) {
        this.cardTranReceiveFM = ept22; //cấp thẻ
        this.cache
          .gridViewSetup(ept22.formName, ept22.gridViewName)
          .subscribe((grv22) => {
            if (grv22) {
              this.cardTranReceiveGRV = grv22;
            }
          });
        this.codxEpService
          .getFormGroup(ept22.formName, ept22.gridViewName)
          .then((fg22) => {
            if (fg22) {
              this.cardTranReceiveFG = fg22;
            }
          });
      }
    });

    this.codxEpService.getFormModel('EPT23').then((ept23) => {
      if (ept23) {
        this.cardTranReturnFM = ept23; //trả
        this.cache
          .gridViewSetup(ept23.formName, ept23.gridViewName)
          .subscribe((grv23) => {
            if (grv23) {
              this.cardTranReturnGRV = grv23;
            }
          });
        this.codxEpService
          .getFormGroup(ept23.formName, ept23.gridViewName)
          .then((fg23) => {
            if (fg23) {
              this.cardTranReturnFG = fg23;
            }
          });
      }
    });
    this.detectorRef.detectChanges();
  }
  onLoading(evt: any) {
    let formModel = this.view.formModel;
    if (formModel) {
      this.cache
        .gridViewSetup(formModel?.formName, formModel?.gridViewName)
        .subscribe((gv) => {
          this.grvEpCards = gv;
          this.columnGrids = [
            {
              field: 'resourceID',
              headerText: gv['ResourceID'].headerText,
            },
            {
              field: 'resourceName',
              headerText: gv['ResourceName'].headerText,
              width: '20%',
            },
            {
              headerText: gv['Icon'].headerText,
              template: this.avatarCol,
              textAlign: 'Center',
              headerTextAlign: 'Center',
              width: '15%',
            },
            {
              field: 'status',
              headerText: gv['Status'].headerText,
              textAlign: 'Center',
              headerTextAlign: 'Center',
              template: this.statusCol,
            },
            {
              field: 'note',
              headerText: gv['Note'].headerText,
            },
            {
              headerText: gv['Owner'].headerText,
              template: this.ownerCol,
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

  clickMF(event, data) {
    this.currCardID = data.resourceID;
    this.popupTitle = event?.text + ' ' + this.funcIDName;
    switch (event?.functionID) {
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS04':
        this.copy(data);
        break;
      case 'EPS2501': //cấp thẻ
        this.curPopupFM = this.cardTranReceiveFM;
        this.curPopupGrv = this.cardTranReceiveGRV;
        this.curPopupFG = this.cardTranReceiveFG;
        this.openPopupCardFunction(
          this.cardTranTmp,
          this.allocationCard,
          event.text,
          data
        );
        break;
      case 'EPS2502': //trả thẻ
        this.curPopupFM = this.cardTranReturnFM;
        this.curPopupGrv = this.cardTranReturnGRV;
        this.curPopupFG = this.cardTranReturnFG;
        this.openPopupCardFunction(
          this.cardTranTmp,
          this.returnCard,
          event.text,
          data
        );
        break;
      case 'EPS2503': //lịch sử thẻ
        this.historyCard(event?.data.url + '/' + data.recID);
        break;
    }
  }
  click(evt: ButtonModel) {
    this.popupTitle = evt?.text + ' ' + this.funcIDName;
    switch (evt.id) {
      case 'btnAdd':
        this.addNew();
        break;
      case 'btnEdit':
        this.edit();
        break;
      case 'btnDelete':
        this.delete();
        break;
    }
  }

  addNew() {
    if (this.popupClosed) {
      this.view.dataService.addNew().subscribe((res) => {
        this.popupClosed = false;
        this.dataSelected = this.view.dataService.dataSelected;
        let option = new SidebarModel();
        option.Width = '550px';
        option.DataService = this.view?.dataService;
        option.FormModel = this.formModel;
        this.dialog = this.callfc.openSide(
          PopupAddEpCardsComponent,
          [this.dataSelected, true, this.popupTitle],
          option
        );
        this.dialog.closed.subscribe((x) => {
          this.popupClosed = true;
          if (!x.event) this.view.dataService.clear();
          if (x.event == null && this.view.dataService.hasSaved)
            this.view.dataService
              .delete([this.view.dataService.dataSelected])
              .subscribe((x) => {
                this.changeDetectorRef.detectChanges();
              });
          else if (x.event) {
            x.event.modifiedOn = new Date();
            this.view.dataService.update(x.event).subscribe();
          }
        });
      });
    }
  }

  edit(obj?) {
    if (obj) {
      if (this.popupClosed) {
        this.view.dataService.dataSelected = obj;
        this.view.dataService
          .edit(this.view.dataService.dataSelected)
          .subscribe((res) => {
            this.popupClosed = false;
            this.dataSelected = this.view?.dataService?.dataSelected;
            let option = new SidebarModel();
            option.Width = '550px';
            option.DataService = this.view?.dataService;
            option.FormModel = this.formModel;
            this.dialog = this.callfc.openSide(
              PopupAddEpCardsComponent,
              [this.view.dataService.dataSelected, false, this.popupTitle],
              option
            );
            this.dialog.closed.subscribe((x) => {
              this.popupClosed = true;
              if (!x.event) this.view.dataService.clear();
              if (x?.event) {
                x.event.modifiedOn = new Date();
                this.view.dataService.update(x.event).subscribe((res) => {});
              }
            });
          });
      }
    }
  }

  copy(obj?) {
    if (obj) {
      if (this.popupClosed) {
        this.view.dataService.dataSelected = obj;
        this.view.dataService
          .copy(this.view.dataService.dataSelected)
          .subscribe((res) => {
            this.popupClosed = false;
            this.dataSelected = this.view?.dataService?.dataSelected;
            let option = new SidebarModel();
            option.Width = '550px';
            option.DataService = this.view?.dataService;
            option.FormModel = this.formModel;
            this.dialog = this.callfc.openSide(
              PopupAddEpCardsComponent,
              [this.view.dataService.dataSelected, true, this.popupTitle],
              option
            );
            this.dialog.closed.subscribe((x) => {
              this.popupClosed = true;
              if (!x.event) this.view.dataService.clear();
              if (x?.event) {
                x.event.modifiedOn = new Date();
                this.view.dataService.update(x.event).subscribe((res) => {});
              }
            });
          });
      }
    }
  }

  delete(obj?) {
    this.view.dataService.methodDelete = 'DeleteResourceAsync';
    if (obj) {
      this.view.dataService.delete([obj], true).subscribe((res) => {
        if (res) {
          // this.api
          // .execSv(
          //   'DM',
          //   'ERM.Business.DM',
          //   'FileBussiness',
          //   'DeleteByObjectIDAsync',
          //   [obj.recID, 'EP_EPCards', true]
          // )
          // .subscribe();
          this.detectorRef.detectChanges();
        }
      });
    }
  }
  openPopupCardFunction(template: any, type: number, title: any,data:any) {
    this.selectedCard=data;
    let time = new Date();
    this.cardDate = time;
    this.currTrans = type;
    this.popupTitle = title;
    this.popupDialog = this.callfc.openForm(template, title, 550, 350);
    this.detectorRef.detectChanges();
  }
  historyCard(url: any) {
    this.codxService.navigate('', url);
  }
  valueUserIDChange(e: any) {
    this.cardUserID = e.data;
    this.changeDetectorRef.detectChanges();
  }
  valueDateChange(e: any) {
    this.cardDate = e.data.fromDate;
    this.changeDetectorRef.detectChanges();
  }
  valueNoteChange(e: any) {
    this.cardNote = e.data;
    this.changeDetectorRef.detectChanges();
  }
  changeDataMF(event, data:any) {        
    if(event!=null && data!=null){
      // event.forEach(func => {        
      //   func.disabled=true;        
      // });
      if(data.status=='1'){
        event.forEach(func => {
          if(func.functionID == "EPS2501" /*MF cấp*/ )
          {
            func.disabled=true;
          }
        });  
      }
      else{
        event.forEach(func => {
          if(func.functionID == "EPS2502"/*MF trả*/)
          {
            func.disabled=true;
          }
        });  
      }
    }
  }
  createCardTrans(currTrans: number) {
    // this.curPopupFG.patchValue({
    //   userID: this.cardUserID,
    //   transDate: this.cardDate,
    //   note: this.cardNote,
    //   resourceType: '2',
    //   createBy: this.authService.userValue.userID,
    //   transType: currTrans,
    //   status: '1',
    //   resourceID: this.currCardID,
    // });
    this.api
      .execSv(
        'EP',
        'ERM.Business.EP',
        'ResourceTransBusiness',
        'AddEPResourceTransAsync',
        [this.currCardID,this.cardUserID,this.cardDate,this.cardNote,currTrans]
      )
      .subscribe((res) => {
        if (res) {
          this.selectedCard.status=currTrans;
          this.view.dataService.update(this.selectedCard).subscribe((res) => {});          
          this.popupDialog.close();
          this.notificationsService.notifyCode('SYS034');    
        }
        this.cardUserID=null;
        this.cardDate=null;
        this.cardNote=null;
      });
  }
}
