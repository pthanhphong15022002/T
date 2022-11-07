import { Component, OnInit } from '@angular/core';
import {} from '@angular/router';
import{
  FormModel
} from 'codx-core';

@Component({
  selector: 'lib-popup-add-employees-party-info',
  templateUrl: './popup-add-employees-party-info.component.html',
  styleUrls: ['./popup-add-employees-party-info.component.css']
})
export class PopupAddEmployeesPartyInfoComponent implements OnInit {

  formModel: FormModel
  constructor() { }

  ngOnInit(): void {
    this.formModel = new FormModel();
    this.formModel.entityName = ''
    this.formModel.formName = ''
    this.formModel.gridViewName = ''

  }

  headerText: ''

}
