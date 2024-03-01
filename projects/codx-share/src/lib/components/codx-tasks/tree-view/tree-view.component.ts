import { query } from '@angular/animations';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Optional,
  Output,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  ApiHttpService,
  CallFuncService,
  DialogData,
  DialogRef,
  FormModel,
  ViewTreeDetailComponent,
  DataService,
  DataRequest,
  PageTitleService,
  CodxService,
  CacheService,
  CodxTreeviewComponent,
} from 'codx-core';
import { Observable, finalize, map } from 'rxjs';

@Component({
  selector: 'share-tree-view',
  templateUrl: './tree-view.component.html',
  styleUrls: ['./tree-view.component.css'],
})
export class TreeViewComponent implements OnInit, AfterViewInit {
  @ViewChild('treeView') treeView: CodxTreeviewComponent;
  //#region Constructor
  @Input() data: any;
  @Input() formModel?: FormModel;
  @Input() dataService: DataService;
  @Input() vllStatus?: any;
  @Input() listRoles?: any;
  @Input() showMoreFunc?: any;
  @Input() dataObj: any;
  @Input() user: any;
  @Input() filter: any;
  @Input() favoriteID = '00000000-0000-0000-0000-000000000009';
  @Input() favoriteName = '';
  @Input() predicate = '';
  @Input() predicateChild = '';
  @Input() dataValue = '';
  @Input() dataValueChild = '';
  @Input() searchText: any;
  @Input() itemTemplate!: TemplateRef<any>;

  isShow = true;
  isClose = false;
  pageSize = 20;
  page = 1;

  @Input()vllPriority = 'TM005';
  dataTree: any[] = [];
  dialog: any;
  favorite = '';
  loaded = false;
  @Output() clickMoreFunction = new EventEmitter<any>();
  @Output() changeMoreFunction = new EventEmitter<any>();
  @Output() viewTask = new EventEmitter<any>();
  @Output() nodeSelect = new EventEmitter<any>();

  gridModelTree = new DataRequest();
  service = 'TM';
  assemblyName = 'ERM.Business.TM';
  entityName = 'TM_Tasks';
  className = 'TaskBusiness';
  methodLoadData = 'GetTasksAsync';
  loadedTree: boolean = true; // load clcik tree
  isAllDatas: any = false;

  constructor(
    private api: ApiHttpService,
    private callfc: CallFuncService,
    private changeDetectorRef: ChangeDetectorRef,
    private pageTitle: PageTitleService,
    private codxService: CodxService,
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    if (this.favoriteID) {
      this.cache.favorite(this.favoriteID).subscribe((x) => {
        this.favoriteName = x?.favorite;
      });
    }
  }
  //#endregion

