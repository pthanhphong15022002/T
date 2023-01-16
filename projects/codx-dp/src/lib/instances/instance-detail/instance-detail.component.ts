import { CodxDpService } from './../../codx-dp.service';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { CRUDService } from 'codx-core';

@Component({
  selector: 'codx-instance-detail',
  templateUrl: './instance-detail.component.html',
  styleUrls: ['./instance-detail.component.css']
})
export class InstanceDetailComponent implements OnInit {
  @Input() formModel: any;
  @Input() dataService: CRUDService;
  @Input() recID: any;

  data: any;
  id: any;
  constructor(
    private dpSv: CodxDpService
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    if(changes['recID']){
      if(changes['recID'].currentValue == this.id) return;
        this.id = changes['recID'].currentValue
        this.getInstanceByRecID(this.id);

    }
  }

  getInstanceByRecID(recID){
    this.dpSv.GetInstanceByRecID(recID).subscribe(res =>{
      if(res){
        this.data = res;
      }
    })
  }
}
