import { ActivatedRoute } from '@angular/router';
import { UIComponent, AuthStore, ViewModel, ViewType, DialogRef, ButtonModel } from 'codx-core';
import { Component, OnInit, inject, Injector, AfterViewInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { ViewUsersComponent } from './view-users/view-users.component';

@Component({
  selector: 'lib-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent extends UIComponent {

  views: Array<ViewModel> = [];
  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any>;
  itemSelected: any;
  dialog!: DialogRef;
  button?: ButtonModel;
  moreFuncs: Array<ButtonModel> = [];

 // @ViewChild('itemTemplate', { static: true }) itemTemplate: TemplateRef<any>;

  
  user: any;
  funcID: string;
  constructor(
    private inject: Injector,
    private authStore: AuthStore,
    private activeRouter: ActivatedRoute,
    private changeDetectorRef:ChangeDetectorRef
  ) {
    super(inject);
    this.user = this.authStore.get();
    this.funcID = this.activeRouter.snapshot.params['funcID'];
  }

  onInit(): void {
    this.button = {
      id: 'btnAdd',
    };
    this.moreFuncs = [
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
    ];
  }

  ngAfterViewInit():void{
    this.views = [
      {
        type: ViewType.list,
        active: true,
        sameData: true,
        model: {
          template: this.itemTemplate,
        },
      },
    ]
    this.changeDetectorRef.detectChanges();
  }

  clickMF(e: any, data?: any) {
    switch (e.functionID) {
      case 'btnAdd':
        // this.show();
        break;
      case 'edit':
        // this.edit(data);
        break;
      case 'delete':
        // this.delete(data);
        break;
    }
  }


  openPopup(item: any) {
    this.dialog = this.callfc.openForm(ViewUsersComponent, ' ', 300, 500, '', item);
    this.dialog.closed.subscribe(e => {
      console.log(e);
    })
  }

  convertHtmlAgency(buID:any)
  {
    var desc = '<div class="d-flex">';
    if(buID)
      desc += '<div class="d-flex align-items-center me-2"><span class=" text-dark-75 font-weight-bold icon-apartment1"></span><span class="ms-1">' +buID+'</span></div>';
    
    return desc + '</div>';
  }
}
