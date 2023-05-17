import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  AlertConfirmInputConfig,
  ApiHttpService,
  CacheService,
  CallFuncService,
  DataRequest,
  DialogModel,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { CodxCmService } from '../../../codx-cm.service';
import { BS_AddressBook } from '../../../models/cm_model';
import { PopupAddressComponent } from './popup-address/popup-address.component';
import { Observable, finalize, map } from 'rxjs';

@Component({
  selector: 'codx-address-cm',
  templateUrl: './codx-address-cm.component.html',
  styleUrls: ['./codx-address-cm.component.css'],
})
export class CodxAddressCmComponent implements OnInit {
  @Input() funcID: any;
  @Input() entityName: any;
  @Input() id: any;
  @Input() type: any;
  @Output() lstAddressEmit = new EventEmitter<any>();
  @Output() lstAddressDeleteEmit = new EventEmitter<any>();
  @Output() addressName = new EventEmitter<any>();

  listAddress = [];
  listAddressDelete = [];
  formModelAddress: FormModel;
  moreFuncAdd = '';
  moreFuncEdit = '';
  loaded: boolean;
  request = new DataRequest();
  predicates = 'ObjectID=@0 && ObjectType=@1';
  dataValues = '';
  service = 'BS';
  currentRecID = '';
  assemblyName = 'ERM.Business.BS';
  className = 'AddressBookBusiness';
  method = 'GetListAddressAsync';
  constructor(
    private cmSv: CodxCmService,
    private cache: CacheService,
    private notiService: NotificationsService,
    private callFc: CallFuncService,
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService
  ) {}

  ngOnInit(): void {
    this.getListAddress();
    this.getFormModelAddress();
    this.cache.moreFunction('CoDXSystem', '').subscribe((res) => {
      if (res && res.length) {
        let m = res.find((x) => x.functionID == 'SYS01');
        if (m) this.moreFuncAdd = m.customName;
      }
    });
  }

  getListAddress() {
    this.loaded = false;
    this.request.predicates = 'ObjectID=@0 && ObjectType=@1';
    this.request.dataValues = this.id + ';' + this.entityName;
    this.request.entityName = 'BS_AddressBook';
    this.request.funcID = this.funcID;
    this.className = 'AddressBookBusiness';
    this.fetch().subscribe((item) => {
      this.listAddress = this.cmSv.bringDefaultContactToFront(item);
      if (this.listAddress != null && this.listAddress.length > 0) {
        this.changeAddress(this.listAddress[0]);
      }
      this.loaded = true;
    });
  }

  private fetch(): Observable<any[]> {
    return this.api
      .execSv<Array<any>>(
        this.service,
        this.assemblyName,
        this.className,
        this.method,
        this.request
      )
      .pipe(
        finalize(() => {
          /*  this.onScrolling = this.loading = false;
          this.loaded = true; */
        }),
        map((response: any) => {
          return response ? response[0] : [];
        })
      );
  }

  changeAddress(data) {
    this.currentRecID = data?.recID;
    this.changeDetectorRef.detectChanges();
  }
  clickMFAddress(e, data) {
    this.moreFuncEdit = e.text;
    switch (e.functionID) {
      case 'SYS03':
        this.openPopupAddress(data, 'edit');
        break;
      case 'SYS02':
        this.removeAddress(data);
        break;
    }
  }

  changeDataMFAddress(e, data) {
    if (e != null && data != null) {
      e.forEach((res) => {
        switch (res.functionID) {
          case 'SYS003':
          case 'SYS004':
          case 'SYS002':
          case 'SYS04':
            res.disabled = true;
            break;
        }
      });
    }
  }
  getFormModelAddress() {
    let dataModel = new FormModel();
    dataModel.formName = 'CMAddressBook';
    dataModel.gridViewName = 'grvCMAddressBook';
    dataModel.entityName = 'BS_AddressBook';
    dataModel.funcID = this.funcID;
    this.formModelAddress = dataModel;
  }

  openPopupAddress(data, action) {
    let opt = new DialogModel();
    let dataModel = new FormModel();
    var title = action == 'add' ? this.moreFuncAdd : this.moreFuncEdit;
    dataModel.formName = 'CMAddressBook';
    dataModel.gridViewName = 'grvCMAddressBook';
    dataModel.entityName = 'BS_AddressBook';
    dataModel.funcID = this.funcID;
    opt.FormModel = dataModel;
    this.cache
      .gridViewSetup('CMAddressBook', 'grvCMAddressBook')
      .subscribe((res) => {
        if (res) {
          var obj = {
            title: title,
            gridViewSetup: res,
            action: action,
            data: data,
            listAddress: this.listAddress,
            type: this.type,
            objectID: this.id,
            objectType: this.entityName,
          };
          var dialog = this.callFc.openForm(
            PopupAddressComponent,
            '',
            500,
            700,
            '',
            obj,
            '',
            opt
          );
          dialog.closed.subscribe((e) => {
            if (e && e.event != null) {
              if (e?.event?.adressType) {
                var index = this.listAddress.findIndex(
                  (x) => x.recID != e.event?.recID && x.isDefault
                );
                if (index != -1) {
                  if (e?.event?.isDefault) {
                    this.listAddress[index].isDefault = false;

                    this.listAddress = this.cmSv.bringDefaultContactToFront(
                      this.cmSv.loadList(e.event, this.listAddress, 'update')
                    );
                  } else {
                    this.listAddress = this.cmSv.bringDefaultContactToFront(
                      this.cmSv.loadList(e.event, this.listAddress, 'update')
                    );
                  }
                } else {
                  this.listAddress = this.cmSv.bringDefaultContactToFront(
                    this.cmSv.loadList(e.event, this.listAddress, 'update')
                  );
                }
                var checkIsDefault = this.listAddress.some((x) => x.isDefault);
                if (!checkIsDefault) {
                  this.addressName.emit(null);
                } else {
                  if (this.type == 'formDetail' && e?.event?.isDefault) {
                    this.addressName.emit(e?.event?.adressName);
                  }
                }
                var index = this.listAddress.findIndex(
                  (x) => x.recID == e.event?.recID
                );
                this.changeAddress(this.listAddress[index]);
                this.lstAddressEmit.emit(this.listAddress);
                this.changeDetectorRef.detectChanges();
              }
            }
          });
        }
      });
  }

  removeAddress(data) {
    var config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
    this.notiService.alertCode('SYS030').subscribe((x) => {
      if (x.event.status == 'Y') {
        var index = this.listAddress.findIndex((x) => x.recID == data.recID);
        if (this.type == 'formAdd') {
          if (index != -1) {
            this.listAddress.splice(index, 1);
            this.listAddressDelete.push(data);
            this.lstAddressDeleteEmit.emit(this.listAddressDelete);
          }
        } else {
          this.cmSv.deleteOneAddress(data.recID).subscribe((res) => {
            if (res) {
              this.listAddress = this.cmSv.bringDefaultContactToFront(
                this.cmSv.loadList(data, this.listAddress, 'delete')
              );
              if (data.isDefault) {
                this.addressName.emit(null);
              }
              this.notiService.notifyCode('SYS008');
              this.changeDetectorRef.detectChanges();
            }
          });
        }
        this.changeAddress(this.listAddress[0]);
      }
    });
  }
}
