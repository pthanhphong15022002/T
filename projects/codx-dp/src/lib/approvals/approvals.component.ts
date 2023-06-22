import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Injector,
  OnChanges,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  ButtonModel,
  CacheService,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxDpService } from '../codx-dp.service';
import { ActivatedRoute } from '@angular/router';
import { LayoutComponent } from '../_layout/layout.component';

@Component({
  selector: 'app-dp-approvals',
  templateUrl: './approvals.component.html',
  styleUrls: ['./approvals.component.css'],
})
export class ApprovalsComponent
  extends UIComponent
  implements OnInit, AfterViewInit, OnChanges
{
  //list view
  @ViewChild('itemTemplate') itemTemplate!: TemplateRef<any>;
  @ViewChild('panelRightRef') panelRight?: TemplateRef<any>;
  data: any;
  funcID: any;
  formModel: any;
  active = 1;
  referType = 'source';
  userID: any;
  transID: any;
  approveStatus = '0';
  dataValues = '';
  recIDAprrover: any;
  listStepsProcess: any = [];

  //modele aprove
  // service = 'DP';
  // assemblyName = 'DP';
  // className = 'InstancesBusiness';
  // method = 'GetListApprovalAsync';
  // idField = 'recID';
  // views: Array<ViewModel> = [];
  // button: ButtonModel = {
  //   id: 'btnAdd',
  // };
  // itemSelected: any;

  constructor(
    inject: Injector,
    private codxDP: CodxDpService,
    private authStore: AuthStore,
    private layoutDP: LayoutComponent,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super(inject);
    this.userID = this.authStore.get().userID;
    this.router.params.subscribe((params) => {
      this.funcID = params['FuncID'];
      this.recIDAprrover = params['id'];
      if (this.funcID)
        this.cache.functionList(this.funcID).subscribe((fuc) => {
          this.formModel = {
            entityName: fuc?.entityName,
            formName: fuc?.formName,
            funcID: this.funcID,
            gridViewName: fuc?.gridViewName,
          };
        });
    });
  }
  ngOnChanges(changes: SimpleChanges): void {}

  onInit(): void {
    this.layoutDP.hidenNameProcess();
    this.router.params.subscribe((params) => {
      this.recIDAprrover = params['id'];
      if (this.recIDAprrover) {
        this.getData(this.recIDAprrover);
      }
    });
  }

  ngAfterViewInit(): void {
    // this.views = [
    //   {
    //     type: ViewType.listdetail,
    //     sameData: true,
    //     active: true,
    //     model: {
    //       template: this.itemTemplate,
    //       panelRightRef: this.panelRight,
    //     },
    //   },
    // ];
  }

  getGridViewSetup(funcID: any) {
    this.cache.functionList(funcID).subscribe((fuc) => {
      this.formModel = {
        entityName: fuc?.entityName,
        formName: fuc?.formName,
        funcID: funcID,
        gridViewName: fuc?.gridViewName,
      };
    });
  }

  getData(id) {
    ////id la cua noi dung instance
    this.api
      .exec<any>('DP', 'InstancesBusiness', 'GetInstancesDetailByRecIDAsync', [
        id,
      ])
      .subscribe((res) => {
        if (res) {
          this.data = res[0];
          this.transID = res[1];
          this.listStepsProcess = res[2];
          this.approveStatus = this.data?.approveStatus ?? '0';
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  handleViewFile(e: any) {
    // if (e == true) {
    //   var index = this.data.listInformationRel.findIndex(
    //     (x) => x.userID == this.userID && x.relationType != '1'
    //   );
    //   if (index >= 0) this.data.listInformationRel[index].view = '3';
    // }
  }

  // selectedChange(e) {
  //   let recID = '';
  //   if (e?.data) {
  //     recID = e.data.recID;
  //     this.itemSelected = e?.data;
  //   } else if (e?.recID) {
  //     recID = e.recID;
  //     this.itemSelected = e;
  //   }
  // }
}
