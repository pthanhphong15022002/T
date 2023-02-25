import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import {
  ButtonModel,
  RequestOption,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { ItemsService } from './items.service';
import { PopupAddItemComponent } from './popup-add-item/popup-add-item.component';

@Component({
  selector: 'lib-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.css'],
})
export class ItemsComponent extends UIComponent {
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  @ViewChild('itemTemplate', { static: true }) itemTemplate: TemplateRef<any>;
  @ViewChild('header1', { static: true }) header1: TemplateRef<any>;
  @ViewChild('header2', { static: true }) header2: TemplateRef<any>;
  @ViewChild('header3', { static: true }) header3: TemplateRef<any>;
  @ViewChild('header4', { static: true }) header4: TemplateRef<any>;
  views: Array<ViewModel> = [];
  btnAdd: ButtonModel = { id: 'btnAdd' };

  constructor(private inject: Injector, private itemsService: ItemsService) {
    super(inject);
  }

  onInit(): void {}

  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.grid,
        active: true,
        sameData: true,
        model: {
          resources: [
            { width: '35%', headerTemplate: this.header1 },
            { width: '35%', headerTemplate: this.header2 },
            { width: '15%', headerTemplate: this.header3 },
            { width: '15%', headerTemplate: this.header4 },
            { field: '', headerText: '', width: 30 },
          ],
          template: this.itemTemplate,
        },
      },
    ];
  }

  handleClickAdd(event) {
    // debug
    console.log({ event });
    console.log(this.view);

    this.view.dataService.addNew().subscribe((newItem) => {
      // debug
      console.log({ newItem });

      const options = new SidebarModel();
      options.Width = '800px';
      options.DataService = this.view.dataService;
      options.FormModel = this.view.formModel;
      this.callfc.openSide(
        PopupAddItemComponent,
        {
          formType: 'add',
          title: 'Thêm mặt hàng',
        },
        options,
        this.view.funcID
      );
    });
  }

  handleClickMoreFuncs(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS04':
        // copy;
        break;
    }
  }

  delete(data): void {
    // debug
    console.log('delete', { data });

    this.view.dataService
      .delete([data], true, (req: RequestOption) => {
        req.methodName = 'DeleteItemAsync';
        req.className = 'ItemsBusiness';
        req.assemblyName = 'ERM.Business.IV';
        req.service = 'IV';
        req.data = [data];

        return true;
      })
      .subscribe((res: any) => {
        if (res.data) {
          this.itemsService.deleteImage(
            res.data.itemID,
            this.view.formModel.entityName
          );
        }
        console.log(res);
      });
  }

  edit(data): void {
    // debug
    console.log('edit', { data });

    this.view.dataService.dataSelected = data;
    this.view.dataService.edit(data).subscribe((selectedItem) => {
      console.log({ selectedItem });

      const options = new SidebarModel();
      options.Width = '800px';
      options.DataService = this.view.dataService;
      options.FormModel = this.view.formModel;
      this.callfc
        .openSide(
          PopupAddItemComponent,
          {
            formType: 'edit',
            title: 'Sửa mặt hàng',
          },
          options,
          this.view.funcID
        )
        .closed.subscribe((res) => console.log(res));
    });
  }
}
