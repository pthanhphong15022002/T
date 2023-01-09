import {
  AfterViewInit,
  Component,
  Injector,
  Input,
  OnInit,
} from '@angular/core';
import {
  ButtonModel,
  DialogModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
  CallFuncService,
  Util,
} from 'codx-core';
import { PopupAddDynamicProcessComponent } from './popup-add-dynamic-process/popup-add-dynamic-process.component';

@Component({
  selector: 'lib-dynamic-process',
  templateUrl: './dynamic-process.component.html',
  styleUrls: ['./dynamic-process.component.css'],
})
export class DynamicProcessComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @Input() showButtonAdd = true;
  @Input() dataObj?: any;

  views: Array<ViewModel> = [];
  moreFuncs: Array<ButtonModel> = [];
  button?: ButtonModel;
  heightWin: any;
  widthWin: any;
  constructor(inject: Injector, private callFunc: CallFuncService) {
    super(inject);
    this.heightWin = Util.getViewPort().height - 100;
    this.widthWin = Util.getViewPort().width - 100;
  }

  onInit(): void {
    this.button = {
      id: 'btnAdd',
    };
  }
  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.content,
        sameData: true,
        model: {},
      },
    ];
  }

  click(evt: ButtonModel) {
    // this.titleAction = evt.text;
    switch (evt.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }
  add() {
    this.view.dataService.addNew().subscribe((res) => {
      var obj = res;
      let dialogModel = new DialogModel();
      dialogModel.IsFull = true;
      dialogModel.zIndex = 999;
      var dialog = this.callfc.openForm(
        PopupAddDynamicProcessComponent,
        '',
        this.widthWin,
        this.heightWin,
        '',
        obj,
        '',
        dialogModel
      );
    });
  }
}
