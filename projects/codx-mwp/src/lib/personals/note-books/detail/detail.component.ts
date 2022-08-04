import { CodxShareService } from './../../../../../../codx-share/src/lib/codx-share.service';
import { Component, OnInit, Injector, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ButtonModel, DialogModel, DialogRef, UIComponent, ViewType } from 'codx-core';
import { PopupAddUpdate } from './popup-add-update/popup-add-update.component';

@Component({
  selector: 'lib-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css'],
})
export class DetailComponent extends UIComponent implements OnInit {
  views: any = [];
  button?: ButtonModel;
  funcID = '';
  dialog!: DialogRef;
  recID = '';
  editMF: any;
  deleteMF: any;
  pinMF: any;
  saveMF: any;
  predicate = 'TransID=@0 && IsNote = false';
  dataValue = '';
  functionList = {
    formName: '',
    gridViewName: '',
    entityName: '',
  }
  gridViewSetup = {
    entityName: '',
    service: '',
    assemblyName: '',
    className: '',
  }

  @ViewChild('gridView') gridView: TemplateRef<any>;
  @ViewChild('listView') listView: TemplateRef<any>;

  constructor(private injector: Injector,
    private route: ActivatedRoute,
    ) {
    super(injector);
    this.route.params.subscribe(params => {
      if (params)
        this.funcID = params['funcID'];
    })

    this.cache.functionList(this.funcID).subscribe(res => {
      if (res) {
        this.functionList.formName = res.formName;
        this.functionList.gridViewName = res.gridViewName;
        this.functionList.entityName = res.entityName;
      }
    })
    this.cache
    .moreFunction('PersonalNotes', 'grvPersonalNotes')
    .subscribe((res) => {
      if (res) {
        this.editMF = res[2];
        this.deleteMF = res[3];
        this.pinMF = res[0];
        this.saveMF = res[1];
      }
    });
  }

  onInit(): void {
    this.getQueryParams();
    this.button = {
      id: 'btnAdd',
    };
  }

  ngAfterViewInit(): void {
    this.views = [
      {
      sameData: true,
      id: '1',
      type: ViewType.content,
      active: false,
      text: 'View Grid',
      icon: 'icon-grid_on',
      model: {
        panelLeftRef: this.gridView,
      },
    },
    {
      sameData: true,
      id: '2',
      type: ViewType.content,
      active: false,
      text: 'View List',
      icon: 'icon-view_list',
      model: {
        panelLeftRef: this.listView,
      },
    },
  ];
  }

  getQueryParams() {
    this.route.queryParams.subscribe(params => {
      if (params) {
        this.recID = params.recID;
        this.dataValue = this.recID;
      }
    });
  }

  openFormCreateDetail(e) {
    var obj = [{
      data: this.view.dataService.data,
      type: 'add',
      parentID: this.recID,
    }]

    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new DialogModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      this.dialog = this.callfc.openForm(PopupAddUpdate,
        'Thêm mới ghi chú', 1438, 775, '', obj, '', option
      );
    });
  }
}
