import { AfterViewInit, Component, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiHttpService, ButtonModel, CallFuncService, DialogData, DialogRef, ResourceModel, SidebarModel, ViewModel, ViewType } from 'codx-core';
import { AddProcessDefaultComponent } from './add-process-default/add-process-default.component';

@Component({
  selector: 'lib-process-release',
  templateUrl: './process-release.component.html',
  styleUrls: ['./process-release.component.css']
})
export class ProcessReleaseComponent implements OnInit , AfterViewInit{
  @ViewChild('viewColumKaban') viewColumKaban!: TemplateRef<any>;
  views: Array<ViewModel> = [];
  recID:any;
  funcID:any;
  resourceKanban?: ResourceModel;
  button?: ButtonModel[];
  process:any;
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
  log(data:any){
    console.log(data)
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
        request2: this.resourceKanban,
        model:
        {
          template2: this.viewColumKaban,
        }
      }
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
    this.callFunc.openSide(AddProcessDefaultComponent,this.process,option)
  }
}
