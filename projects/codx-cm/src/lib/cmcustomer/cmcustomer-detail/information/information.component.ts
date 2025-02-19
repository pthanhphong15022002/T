import { Component, Input, OnInit } from '@angular/core';
import { CodxCmService } from '../../../codx-cm.service';
import { FormModel } from 'codx-core';

@Component({
  selector: 'codx-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.css'],
})
export class InformationComponent implements OnInit {
  @Input() funcID = 'CM0101'; //True - Khách hàng; False - Liên hệ
  @Input() dataSelected: any;
  @Input() formModel: any;
  @Input() gridViewSetup: any;
  @Input() entityName = '';
  @Input() listAddress = [];
  @Input() nameCbxCM = '';
  @Input() checkType: string = '1';
  formModelAddress: FormModel;
  constructor(private cmSv: CodxCmService) {}

  ngOnInit(): void {
    if (this.checkType == '1')
      this.checkType =
        this.dataSelected?.category == '2' ? '5' : this.checkType;
  }
}
