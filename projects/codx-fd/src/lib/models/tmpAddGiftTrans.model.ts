export class tmpAddGiftTrans{
    public RecID:string ;
    public UserID:string ;
    public GiftID:string ;
    public GifName:string ;
    public TransType:string ;
    public Quantity:number ;
    public Amount:number;
    public Price:number ;
    public PriceType:string;
    public Status:string ;
    public Memo:string ;
    public ItemID:string ;
    public Situation:string ;
    public PatternID:string;
    public FunctionID:string ;
    public EntityName:string ;
    public EntityPer:string ;


    public constructor(){
        this.TransType = "1";
        this.Quantity = 0;
        this.UserID = "";
        this.Situation = "";
        this.Status = "1";
    }

}