import { AfterViewInit, Component, HostBinding, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormModel, UIDetailComponent } from 'codx-core';

@Component({
  selector: 'pr-view-detail-template',
  templateUrl: './view-detail-template.component.html',
  styleUrls: ['./view-detail-template.component.css']
})
export class ViewDetailTemplateComponent extends UIDetailComponent implements OnChanges, AfterViewInit {

  @HostBinding('class') get valid() { return "d-block w-100 h-100"; }
  @Input() runMode:string;
  @Input() formModel:FormModel;
  @Input() hideMF:boolean = true;

  data:any;
  gridKowColumns:any[] = [];
  tabControl = [
    {
      name: 'History',
      textDefault: 'Lịch sử',
      isActive: true,
      icon: 'icon-i-clock-history',
    },
    {
      name: 'Comment',
      textDefault: 'Thảo luận',
      isActive: false,
      icon: 'icon-i-chat-right',
    },
    {
      name: 'Attachment',
      textDefault: 'Đính kèm',
      isActive: false,
      icon: 'icon-i-paperclip',
    }
  ];
  override onInit(): void {
    this.loadData(this.recID);
  }


  ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes?.recID && changes?.recID?.currentValue !== changes?.recID?.previousValue)
    {
      this.loadData(this.recID);
    }
  }

  ngAfterViewInit(): void {
    
  }

  loadData(recID:string){
    if(recID)
    {
      this.api.execSv("HR","HR","TemplateExcelBusiness","GetByIDAsync",[recID])
      .subscribe((res:any) => {
        if(res)
        {
          this.data = res;
          this.detectorRef.detectChanges();
        }
      });
    }
  }

}
