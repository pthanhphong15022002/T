import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'tabs-header',
  templateUrl: './tabs-header.component.html',
  styleUrls: ['./tabs-header.component.scss']
})
export class TabsHeaderComponent implements OnInit {
  @Input() listTab = [];
  @Input() size = 20;
  @Output() tab = new EventEmitter();

  sizeIcon = '';
  sizeText = '';
  listTaskConvert = [];
  tabOld;
  ngOnInit(): void {
    this.size = this.size%2 == 0 ? this.size : this.size + 1;
    this.sizeIcon = this.size.toString();
    this.sizeText = (this.size - 8).toString() + 'px';

    this.listTaskConvert = this.listTab.map((item) => {
      return {...item, isActive: false}
    })
    this.listTaskConvert[0].isActive = true;
    this.tabOld = this.listTaskConvert[0];
    this.tab.emit(this.listTaskConvert[0].name);
  }

  clickMenu(item) {
   item.isActive = true;
   this.tabOld.isActive = false;
   this.tabOld = item;
   this.tab.emit(item.name);
  }
}
