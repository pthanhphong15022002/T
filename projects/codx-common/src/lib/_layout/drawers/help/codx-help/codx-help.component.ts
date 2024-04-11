import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import axios from 'axios';
import { ApiHttpService, CacheService, NotificationsService, RealHub, RealHubService, Util } from 'codx-core';
import { Subscription, from } from 'rxjs';
import { environment } from 'src/environments/environment';
const API_KEY = "NDgyMTEzZTcOGVjZGEMjVmNmVlNzVjMDBjMUwYTUNmMyZWExZGRiNQNGJiNTAwMjcMTdiMjNiYWIYQ";
const AgentDocumentId = "65ee834213439ba7df12c269";
@Component({
  selector: 'codx-help',
  templateUrl: './codx-help.component.html',
  styleUrls: ['./codx-help.component.css']
})
export class CodxHelpComponent implements OnInit, AfterViewInit, OnDestroy {

  subcriptions = new Subscription();
  module:string = "";
  function:any = null;
  constructor
  (
    private api:ApiHttpService,
    private cacheSV:CacheService,
    private notiSV:NotificationsService,
    private realHub: RealHubService,
    private router:Router
  )
  {
    this.module = this.router.url.split('/')[2];
  }

  
  ngOnInit(): void {
    this.subcriptions.add(this.cacheSV.functionList("WPT13")
    .subscribe((func:any) => {
      this.function = func;
    }));
  }

  ngAfterViewInit(): void {
    this.realHub.start("dm")
    .then((res:RealHub) => {
      if(res) {
        res.$subjectReal.asObservable()
        .subscribe((z):any => 
        {
          if(z && z?.event == 'OpenChatDoc' && z?.message == this.session) 
          {
            let respone = z.data;
            if(respone && respone?.status && respone?.docID)
            {
              this.openTabGPT(respone.docID);
            }
          }
        })
      }
    });
  }

  ngOnDestroy(): void {
    this.subcriptions.unsubscribe();
  }

  session:string = "";
  clickChatDoc(module:string){
    let objectID = module.toLocaleUpperCase(), referType = "help";
    this.subcriptions.add(this.api.execSv("DM","DM","FileBussiness","GetFileDocAsync",[objectID,referType])
    .subscribe((res:any) => {
      if(res)
      {
        let type = res.split(":");
        if(type[0] == "id")
          this.openTabGPT(type[1]);
        else  
          this.session = res;
      }
      else 
        this.notiSV.notify("Không tim thấy tài liệu","2");
    }));
  }

  openTabGPT(docID:string){
    window.open(`${environment.lvai.Url}?k=${environment.lvai.API_KEY}&docIds=${docID}`);
  }

}
