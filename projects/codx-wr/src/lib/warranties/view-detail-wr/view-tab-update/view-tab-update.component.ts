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

@Component({
  selector: 'wr-view-tab-update',
  templateUrl: './view-tab-update.component.html',
  styleUrls: ['./view-tab-update.component.css'],
})
export class ViewTabUpdateComponent implements OnInit {
  @Input() transID: any;
  @Output() listChange = new EventEmitter<any>();
  formModel: FormModel = {
    formName: 'WRWorkOrderUpdates',
    gridViewName: 'grvWRWorkOrderUpdates',
    entityName: 'WR_WorkOrderUpdates',
  };
  lstUpdate = [];
  loaded: boolean;
  request = new DataRequest();
  predicates = 'TransID=@0';
  dataValues = '';
  service = 'WR';
  currentRecID = '';
  assemblyName = 'ERM.Business.WR';
  className = 'WorkOrderUpdatesBusiness';
  method = 'LoadDataAsync';
  id: any;
  constructor(private api: ApiHttpService, private cache: CacheService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['transID']) {
      if (
        changes['transID'].currentValue != null &&
        changes['transID']?.currentValue?.trim() != ''
      ) {
        if (changes['transID']?.currentValue == this.id) return;
        this.id = changes['transID']?.currentValue;
        this.getListOrderUpdate();
      } else {
        if (!this.loaded) this.loaded = true;
      }
    }
  }

  ngOnInit(): void {}

  getListOrderUpdate() {
    this.loaded = false;
    this.request.predicates = this.predicates;
    this.request.dataValues = this.transID;
    this.request.entityName = 'WR_WorkOrderUpdates';
    this.request.pageLoading = false;
    this.fetch().subscribe(async (item) => {
      this.lstUpdate = item;
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
