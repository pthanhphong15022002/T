import { Component, OnInit, Injector } from '@angular/core';
import {
  CacheService,
  CallFuncService,
  DialogRef,
  LayoutBaseComponent,
  SidebarModel,
  UIComponent,
  ViewModel
} from 'codx-core';
import { Observable } from 'rxjs';
import { CodxDMService } from '../codx-dm.service';
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
  constructor(
    inject: Injector,
    public cache: CacheService,
    private callfc: CallFuncService,
    private dmSV: CodxDMService) {
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
    //this.dmSV.openCreateFolder.next(true);
    let option = new SidebarModel();
    option.DataService = this.dmSV.dataService;
    option.FormModel = this.dmSV.formModel;
    option.Width = '550px';
    let data = {} as any;
    data.title = this.titleAddFolder;
    this.callfc.openSide(CreateFolderComponent, data, option);
  }

}
