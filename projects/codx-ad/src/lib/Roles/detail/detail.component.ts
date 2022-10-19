import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import {
  NotificationsService,
  ScrollComponent,
  TenantStore,
  UIComponent,
  ViewType,
} from 'codx-core';
import { Subscription } from 'rxjs';
import { RolesService } from '../services/roles.service';
import { TempService } from '../services/temp.service';

declare var $: any;
@Component({
  selector: 'app-roles',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class RoleDetailComponent
  extends UIComponent
  implements OnDestroy, OnChanges
{
  dataMoreFuntions: any;
  dataBasic: any = [];
  dataMore: any = [];
  dataExport: any = [];
  recid: any;
  funid: any;
  vll: any;
  myTree = [];
  form: FormGroup;
  dataFuncRole = [];
  tenant = '';
  roleName = '';
  activeSys = true;
  activeExp = true;
  activeMore = true;
  active = false;
  dataPermission: any = {};
  sub: Subscription;
  funcID: any;
  views = [];
  formName = '';
  gridViewName = '';
  functionID = '';
  arrTemplate = [];

  @ViewChild('template') template: TemplateRef<any>;

  constructor(
    private tempService: TempService,
    private df: ChangeDetectorRef,
    private at: ActivatedRoute,
    private RolesService: RolesService,
    private formBuilder: FormBuilder,
    private notificationsService: NotificationsService,
    private tenantStore: TenantStore,
    private route: ActivatedRoute,
    injector: Injector
  ) {
    super(injector);
    this.route.params.subscribe((params) => {
      if (params) this.funcID = params['funcID'];
    });
    this.tenant = this.tenantStore.get()?.tenant;
    this.roleName = this.tempService.roleName;
  }
  ngOnChanges(changes: SimpleChanges): void {}
  onInit(): void {
    var rid = this.at.snapshot.queryParams.recID;
    if (rid) {
      this.recid = rid;
      this.LoadAsside();
      this.RolesService._dataChanged = false;
      this.RolesService._activeSysFuction = false;
      this.RolesService._activeMoreFuction = false;
    }
  }

  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.content,
        active: true,
        sameData: false,
        model: {
          panelRightRef: this.template,
        },
      },
    ];
  }
  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
    //this.RolesService.appendPesmission(null);
  }
  onChangeSelectedFunction(data) {
    this.roleName = this.tempService.roleName + ' - ' + data.nameFunction;
  }

  LoadAsside() {
    this.api
      .execSv(
        'SYS',
        'ERM.Business.SYS',
        'FunctionListBusiness',
        'GetFunctionRoleAsync',
        [this.recid]
      )
      .subscribe((res: any) => {
        if (res) {
          var data = res;
          this.myTree = data;
          this.df.detectChanges();
          this.loadSource();
        }
      });
  }

  onSelectionAddChanged(evt: any, tree: any) {
    ScrollComponent.reinitialization();
    if (evt && evt.data) {
      let item = evt.data;
      this.formName = item.formName;
      this.gridViewName = item.gridViewName;
      this.functionID = item.functionType == 'M' ? '' : item.functionID;
      if (this.formName && this.gridViewName && this.functionID) {
        this.api
          .execSv(
            'SYS',
            'ERM.Business.AD',
            'RolesBusiness',
            'GetPermissionAsync',
            [this.functionID, this.formName, this.gridViewName, this.recid]
          )
          .subscribe((res) => {
            if (res) {
              //var data = res.msgBodyData;
              this.LoadPermission(res);
              //this.RolesService.appendPesmission(data);
            }
          });
      } else {
        this.api
          .execSv(
            'SYS',
            'ERM.Business.SYS',
            'FunctionListBusiness',
            'GetFunctionRoleAsync',
            [this.recid, item.functionID]
          )
          .subscribe((res: any) => {
            if (res) {
              var dataTree = tree.dicDatas[item.functionID];
              dataTree.items = res;
              this.df.detectChanges();
              //this.loadSource();
            }
          });
      }
    }
  }

  LoadPermission(d: any) {
    if (!d) return;
    //var d = data[0] || {};

    this.dataBasic = d.Basic || [];
    this.dataMore = d.More || [];
    this.dataExport = d.Export || [];

    this.dataPermission = d.Data || {};

    this.df.detectChanges();

    var funcExp: Array<string> = d.Adv || [];
    // if (!this.tempService.isSystem)
    this.active = true;
    // else
    //   this.active = false;
    this.checkAndLock('exp', false);

    this.activeSys = this.RolesService._activeSysFuction;
    this.checkAndLock('sys', this.activeSys);

    this.activeMore = this.RolesService._activeMoreFuction;
    this.checkAndLock('more', this.activeMore);

    var sysfunc = document.querySelectorAll('codx-input[data-funcID]');

    sysfunc.forEach((elm) => {
      //var funcID = $(elm).data('funcid');
      // if (funcExp.indexOf(funcID) >= 0) {
      //   elm.checked = true;
      // } else {
      //   elm.checked = false;
      // }
    });
    this.df.detectChanges();
  }

  loadSource() {
    var formName = this.formName;
    var gridViewName = this.gridViewName;
    this.api
      .execSv(
        'SYS',
        'ERM.Business.AD',
        'RolesBusiness',
        'GetModelFromRolesAsync',
        [formName, gridViewName]
      )
      .subscribe((res: any) => {
        if (res) {
          this.dataBasic = res.Basic;
          this.dataMore = res.More;
          this.dataExport = res.Export;
          this.df.detectChanges();
        }
      });
  }

  valueChange(e) {
    if (e.field == 'sys' || e.field == 'exp' || e.field == 'more')
      this.checkAndLock(e.field, e.data);
    else {
      this.dataPermission[e.field] = e.data;
      this.RolesService._dataChanged = true;
    }
  }
  inputChange($event) {
    this.RolesService._dataChanged = true;
  }
  activeSysChange(e) {
    this.checkAndLock('sys', e.srcElement.checked);
  }

  activeMoreChange(e) {
    this.checkAndLock('more', e.srcElement.checked);
  }

  checkAndLock(t, check) {
    var eleCurrent = document.getElementsByClassName(t);
    if (eleCurrent.length > 0) {
      var current = eleCurrent[0] as HTMLElement;
      var eles = current.querySelectorAll('codx-input[data-funcID]'); // $('input[data-funcID]', $('.' + t));
      var a = this.active;
      eles.forEach((element) => {
        let inner = element.querySelector('span.e-switch-inner');
        let handle = element.querySelector('span.e-switch-handle');
        if (check) {
          if (inner) inner.classList.add('e-switch-active');
          if (handle) handle.classList.add('e-switch-active');
          // element.checked = true;
          // element.disabled = true && a;
        } else {
          if (inner) inner.classList.remove('e-switch-active');
          if (handle) handle.classList.remove('e-switch-active');
        }
      });
      if (check) {
        // $.each(eles, function (i, elm) {
        //   //console.log(elm);
        //   elm.checked = true;
        //   elm.disabled = true && a;
        // });
      } else {
        eles.forEach((element) => {
          // element.checked = false;
          // element.disabled = false;
        });
        // $.each(eles, function (i, elm) {
        //   elm.checked = false;
        //   elm.disabled = false;
        // });
      }
    }
  }
  Save() {
    var funcID = this.RolesService.funcID;
    var formName = this.RolesService.formName;
    var roleID = this.recid;
    if (!funcID || !roleID) return;
    var create = this.dataPermission.create;
    var sys = this.activeSys;
    var more = this.activeMore;
    var view = this.dataPermission.read;
    var edit = this.dataPermission.write;
    var deleted = this.dataPermission.delete;
    var t = this;
    // var sysfunc = $('input[data-funcID]', $('.sys'));
    // var morefunc = $('input[data-funcID]', $('.more'));
    // var expfunc = $('input[data-funcID]', $('.exp'));

    // $.each(sysfunc, function (i, elm) {
    //   //console.log(elm);
    //   if (elm.checked) {
    //     var funcID = $(elm).data('funcid');
    //     t.dataFuncRole.push(funcID);
    //   }
    // });

    // $.each(expfunc, function (i, elm) {
    //   //console.log(elm);
    //   if (elm.checked) {
    //     var funcID = $(elm).data('funcid');
    //     t.dataFuncRole.push(funcID);
    //   }
    // });

    // $.each(morefunc, function (i, elm) {
    //   //console.log(elm);
    //   if (elm.checked) {
    //     var funcID = $(elm).data('funcid');
    //     t.dataFuncRole.push(funcID);
    //   }
    // });

    this.api
      .call('ERM.Business.AD', 'RolesBusiness', 'SaveRolePermissionAsync', [
        roleID,
        create,
        view,
        edit,
        deleted,
        sys,
        more,
        funcID,
        formName,
        this.dataFuncRole,
      ])
      .subscribe((res) => {
        t.dataFuncRole = [];
        if (res && res.msgBodyData[0]) {
          $('.check-per[data-id="' + funcID + '"]').addClass(
            'far fa-check-square'
          );
          this.RolesService._dataChanged = false;
          this.notificationsService.notifyCode('SYS019');
        }
      });
  }

  Delete() {
    var funcID = this.RolesService.funcID;
    var formName = this.RolesService.formName;
    var funcID = this.RolesService.funcID;
    var roleID = this.recid;
    if (!funcID || !roleID) return;
    this.api
      .call('ERM.Business.AD', 'RolesBusiness', 'DeleteRolePermissionAsync', [
        roleID,
        funcID,
        formName,
      ])
      .subscribe((res) => {
        if (res && res.msgBodyData[0]) {
          $('.check-per[data-id="' + funcID + '"]').removeClass(
            'far fa-check-square'
          );
          this.notificationsService.notifyCode('SYS019');
          this.RolesService._dataChanged = false;

          this.api
            .call('ERM.Business.AD', 'RolesBusiness', 'GetPermissionAsync', [
              funcID,
              formName,
              '',
              this.recid,
            ])
            .subscribe((res) => {
              if (res) {
                var data = res.msgBodyData;
                this.RolesService.appendPesmission(data);
              }
            });
        }
      });
  }
}
