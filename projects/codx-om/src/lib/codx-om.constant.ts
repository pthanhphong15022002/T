export const OMCONST = {
  OMPARAM: 'OMParameters',
  SERVICES: 'OM',
  ASSEMBLY: 'ERM.Business.OM',
  BUSINESS: {
    DashBoard: 'DashBoardBusiness',
    OKR: 'OKRBusiness',
    KR: 'KRBusiness',
    OB: 'OBBusiness',
    OKRPlan: 'OKRPlansBusiness',
    OM: 'OMBusiness',
    Reviews: 'ReviewsBusiness',
    Reports: 'ReportsBusiness',
  },
  FUNCID: {
    COMP: 'OMT01',
    DEPT: 'OMT02',
    ORG: 'OMT03',
    PERS: 'OMT04',
  },

  OBFUNCID: {
    COMP: 'OMT011',
    DEPT: 'OMT021',
    ORG: 'OMT031',
    PERS: 'OMT041',
  },

  KRFUNCID: {
    COMP: 'OMT012',
    DEPT: 'OMT022',
    ORG: 'OMT032',
    PERS: 'OMT042',
  },
  SKRFUNCID: {
    COMP: 'OMT013',
    DEPT: 'OMT023',
    ORG: 'OMT033',
    PERS: 'OMT043',
  },

  MFUNCID: {
    Add: 'SYS01',
    Delete: 'SYS02',
    Edit: 'SYS03',
    Copy: 'SYS04',

    //OB
    OBDetail: 'OMT101',
    OBAssign: 'OMT102',
    OBDistribute: 'OMT103',
    OBEditKRWeight: 'OMT104',

    //KR
    KRDetail: 'OMT201',
    KRAssign: 'OMT202',
    KRDistribute: 'OMT203',
    KREditSKRWeight: 'OMT204',
    KRCheckIn: 'OMT205',
  },

  VLL: {
    OKRType: {
      Obj: 'O',
      KResult: 'R',
      SKResult: 'S',
    },

    OKRLevel: {
      COMP: '1',
      DEPT: '3',
      ORG: '5',
      PERS: '9',
    },

    Plan: {
      Month: 'M',
      Quarter: 'Q',
    },
    RefType_Link: {
      Align: '1',
      Assign: '2',
    },
  },
  GRVNAME: {},
  FORMMODEL: {},
  PARAM:{
    Type1:'1',
    Type2:'2',
    Type3:'3',
    Type4:'4',
  }
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
  //-----------------------------------Base Event------------------------------------//
  //---------------------------------------------------------------------------------//
  // valueChange(evt: any) {
  //   if (evt && evt?.data) {
      
  //   }
  //   this.detectorRef.detectChanges();
  // }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Event----------------------------------//
  //---------------------------------------------------------------------------------//

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
