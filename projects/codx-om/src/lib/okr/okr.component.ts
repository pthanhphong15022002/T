import {
  AfterViewInit,
  Component,
  Injector,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ButtonModel,
  UIComponent,
  ViewModel,
  ViewType,
  AuthStore,
  CallFuncService,
  DialogModel,
  DataRequest,
} from 'codx-core';
import { CodxOmService } from '../codx-om.service';
import { OkrAddComponent } from './okr-add/okr-add.component';

@Component({
  selector: 'lib-okr',
  templateUrl: './okr.component.html',
  styleUrls: ['./okr.component.css'],
})
export class OKRComponent extends UIComponent implements AfterViewInit {
  views: Array<ViewModel> | any = [];
  @ViewChild('panelRight') panelRight: TemplateRef<any>;

  openAccordion = [];
  dataOKR = [];

  //title//
  titleRoom = 'Phòng kinh doanh';
  /////////
  auth: AuthStore;
  okrService: CodxOmService;
  gridView: any;
  constructor(inject: Injector) {
    super(inject);
    this.auth = inject.get(AuthStore);
    this.okrService = inject.get(CodxOmService);
  }
  ngAfterViewInit(): void {
    this.views = [
      {
        id: '1',
        type: ViewType.content,
        active: true,
        sameData: true,
        model: {
          panelRightRef: this.panelRight,
          contextMenu: '',
        },
      },
    ];
    this.getGridViewSetup();
  }

  onInit(): void {
    var user = this.auth.get();
    // this.cache.getCompany(user.userID).subscribe(item=>{
    //   if(item) this.titleRoom = item.organizationName
    // })
    var dataRequest = new DataRequest();
    dataRequest.funcID = "OMT01"
    dataRequest.entityName = "OM_OKRs"
    dataRequest.page = 1;
    dataRequest.pageSize = 20;
    dataRequest.predicate="ParentID=null"
    this.okrService.getOKR(dataRequest).subscribe((item:any)=>{
      if(item) this.dataOKR = this.dataOKR.concat(item);
    });
    
  }

  //Hàm click
  click(event: any) {
    switch (event) {
      case 'add': {
        this.add();
        break;
      }
    }
  }

  //Thêm mới mục tiêu
  add() {
    var dialogModel = new DialogModel();
    dialogModel.IsFull = true;
    let dialog = this.callfc.openForm(
      OkrAddComponent,
      '',
      null,
      null,
      null,
      [this.view.formModel],
      '',
      dialogModel
    );
    dialog.closed.subscribe(item=>{
      if(item.event) this.dataOKR = this.dataOKR.concat(item.event);
    })
  }

  //Lấy data danh sách mục tiêu
  getGridViewSetup()
  {
    this.okrService.loadFunctionList(this.view.funcID).subscribe((fuc) => {
      this.okrService.loadGridView(fuc?.formName, fuc?.gridViewName).subscribe(grd=>{
        this.gridView = grd;
      })
    })
  }



}
