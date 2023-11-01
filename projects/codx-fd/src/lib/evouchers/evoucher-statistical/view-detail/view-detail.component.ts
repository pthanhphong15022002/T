import { AfterViewInit, Component, Input, OnChanges, OnInit, Optional, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { ApiHttpService, DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-view-detail',
  templateUrl: './view-detail.component.html',
  styleUrls: ['./view-detail.component.css']
})
export class ViewDetailComponent implements OnInit , OnChanges , AfterViewInit{
  @ViewChild('dateColumn') dateColumn: TemplateRef<any>;
  @ViewChild('dateRow') dateRow: TemplateRef<any>;
  @ViewChild('createdColumn') createdColumn: TemplateRef<any>;
  @ViewChild('nameVoucherColumn') nameVoucherColumn: TemplateRef<any>;
  @ViewChild('amountColumn') amountColumn: TemplateRef<any>;
  @ViewChild('tmpInfor') tmpInfor: TemplateRef<any>;
  @ViewChild('tmpInforVoucher') tmpInforVoucher: TemplateRef<any>;
  @Input() recID:any;
  
  listData:any;
  dataItem:any;
  columnsGrid = [];
  hGrid=0;
  constructor(
    private api: ApiHttpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  {
  }
  ngAfterViewInit(): void {
    this.columnsGrid = [
      {
        width: 100,
        headerTemplate: this.dateColumn,
        template:this.dateRow,
      },
      {
        headerTemplate: this.createdColumn,
        template:this.tmpInfor,
      },
      {
        field: 'itemName',
        headerTemplate: this.nameVoucherColumn,
      },
      {
        width: 80,
        field: 'amount',
        headerTemplate: this.amountColumn,
        textAlign: 'center',
      }
    ];
    this.setting();
  }

  ngOnInit(): void {
  }
  
  setting()
  {
    var divBody = document.getElementById('v-d-e').offsetHeight;
    var divheader = document.getElementById('v-d-e-header').offsetHeight;
    this.hGrid = divBody - divheader - 80;
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes?.recID &&
      changes.recID?.previousValue != changes.recID?.currentValue
    ) {
      this.recID = changes.recID?.currentValue
      this.getData();
    }
  }

  getData()
  {
    this.api.execSv("FD","FD","PaymentsBusiness","GetListGiftTransAsync",this.recID).subscribe(item=>{
      this.dataItem = item[0]; 
      this.listData = item[1]
    });
  }
}
