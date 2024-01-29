import { ChangeDetectorRef, Component, EventEmitter, Injector, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { ApiHttpService, AuthStore, CallFuncService, NotificationsService } from "codx-core";
import { CodxShareService } from "projects/codx-share/src/public-api";

@Component({ template: '' })
export abstract class BaseFieldComponent
{
    user:any;
    @Input() formModel;
    @Input() data: any;
    @Input() process: any;
    @Input() stage: any;
    @Input() parent: any;
    @Input() type: string = 'add';
    @Input() vll:any;
    @Input() listStage = [];
    @Output() dataChange = new EventEmitter<any>();
    @Output() back = new EventEmitter<any>();

    protected authstore!: AuthStore;
    protected api: ApiHttpService;
    protected shareService: CodxShareService;
    protected ref: ChangeDetectorRef;
    protected callFuc: CallFuncService;
    protected sanitizer: DomSanitizer;
    protected notifySvr: NotificationsService;
    
    constructor(inject: Injector)
    {
      this.authstore = inject.get(AuthStore);
      this.api = inject.get(ApiHttpService);
      this.shareService = inject.get(CodxShareService);
      this.ref = inject.get(ChangeDetectorRef);
      this.callFuc = inject.get(CallFuncService);
      this.user = this.authstore.get();
      this.sanitizer = inject.get(DomSanitizer);
      this.notifySvr = inject.get(NotificationsService);
    }

}