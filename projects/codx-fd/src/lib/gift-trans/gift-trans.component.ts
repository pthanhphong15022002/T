import { ChangeDetectorRef, Component, Injector, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ButtonModel, CRUDService, DialogRef, SidebarModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { PopupAddGiftComponent } from './popup-add-gift/popup-add-gift.component';
import { PopupSendGiftComponent } from './popup-send-gift/popup-send-gift.component';
import { CodxFdService } from '../codx-fd.service';
import { Observable, of } from 'rxjs';

@Component({
    selector: 'lib-gift-trans',
    templateUrl: './gift-trans.component.html',
    styleUrls: ['./gift-trans.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class GiftTransComponent extends UIComponent {
    views: Array<ViewModel>;
    buttonAdd: ButtonModel[];
    service: string = "FD";
    assemblyName: string = "ERM.Business.FD";
    className: string = "GiftTransBusiness"
    predicate: string = "";
    dataValue: string = "";
    entityName: string = "FD_GiftTrans";
    dialogConfirmStatus!: DialogRef;
    listGiftTran: any[] = [];
    selectedGiftID: string = "";
    dataSelected: any;
    currFuncID: string = "";
    @ViewChild("itemTemplateGift") itemTemplateGift: TemplateRef<any>;
    @ViewChild("itemTemplateEVoucher") itemTemplateEVoucher: TemplateRef<any>;
    @ViewChild("panelRightRef") panelRightRef: TemplateRef<any>;
    @ViewChild("panelLefRef") panelLefRef: TemplateRef<any>;


    constructor(
        private injector: Injector,
        private route: ActivatedRoute,
        private dt: ChangeDetectorRef,
        private serviceFD: CodxFdService
    ) {
        super(injector);
    }

    onInit() {
        this.funcID = this.route.snapshot.paramMap.get('funcID');
        this.currFuncID = this.funcID;
        //console.log('funcID:', this.funcID);
    }

    ngAfterViewInit(): void {
        this.buttonAdd = [{
            id: 'btnAdd',
        }];
        this.views = [{
            type: ViewType.listdetail,
            active: true,
            sameData: true,
            model: {
                template: this.funcID === "FDT091" ? this.itemTemplateGift: this.itemTemplateEVoucher,
                panelRightRef: this.panelRightRef
            }
        }];
        this.dt.detectChanges();
    }

    clickMF(event: any, data: any) {
        switch (event.functionID) {
            case "FDT0911": // giao quà
                this.sendGift(data);
                break;
            case "SYS05": // xem
                let option = new SidebarModel();
                option.DataService = (this.view.dataService as CRUDService);
                option.FormModel = this.view.formModel;
                let dataSend = {
                    funcID: this.funcID,
                    type: "detail",
                    data: data
                }
                this.callfc.openSide(PopupAddGiftComponent, dataSend, option, "");
                break;
        }
    }

    sendGift(item: any) {
        var data = {
            moreFunc: {
                formName: "GiftTrans",
                gridViewName: "grvGiftTrans",
            },
            fieldDefault: "GiftTrans",
            valueDefault: "2"
        };
        this.dialogConfirmStatus = this.callfc.openForm(
            PopupSendGiftComponent,
            '',
            500,
            350,
            '',
            data
        );
        this.dialogConfirmStatus.closed.subscribe((e) => {
            if (e && e.event == "oke") {
                this.serviceFD.sendGift(
                    item.recID,
                    "2",
                    e.event,
                    this.funcID
                ).subscribe((res: any) => {
                if(res){
                    item.status = "2";
                    this.view.dataService.update(item).subscribe();
                }
                });
            }
        });
      }


    clickShowAssideRight() {
        if (!this.view) return;
        let option = new SidebarModel();
        option.DataService = (this.view.dataService as CRUDService);
        option.FormModel = this.view.formModel;
        let dataSend = {
            funcID: this.funcID,
            type: "add",
        }
        this.callfc.openSide(PopupAddGiftComponent, dataSend, option, "");
    }
    selectedChange(event: any) {
        if (!event || !event.data) return;
        this.dataSelected = event.data;
        this.selectedGiftID = event.data.recID;
        this.dt.detectChanges();
    }

    changeStatus(event: string) {
        this.dataSelected.status = event;
        this.view.dataService.update(this.dataSelected).subscribe();
    }

    viewChanged(event: any) {
        if(event){
            this.funcID = this.route.snapshot.paramMap.get('funcID');
            if(this.funcID !== this.currFuncID){
                this.currFuncID = this.funcID;
                this.views = [{
                    type: ViewType.listdetail,
                    active: true,
                    sameData: true,
                    model: {
                        template: this.funcID === "FDT091" ? this.itemTemplateGift: this.itemTemplateEVoucher,
                        panelRightRef: this.panelRightRef
                    }
                }];
                this.view.load();
            }
        }
    }

    changeDataMF(event: any) {
        if (event?.length > 0 && this.funcID == "FDT092") {
            const mf = event.find((i) => i.functionID === "SYS02");
            if (mf) {
              mf.disabled = true;
            }
        }
    }
}
