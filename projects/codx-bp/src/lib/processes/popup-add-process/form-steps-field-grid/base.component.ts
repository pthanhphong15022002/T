import { ChangeDetectorRef, Component, EventEmitter, Injector, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { ApiHttpService, AuthStore, CallFuncService } from "codx-core";
import { CodxShareService } from "projects/codx-share/src/public-api";

@Component({ template: '' })
export abstract class BaseFieldComponent
{
    user:any;
    @Input() data: any;
    @Input() process: any;
    @Input() stage: any;
    @Input() parent: any;
    @Input() type: string = 'add';
    @Input() vll:any;
    @Output() dataChange = new EventEmitter<any>();
    @Output() back = new EventEmitter<any>();

    protected authstore!: AuthStore;
    protected api: ApiHttpService;
    protected shareService: CodxShareService;
    protected ref: ChangeDetectorRef;
    protected callFuc: CallFuncService;
    constructor(inject: Injector)
    {
      this.authstore = inject.get(AuthStore);
      this.api = inject.get(ApiHttpService);
      this.shareService = inject.get(CodxShareService);
      this.ref = inject.get(ChangeDetectorRef);
      this.callFuc = inject.get(CallFuncService);
      this.user = this.authstore.get();
    }

}