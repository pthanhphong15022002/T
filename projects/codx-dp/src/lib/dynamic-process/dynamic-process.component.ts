import {
  AfterViewInit, ChangeDetectorRef, Component,
  inject, Injector, Input, OnInit, TemplateRef, ViewChild,
} from '@angular/core';
import { PopupAddDynamicProcessComponent } from './popup-add-dynamic-process/popup-add-dynamic-process.component';
import { ActivatedRoute } from '@angular/router';
import { AuthStore, ButtonModel, NotificationsService, UIComponent, ViewModel, ViewType , DialogModel,
  SidebarModel,
  CallFuncService,
  Util, } from 'codx-core';
import { CodxDpService } from '../codx-dp.service';

@Component({
  selector: 'lib-dynamic-process',
  templateUrl: './dynamic-process.component.html',
  styleUrls: ['./dynamic-process.component.css'],
})
export class DynamicProcessComponent extends UIComponent
implements OnInit, AfterViewInit {

 // View
 views: Array<ViewModel> = [];
 moreFuncs: Array<ButtonModel> = [];
 button?: ButtonModel;

 // view child
 @ViewChild('templateViewCard', { static: true })templateViewCard: TemplateRef<any>;
 @ViewChild('headerTemplate') headerTemplate: TemplateRef<any>;

 // Input
 @Input() dataObj?: any;
 @Input() showButtonAdd = true;


 // get api DP Proccess
 method = 'GetListProcessesAsync';

 // create variables
 crrFunID:string = '';
 funcID: string =  '';
 gridViewSetup: any;

 // const set value
 readonly btnAdd:string = 'btnAdd';

 heightWin: any;
 widthWin: any;

  constructor(
    private inject: Injector,
    private changeDetectorRef: ChangeDetectorRef,
    private activedRouter: ActivatedRoute,
    private codxDpService: CodxDpService,
    private notificationsService: NotificationsService,
    private authStore: AuthStore,
    private callFunc: CallFuncService,
  ) {
    super(inject);
    this.heightWin = Util.getViewPort().height - 100;
    this.widthWin = Util.getViewPort().width - 100;

  }

  onInit(): void {
    this.button = {
      id: this.btnAdd,
    };
  }

  afterLoad() {

  }
  onDragDrop(e: any) {}

  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }
  clickMF(e: any, data?: any){

  }
  changeDataMF(e:any, data?:any){

  }
  ngAfterViewInit(): void {
    this.views=[{
      type: ViewType.card,
      sameData: true,
      active: true,
      model: {
        template: this.templateViewCard,
        headerTemplate: this.headerTemplate,
      },
    }];
    this.changeDetectorRef.detectChanges();
  }

  searchDynamicProcess($event) {
    if($event)
    this.changeDetectorRef.detectChanges();
  }

  // CRUD methods
  add() {
    this.view.dataService.addNew().subscribe((res) => {
      let option = new SidebarModel();
      option.Width = '800px';
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;

      let dialogModel = new DialogModel();
      dialogModel.IsFull = true;
      let dialogAdd = this.callFunc.openForm(
        PopupAddDynamicProcessComponent,
        '',
        800,
        700,
        '',
        {
          isAddNew: true,
          formModel: this.view?.formModel,
          option: option,
        },
        '',
        dialogModel
      );
    });

  }

  update() {
    this.changeDetectorRef.detectChanges();

  }

  delete() {
    this.changeDetectorRef.detectChanges();
  }
}
