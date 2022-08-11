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
import { ActivatedRoute, Router } from '@angular/router';
import { ApiHttpService, ButtonModel, CacheService, CodxService, ViewModel, ViewsComponent, ViewType } from 'codx-core';
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
    @Input() tmpHeader?: TemplateRef<any>;
    @Input() tmpBody?: TemplateRef<any>;
    @Input() tmpDetail?: TemplateRef<any>;
    @Output() selectedChange = new EventEmitter<any>(); 
    funcID: any;
    transID:any;
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
    constructor(
      private router: Router, 
      private cache: CacheService,  
      private odService :DispatchService, 
      private detectorRef : ChangeDetectorRef,
      private route:ActivatedRoute,
      private codxService: CodxService
      ) {
      
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
    openFormFuncID(e:any)
    {

    }
    valueChange(dt: any) {
      this.transID = null;
      if (dt?.data) {
        if(dt?.data[0])
        {
          this.transID = dt.data[0].transID
          this.dataItem = dt?.data[0];
        }
        else
        {
          this.transID = dt?.data?.transID
          this.dataItem = dt?.data;
        }
      }
      else if(dt?.transID){
        this.transID = dt.transID
        this.dataItem = dt;
      };
      this.cache.functionList(this.dataItem?.functionID).subscribe((fuc) => {
        if(fuc)
        {
          var params ;
          if(fuc?.url)
          {
            params = fuc?.url.split("/");
            this.codxService.navigate('','/od/approvals/ODT71/'+params[1]+"/"+fuc?.functionID+"/"+this.dataItem?.transID)
          }
          //const queryParams = { 'id' : this.dataItem?.transID};
        
          //this.router.navigate(['tester/od/approvals/ODT71/'+params[1]+"/"+fuc?.functionID]);
        }
        //this.router.navigate([{ outlets: { 'detail': ['/tester/'+fuc?.url+'/detail'] } }], { skipLocationChange: true });
        //this.router.navigate([ { outlets: { primary:['/tester/od/dispatches/'+fuc?.url+'/detail', 'test1'] } }]);
        //this.router.navigate(['/tester/od/dispatches/'+fuc?.url+'/detail'])
        //this.codxService.navigate("","",{})
      });
      this.selectedChange.emit([this.dataItem,this.view]);
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
