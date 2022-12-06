import { query } from '@angular/animations';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Optional,
  Output,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ApiHttpService, CallFuncService, DialogData, DialogRef, FormModel, ViewTreeDetailComponent, DataService, DataRequest, PageTitleService, CodxService, CacheService } from 'codx-core';

@Component({
  selector: 'share-tree-view',
  templateUrl: './tree-view.component.html',
  styleUrls: ['./tree-view.component.css'],
})
export class TreeViewComponent implements OnInit, AfterViewInit {

  //#region Constructor
  @Input() data: any
  @Input() formModel?: FormModel;
  @Input() dataService: DataService;
  @Input() vllStatus?: any;
  @Input() listRoles?: any;
  @Input() showMoreFunc?: any;
  @Input() dataObj: any
  isShow = true ;
  isClose = false ;


  vllPriority ='TM005'
  dataTree: any[] = [];
  dialog: any;
  favorite  = '' ;
  @Output() clickMoreFunction = new EventEmitter<any>();
  @Output() viewTask = new EventEmitter<any>();
 
  constructor(
    private api: ApiHttpService,
    private callfc: CallFuncService,
    private changeDetectorRef: ChangeDetectorRef,
    private pageTitle: PageTitleService,
    private codxService : CodxService,
    private cache : CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) { 
    if (this.codxService.activeFav) {
          this.cache.favorite(this.codxService.activeFav).subscribe((x) => {
            this.favorite = x?.favorite
          });
   }}
  //#endregion

  //#region Init
  ngOnInit(): void { }

  ngAfterViewInit(): void {
    var gridModel = new DataRequest();
    gridModel.formName = this.formModel.formName;
    gridModel.entityName = this.formModel.entityName;
    gridModel.funcID = this.formModel.funcID;
    gridModel.gridViewName = this.formModel.gridViewName;
    gridModel.treeField = 'ParentID';
    gridModel.dataObj = JSON.stringify(this.dataObj)  ;
   
    this.api
      .execSv<any>(
        'TM',
        'ERM.Business.TM',
        'TaskBusiness',
        'GetTasksAsync',
        gridModel
      )
      .subscribe((res) => {
        if (res) {
          this.dataTree = res[0];
          let breadCrumbs = [
            {
              title: this.favorite + ' (' +res[1] + ')',
            },
          ];

          this.pageTitle.setBreadcrumbs(breadCrumbs);
        }
        }
      );
  }
  //#endregion

  //#region Event
  clickMF(e: any, dt?: any) {
    this.clickMoreFunction.emit({ e: e, data: dt });
  }

  changeDataMF(e, data) {
    if (e) {
      e.forEach((x) => {
        if (
          (x.functionID == 'TMT02016' || x.functionID == 'TMT02017') &&
          data.confirmControl == '0'
        ) {
          x.disabled = true;
        }
        if (
          x.functionID == 'TMT02019' &&
          data.verifyControl == '0' &&
          data.category == '1'
        ) {
          x.disabled = true;
        }
         //an giao viec
         if (x.functionID == 'SYS005') {
          x.disabled = true;
        }
         //an cap nhat tien do khi hoan tat 
         if ((x.functionID == 'TMT02018'|| x.functionID == 'TMT02026'||x.functionID == 'TMT02035')&& data.status=="90") {
          x.disabled = true;
        }
          //an voi ca TMT026
          if (
            (x.functionID == 'SYS02' ||
              x.functionID == 'SYS03' ||
              x.functionID == 'SYS04') &&
              this.formModel?.funcID == 'TMT0206'
          ) {
            x.disabled = true;
          }
      });
    }
  }
  //#endregion

  //#region Function
  selectionChange(parent) {
  // var id = parent?.data.taskID ;
  // var element = document.getElementById(id);
  // if(element){
  //   this.isClose =  element.classList.contains("icon-add_box");
  //   this.isShow =  element.classList.contains("icon-indeterminate_check_box"); 
  //   if(this.isClose){
  //     element.classList.remove("icon-add_box");
  //     element.classList.add("icon-indeterminate_check_box");
  //   }else if(this.isShow){
  //     element.classList.remove("icon-indeterminate_check_box");
  //     element.classList.add("icon-add_box");
  //   }
  // }
   if(parent.isItem){
    this.api
      .execSv<any>(
        'TM',
        'ERM.Business.TM',
        'TaskBusiness',
        'GetListTasksChildrenDeTailsTreeOneStepAsync',
        parent.data.taskID
      )
      .subscribe((res) => {
        if (res && res?.length >0) {
          parent.data.items=res ;
        }
      });
   }
  }

  dbClick(data){
    this.viewTask.emit(data) ;
  }

  //#endregion
}