  //#region Init
  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.gridModelTree.formName = this.formModel.formName;
    this.gridModelTree.entityName = this.formModel.entityName;
    this.gridModelTree.funcID = this.formModel.funcID;
    this.gridModelTree.gridViewName = this.formModel.gridViewName;
    this.gridModelTree.treeField = 'ParentID';
    this.gridModelTree.dataObj = JSON.stringify(this.dataObj);
    this.gridModelTree.pageSize = this.pageSize;
    this.gridModelTree.page = this.page;
    this.gridModelTree.filter = this.filter;
    this.gridModelTree.favoriteID = this.favoriteID;
    this.gridModelTree.searchText = this.searchText;
    if(this.predicate && this.dataValue){
      this.gridModelTree.predicate=this.predicate;
      this.gridModelTree.dataValue=this.dataValue;
    }
    this.loadData();
    //cu ne
    // var gridModel = new DataRequest();
    // gridModel.formName = this.formModel.formName;
    // gridModel.entityName = this.formModel.entityName;
    // gridModel.funcID = this.formModel.funcID;
    // gridModel.gridViewName = this.formModel.gridViewName;
    // gridModel.treeField = 'ParentID';
    // gridModel.dataObj = JSON.stringify(this.dataObj);
    // // gridModel.pageSize = 20;
    // // gridModel.page = 0;
    // this.loaded = false;
    // this.api
    //   .execSv<any>(
    //     'TM',
    //     'ERM.Business.TM',
    //     'TaskBusiness',
    //     'GetTasksAsync',
    //     gridModel
    //   )
    //   .subscribe((res) => {
    //     if (res) {
    //       this.dataTree = res[0];
    //       let breadCrumbs = [
    //         {
    //           title: this.favorite + ' (' + res[1] + ')',
    //         },
    //       ];
    //       this.loaded = true;
    //       this.pageTitle.setBreadcrumbs(breadCrumbs);
    //     }
    //   });
  }
  //#endregion

  //#region Event
  clickMF(e: any, dt?: any) {
    this.clickMoreFunction.emit({ e: e, data: dt });
  }

  changeDataMF(e, data) {
    if (data.category == '3') {
      e.forEach((x) => {
        x.isbookmark = false;
      });
      this.changeMoreFunction.emit({ e: e, data: data });
    } else {
      e.forEach((x) => {
        if (x.functionID != 'SYS05') x.disabled = true;
      });
    }
    // if (e) {
    //   e.forEach((x) => {
    //     if (
    //       (x.functionID == 'TMT02016' || x.functionID == 'TMT02017') &&
    //       data.confirmControl == '0'
    //     ) {
    //       x.disabled = true;
    //     }
    //     if (
    //       x.functionID == 'TMT02019' &&
    //       data.verifyControl == '0' &&
    //       data.category == '1'
    //     ) {
    //       x.disabled = true;
    //     }
    //     //an giao viec
    //     if (x.functionID == 'SYS005') {
    //       x.disabled = true;
    //     }
    //     //an cap nhat tien do khi hoan tat
    //     if (
    //       (x.functionID == 'TMT02018' ||
    //         x.functionID == 'TMT02026' ||
    //         x.functionID == 'TMT02035') &&
    //       data.status == '90'
    //     ) {
    //       x.disabled = true;
    //     }
    //     //an voi ca TMT026
    //     if (
    //       x.functionID == 'SYS02' ||
    //       x.functionID == 'SYS03' ||
    //       x.functionID == 'SYS04'
    //       // &&this.formModel?.funcID == 'TMT0206'
    //     ) {
    //       x.disabled = true;
    //     }
    //     if (
    //       (this.formModel?.funcID == 'TMT03011' ||
    //         this.formModel?.funcID == 'TMT05011') &&
    //       data.category == '1' &&
    //       data.createdBy != this.user.userID &&
    //       !this.user?.administrator &&
    //       (x.functionID == 'SYS02' || x.functionID == 'SYS03')
    //     ) {
    //       x.disabled = true;
    //     }
    //   });
    // }
  }
  //#endregion

  //#region Function
  selectionChange(parent) {
    // if (!this.loadedTree) return;
    // var id = parent?.data.taskID;
    // var element = document.getElementById(id);
    // if (element) {
    //   this.isClose = element.classList.contains('icon-add_box');
    //   this.isShow = element.classList.contains('icon-indeterminate_check_box');
    //   if (this.isClose) {
    //     element.classList.remove('icon-add_box');
    //     element.classList.add('icon-indeterminate_check_box');
    //   } else if (this.isShow) {
    //     element.classList.remove('icon-indeterminate_check_box');
    //     element.classList.add('icon-add_box');
    //   }
    // }

    this.loadedTree = false;
    if (parent.isItem) {
      if(this.predicateChild && this.dataValue){
        let predicate = this.predicateChild+'&&ParentID=@1';
        let datavalue = this.dataValueChild+';'+parent.data.recID.toString()
        this.api
        .execSv<any>(
          'TM',
          'ERM.Business.TM',
          'TaskBusiness',
          'GetListTasksChildrenDeTailsTreeOneStepAsync',
          [parent.data.taskID,predicate,datavalue]
        )
        .subscribe((res) => {
          if (res && res?.length > 0) {
            parent.data.items = res;
            this.loadedTree = true;
          }
        });
      }
      else{
        this.api
        .execSv<any>(
          'TM',
          'ERM.Business.TM',
          'TaskBusiness',
          'GetListTasksChildrenDeTailsTreeOneStepAsync',
          [parent.data.taskID]
        )
        .subscribe((res) => {
          if (res && res?.length > 0) {
            parent.data.items = res;
            this.loadedTree = true;
          }
        });
      }

    }
  }

  dbClick(data) {
    this.viewTask.emit(data);
  }
  select(data){
    this.nodeSelect.emit(data);
  }

  //#endregion

  loadData() {
    this.loaded = this.gridModelTree.page > 1;
    this.fetch().subscribe((res) => {
      if (res) {
        let dataTreeAll = res[0];
        if (this.gridModelTree.page > 1) {
          let idxLastRemove = this.gridModelTree.page * 20 - 1;
          let dataTreeNew = dataTreeAll.splice(0, idxLastRemove);
          if (dataTreeNew?.length > 0)
            this.dataTree = this.dataTree.concat(dataTreeNew);
        } else this.dataTree = dataTreeAll;

        this.loaded = true;
        this.isAllDatas = this.dataTree?.length == res[1];
        // this.cache.favorite(this.gridModelTree.favoriteID).subscribe((f) => {
        //   this.favorite = f?.favorite;
        let breadCrumbs = [
          {
            title: this.favoriteName + ' ' + res[1] + '',
          },
        ];
        this.pageTitle.setBreadcrumbs(breadCrumbs);
        // });
      } else {
        this.isAllDatas = true;
        this.loaded = true;
      }
    });
  }

  fetch(): Observable<any[]> {
    return this.api
      .execSv<Array<any>>(
        this.service,
        this.assemblyName,
        this.className,
        this.methodLoadData,
        this.gridModelTree
      )
      .pipe(
        finalize(() => {
          /*  this.onScrolling = this.loading = false;
          this.loaded = true; */
        }),
        map((response: any) => {
          return response;
        })
      );
  }

  @HostListener('scroll', ['$event'])
  onScroll(event: Event): void {
    if (!this.isAllDatas) {
      const element = event.target as HTMLElement;
      if (element.scrollHeight - element.scrollTop === element.clientHeight) {
        this.gridModelTree.page += 1;
        this.loadData();
      }
    }
  }
}
