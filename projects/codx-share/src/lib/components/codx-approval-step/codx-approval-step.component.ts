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
import { ApiHttpService, ButtonModel, CacheService, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { formatDtDis } from '../../../../../codx-od/src/lib/function/default.function';
import { DispatchService } from '../../../../../codx-od/src/lib/services/dispatch.service';


@Component({
  selector: 'codx-approval-step',
  templateUrl: './codx-approval-step.component.html',
  styleUrls: ['./codx-approval-step.component.scss'],
})
export class CodxApprovalStepComponent implements OnInit , OnChanges , AfterViewInit
  {
    @Input() transID : string;
    data:any = {};
    constructor( 
      private api: ApiHttpService,
      private detectorRef : ChangeDetectorRef
    ) {}
    ngOnChanges(changes: SimpleChanges): void {
      if(changes["transID"] && changes["transID"]?.currentValue != changes["transID"]?.previousValue)
      {
        this.data = {};
        this.transID = changes["transID"]?.currentValue;
        this.getApprovalTransByID();
        this.detectorRef.detectChanges();
      }
    }
    ngOnInit(): void {
      this.data = {};
      //if(this.transID) this.getApprovalTransByID();
    }
    ngAfterViewInit(): void {
     
    }
    getApprovalTransByID()
    {
      this.api.execSv("ES","ES","ApprovalTransBusiness","GetByTransIDAsync",this.transID).subscribe(item=>{if(item) this.formatApproval(item)})
    }
    formatApproval(data)
    {
      debugger;
      for(var i = 0 ; i < data.length ; i++)
      {
        if (!(data[i].stepNo in this.data))
        {
          this.data[data[i].stepNo] = {};
          this.data[data[i].stepNo].data = [];
          this.data[data[i].stepNo].name = data[i].stepNote;
          this.data[data[i].stepNo].data.push(data[i]);
        }
        else this.data[data[i].stepNo].data.push(data[i]);
      }
    }
    aaa(data:any)
    {
      debugger;
      console.log(data)
    }
}
