import { AfterViewInit, Component, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthStore, ButtonModel, DataRequest, DialogRef, NotificationsService, ResourceModel, SidebarModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { CodxBpService } from '../codx-bp.service';
import { PopupAddProcessStepComponent } from './popup-add-processstep/popup-add-processstep.component';

@Component({
  selector: 'lib-processstep',
  templateUrl: './processstep.component.html',
  styleUrls: ['./processstep.component.css']
})
export class ProcessStepComponent  extends UIComponent
implements OnInit, AfterViewInit {
  @ViewChild('itemViewList') itemViewList: TemplateRef<any>;
  @ViewChild('panelRight') panelRight?: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate!: TemplateRef<any>;
  @ViewChild('cardKanban') cardKanban!: TemplateRef<any>;

  model?: DataRequest;
  request: ResourceModel;
  resourceKanban?: ResourceModel;
  modelResource: ResourceModel;
  resource: ResourceModel;
  dialog!: DialogRef;
  titleAction = '';

  views: Array<ViewModel> = [];
  button?: ButtonModel;
  moreFuncs: Array<ButtonModel> = [];
  user: any;
  funcID: any;
  itemSelected: any;

  service = 'BP';
  entityName = 'BP_ProcessStepsBusiness';
  idField = 'recID';
  assemblyName = 'ERM.Business.BP';
  className = 'ProcessStepsBusiness';
  method = 'GetProcessStepsAsync'; //chua viet
  constructor(
    inject: Injector,
    private authStore: AuthStore,
    private activedRouter: ActivatedRoute,
    private notiService: NotificationsService,
    private svBp: CodxBpService
  ) {
    super(inject);
    this.user = this.authStore.get();
    if (!this.funcID)
      this.funcID = this.activedRouter.snapshot.params['funcID'];
     
  }

  onInit(): void {
    this.button = {
      id: 'btnAdd',
      items:[
        {
          id: 'edit',
          icon: 'icon-list-checkbox',
          text: 'Sửa',
        },
        {
          id: 'btnMF2',
          icon: 'icon-list-checkbox',
          text: 'more 2',
        },
      ]
    };

    this.resourceKanban = new ResourceModel();
    this.resourceKanban.service = 'SYS';
    this.resourceKanban.assemblyName = 'SYS';
    this.resourceKanban.className = 'CommonBusiness';
    this.resourceKanban.method = 'GetColumnsKanbanAsync';


  }
  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.content,
        active: false,
        sameData: true,
        model: {
          template: this.itemViewList,
        },
      },
      {
        type: ViewType.kanban,
        active: false,
        sameData: false,
        request: this.request,
        request2: this.resourceKanban,
        model: {
          template: this.cardKanban,
        },
      },]
  }
 

   //#region event
   click(evt: ButtonModel) {
    this.titleAction = evt.text;
    switch (evt.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }

  receiveMF(e: any) {
    this.clickMF(e.e, e.data);
  }

  changeDataMF(e,data){

  }


  clickMF(e: any, data?: any) {
    this.itemSelected = data;
    this.titleAction = e.text;
    switch (e.functionID) {
      case 'SYS01':
        this.add();
        break;
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS04':
        this.copy(data);
        break;
      case 'SYS02':
        this.delete(data);
    }
  }


 


  onDragDrop(e: any) {
    console.log(e);
  }
  //#endregion


  //#region CRUD
add(){
 this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '550px';
      this.dialog = this.callfc.openSide(
        PopupAddProcessStepComponent,
        [this.view.dataService.dataSelected,'add', this.titleAction],
        option
      );
      this.dialog.closed.subscribe((e) => {
        if (e?.event == null)
          this.view.dataService.delete(
            [this.view.dataService.dataSelected],
            false
          );
      });
    });
};
edit(data){
  
}
copy(data){
  
}

delete(data){
  
}
//endregion

}
