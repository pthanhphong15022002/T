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
  @ViewChild('templateList') itemTemplate?: TemplateRef<any>;
  @ViewChild('headerTemplate') headerTemplate?: TemplateRef<any>;
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
    
  }

  HandleAction(evt){
    console.log('on action', evt);
  }

  clickMF(evt, data){

  }

}
