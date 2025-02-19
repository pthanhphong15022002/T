export const OMCONST = {
  OMPARAM: 'OMParameters',
  SERVICES: 'OM',
  ASSEMBLY: 'ERM.Business.OM',
  BUSINESS: {
    DashBoard: 'DashBoardBusiness',
    OKR: 'OKRBusiness',
    //KR: 'KRBusiness',
    //OB: 'OBBusiness',
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
    View: 'View',
    //Plan
    ReleasePlanCOMP:'OMT011',
    UnReleasePlanCOMP:'OMT012',
    PlanWeightCOMP:'OMT013',
    SharesPlanCOMP:'OMT014',
    PermissionCOMP:'OMT015',
    UpdateVerPlanCOMP:'OMT016',
    ShowVerPlanCOMP:'OMT017',
    //Plan
    ReleasePlanDEPT:'OMT021',
    UnReleasePlanDEPT:'OMT022',
    PlanWeightDEPT:'OMT023',
    SharesPlanDEPT:'OMT024',
    PermissionDEPT:'OMT025',
    UpdateVerPlanDEPT:'OMT026',
    ShowVerPlanDEPT:'OMT027',
    //Plan
    ReleasePlanORG:'OMT031',
    UnReleasePlanORG:'OMT032',
    PlanWeightORG:'OMT033',
    SharesPlanORG:'OMT034',
    PermissionORG:'OMT035',
    UpdateVerPlanORG:'OMT036',
    ShowVerPlanORG:'OMT037',
    //Plan
    ReleasePlanPER:'OMT041',
    UnReleasePlanPER:'OMT042',
    PlanWeightPER:'OMT043',
    SharesPlanPER:'OMT044',
    PermissionPER:'OMT045',
    UpdateVerPlanPER:'OMT046',
    ShowVerPlanPER:'OMT047',
    
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
    KRTask: 'OMT206',
    KRChagneAssignTarget: 'OMT207',
    KRReviewCheckIn:'OMT208',

    //SKR
    SKRDetail: 'OMT301',
    SKRAssign: 'OMT302',
    SKRDistribute: 'OMT303',
    SKRCheckIn: 'OMT304',
    SKRTask: 'OMT305',
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
      POSITION: '7',
    },

    Plan: {
      Month: 'M',
      Quarter: 'Q',
    },
    RefType_Link: {
      Distribute: '1',
      Assign: '2',
      Link:'3',
    },
    PlanStatus:{
      Cancelled:'0',
      NotStarted:'1',
      Ontracking:'2',
      AtRisk:'3',
      InTrouble:'4',
      Completed:'5',
    },
    ASSIGN_TYPE:  {
      OB : "ASO",
      KR : "ASR",
      SKR : "ASS",
    },
  
    HAS_ASSIGN : "AS",
    HAS_DISTRIBUTE : "DT",
  
    DISTRIBUTE_TYPE:  {
      OB : "DTO",
      KR : "DTR",
      SKR : "DTS",
    },
    CHECK_IN_TYPE:  {
      RealTime : "0",
      Plan : "1",
      Review : "2",
    },    
    CHECK_IN_STATUS:  {
      RealTime : "0",
      OnPlan : "1",
      LatePlan : "2",
      Review: "3",
    },
  },
  GRVNAME: {},
  FORMMODEL: {},
  PARAM:{
    Type1:'1',
    Type2:'2',
    Type3:'3',
    Type4:'4',
  },
  ASSET_URL:'./assets/themes/om/default/img/',
  
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
