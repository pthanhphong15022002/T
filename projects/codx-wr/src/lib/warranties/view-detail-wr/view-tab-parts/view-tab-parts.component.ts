import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  DataRequest,
  FormModel,
} from 'codx-core';
import { Observable, finalize, map } from 'rxjs';
import { CodxWrService } from '../../../codx-wr.service';

@Component({
  selector: 'wr-view-tab-parts',
  templateUrl: './view-tab-parts.component.html',
  styleUrls: ['./view-tab-parts.component.css'],
})
export class ViewTabPartsComponent implements OnInit {
  @Input() transID: any;
  @Output() listChange = new EventEmitter<any>();
  formModel: FormModel = {
    formName: 'WRWorkOrderParts',
    gridViewName: 'grvWRWorkOrderParts',
    entityName: 'WR_WorkOrderParts',
  };
  lstParts = [];
  loaded: boolean;
  request = new DataRequest();
  predicates = 'TransID=@0';
  dataValues = '';
  service = 'WR';
  currentRecID = '';
  assemblyName = 'ERM.Business.WR';
  className = 'WorkOrderPartsBusiness';
  method = 'LoadDataAsync';
  id: any;
  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
    private wrSv: CodxWrService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['transID']) {
      if (
        changes['transID'].currentValue != null &&
        changes['transID']?.currentValue?.trim() != ''
      ) {
        if (changes['transID']?.currentValue == this.id) return;
        this.id = changes['transID']?.currentValue;
        this.getListOrderParts();
      } else {
        if (!this.loaded) this.loaded = true;
      }
    }
  }

  ngOnInit(): void {}

  getListOrderParts() {
    this.loaded = false;
    this.request.predicates = this.predicates;
    this.request.dataValues = this.transID;
    this.request.entityName = 'WR_WorkOrderParts';
    this.request.pageLoading = false;
    this.fetch().subscribe(async (item) => {
      this.lstParts = item;
      console.log(this.lstParts);
      this.wrSv.listOrderPartsSubject.next(this.lstParts);
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
}
