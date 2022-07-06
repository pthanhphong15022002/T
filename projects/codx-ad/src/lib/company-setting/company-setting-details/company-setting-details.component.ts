import { Component, Input, OnInit } from '@angular/core';
import { FormModel } from 'codx-core';
import { AD_CompanySettings } from '../../models/AD_CompanySettings.models';

@Component({
  selector: 'lib-company-setting-details',
  templateUrl: './company-setting-details.component.html',
  styleUrls: ['./company-setting-details.component.css']
})
export class CompanySettingDetailsComponent implements OnInit {
   title ="Thông tin tài khoản"
  constructor() { }
  @Input() formModel?: FormModel;
  data = new AD_CompanySettings();
  ngOnInit(): void {

  }

}
