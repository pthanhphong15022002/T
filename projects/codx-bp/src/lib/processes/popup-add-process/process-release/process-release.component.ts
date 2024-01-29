import { AfterViewInit, Component, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiHttpService, ButtonModel, CallFuncService, DialogData, DialogModel, DialogRef, ResourceModel, SidebarModel, ViewModel, ViewType, ViewsComponent } from 'codx-core';
import { AddProcessDefaultComponent } from './add-process-default/add-process-default.component';
import { ProcessReleaseDetailComponent } from './process-release-detail/process-release-detail.component';

@Component({
  selector: 'lib-process-release',
  templateUrl: './process-release.component.html',
  styleUrls: ['./process-release.component.css']
})
export class ProcessReleaseComponent implements OnInit , AfterViewInit{
  @ViewChild('view') view: ViewsComponent;
  @ViewChild('viewColumKaban') viewColumKaban!: TemplateRef<any>;
  @ViewChild('cardKanban') cardKanban!: TemplateRef<any>;
  @ViewChild('templateList') templateList?: TemplateRef<any>;
  @ViewChild('headerTemplateList') headerTemplateList?: TemplateRef<any>;
  views: Array<ViewModel> = [];
  recID:any;
  funcID:any;
  request?:ResourceModel;
  resourceKanban?: ResourceModel;
  button?: ButtonModel[];
  process:any;

  //#region setting methods
  service = 'BP';
  assemblyName = 'ERM.Business.BP';
  entityName = 'BP_Instances';
  className = 'ProcessInstancesBusiness';
  idField = 'recID';
  method = 'GetListInstancesAsync';
  dataObj: any;
  //#endregion
  constructor(
    private api: ApiHttpService,
    private callFunc: CallFuncService,
    private router: ActivatedRoute,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
   this.router.params.subscribe((param) => {
      if(!this.funcID) this.funcID = param['funcID'];
      if(!this.recID) this.recID = param['id'];
   });
  }

  ngAfterViewInit(): void {

    this.button = [
      {
        id: 'btnAdd',
      },
    ];

    this.views = [
      {
        type: ViewType.kanban,
        active: true,
        sameData: true,
        request: this.request,
        request2: this.resourceKanban,
        model:
        {
          template: this.cardKanban,
          template2: this.viewColumKaban,
        }
      },
      {
        type: ViewType.list,
        sameData: true,
        active: false,
        model: {
          template: this.templateList,
          headerTemplate: this.headerTemplateList,
        },
      },
      // request: this.request,
      // request2: this.resourceKanban,
      // // toolbarTemplate: this.footerButton,
      // model: {
      //   template: this.cardKanban,
      //   template2: this.viewColumKaban,
      //   setColorHeader: true,
      // },
    ]
  }

  getProcess()
  {
    this.api.execSv("BP","BP","ProcessesBusiness","GetAsync",this.recID).subscribe(item=>{
      if(item) this.process = item;
    })
  }

  ngOnInit(): void {
    this.dataObj = {
      processID: this.recID,
    }

    this.request = new ResourceModel();
    this.request.service = 'BP';
    this.request.assemblyName = 'BP';
    this.request.className = 'ProcessInstancesBusiness';
    this.request.method = 'GetListInstancesAsync';
    this.request.idField = 'recID';
    this.request.dataObj = this.dataObj;

    this.resourceKanban = new ResourceModel();
    this.resourceKanban.service = 'BP';
    this.resourceKanban.assemblyName = 'BP';
    this.resourceKanban.className = 'ProcessesBusiness';
    this.resourceKanban.method = 'GetColumnsKanbanAsync';
    this.resourceKanban.dataObj = this.recID;

    this.getProcess();
  }

  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }

  add()
  {
    var option = new SidebarModel();
    option.FormModel = {
      funcID : this.funcID
    }
    let popup = this.callFunc.openSide(AddProcessDefaultComponent,this.process,option);
    popup.closed.subscribe(res=>{
      if(res?.event)
      {
        (this.view.currentView as any).kanban.addCard(res?.event)
      }
    })
  }

  openFormDetail(dt:any)
  {
    var option = new DialogModel();
    option.IsFull = true;
    let popup = this.callFunc.openForm(ProcessReleaseDetailComponent,"",850,600,"",{data:dt,process:this.process},"",option);
  }
}
