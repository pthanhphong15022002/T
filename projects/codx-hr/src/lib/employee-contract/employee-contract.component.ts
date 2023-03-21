import { FormGroup } from '@angular/forms';
import { PopupEProcessContractComponent } from './popup-eprocess-contract/popup-eprocess-contract.component';
import { CodxHrService } from './../codx-hr.service';
import { filter } from 'rxjs';
import { UIComponent, ViewModel, ButtonModel, ViewType, NotificationsService, SidebarModel, DialogModel, DialogRef } from 'codx-core';
import { Component, OnInit, ViewChild, TemplateRef, Injector, ChangeDetectorRef } from '@angular/core';
import { DataRequest } from '@shared/models/data.request';
import { ActivatedRoute } from '@angular/router';
import { PopupEContractComponent } from '../employee-profile/popup-econtract/popup-econtract.component';

@Component({
  selector: 'lib-employee-contract',
  templateUrl: './employee-contract.component.html',
  styleUrls: ['./employee-contract.component.css']
})
export class EmployeeContractComponent extends UIComponent {
  @ViewChild('templateList') itemTemplate?: TemplateRef<any>;
  @ViewChild('templateListDetail') itemTemplateListDetail?: TemplateRef<any>;
  @ViewChild('panelRightListDetail') panelRightListDetail?: TemplateRef<any>;
  @ViewChild('headerTemplate') headerTemplate?: TemplateRef<any>;
  @ViewChild('eInfoTemplate') eInfoTemplate?: TemplateRef<any>;
  @ViewChild('contractTemplate') contractTemplate?: TemplateRef<any>;
  @ViewChild('templateUpdateStatus', { static: true })
  templateUpdateStatus: TemplateRef<any>;
  views: Array<ViewModel> = []
  funcID: string
  eContractHeaderText
  method = 'LoadDataEcontractWithEmployeeInfoAsync';
  numofRecord
  buttonAdd: ButtonModel = {
    id : 'btnAdd',
    text: 'Thêm'
  }
  formGroup: FormGroup;

  editStatusObj: any;
  dialogEditStatus: any;


  // moreFuncs = [
  //   {
  //     id: 'btnEdit',
  //     icon: 'icon-list-checkbox',
  //     text: 'Chỉnh sửa',
  //   },
  //   {
  //     id: 'btnDelete',
  //     icon: 'icon-list-checkbox',
  //     text: 'Xóa',
  //   },
  // ];

  constructor(
    inject: Injector,
    private hrService: CodxHrService,
    private activedRouter: ActivatedRoute,
    private df: ChangeDetectorRef,
    private notify: NotificationsService,
    ) {
    super(inject);
    this.funcID = this.activedRouter.snapshot.params['funcID'];

   }

