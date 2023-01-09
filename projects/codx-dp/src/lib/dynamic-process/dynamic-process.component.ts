import { AfterViewInit, ChangeDetectorRef, Component, inject, Injector, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthStore, ButtonModel, NotificationsService, UIComponent, ViewModel, ViewType } from 'codx-core';
import { CodxDpService } from '../codx-dp.service';

@Component({
  selector: 'lib-dynamic-process',
  templateUrl: './dynamic-process.component.html',
  styleUrls: ['./dynamic-process.component.css']
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

  constructor(
    private inject: Injector,
    private changeDetectorRef: ChangeDetectorRef,
    private activedRouter: ActivatedRoute,
    private codxDpService: CodxDpService,
    private notificationsService: NotificationsService,
    private authStore: AuthStore,
  ) {
    super(inject);

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
    this.changeDetectorRef.detectChanges();

  }

  update() {
    this.changeDetectorRef.detectChanges();

  }

  delete() {
    this.changeDetectorRef.detectChanges();

  }

  copy(){
    this.changeDetectorRef.detectChanges();

  }


}
