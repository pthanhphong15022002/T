import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { CRUDService } from 'codx-core';

@Component({
  selector: 'codx-campaigns-detail',
  templateUrl: './campaigns-detail.component.html',
  styleUrls: ['./campaigns-detail.component.css']
})
export class CampaignsDetailComponent implements OnInit {
  @Input() dataSelected: any;
  @Input() dataService: CRUDService;
  @Input() formModel: any;
  id: any;
  loaded: boolean;
  tabControl = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true, template: null },
    {
      name: 'Comment',
      textDefault: 'Thảo luận',
      isActive: false,
      template: null,
    },
    {
      name: 'Attachment',
      textDefault: 'Đính kèm',
      isActive: false,
      template: null,
    },
    { name: 'Task', textDefault: 'Công việc', isActive: false, template: null },
  ];
  constructor(){

  }
  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataSelected']) {
      if (
        changes['dataSelected'].currentValue != null &&
        changes['dataSelected'].currentValue?.recID
      ) {
        if (changes['dataSelected'].currentValue?.recID == this.id) return;
        this.loaded = false;
        this.id = changes['dataSelected'].currentValue?.recID;
        this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
        this.loaded = true;
      }
    }
  }

  clickMF(e, data){

  }
}
