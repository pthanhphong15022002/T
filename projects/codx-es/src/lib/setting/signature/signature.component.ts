import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  AuthService,
  ButtonModel,
  CacheService,
  CallFuncService,
  DialogRef,
  FormModel,
  LayoutService,
  NotificationsService,
  SidebarModel,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { ActivatedRoute } from '@angular/router';
import { PopupAddSignatureComponent } from './popup-add-signature/popup-add-signature.component';
import { CodxEsService } from '../../codx-es.service';

export class defaultRecource { }
@Component({
  selector: 'signature',
  templateUrl: './signature.component.html',
  styleUrls: ['./signature.component.scss'],
})
export class SignatureComponent implements OnInit, AfterViewInit {
  @ViewChild('viewBase') viewBase: ViewsComponent;
  @ViewChild('listItem') listItem: TemplateRef<any>;
  @ViewChild('gridView') gridView: TemplateRef<any>;
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('asideLeft') asideLeft: TemplateRef<any>;
  @ViewChild('gridTemplate') grid: TemplateRef<any>;
  @ViewChild('popupDevice', { static: true }) popupDevice;
  @ViewChild('sideBarRightRef') sideBarRightRef: TemplateRef<any>;
  @ViewChild('signatureType', { static: true }) signatureType;
  @ViewChild('fullName', { static: true }) fullName;
  @ViewChild('supplier', { static: true }) supplier;
  @ViewChild('oTPControl', { static: true }) oTPControl;
  @ViewChild('templateStop', { static: true }) templateStop;
  @ViewChild('noName', { static: true }) noName;
  @ViewChild('createdBy', { static: true }) createdBy;
  @ViewChild('editSignature') editSignature: PopupAddSignatureComponent;
  @ViewChild('imageStamp', { static: true }) imageStamp;
  @ViewChild('imageSignature1', { static: true }) imageSignature1;
  @ViewChild('imageSignature2', { static: true }) imageSignature2;
  @ViewChild('itemAction', { static: true }) itemAction: TemplateRef<any>;

  isAfterRender = false;
  itemSelected: any = {};

  devices: any;
  editform: FormGroup;
  isAdd = true;
  columnsGrid;
  dataSelected: any;
  dialog!: DialogRef;
  funcList: any = {};

  formModel: FormModel;

  constructor(
    private callfunc: CallFuncService,
    private cr: ChangeDetectorRef,
    private cacheSv: CacheService,
    private readonly auth: AuthService,
    private activedRouter: ActivatedRoute,
    private esService: CodxEsService,
    private layout: LayoutService,
    private notify: NotificationsService
  ) {
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    this.cacheSv.functionList(this.funcID).subscribe((func) => {
      this.funcList = func;
    });

    this.formModel = this.viewBase?.formModel;
  }

  views: Array<ViewModel> = [];
  moreFunc: Array<ButtonModel> = [];
  ngOnInit(): void {
    this.layout.showIconBack = true;
    this.formModel = this.viewBase?.formModel;
  }

  button: ButtonModel;
  funcID: string;
  service = 'ES';
  assemblyName = 'ES';
  entityName = 'ES_Signatures';
  predicate = '';
  dataValue = '';
  idField = 'recID';
  className = 'SignaturesBusiness';
  method = 'GetListAsync';

