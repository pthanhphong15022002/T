import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from "@angular/core";
import { TagsService } from "./tags.service";
import * as $ from 'jquery';
/* 

<tags [editMode]='true' 
        [entityName]="'HR_OrganizationUnits'" 
        [(value)]="['ce8ba70c-4c0e-11ec-80dd-00155d001163']" 
        (change)="tagsChange($event)">
</tags>

 */
@Component({
    selector: 'tags',
    templateUrl: './tags.component.html',
    styleUrls: ['./tags.component.scss']
})
export class TagsComponent implements OnInit {
    tagsData: any = null;
    data: any = [];
    editItemCurren: any;
    editItem: any;
    searchField: "";
    @Input() value: string;
    @Output() valueChange = new EventEmitter<string>();

    @Input() editMode: boolean = false;
    @Input() entityName: string = "";
    lstRecID = "";
    isOpen: boolean = false;
    constructor(private tagsService: TagsService, private df: ChangeDetectorRef) { }
    ngOnInit(): void {
        this.tagsService.getTags(this.entityName).subscribe(o => {
            this.tagsData = o || [];
        });

    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['value'].currentValue) {
            if (changes['value'].currentValue != this.lstRecID) {
                this.getTagsChoose(this.value);
            }
        }
        else {
            this.data.length = 0;
            this.lstRecID = "";
        }
    }
    getTagsChoose(guids: string) {
        this.tagsService.getTagsChoose(this.entityName, guids).subscribe((result) => {
            if (result?.length > 0) {
                this.data = result;
                this.lstRecID = guids;
            }
        })
    }
    close() {
        this.editItem = null;
        this.ngbPopover.close();
        this.isOpen = false;

    }
    deleteTag(data) {
        this.tagsService.deleteTags(this.editItem)
            .subscribe((o: any) => {
                var searchSelect = obj => obj.recID === this.editItem.recID;
                var exist = this.tagsData.findIndex(searchSelect);
                this.tagsData.splice(exist, 1);

                exist = this.data.findIndex(searchSelect);
                this.data.splice(exist, 1);

                this.editItem = null;
                this.df.detectChanges();
            });
    }
    saveTag() {
        if (this.editItem) {
            this.tagsService.saveTags(this.entityName, this.editItem)
                .subscribe((o: any) => {
                    if (this.editItem.recID) {
                        this.editItemCurren.tagName = this.editItem.tagName;
                        this.editItemCurren.color = this.editItem.color;
                    }
                    else {
                        (this.tagsData as any).push(o);
                    }
                    this.editItem = null;
                    this.df.detectChanges();
                });
        }
    }

    ngbPopover: any;
    open(p) {
        this.ngbPopover = p;
        p.open();
        this.isOpen = true;
    }
    addTag() {
        this.editItem = { color: "#ffffff" };
    }
    editTag(item) {
        this.editItemCurren = item
        this.editItem = $.extend({}, item);
        this.editItem.color = (this.editItem.color || "#ffffff");
    }
    handleChange($event) {
        this.editItem.color = $event.color.hex;
    }

    getContrastYIQ(item) {
        var hexcolor = (item.color || "#ffffff").replace("#", "");
        var r = parseInt(hexcolor.substr(0, 2), 16);
        var g = parseInt(hexcolor.substr(2, 2), 16);
        var b = parseInt(hexcolor.substr(4, 2), 16);
        var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? 'black' : 'white';
    }
    chooseTag(item) {
        if (this.lstRecID && this.lstRecID.includes(item.recID)) {
            let index = this.data.findIndex(p => p.recID == item.recID);
            this.data.splice(index, 1);
        }
        else {
            this.data.push(item);
        }
        this._valueChange();
    }
    _valueChange() {
        if (this.data?.length > 0) {
            this.lstRecID = this.data.map((item) => item['recID']).join(";");
        }
        else {
            this.lstRecID = "";
        }
        this.valueChange.emit(this.lstRecID);
    }
    trackByFn(index: number, item) {
        return item.recID;
    }
}