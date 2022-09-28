import { TempService } from '../services/temp.service';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RolesService } from '../services/roles.service';
import { ApiHttpService, NotificationsService } from 'codx-core';

declare var $: any;
@Component({
  selector: 'app-asideroledetail',

  templateUrl: './asideroledetail.component.html',
  styleUrls: ['./asideroledetail.component.scss'],
})
export class AsideroledetailComponent implements OnInit {
  recid = '';
  constructor(
    private RolesService: RolesService,
    private api: ApiHttpService,
    private notificationsService: NotificationsService,
    private at: ActivatedRoute,
    private tempService: TempService
  ) {}
  @Input() treeData: [];
  @Output() onChangeSelected = new EventEmitter();
  ngOnInit(): void {
    var rid = this.at.snapshot.paramMap.get('id');
    if (rid) {
      this.recid = rid;
    }
  }

  ngAfterViewInit() {}
  onChangeSelectedFunction(data) {
    this.onChangeSelected.emit(data);
  }
  itemClick(elm, item, event, customName) {
    if (this.RolesService._dataChanged) {
      this.notificationsService.notifyCode(
        'Dữ liệu thay đổi, bạn cần lưu lại trước.'
      );
      return;
    }
    this.onChangeSelected.emit({ nameFunction: customName });
    var formName = item.formName;
    var gridViewName = item.gridViewName;
    var functionID = item.functionType == 'M' ? '' : item.functionID;
    event.preventDefault();
    $('.menu-item').removeClass('menu-item-active');
    $(elm).addClass('menu-item-active');
    this.RolesService.formName = formName;
    this.RolesService.gridViewName = gridViewName;
    this.RolesService.funcID = functionID;
    this.RolesService._activeSysFuction = item.activeSysFuction;
    this.RolesService._activeMoreFuction = item.activeMoreFuction;
    this.api
      .call('ERM.Business.AD', 'RolesBusiness', 'GetPermissionAsync', [
        functionID,
        formName,
        gridViewName,
        this.recid,
      ])
      .subscribe((res) => {
        if (res) {
          var data = res.msgBodyData;
          this.RolesService.appendPesmission(data);
        }
      });
  }

  collapse(elm, item, event) {
    var icon = $('.i-collapse[data-id="' + item.functionID + '"]', $(elm));
    if (icon.length > 0) {
      if (icon.hasClass('fa-caret-right')) {
        icon.removeClass('fa-caret-right');
        icon.addClass('fa-caret-down');
      } else {
        icon.removeClass('fa-caret-down');
        icon.addClass('fa-caret-right');
      }
    }
  }

  clickLI() {
    console.log('clicked');
  }
}
