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
  implements OnDestroy, OnChanges {
  // dataPermissions: any;
  // dataAdvances: any;
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
    // super(
    //   {
    //     title: "",
    //     formName: "",
    //     gridViewName: "",
    //     entity: "",
    //     functionID: "",
    //     hiddenTree: true
    //   } as ModelPage,
    //   injector
    // );
    super(injector);
    this.route.params.subscribe((params) => {
      if (params) this.funcID = params['funcID'];
    });
    this.tenant = this.tenantStore.get()?.tenant;
    this.roleName = this.tempService.roleName;
  }
  ngOnChanges(changes: SimpleChanges): void { }
  onInit(): void {
    var rid = this.at.snapshot.queryParams.recID;
    if (rid) {
      this.recid = rid;
      this.LoadAsside();
      this.RolesService._dataChanged = false;
      this.RolesService._activeSysFuction = false;
      this.RolesService._activeMoreFuction = false;
    }

    this.RolesService.LoadDataPermission.subscribe((data: any) => {
      if (!data) return;
      var d = data[0] || {};

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

      var sysfunc = $('input[data-funcID]');

      var t = this;

      $.each(sysfunc, function (i, elm) {
        var funcID = $(elm).data('funcid');
        if (funcExp.indexOf(funcID) >= 0) {
          elm.checked = true;
        } else {
          elm.checked = false;
        }
      });
      this.df.detectChanges();
    });
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
    this.RolesService.appendPesmission(null);
  }
  onChangeSelectedFunction(data) {
    this.roleName = this.tempService.roleName + ' - ' + data.nameFunction;
  }

  LoadAsside() {
    //$('#kt_aside_menu').empty();
    this.api
      .execSv(
        'SYS',
        'ERM.Business.SYS',
        'FunctionListBusiness',
        'GetFunctionRoleAsync',
        [this.recid]
      )
      .subscribe((res: any) => {
        console.log('check GetFunctionRoleAsync', res);
        if (res) {
          var data = res;
          this.myTree = data;
          this.df.detectChanges();
          //this.loadSource();
        }
      });
  }

  onSelectionAddChanged(evt: any, tree: any) {
    if (evt) {
      this.api
        .execSv(
          'SYS',
          'ERM.Business.SYS',
          'FunctionListBusiness',
          'GetFunctionRoleAsync',
          [this.recid, evt.data.functionID]
        )
        .subscribe((res: any) => {
          if (res) {
            var data = res;
            var dataTree = tree.dicDatas[evt.data.functionID];
            dataTree.items = data;
            //this.myTree = data;
            this.df.detectChanges();
            //this.loadSource();
          }
        });
    }
  }

  loadSource() {
    var formName = this.RolesService.formName;
    var gridViewName = this.RolesService.gridViewName;
    this.api
      .call('ERM.Business.AD', 'RolesBusiness', 'GetModelFromRolesAsync', [
        formName,
        gridViewName,
      ])
      .subscribe((res) => {
        if (res) {
          var data = res.msgBodyData[0];
          this.dataBasic = data.Basic;
          this.dataMore = data.More;
          this.dataExport = data.Export;
          this.df.detectChanges();
        }
      });
  }

  reloadComponent() {
    // let currentUrl = this.router.url;
    //TEMP
    // this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    // this.router.onSameUrlNavigation = "reload";
    // this.router.navigate([currentUrl]);
    //TEMP
  }

  valueChange(e) {
    if (e.field == 'sys' || e.field == 'exp' || e.field == 'more')
      this.checkAndLock(e.field, e.data);
    else {
      this.dataPermission[e.field] = e.data.value;
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
  activeExpChange(e) {
    if (e.srcElement.checked) {
      $('#penal').removeClass('collapse');
    } else {
      $('#penal').addClass('collapse');
    }
  }
  checkAndLock(t, check) {
    var eles = $('input[data-funcID]', $('.' + t));
    var a = this.active;
    if (check) {
      $.each(eles, function (i, elm) {
        //console.log(elm);
        elm.checked = true;
        elm.disabled = true && a;
      });
    } else {
      $.each(eles, function (i, elm) {
        elm.checked = false;
        elm.disabled = false;
      });
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
    var sysfunc = $('input[data-funcID]', $('.sys'));
    var morefunc = $('input[data-funcID]', $('.more'));
    var expfunc = $('input[data-funcID]', $('.exp'));
    var t = this;

    $.each(sysfunc, function (i, elm) {
      //console.log(elm);
      if (elm.checked) {
        var funcID = $(elm).data('funcid');
        t.dataFuncRole.push(funcID);
      }
    });

    $.each(expfunc, function (i, elm) {
      //console.log(elm);
      if (elm.checked) {
        var funcID = $(elm).data('funcid');
        t.dataFuncRole.push(funcID);
      }
    });

    $.each(morefunc, function (i, elm) {
      //console.log(elm);
      if (elm.checked) {
        var funcID = $(elm).data('funcid');
        t.dataFuncRole.push(funcID);
      }
    });

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
