import { L } from '@angular/cdk/keycodes';
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
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { viewChangeEvent } from '@syncfusion/ej2-angular-documenteditor';
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
  recid: any;
  vll: any;
  myTree = [];
  form: FormGroup;
  dataFuncRole: any = {};
  tenant = '';
  roleName = '';
  activeSys = true;
  activeExp = true;
  activeMore = true;
  active = false;
  dataPermission: any = {};
  sub: Subscription;
  funcIDPara: any;
  views = [];
  formName = '';
  gridViewName = '';
  functionID = '';
  parent: any;
  arrTemplate = [];
  tabActive = 'DataAuthorize';
  dataAuthorize: any[] = [];
  dataReport: any[] = [];
  dataMore: any[] = [];
  dataRole: any = {};
  listPermission: any[] = [];
  dataAdv: any = {};
  checkAll: any = {};
  selectIndex = 0;

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
      //this.roleName = this.tempService.roleName;
      if (params) this.funcIDPara = params['funcID'];
    });
    this.tempService.roleName.subscribe((res) => {
      this.roleName = res;
    });
    this.tenant = this.tenantStore.get()?.tenant;
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

  LoadAsside() {
    this.api
      .execSv(
        'SYS',
        'ERM.Business.SYS',
        'FunctionListBusiness',
        'GetModuleFunctionAsync',
        [this.recid]
      )
      .subscribe((res: any) => {
        if (res) {
          var data = res;
          this.myTree = data;
          this.df.detectChanges();
          this.asideClick(null, 0, data[0]);
          //this.loadSource();
        }
      });
  }

  asideClick(evt: any, index: any, item: any) {
    this.selectIndex = index;
    ScrollComponent.reinitialization();
    this.formName = item.formName;
    this.gridViewName = item.gridViewName;
    this.functionID = item.functionID;
    this.parent = item;
    this.tempService.roleName.next(item.customName);
    this.api
      .execSv(
        'SYS',
        'ERM.Business.AD',
        'RolesBusiness',
        'GetDataByParentAsync',
        [this.recid, item]
      )
      .subscribe((res: any) => {
        if (res) {
          this.active = true;
          var funtion = res[0] as any[];
          if (funtion.length > 0) {
            this.dataAuthorize = funtion.filter((x) => x.functionType != 'R');
            this.dataReport = funtion.filter((x) => x.functionType == 'R');
          }

          this.dataRole = res[1];
          this.dataAdv = res[2];
          // if (this.dataRole) {
          //   this.dataMore = this.dataRole.More;
          // }
          this.df.detectChanges();
          //this.loadSource();
        }
      });
  }

  // onSelectionAddChanged(evt: any, item: any) {
  //   ScrollComponent.reinitialization();
  //   if (evt) {
  //     //let item = evt.data;
  //     this.formName = item.formName;
  //     this.gridViewName = item.gridViewName;
  //     this.functionID = item.functionID;
  //     this.tempService.roleName.next(item.customName);
  //     this.api
  //       .execSv(
  //         'SYS',
  //         'ERM.Business.AD',
  //         'RolesBusiness',
  //         'GetPermissionAsync',
  //         [this.functionID, this.formName, this.gridViewName, this.recid]
  //       )
  //       .subscribe((res) => {
  //         if (res) {
  //           //this.LoadPermission(res);
  //         }
  //       });
  //     // if (item.isFunction) {
  //     //   this.roleName = this.tempService.roleName + ' - ' + item.customName;
  //     //   this.api
  //     //     .execSv(
  //     //       'SYS',
  //     //       'ERM.Business.AD',
  //     //       'RolesBusiness',
  //     //       'GetPermissionAsync',
  //     //       [this.functionID, this.formName, this.gridViewName, this.recid]
  //     //     )
  //     //     .subscribe((res) => {
  //     //       if (res) {
  //     //         this.LoadPermission(res);
  //     //       }
  //     //     });
  //     // } else {
  //     // this.api
  //     //   .execSv(
  //     //     'SYS',
  //     //     'ERM.Business.SYS',
  //     //     'FunctionListBusiness',
  //     //     'GetFunctionRoleAsync',
  //     //     [this.recid, item.functionID]
  //     //   )
  //     //   .subscribe((res: any) => {
  //     //     if (res) {
  //     //       var dataTree = tree.dicDatas[item.functionID];
  //     //       dataTree.items = res;
  //     //       this.df.detectChanges();
  //     //       //this.loadSource();
  //     //     }
  //     //   });
  //     //}
  //   }
  // }

  navChange(evt: any) {
    this.tabActive = evt.nextId;
  }

  loadDetail() {
    switch (this.tabActive) {
      case 'DataAuthorize':
        this.api
          .execSv(
            'SYS',
            'ERM.Business.SYS',
            'FunctionListBusiness',
            'GetDataByFunctionAsync',
            [this.recid, this.parent]
          )
          .subscribe((res: any) => {
            if (res) {
              var data = res;
              this.myTree = data;
              this.df.detectChanges();
              //this.loadSource();
            }
          });
        break;
    }
  }

  LoadPermission(d: any) {
    if (!d) return;

    // this.dataBasic = d.Basic || [];
    // this.dataMore = d.More || [];
    // this.dataExport = d.Export || [];

    this.dataPermission = d.Data || {};

    this.df.detectChanges();

    this.dataAdv = d.Adv || [];

    this.active = true;

    this.checkAndLock('exp', false);

    this.activeSys = this.RolesService._activeSysFuction;
    this.checkAndLock('sys', this.activeSys);

    this.activeMore = this.RolesService._activeMoreFuction;
    this.checkAndLock('more', this.activeMore);

    var sysfunc = document.querySelectorAll('codx-input[data-funcID]');

    sysfunc.forEach((elm: any) => {
      let funcID = elm.dataset?.funcid;
      let inner = elm.querySelector('span.e-switch-inner');
      let handle = elm.querySelector('span.e-switch-handle');

      if (this.dataAdv.indexOf(funcID) >= 0) {
        if (inner) inner.classList.add('e-switch-active');
        if (handle) handle.classList.add('e-switch-active');
      } else {
        if (inner) inner.classList.remove('e-switch-active');
        if (handle) handle.classList.remove('e-switch-active');
      }
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
          // this.dataBasic = res.Basic;
          // this.dataMore = res.More;
          // this.dataExport = res.Export;
          this.df.detectChanges();
        }
      });
  }

  valueChange(e, funcID) {
    if (e.field === 'selectAll') {
      // this.checkAll[funcID] = e.data;
      // this.detectorRef.detectChanges();
      var codxinput = document.querySelectorAll(
        'codx-input[data-parent="' + funcID + '"]'
      );
      if (codxinput && codxinput.length > 0) {
        codxinput.forEach((element) => {
          var ejcheck = element.getElementsByTagName('ejs-checkbox');
          var check = null;
          var input = null;
          if (ejcheck) {
            //ejcheck[0].setAttribute("aria-checked", "true");
            check = ejcheck[0].querySelector('span.e-frame');
          }
          if (e.data) {
            ejcheck[0].setAttribute('aria-checked', 'true');
            if (check) {
              check.classList.add('e-check');
            }
            ejcheck[0].classList.add('e-checkbox-disabled');
          } else {
            ejcheck[0].setAttribute('aria-checked', 'false');
            if (check) {
              check.classList.remove('e-check');
            }
            ejcheck[0].classList.remove('e-checkbox-disabled');
          }
        });
      }
    } else {
      if (e.field == 'sys' || e.field == 'exp' || e.field == 'more') {
        //var more = 'SYS002';
        // if (e.data) {
        //   var dt = this.dataFuncRole[funcID] as any[];
        //   if (dt && dt.length > 0) {
        //     dt.push(more);
        //     //this.dataFuncRole[funcID];
        //   } else {
        //     var arr = [];
        //     arr.push(more);
        //     this.dataFuncRole[funcID] = arr;
        //   }
        // } else {
        //   this.dataFuncRole = this.dataFuncRole.filter((res) => res != funcID);
        // }
        this.checkAndLock(e.field, e.data);
      } else {
        //if (!dataPermission) dataPermission = {};
        var per = {};
        if (
          this.dataRole &&
          this.dataRole[funcID] &&
          this.dataRole[funcID].DataPer
        ) {
          per = this.dataRole[funcID].DataPer;
        }
        per[e.field] = e.data;
        per['functionID'] = funcID;
        per['roleID'] = this.recid;
        this.dataRole[funcID].DataPer = per;
        //this.dataPermission[e.field] = e.data;
        this.RolesService._dataChanged = true;
      }
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
    }
  }
  Save() {
    var role = Object.values(this.dataRole) as any[];
    var pers = [];
    role.forEach((element) => {
      pers.push(element.DataPer);
    });
    var roleID = this.recid;
    var sys = this.activeSys;
    var more = this.activeMore;
    var t = this;
    pers.forEach((element) => {
      if (!element) return;
      element.activeSysFuction = sys;
      element.activeMoreFunction = more;
    });

    this.addIDActive('exp');
    this.addIDActive('more');

    this.api
      .call('ERM.Business.AD', 'RolesBusiness', 'SaveRolePermissionAsync', [
        roleID,
        pers,
        this.dataFuncRole,
      ])
      .subscribe((res) => {
        t.dataFuncRole = {};
        if (res && res.msgBodyData[0]) {
          this.RolesService._dataChanged = false;
          this.notificationsService.notifyCode('SYS019');
        }
      });
  }

  private addIDActive(field: string) {
    var inputs = document.querySelectorAll('codx-input[field="' + field + '"]');
    if (inputs && inputs.length > 0) {
      inputs.forEach((element: any) => {
        var parent = element.dataset['parent'];
        var id = element.dataset['function'];
        var dt = this.dataFuncRole[parent] as any[];
        var checkbox = element.querySelector('ejs-checkbox');
        var check = 'false';
        if (checkbox) check = checkbox.getAttribute('aria-checked');
        if (check === 'false') {
          if (dt && dt.length > 0) {
            dt = dt.filter((res) => res != id);
          } else {
          }
        } else {
          if (dt && dt.length > 0 && !dt.includes(id)) {
            dt.push(id);
          } else {
            var arr = [];
            arr.push(id);
            this.dataFuncRole[parent] = arr;
          }
        }
      });
    }
    // var eles = element.querySelectorAll('codx-input[data-funcID]');
    // eles.forEach((element: any) => {
    //   let inner = element.querySelector('span.e-switch-inner');
    //   if (inner.classList.contains('e-switch-active')) {
    //     let funcID = element.dataset?.funcid;
    //     this.dataFuncRole.push(funcID);
    //   }
    // });
  }

  Delete() {
    var formName = this.formName;
    var funcID = this.functionID;
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
          var checkper = document.querySelector(
            '.check-per[data-id="' + funcID + '"]'
          );
          if (checkper) checkper.classList.remove('far', 'fa-check-square');
          this.notificationsService.notifyCode('SYS019');
          this.RolesService._dataChanged = false;
          this.asideClick(null, 0, this.myTree[0]);
          // this.api
          //   .execSv(
          //     'SYS',
          //     'ERM.Business.AD',
          //     'RolesBusiness',
          //     'GetPermissionAsync',
          //     [funcID, formName, '', this.recid]
          //   )
          //   .subscribe((res) => {
          //     if (res) {
          //       this.LoadPermission(res);
          //     }
          //   });
        }
      });
  }
}
