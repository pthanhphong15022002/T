import { PopupEProcessContractComponent } from './popup-eprocess-contract/popup-eprocess-contract.component';
import { CodxHrService } from './../codx-hr.service';
import { filter } from 'rxjs';
import { UIComponent, ViewModel, ButtonModel, ViewType, NotificationsService, SidebarModel } from 'codx-core';
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
  @ViewChild('headerTemplate') headerTemplate?: TemplateRef<any>;
  @ViewChild('eInfoTemplate') eInfoTemplate?: TemplateRef<any>;
  @ViewChild('contractTemplate') contractTemplate?: TemplateRef<any>;

  views: Array<ViewModel> = []
  funcID: string
  method = 'LoadDataEcontractWithEmployeeInfoAsync';

  buttonAdd: ButtonModel = {
    id : 'btnAdd',
    text: 'Thêm'
  }


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
      }
    ]
    console.log('view cua e contract', this.view);
    this.view.dataService.methodDelete = 'DeleteEContractAsync';
  }

  HandleAction(evt){
    console.log('on action', evt);
  }

  clickMF(event, data){
    switch (event.functionID) {
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
      this.HandleEContractInfo(actionHeaderText, 'copy', res);
    });
  }

  addContract(evt){
    this.HandleEContractInfo(evt.text,'add',null);
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

}
