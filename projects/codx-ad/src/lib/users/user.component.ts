import { ActivatedRoute } from '@angular/router';
import { UIComponent, AuthStore, ViewModel, ViewType, DialogRef } from 'codx-core';
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
}
