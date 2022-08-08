import {
  Component,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  Injector,
  OnInit,
  ChangeDetectorRef,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { ButtonModel, CacheService, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { formatDtDis } from '../../../../../codx-od/src/lib/function/default.function';
import { DispatchService } from '../../../../../codx-od/src/lib/services/dispatch.service';


@Component({
  selector: 'codx-approval',
  templateUrl: './codx-approval.component.html',
  styleUrls: ['./codx-approval.component.scss'],
})
export class CodxApprovalComponent implements OnInit , OnChanges , AfterViewInit
  {
    @ViewChild('view') view!: ViewsComponent;
    @ViewChild('itemTemplate') template!: TemplateRef<any>;
    @ViewChild('panelRightRef') panelRight?: TemplateRef<any>;
    @Input() tmpDetail?: TemplateRef<any>;

    @Output() selectedChange = new EventEmitter<any>(); 
    funcID: any;
    views: Array<ViewModel> | any = [];
    button?: ButtonModel;
    gridViewSetup: any;
    dvlApproval : any;
    dataItem: any;
    lstDtDis: any;
    lstUserID: any;
    /**
     *
     */
    constructor( private cache: CacheService ,  private odService :DispatchService , private detectorRef : ChangeDetectorRef) {
      
    }
    ngOnChanges(changes: SimpleChanges): void {
      
    }
    ngOnInit(): void {
     
    }
    ngAfterViewInit(): void {
      this.views = [
        {
          type: ViewType.listdetail,
          active: true,
          sameData: true,
          model: {
            template: this.template,
            //panelLeftRef: this.panelLeft,
            panelRightRef: this.panelRight,
            contextMenu: '',
          },
        },
      ];
      this.button = {
        id: 'btnAdd',
      };
      this.getGridViewSetup(this.view.formModel.funcID);
      this.detectorRef.detectChanges();
    }

    click(e:any)
    {

    }

    valueChange(dt: any) {
      var recID = null;
      if (dt?.data) {
        if(dt?.data[0])
        {
          recID = dt.data[0].transID
          this.dataItem = dt?.data[0];
        }
        else
        {
          recID = dt?.data?.transID
          this.dataItem = dt?.data;
        }
      }
      else if(dt?.transID){
        recID = dt.transID
        this.dataItem = dt;
      };
      this.selectedChange.emit(this.dataItem);
    }
    getDtDis(id: any) {
      this.lstDtDis = null;
      if(id)
      {
        this.lstUserID = '';
        this.odService.getDetailDispatch(id).subscribe((item) => {
          //this.getChildTask(id);
          if (item) {
            this.lstDtDis = formatDtDis(item);
            //this.view.dataService.setDataSelected(this.lstDtDis);
          }
        });
      }
    }
    getGridViewSetup(funcID:any) {
      this.cache
      .valueList("ES022")
      .subscribe((item) => {
        this.dvlApproval = item?.datas[0];
        //this.ref.detectChanges();
      });
     /*  this.cache.functionList('ODT31').subscribe((fuc) => {
        debugger;
        this.cache
          .gridViewSetup(fuc?.formName, fuc?.gridViewName)
          .subscribe((grd) => {
            this.gridViewSetup = grd;
          });
      }); */
      //formName: string, gridName: string
    }
    public setStyles(bg:any): any {
      let styles = {            
          'backgroundColor': bg
      };      
      return styles;
  }
}
