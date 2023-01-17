import { style } from '@angular/animations';
import { CodxDpService } from './../../codx-dp.service';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { CRUDService } from 'codx-core';

@Component({
  selector: 'codx-instance-detail',
  templateUrl: './instance-detail.component.html',
  styleUrls: ['./instance-detail.component.css'],
})
export class InstanceDetailComponent implements OnInit {
  @Input() formModel: any;
  @Input() dataService: CRUDService;
  @Input() recID: any;

  dataSelect: any;
  id: any;

  //progressbar
  labelStyle = { color: '#FFFFFF' };
  showProgressValue = true;
  animation = { enable: true, duration: 2000, delay: 0 };
  trackThickness: Number = 24;
  progressThickness: Number = 24;
  value: Number = 30;
  cornerRadius: Number = 30;
  constructor(private dpSv: CodxDpService) {

  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    if (changes['recID']) {
      if (changes['recID'].currentValue == this.id) return;
      this.id = changes['recID'].currentValue;
      this.getInstanceByRecID(this.id);
    }
  }


  getInstanceByRecID(recID) {
    this.dpSv.GetInstanceByRecID(recID).subscribe((res) => {
      if (res) {
        this.dataSelect = res;
      }
    });
  }


}
