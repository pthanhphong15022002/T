import { ContextMenuModel } from '@syncfusion/ej2-angular-navigations';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  CardSettingsModel,
  DialogSettingsModel,
  SwimlaneSettingsModel,
} from '@syncfusion/ej2-angular-kanban';
import { CoDxKanbanComponent } from 'codx-core';

@Component({
  selector: 'app-test-kanban',
  templateUrl: './test-kanban.component.html',
  styleUrls: ['./test-kanban.component.scss'],
})
export class TestKanbanComponent implements OnInit {
  dataSource = cardData;
  item: any;
  showSumary = false;
  Sumary: string = '';
  @ViewChild('kanban') kanban!: CoDxKanbanComponent;
  @ViewChild('popupAdd') modalContent: any;
  constructor(private modalService: NgbModal) {}
  public swimlaneSettings: SwimlaneSettingsModel = {
    keyField: 'Assignee',
    showEmptyRow: false,
  };

  public columns = [
    { headerText: 'Đang làm', keyField: '1', allowToggle: true },
    { headerText: 'Làm được 10%', keyField: '2', allowToggle: true },
    { headerText: 'Review', keyField: '3', allowToggle: true },
    { headerText: 'Xong', keyField: '4', allowToggle: true },
  ];

  ngOnInit() {}

  public cardSettings: CardSettingsModel = {
    headerField: 'Description',
    template: '#cardTemplate',
    selectionType: 'Multiple',
  };

  public dialogSettings: DialogSettingsModel = {
    fields: [
      { text: 'ID', key: 'Description', type: 'TextBox' },
      { key: 'Status', type: 'DropDown' },
      { key: 'Assignee', type: 'DropDown' },
      { key: 'RankId', type: 'TextBox' },
      { key: 'Summary', type: 'TextArea' },
    ],
  };

  public contextMenuSetting = {
    enable: true,
    menuItem: [],
  };
  clickme() {
    console.log('aloooo');
  }
  public getString(assignee: any) {
    return assignee
      .match(/\b(\w)/g)
      .join('')
      .toUpperCase();
  }

  openPopup(evt: any, action: string = 'add') {
    this.modalService
      .open(this.modalContent, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (res) => {
          if (res) {
            if (action == 'add')
              this.kanban.addCard({
                Id: 'Task 100',
                Description: 'Task - BigData',
                Status: '1',
                Summary: 'Big data is so cool',
                Priority: 'High',
                Tags: 'Bug, Release Bug',
                RankId: 1,
                Assignee: 'Nancy Davloio',
              });
          }
        },
        (reason) => {
          if (reason) {
          }
        }
      );
  }

  onDataDrag(evt: any) {
    console.log(evt);
    this.item = evt;
  }

  submit(e: any, modal: any) {
    let t = this;
    setTimeout(function () {
      t.item.Summary = 'halo con cá rô 1234';
      t.kanban.itemUpdate = t.item;
      modal.close(true);
    }, 1000);
  }
}
export let cardData: Object[] = [
  {
    Id: 'Task 1',
    Description: 'Task - 29001',
    Status: '1',
    Summary:
      'Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.',
    Priority: 'High',
    Tags: 'Bug, Release Bug',
    RankId: 1,
    Assignee: 'Nancy Davloio',
  },
  {
    Id: 'Task 2',
    Description: 'Task - 29002',
    Status: '2',
    Summary: 'Add responsive support to applicaton',
    Priority: 'Low',
    Tags: 'Story, Kanban',
    RankId: 1,
    Assignee: 'Andrew Fuller',
  },
  {
    Id: 'Task 3',
    Description: 'Task - 29003',
    Status: '3',
    Summary: 'Show the retrived data from the server in grid control.',
    Priority: 'High',
    Tags: 'Bug, Breaking Issue',
    RankId: 2,
    Assignee: 'Janet Leverling',
  },
  {
    Id: 'Task 4',
    Description: 'Task - 29004',
    Status: '4',
    Summary: 'Fix the issues reported in the IE browser.',
    Priority: 'High',
    Tags: 'Bug, Customer',
    RankId: 3,
    Assignee: 'Andrew Fuller',
  },
  {
    Id: 'Task 5',
    Description: 'Task - 29005',
    Status: '1',
    Summary: 'Improve application performance.',
    Priority: 'Normal',
    Tags: 'Story, Kanban',
    RankId: 1,
    Assignee: 'Steven walker',
  },
  {
    Id: 'Task 6',
    Description: 'Task - 29009',
    Status: '2',
    Summary: 'API Improvements.',
    Priority: 'Critical',
    Tags: 'Bug, Customer',
    RankId: 2,
    Assignee: 'Nancy Davloio',
  },
  {
    Id: 'Task 7',
    Description: 'Task - 29010',
    Status: '3',
    Summary: "Fix cannot open user's default database sql error.",
    Priority: 'High',
    Tags: 'Bug, Internal',
    RankId: 8,
    Assignee: 'Margaret hamilt',
  },
  {
    Id: 'Task 8',
    Description: 'Task - 29015',
    Status: '4',
    Summary: 'Fix the filtering issues reported in safari.',
    Priority: 'Critical',
    Tags: 'Bug, Breaking Issue',
    RankId: 4,
    Assignee: 'Margaret hamilt',
  },
  {
    Id: 'Task 9',
    Description: 'Task - 29016',
    Status: '1',
    Summary: 'Fix the issues reported in IE browser.',
    Priority: 'High',
    Tags: 'Bug, Customer',
    RankId: 3,
    Assignee: 'Andrew Fuller',
  },
  {
    Id: 'Task 10',
    Description: 'Task - 29017',
    Status: '2',
    Summary: 'Enhance editing functionality.',
    Priority: 'Normal',
    Tags: 'Story, Kanban',
    RankId: 4,
    Assignee: 'Janet Leverling',
  },
];