  onInit(): void {
    if (!this.funcID) {
      this.funcID = this.activedRouter.snapshot.params['funcID'];
    }
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.list,
        active: true,
        sameData: true,
        model: {
          template: this.itemTemplate,
          headerTemplate: this.headerTemplate
        }
      },
      {
        type: ViewType.listdetail,
        sameData: true,
        active: true,
        model: {
          template: this.itemTemplateListDetail,
          panelRightRef: this.panelRightListDetail,
        },
      },
    ]
    console.log('view cua e contract', this.view);
    this.view.dataService.methodDelete = 'DeleteEContractAsync';
    console.log('data service data', this.view?.formModel.funcID);
    this.hrService.getHeaderText(this.view?.formModel?.funcID).then((res) =>{
      this.eContractHeaderText = res;
      console.log('hed do` text ne',this.eContractHeaderText);
    })
  }

  ngAfterViewChecked(){
    // if(this.view.dataService?.data){
    //   this.numofRecord = this.view.dataService.data.length      
    //   var PageTiltle = (window as any).ng.getComponent(document.querySelector('codx-page-title'));
    //   if(PageTiltle.pageTitle.breadcrumbs._value[0]?.title){
    //     PageTiltle.pageTitle.breadcrumbs._value[0].title = `(Tất cả ${this.numofRecord})`;
    //   }
    // }
    if(!this.formGroup?.value){
      this.hrService.getFormGroup(this.view?.formModel?.formName, this.view?.formModel?.gridViewName).then((res) => {
        this.formGroup = res;
        console.log('form group ne', this.formGroup);
      });
    }
  }

  HandleAction(evt){
    console.log('on action', evt);
  }

  
  close2(dialog: DialogRef) {
    dialog.close();
  }
  
  popupUpdateEContractStatus(funcID, data){
    // let option = new DialogModel();
    // option.zIndex = 999;
    // option.FormModel = this.view.formModel
    if(funcID == 'HRT1001A7') data.signStatus = '5';
    if(funcID == 'HRT1001A0') data.signStatus = '0';
    if(funcID == 'HRT1001A9') data.signStatus = '9';

    this.editStatusObj = data;
    this.formGroup.patchValue(this.editStatusObj);
    console.log('edit object', this.editStatusObj);
    this.dialogEditStatus = this.callfc.openForm(
      this.templateUpdateStatus,
      null,
      850,
      550,
      null,
      null
    );
    this.dialogEditStatus.closed.subscribe((e) => {
      this.detectorRef.detectChanges();
    });
  }

  onSaveUpdateForm(){
    this.hrService.editEContract(this.editStatusObj).subscribe((res) => {
      debugger
      if(res != null){
        this.notify.notifyCode('SYS007');
        this.dialogEditStatus && this.dialogEditStatus.close(res);
      }
    })
  }

  clickMF(event, data){
    debugger
    switch (event.functionID) {
      case 'HRT1001A7': // cap nhat da ki
      case 'HRT1001A0': // huy hop dong
      case 'HRT1001A9': // thanh ly hop dong
      let oUpdate = JSON.parse(JSON.stringify(data));
      this.popupUpdateEContractStatus(event.functionID , oUpdate)
      break;
      case 'HRT1001A1': // de xuat hop dong tiep theo
      break;

      case 'SYS03':
        this.HandleEContractInfo(event.text, 'edit', data);
        this.df.detectChanges();
        break;
      case 'SYS02': //delete
      this.view.dataService.delete([data]).subscribe((res) => {
        if(res){
          // debugger
          // this.view.dataService.remove(data).subscribe((res) => {
          //   console.log('res sau khi remove', res);
            
          // });
          // this.df.detectChanges();
        }
      })
      // this.hrService.deleteEContract(data.contract).subscribe((p) => {
      //   if (p) {
      //     this.notify.notifyCode('SYS008');
      //     this.view.dataService.delete(data).subscribe((res) => {});
      //     this.df.detectChanges();
      //   } else {
      //     this.notify.notifyCode('SYS022');
      //   }
      // });
        break;
      case 'SYS04': //copy
        this.copyValue(event.text, data, 'eContract');
        this.df.detectChanges();
        break;
    }
  }

  copyValue(actionHeaderText, data, flag) {
    this.hrService
    .copy(data, this.view.formModel, 'RecID')
    .subscribe((res) => {
      if(flag == 'eContract'){
        this.HandleEContractInfo(actionHeaderText, 'copy', res);
      }
    });
  }

  addContract(evt){
    if(evt.id == 'btnAdd'){
      this.HandleEContractInfo(evt.text,'add',null);
    }
  }

  // addNew(actionHeaderText, actionType: string, data: any){
  //   this.view.dataService.addNew().subscribe((res) => {
  //     this.dataSelected = this.view.dataService.dataSelected;
  //     let option = new SidebarModel();
  //     option.Width = '550px';
  //     option.DataService = this.view?.dataService
  //     option.FormModel = this.view.formModel;
  //     let dialogAdd = this.callfc.openSide(
  //       PopupEProcessContractComponent,
  //       // isAppendix ? PopupSubEContractComponent : PopupEContractComponent,
  //       {
  //         actionType: actionType,
  //         dataObj: data,
  //         headerText:
  //           actionHeaderText + ' ' + this.view.function.description,
  //         employeeId: data?.employeeID,
  //         funcID: this.view.funcID,
  //       },
  //       option
  //     );
  //     dialogAdd.closed.subscribe((res) => {
  //       if (res.event) {
  //         console.log('moi add hop dong xong', res.event[0]);
  //         this.view.dataService.addNew(res.event[0]).subscribe((res) => {
  //         });
  //         this.df.detectChanges();
  //       }
  //       if (res?.event) this.view.dataService.clear();
  //     });
  //   })
  // }

  HandleEContractInfo(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.Width = '550px';
    option.FormModel = this.view.formModel;
    // let isAppendix = false;
    // if((actionType == 'edit' || actionType == 'copy') && data.isAppendix == true){
    //   isAppendix = true;
    // }
    let dialogAdd = this.callfc.openSide(
      PopupEProcessContractComponent,
      // isAppendix ? PopupSubEContractComponent : PopupEContractComponent,
      {
        actionType: actionType,
        dataObj: data,
        headerText:
          actionHeaderText + ' ' + this.view.function.description,
        employeeId: data?.employeeID,
        funcID: this.view.funcID,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res.event) {
        if(actionType == 'add'){
          console.log('moi add hop dong xong', res.event[0]);
          this.view.dataService.add(res.event[0],0).subscribe((res) => {
          });
          this.df.detectChanges();
        }
        else if(actionType == 'edit'){
          this.view.dataService.update(res.event[0]).subscribe((res) => {
          })
          this.df.detectChanges();
        }
      }
      if (res?.event) this.view.dataService.clear();
    });
  }

  onMoreMulti(evt){
    console.log('chon nhieu dong', evt);
  }
}
