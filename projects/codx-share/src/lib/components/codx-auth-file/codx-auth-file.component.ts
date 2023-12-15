import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AESCryptoService } from 'codx-core';
import { CodxShareService } from '../../codx-share.service';
import { isObservable } from 'rxjs';

@Component({
  selector: 'codx-auth-file',
  templateUrl: './codx-auth-file.component.html',
  styleUrls: ['./codx-auth-file.component.css']
})
export class CodxAuthFileComponent implements OnInit{
  data:any;
  constructor(
    private router: ActivatedRoute,
    private aesCrypto: AESCryptoService,
    private shareService: CodxShareService
  )
  {

  }
  ngOnInit(): void {
    //this.getParams();
    alert("b")
  }

  getParams()
  {
    this.router.queryParams.subscribe((queryParams) => {
      if (queryParams?._k) {
        let recID = this.aesCrypto.decode(queryParams?._k);
        this.loadData(recID);
      }
    });
  }

  loadData(recID:any)
  {
    let paras = [recID];
    let keyRoot = "AuthFile" + recID;
    let share = this.shareService.loadDataCache(paras,keyRoot,"BG","BG","SharingsBusiness","GetItemSharingAsync");
    if(isObservable(share))
    {
      debugger
      share.subscribe(item=>{
        debugger
        this.data = item;
      })
    }
    else this.data = share;
  }
}
