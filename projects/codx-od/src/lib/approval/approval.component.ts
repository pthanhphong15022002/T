import {
  Component,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  Injector,
  OnInit,
} from '@angular/core';
import { ButtonModel, CacheService, ViewModel, ViewsComponent, ViewType } from 'codx-core';


@Component({
  selector: 'app-approval',
  templateUrl: './approval.component.html',
  styleUrls: ['./approval.component.scss'],
})
export class ApprovalComponent implements OnInit , OnChanges , AfterViewInit
  {
    @ViewChild('view') view!: ViewsComponent;
    @ViewChild('itemTemplate') template!: TemplateRef<any>;
    @ViewChild('panelRightRef') panelRight?: TemplateRef<any>;
    views: Array<ViewModel> | any = [];
    button?: ButtonModel;
    gridViewSetup: any;
    dvlApproval : any;
    /**
     *
     */
    constructor( private cache: CacheService) {
      
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
     
    }
    click(e:any)
    {}
    getGridViewSetup(funcID:any) {
      this.cache
      .valueList("ES022")
      .subscribe((item) => {
        debugger;
        this.dvlApproval = item?.datas[0];
        //this.ref.detectChanges();
      });
      this.cache.functionList(funcID).subscribe((fuc) => {
        this.cache
          .gridViewSetup(fuc?.formName, fuc?.gridViewName)
          .subscribe((grd) => {
            this.gridViewSetup = grd;
          });
      });
      //formName: string, gridName: string
    }
}
