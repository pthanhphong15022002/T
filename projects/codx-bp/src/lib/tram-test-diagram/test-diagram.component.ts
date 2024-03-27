import { Component, ViewEncapsulation, OnInit, AfterViewInit, Injector, ViewChild, TemplateRef } from "@angular/core";
import { ButtonModel, NotificationsService, UIComponent, Util, ViewModel, ViewType } from "codx-core";
import { CodxShareService } from "projects/codx-share/src/public-api";
import { CodxBpService } from "../codx-bp.service";

@Component({
  selector: 'test-diagram',
  templateUrl: './test-diagram.component.html',
  styleUrls: ['./test-diagram.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TramTestDiagramComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @ViewChild('contentTemplate') contentTemplate: TemplateRef<any>;
  views: Array<ViewModel> = [];
  moreFuncs: Array<ButtonModel> = [];
  button?: ButtonModel[];
  method = 'GetListProcessesAsync';
  showButtonAdd: boolean = true;
  dataObj: any;
  titleAction = '';
  heightWin: any;
  widthWin: any;
  itemSelected: any;
  popoverDetail: any;
  popupOld: any;
  popoverList: any;
  readonly btnAdd: string = 'btnAdd';
  asideMode: string;
  vllBP016 = [];
  recID:any;
  columns:any=[];
  constructor(
    inject: Injector,
    private bpService: CodxBpService,
    private notiSv: NotificationsService,
    private codxShareService: CodxShareService
  ) {
    super(inject);
    this.router.params.subscribe((param) => {
      if(!this.funcID) this.funcID = param['funcID'];
      if (!this.recID) this.recID = param['id'];
      if(this.recID){
       this.getProcess()
       let sub = this.api.execSv('BP','BP','ProcessesBusiness','GetColumnsKanbanAsync',[{},this.recID]).subscribe((res:any)=>{
          this.columns=res?.columns;
          sub.unsubscribe();
        })
      }
    });
  }
  override onInit(): void {

  }
  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.content,
        sameData: true,
        active: true,
        model: {
          panelLeftRef: this.contentTemplate,
        },
      },
    ]
  }

  clickMF(e:any,data:any){

  }

  click(e:any){

  }
  process:any;
  lstSteps:any;
  getProcess() {
   let sub= this.api
      .execSv('BP', 'BP', 'ProcessesBusiness', 'GetAsync', this.recID)
      .subscribe((item) => {
        if (item) {
          this.process = item;
          console.log(this.process);

          this.lstSteps = this.process?.steps?.filter(
            (x) => x.activityType == 'Stage'
          );
        }
        sub.unsubscribe();
      });
  }
}
