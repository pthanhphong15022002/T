import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import axios from 'axios';
import { ApiHttpService, CacheService, NotificationsService, Util } from 'codx-core';
import { Subscription, from } from 'rxjs';
import { environment } from 'src/environments/environment';
const API_KEY = "NDgyMTEzZTcOGVjZGEMjVmNmVlNzVjMDBjMUwYTUNmMyZWExZGRiNQNGJiNTAwMjcMTdiMjNiYWIYQ";
const AgentDocumentId = "65ee834213439ba7df12c269";
@Component({
  selector: 'codx-help',
  templateUrl: './codx-help.component.html',
  styleUrls: ['./codx-help.component.css']
})
export class CodxHelpComponent implements OnInit, OnDestroy {

  subcriptions = new Subscription();
  module:string = "";
  function:any = null;
  constructor
  (
    private api:ApiHttpService,
    private cacheSV:CacheService,
    private notiSV:NotificationsService,
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

  ngOnDestroy(): void {
    this.subcriptions.unsubscribe();
  }

  openChatDoc(module:string){
    let objectID = module.toLocaleUpperCase(), referType = "help";
    let subscribe = this.api.execSv("DM","DM","FileBussiness","GetFileDocAsync",[objectID,referType])
    .subscribe((docID:any) => {
      if(docID)
      {
        this.openTabGPT(docID);
      }
      else this.notiSV.notify("Không tim thấy tài liệu.","2");
    });
    this.subcriptions.add(subscribe);

  }

  openTabGPT(docID:string){
    window.open(`https://console.trogiupluat.vn/Chatbox/Document?k=${environment.lvai.API_KEY}&docIds=${docID}`);
  }

}
