import { ChangeDetectorRef, Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ButtonModel, ViewModel, ViewType } from 'codx-core';

@Component({
  selector: 'lib-nationalities',
  templateUrl: './nationalities.component.html',
  styleUrls: ['./nationalities.component.css']
})
export class NationalitiesComponent implements OnInit {
  views: Array<ViewModel> = [];
  button?: ButtonModel;
  columnsGrid = [];

  @Input() functionObject;
  @ViewChild('itemCreateBy', { static: true }) itemCreateBy: TemplateRef<any>;
  @ViewChild('itemCreate', { static: true }) itemCreate: TemplateRef<any>;
  @ViewChild('itemStopCheck', { static: true }) itemStopCheck: TemplateRef<any>;

  constructor(
    private changedr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.columnsGrid = [
      // { field: 'noName', nameColumn: '', template: this.GiftIDCell, width: 30 },
      { field: 'nationalityID', headerText: 'Mã', width: 100 },
      { field: 'nationalityName', headerText: 'Quốc tịch', width: 150 },
      { field: 'nationalityName2', headerText: 'Tên khác', width: 140 },
      { field: 'stop', headerText: 'Ngưng sử dụng', template: this.itemStopCheck, width: 100 },
      { field: 'createName', headerText: 'Người tạo', template: this.itemCreateBy, width: 100 },
      { field: 'createdOn', headerText: 'Ngày tạo', template: this.itemCreate, width: 100 }
    ];
  }

  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        // this.add();
        break;
    }
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
          // template: this.grid,
        }
      },

    ];
    this.changedr.detectChanges();
  }

  changeView(evt: any) { }

  requestEnded(evt: any) {
  }

  valueChangeShared(e){
    console.log(e)
  }
}
