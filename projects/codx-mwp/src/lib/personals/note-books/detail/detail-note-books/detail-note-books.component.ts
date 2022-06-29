import { UpdateDetailNoteBookComponent } from './../update-detail-note-book/update-detail-note-book.component';
import { ActivatedRoute } from '@angular/router';
import { ViewsComponent, CodxService, CallFuncService, ApiHttpService, ButtonModel } from 'codx-core';
import { Component, OnInit, TemplateRef, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { AddDetailNoteBooksComponent } from '../add-detail-note-books/add-detail-note-books.component';
import { LayoutModel } from '@shared/models/layout.model';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
@Component({
  selector: 'app-detail-note-books',
  templateUrl: './detail-note-books.component.html',
  styleUrls: ['./detail-note-books.component.scss']
})
export class DetailNoteBooksComponent implements OnInit, OnDestroy {

  views = [];
  recID: any;
  data: any;
  item: any;
  columnsGrid;
  funcID = '';

  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('panelLeft') panelLeftRef: TemplateRef<any>;
  @ViewChild('viewbase') viewbase: ViewsComponent;
  @ViewChild('lstGrid') lstGrid;
  @ViewChild('iconMoreFunc', {static : true}) iconMoreFunc;
  @ViewChild('memo', {static : true}) memo;
  @ViewChild('tag', {static : true}) tag;
  @ViewChild('createdOn', {static : true}) createdOn;
  @ViewChild('modifiedOn', {static : true}) modifiedOn;
  constructor(private changedt: ChangeDetectorRef,
    private route: ActivatedRoute,
    private codxService: CodxService,
    private callfc: CallFuncService,
    private api: ApiHttpService,
  ) {
      this.route.params.subscribe(params => {
        this.funcID = params['funcID'];
      })
   }

  button: Array<ButtonModel> = [{
    id: '1',
  }]
  ngOnDestroy(): void {
  }

  ngOnInit(): void {
    this.getQueryParams();

    this.columnsGrid = [{
      field: 'title',
      headerText: 'Tiêu đề',
      template: '',
      width: 150
    },
    {
      field: 'Tag#',
      headerText: 'Tag#',
      template: this.tag,
      width: 100
    },
    {
      field: 'memo',
      headerText: 'Chi tiết',
      template: this.memo,
      innerWidth: 300
    },
    {
      field: 'Đính kèm',
      headerText: 'Đính kèm',
      template: '',
      width: 100
    },
    {
      field: 'createdOn',
      headerText: 'Ngày tạo',
      template: this.createdOn,
      width: 150
    },
    {
      field: 'modifiedOn',
      headerText: 'Ngày cập nhật',
      template: this.modifiedOn,
      width: 150
    },
    {
      field: '',
      headerText: 'Chức năng tạm',
      template: this.iconMoreFunc,
      width: 50
    },
  ];
  }

  getQueryParams() {
    this.route.queryParams.subscribe(params => {
      if (params) {
        this.recID = params.recID;
      }
    });
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        id: '1',
        type: 'content',
        active: true,
        model: {
          panelLeftRef: this.panelLeftRef,
          // sideBarRightRef:this.panelRightRef,
          // widthAsideRight:'800px'
        },
      }
    ];
    // this.userPermission = this.viewbase.userPermission;
    // console.log(this.userPermission);
    this.changedt.detectChanges();
  }

  openFormCreateDetail(e) {
    var obj = {
      recID: this.recID,
      lstNote: this.lstGrid
    };
    this.callfc.openForm(AddDetailNoteBooksComponent, 'Thêm mới ghi chú', 1440, 780, '', obj);
  }

  onSelected(e) {
    this.data = e.datas;
  }

  openFormMoreFunc(e) {
    if(e) {
      this.item = e;
    }
  }

  formUpdate(item) {
    if(item) {
      var obj = {
        item: item,
        lstNote: this.lstGrid
      };
      this.callfc.openForm(UpdateDetailNoteBookComponent, 'Cập nhập ghi chú', 1440, 780, '', obj);
    }
  }

  onDelete(recID) {
    this.api
    .exec<any>(
      'ERM.Business.WP',
      'NotesBusiness',
      'DeleteNoteAsync',
      recID
    )
    .subscribe((res) => {
      if (res) {
        var dt = res;
        this.lstGrid.removeHandler(dt, "recID");
        this.changedt.detectChanges();
      }
    });
  }

  
  onSearch(e) {
    this.lstGrid.onSearch(e);
    this.changedt.detectChanges();
  }

}
