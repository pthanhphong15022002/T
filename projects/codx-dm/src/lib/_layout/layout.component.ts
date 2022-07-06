import { Component, OnInit, Injector } from '@angular/core';
import {
  CacheService,
  DialogRef,
  LayoutBaseComponent,
  SidebarModel,
  ViewModel
} from 'codx-core';
import { Observable } from 'rxjs';
import { CreateFolderComponent } from '../createFolder/createFolder.component';
@Component({
  selector: 'lib-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent extends LayoutBaseComponent {
  module = 'DM';
  public titleAddFolder = 'Tạo thư mục';
  public titleStorage = 'Dung lượng lưu trữ';
  public titleHddUsed = 'Đã sử dụng 203.63MB trong tổng số 50.00 GB';
  dialog!: DialogRef;
  views: Array<ViewModel> = [];
  constructor(
    inject: Injector,
    public cache: CacheService) {
    super(inject);
    this.codxService.init(this.module);
  }

  onInit(): void {
    this.codxService.modulesOb$.subscribe(res => {
      console.log(res);
    })
  }

  onAfterViewInit(): void {
    this.cache.message("DM060").subscribe(item => {
      if (item != null) {
        this.titleAddFolder = item.description;
      }
    });

    this.cache.message("DM061").subscribe(item => {
      if (item != null) {
        this.titleStorage = item.description;
      }
    });
  }

  AddFolder() {
    // let option = new SidebarModel();
    // option.DataService = this.view?.currentView?.dataService;
    // option.FormModel = this.view?.currentView?.formModel;
    // option.Width = '750px';

    // this.dialog = this.callfc.openSide(CreateFolderComponent, data, option);
    // this.dialog.closed.subscribe(e => {
    //   console.log(e);
    // })
  }

}
