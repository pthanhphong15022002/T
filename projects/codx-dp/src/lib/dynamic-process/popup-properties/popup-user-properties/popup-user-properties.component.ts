import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'codx-user-properties',
  templateUrl: './popup-user-properties.component.html',
  styleUrls: ['./popup-user-properties.component.scss']
})
export class PopupUserPropertiesComponent implements OnInit {

  @Input() list: any;
  @Input() item: any;
  popupSearch: any;
  listUserSearch = [];
  listUser = [];
  constructor() { }

  ngOnInit(): void {
  }


  seachUser(e, value, p) {
    e.stopPropagation();
    // p.open();
    this.popupSearch = p;
    this.listUserSearch = value;
    this.listUser = value;
  }

  searchName(e) {
    var resouscesSearch = [];
    if (e.trim() == '') {
      this.listUserSearch = this.listUser;
      return;
    }
    let value = e.trim().toLowerCase();
    this.listUserSearch = this.listUser.filter(
      (item) => item.objectName.toString().toLowerCase().search(value) >= 0
    );
    // this.listUserSearch = resouscesSearch;
  }
}