  ngAfterViewInit(): void {
    this.viewBase.dataService.methodDelete = 'DeleteSignatureAsync';
    this.viewBase.dataService.methodSave = 'AddNewAsync';
    this.viewBase.dataService.methodUpdate = 'EditAsync';

    this.button = {
      id: 'btnAdd',
    };

    this.cr.detectChanges();
  }
  onLoading(evt: any) {
    let formModel = this.viewBase.formModel;
    console.log(this.formModel);

    if (formModel) {
      this.cacheSv
        .gridViewSetup(formModel?.formName, formModel?.gridViewName)
        .subscribe((gv) => {
          console.log(gv);

          this.columnsGrid = [
            {
              field: '',
              headerText: '',
              width: 40,
              template: this.itemAction,
              textAlign: 'center',
            },
            // {
            //   field: 'email',
            //   headerText: gv ? gv['Email'].headerText || 'Email' : 'Email',
            //   template: '',
            //   width: 200,
            // },
            {
              field: 'fullName',
              headerText: gv
                ? gv['FullName'].headerText || 'FullName'
                : 'FullName',
              template: this.fullName,
              width: 180,
            },
            {
              field: 'signatureType',
              headerText: gv
                ? gv['SignatureType'].headerText || 'SignatureType'
                : 'SignatureType',
              template: this.signatureType,
              width: 140,
            },
            {
              field: 'supplier',
              headerText: gv
                ? gv['Supplier'].headerText || 'Supplier'
                : 'Supplier',
              template: this.supplier,
              width: 150,
            },
            {
              field: 'signature1',
              headerText: gv
                ? gv['Signature1'].headerText || 'Signature1'
                : 'Signature1',
              template: this.imageSignature1,
              width: 130,
              textAlign: 'Center',
            },
            {
              field: 'signature2',
              headerText: gv
                ? gv['Signature2'].headerText || 'Signature2'
                : 'Signature2',
              template: this.imageSignature2,
              width: 130,
              textAlign: 'Center',
            },
            {
              field: 'stamp',
              headerText: gv ? gv['Stamp'].headerText || 'Stamp' : 'Stamp',
              template: this.imageStamp,
              width: 130,
              textAlign: 'Center',
            },
            {
              field: 'otpControl',
              headerText: gv ? gv['OTPControl'].headerText || 'Icon' : 'Icon',
              template: this.oTPControl,
              width: 110,
            },
            // {
            //   field: 'stop',
            //   headerText: gv ? gv['Stop'].headerText || 'Icon' : 'Icon',
            //   template: this.templateStop,
            //   width: 80,
            //   //textAlign: 'Center',
            // },
          ];
          this.views = [
            {
              sameData: true,
              type: ViewType.list,
              active: false,
              model: {
                template: this.listItem,
              },
            },
            {
              sameData: true,
              type: ViewType.grid,
              active: true,
              model: {
                resources: this.columnsGrid,
              },
            },
          ];
          this.cr.detectChanges();
        });
    }
  }

  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.addNew(evt);
        break;
      case 'btnEdit':
        this.edit(evt);
        break;
      case 'btnDelete':
        this.delete(evt);
        break;
    }
  }

  addNew(evt?: any) {
    this.viewBase.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.viewBase.dataService;
      option.FormModel = this.viewBase.formModel;
      option.Width = '550px';
      let dialogAdd = this.callfunc.openSide(
        PopupAddSignatureComponent,
        {
          isAdd: true,
          headerText: evt.text + ' ' + this.funcList?.customName ?? '',
        },
        option
      );
      dialogAdd.closed.subscribe((x) => {
        if (!x?.event) this.viewBase.dataService.clear();
        if (x.event == null && this.viewBase.dataService.hasSaved)
          this.viewBase.dataService
            .delete([this.viewBase.dataService.dataSelected])
            .subscribe((x) => {
              this.cr.detectChanges();
            });
        else if (x.event) {
          x.event.modifiedOn = new Date();
          this.viewBase.dataService.update(x.event).subscribe();
        }
      });
    });
  }

  edit(evt?) {
    if (evt) {
      this.viewBase.dataService.dataSelected = evt?.data;

      this.viewBase.dataService
        .edit(this.viewBase.dataService.dataSelected)
        .subscribe((res) => {
          this.dataSelected = this.viewBase.dataService.dataSelected;
          let option = new SidebarModel();
          option.Width = '550px';
          option.DataService = this.viewBase?.dataService;
          option.FormModel = this.viewBase?.formModel;

          let dialogEdit = this.callfunc.openSide(
            PopupAddSignatureComponent,
            {
              isAdd: false,
              headerText: evt.text + ' ' + this.funcList?.customName ?? '',
            },
            option
          );
          dialogEdit.closed.subscribe((x) => {
            if (!x?.event) this.viewBase.dataService.clear();
            if (x.event) {
              x.event.modifiedOn = new Date();
              this.viewBase.dataService.update(x.event).subscribe((res) => {
                console.log('update', res);
              });
            }
          });
        });
    }
  }

  delete(evt?) {
    let deleteItem = this.viewBase.dataService.dataSelected;
    if (evt?.data) {
      deleteItem = evt?.data;
    }
    this.viewBase.dataService.delete([deleteItem]).subscribe((res) => {
      console.log(res);
    });
  }

  copy(evt) {
    this.viewBase.dataService.dataSelected = evt?.data;
    this.viewBase.dataService.copy(0).subscribe((res: any) => {
      this.viewBase.dataService.dataSelected.recID = res?.recID;
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.viewBase?.dataService;
      option.FormModel = this.viewBase?.formModel;
      this.dialog = this.callfunc.openSide(
        PopupAddSignatureComponent,
        {
          isAdd: false,
          headerText: evt.text + ' ' + this.funcList?.customName ?? '',
          type: 'copy',
        },
        option
      );
      this.dialog.closed.subscribe((x) => {
        if (!x?.event) this.viewBase.dataService.clear();
        if (x.event == null && this.viewBase.dataService.hasSaved)
          this.viewBase.dataService
            .delete([this.viewBase.dataService.dataSelected])
            .subscribe((x) => {
              this.cr.detectChanges();
            });
        else if (x.event) {
          x.event.modifiedOn = new Date();
          this.viewBase.dataService.update(x.event).subscribe();
        }
      });
    });
  }

  stop(evt) {
    let data = this.viewBase.dataService.dataSelected;
    if (evt?.data) {
      data = evt?.data;
    }
    data.stop = true;
    this.esService.editSignature(data).subscribe((res) => {
      if (res) {
        this.notify.notifyCode('E0528');
        this.viewBase.dataService.update(data).subscribe();
      }
    });
  }

  closeEditForm(event) {
    //this.dialog && this.dialog.close();
  }

  clickMF(event: any, data) {
    event.data = data;
    switch (event?.functionID) {
      case 'SYS03':
        this.edit(event);
        break;
      case 'SYS02':
        this.delete(event);
        break;
      //Copy
      case 'SYS04': {
        this.copy(event);
        //this.stop(event);
        break;
      }
      //Stop
      case 'ESS211': {
        this.stop(event);
        break;
      }
    }
  }

  changeDataMF(evt){

  }
}
