import { CodxHrService } from './../codx-hr.service';
import { filter } from 'rxjs';
import { UIComponent, ViewModel, ButtonModel, ViewType } from 'codx-core';
import { Component, OnInit, ViewChild, TemplateRef, Injector } from '@angular/core';
import { DataRequest } from '@shared/models/data.request';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'lib-employee-contract',
  templateUrl: './employee-contract.component.html',
  styleUrls: ['./employee-contract.component.css']
})
export class EmployeeContractComponent extends UIComponent {
  funcID: string
  method : 'GetDefaultAsync';
  views: Array<ViewModel> = []
  buttonAdd: ButtonModel = {
    id : 'btnAdd',
    text: 'Thêm'
  }

  buttonRefresh: ButtonModel = {
    id : 'btnRefresh',
    text: 'Thêm'
  }

//   buttons: ButtonModel[] = [{
//     id : 'btnRefresh',
//     text: 'Refresh'
//   },
//   {
//     id : 'btnAdd',
//     text: 'Thêm'
//   }
// ]
  columnsGrid = [];
  constructor(
    inject: Injector,
    private hrService: CodxHrService,
    private activedRouter: ActivatedRoute,
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
        type: ViewType.content,
        active: true,
        sameData: true,
        showFilter:true,
        model: {
          
          // panelLeftRef: this.templateLeft,
          // widthLeft: '15%',
          // panelRightRef: this.templateRight,
        }
      }
    ]
  }

  HandleAction(evt){
    console.log('on action', evt);
  }

}
