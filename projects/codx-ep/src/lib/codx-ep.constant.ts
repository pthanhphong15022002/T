export const EPCONST = {
  EPPARAM: 'EPParameters',
  SERVICES: 'EP',
  ASSEMBLY: 'ERM.Business.EP',
  ENTITY:{
    Bookings:'EP_Bookings',
    R_Bookings:'EP_BookingRooms',
    C_Bookings:'EP_BookingCars',
    S_Bookings:'EP_Bookings',

    Resources:'EP_Resources',
    R_Resources:'EP_Rooms',
    C_Resources:'EP_Cars',
    S_Resources:'EP_Stationery',
    DR_Resources:'EP_Drivers',
    CA_Resources:'EP_Drivers',
    CA_History:'EP_HistoryCards',

  },
  BUSINESS: {
    Bookings: 'BookingsBusiness',
    Resources: 'ResourcesBusiness',
    ResourceQuota: 'ResourceQuotaBusiness',
    ResourceTrans: 'ResourceTransBusiness',
    Warehouses: 'WarehousesBusiness',
  },
  FUNCID: {
    Report:'EPR',
    R_Category:'EPS21',
    C_Category:'EPS22',
    DR_Category:'EPS23',
    S_Category:'EPS24',
    CA_Category:'EPS25',
    CA_History:'EPS2501',
    R_Bookings:'EPT11',
    C_Bookings:'EPT21',
    CA_Get:'EPT22',
    CA_Return:'EPT23',
    S_Bookings:'EPT31',
    S_Allocation:'EPT32',
    R_Approval:'EPT401',
    C_Approval:'EPT402',
    S_Approval:'EPT403',
  },

  R_FUNCID: {
    
  },

  C_FUNCID: {
    
  },
  S_FUNCID: {
    
  },

  MFUNCID: {
    Add: 'SYS01',
    Delete: 'SYS02',
    Edit: 'SYS03',
    Copy: 'SYS04',

    //Room
    R_Reschedule:'EP4T1101',
    R_Invite:'EP4T1102',
    R_Release:'EP4T1103',
    R_Cancel:'EP4T1104',
    R_Approval:'EPT40101',
    R_Reject:'EPT40105',
    R_Undo:'EPT40106',

    //Car
    C_Release:'EP7T1101',
    C_Cancel:'EP7T1102',  
    C_Approval:'EPT40201',
    C_Reject:'EPT40202',
    C_CardTrans:'EPT40203',
    C_DriverAssign:'EPT40204',
    C_Undo:'EPT40206',
    CA_GetCard:'EPS2501',
    CA_ReturnCard:'EPS2502',
    CA_History:'EPS2503',

    //Stationery
    S_Approval:'EPT40301',
    S_Reject:'EPT40302',
    S_Allocate:'EPT40303',
    S_Undo:'EPT40306',
    S_Release:'EP8T1101',
    S_Cancel:'EP8T1102',
    S_UpdateQuantity:'EPS2301',
    S_Quota:'EPS2302',

    
  },

  MES_CODE:{
    Success:'SYS034',
  },

  A_STATUS:{
    Cancel:'0',
    New:'1',
    Released:'3',
    Rejected:'4',
    Approved:'5'

  },

  VLL: {
    OKRType: {
      
    },

    
  },
  

  //region format

  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  // ngAfterViewInit(): void {

  // }

  // onInit(): void {
    
  //   this.getCacheData();
    
  // }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Cache Data--------------------------------//
  //---------------------------------------------------------------------------------//
  // getCacheData(){

  // }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Data Func---------------------------------//
  //---------------------------------------------------------------------------------//

  //---------------------------------------------------------------------------------//
  //-----------------------------------Event-----------------------------------------//
  //---------------------------------------------------------------------------------//
  // valueChange(evt: any) {
  //   if (evt && evt?.data) {
      
  //   }
  //   this.detectorRef.detectChanges();
  // }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Validate Func---------------------------------//
  //---------------------------------------------------------------------------------//

  //---------------------------------------------------------------------------------//
  //-----------------------------------Logic Func-------------------------------------//
  //---------------------------------------------------------------------------------//

  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Func-----------------------------------//
  //---------------------------------------------------------------------------------//


  //---------------------------------------------------------------------------------//
  //-----------------------------------Popup-----------------------------------------//
  //---------------------------------------------------------------------------------//
  

}
