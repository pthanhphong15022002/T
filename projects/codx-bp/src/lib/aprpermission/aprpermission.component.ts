import { ChangeDetectorRef, Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ButtonModel, ViewModel, ViewType } from 'codx-core';

@Component({
  selector: 'lib-aprpermission',
  templateUrl: './aprpermission.component.html',
  styleUrls: ['./aprpermission.component.css']
})
export class AprpermissionComponent implements OnInit {
  funcID: any;
  views: Array<ViewModel> = [];
  button?: ButtonModel;
  moreFuncs: Array<ButtonModel> = [];
  columnsGrid = [];

  @ViewChild('view') codxview!: any;
  @Input() dataObj?: any;
  @Input() showButtonAdd = true;
  @ViewChild('itemViewList') itemViewList: TemplateRef<any>;
  @ViewChild('itemProcessName', { static: true })
  itemProcessName: TemplateRef<any>;
  @ViewChild('itemPetitioner', { static: true })
  itemPetitioner: TemplateRef<any>;
  @ViewChild('itemRequestDate', { static: true })
  itemRequestDate: TemplateRef<any>;
  @ViewChild('itemPermission', { static: true })
  itemPermission: TemplateRef<any>;
  @ViewChild('itemDescription', { static: true })
  itemDescription: TemplateRef<any>;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.button = {
      id: 'btnAdd',
    };
    this.columnsGrid = [
      { headerTemplate: this.itemProcessName, width: 300 },
      { headerTemplate: this.itemPetitioner, width: 300 },
      { headerTemplate: this.itemRequestDate, width: 100 },
      { headerTemplate: this.itemPermission, width: 100 },
      { headerTemplate: this.itemDescription, width: 300 },
      { field: '', headerText: '', width: 100 },
    ];
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        id: '1',
        type: ViewType.grid,
        active: true,
        sameData: true,
        model: {
          resources: this.columnsGrid,
          template: this.itemViewList,
        },
      },
    ];
    this.changeDetectorRef.detectChanges();
  }

  click(evt: ButtonModel) {
    // this.titleAction = evt.text;
    // switch (evt.id) {
    //   case 'btnAdd':
    //     this.add();
    //     break;
    // }
  }

  permission($event) {

  }

  clickMF(e: any, data?: any) {

  }

}
