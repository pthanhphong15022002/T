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
} from 'codx-core';
import { OkrAddComponent } from './okr-add/okr-add.component';

@Component({
  selector: 'lib-okr',
  templateUrl: './okr.component.html',
  styleUrls: ['./okr.component.css'],
})
export class OKRComponent extends UIComponent implements AfterViewInit {
  views: Array<ViewModel> | any = [];
  @ViewChild('panelRight') panelRight: TemplateRef<any>;

  //title//
  titleRoom = 'Phòng kinh doanh';
  /////////
  auth: AuthStore;
  constructor(inject: Injector) {
    super(inject);
    this.auth = inject.get(AuthStore);
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
  }

  onInit(): void {
    //Lấy thông tin công ty
    var user = this.auth.get();
    // this.cache.getCompany(user.userID).subscribe(item=>{
    //   if(item)
    //     this.titleRoom = item.organizationName
    // })
  }
  //Thêm mới mục tiêu
  add(e: any) {
    var dialogModel = new DialogModel();
    dialogModel.IsFull = true;
    this.callfc.openForm(
      OkrAddComponent,
      '',
      null,
      null,
      null,
      null,
      '',
      dialogModel
    );
  }
}
