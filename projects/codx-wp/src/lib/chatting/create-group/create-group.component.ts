import { Component, OnInit } from '@angular/core';
import { ApiHttpService } from 'codx-core';

@Component({
    selector: 'create-group',
    templateUrl: './create-group.component.html',
})
export class CreateGroupComponent implements OnInit {
    constructor(private api: ApiHttpService) { }
    ngOnInit(): void {
        this.loadData();
    }
    groupName: string = "";
    userSelected : any[] = [];
    users:any[] = [];
    searchUser = "";

    selectUser(user){

    }

    loadData(){
        let options = {
            page: 1,
            pageSize: 50,
            entityName: "AD_Users",
            formName: "create Group chat",
            gridViewName: "grvUsers",
            funcID: "AD006",
            pageLoading: true,
            searchText: this.searchUser
        };
        this.api.exec<any>(
            'ERM.Business.WP', 
            'ChatBusiness', 
            'MockSearchUsers', options).subscribe(resp=>{
                
            //this.users = resp[0];
        })
    }
}