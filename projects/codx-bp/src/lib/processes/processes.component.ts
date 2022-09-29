import { AfterViewInit, Component, Injector, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ButtonModel, UIComponent, ViewModel, ViewType } from 'codx-core';

@Component({
  selector: 'lib-processes',
  templateUrl: './processes.component.html',
  styleUrls: ['./processes.component.css']
})
export class ProcessesComponent extends UIComponent implements OnInit, AfterViewInit {
  @ViewChild('itemViewList') itemViewList: TemplateRef<any>;
  @Input() showButtonAdd = true;
  @Input() dataObj?: any;

  views: Array<ViewModel> = [];
  button?: ButtonModel;
  moreFuncs: Array<ButtonModel> = [];

  constructor(
    inject: Injector,

  ) {
    super(inject);
   }

   onInit(): void {
    throw new Error('Method not implemented.');
  }

  click(evt: ButtonModel) {
    // this.titleAction = evt.text;
    switch (evt.id) {
      case 'btnAdd':
        // this.add();
        break;
    }
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.list,
        active: false,
        sameData: true,
        model: {
          template: this.itemViewList,
        },
      },
    ]
  }

  onDragDrop(e: any) {
    console.log(e);
  }
}
