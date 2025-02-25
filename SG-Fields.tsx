import React, { FormEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./fields.scss";

import renderComponent from "./renderer";
import {
  getLovMissing,
  residentialAddress,
  stageFields,
  submitRequest,
  userInputPayload,
} from "./fields.utils";
import Footer from "../footer/footer";
import {
  FieldsetModel,
  KeyStringModel,
  KeyWithAnyModel,
  StoreModel,
  FieldModel,
} from "../../../utils/model/common-model";
import {
  isFormUpdate,
  checkProductDetails,
  lovRequests,
  dispatchLoader,
  submitBasicData,
  channelReference,
  submitBasicDataMyInfo,
  creditToTrust,
  thankYouPage, 
  submitBasicDataDocument,
  getOfferData,
  offerData,
  defaultError,
  rateRequest
} from "../../../services/common-service";
import { stagesAction } from "../../../utils/store/stages-slice";
import { getStageName, pageScrollTop, stateUrl } from "./stage.utils";
import { fieldErrorAction } from "../../../utils/store/field-error-slice";
import {
  authenticateType,
  FindIndex,
  smoothScroll,
  getUrl,
  getTokenChno
} from "../../../utils/common/change.utils";
import { useNavigate } from "react-router-dom";
import Model from "../../../shared/components/model/model";
import DocumentUpload from "../../../shared/components/document-upload/document-upload";
import { ValueUpdateAction } from "../../../utils/store/value-update-slice";
import ReviewPage from "../review-page/review-page";
import validateService from "../../../services/validation-service";
import CPFContribution from "../../../shared/components/cpf-contribution/cpf-contribution";
import BancaDetails from "../../../shared/components/banca-details/banca-details";
import {
  assignUpdateUserInput,
  deleteConditionalFieldSelector,
  removeUserInput,
  setFieldsForMyinfo,
} from "./fields-methods";
import trackEvents from "../../../services/track-events";
import gaTrackEvents from "../../../services/ga-track-events";
import { CONSTANTS,DEFAULT_NONEDITABLE } from "../../../utils/common/constants";
import { referralcodeAction } from "../../../utils/store/referral-code-slice";
import errorMsg from "../../../assets/_json/error.json";
import { store } from "../../../utils/store/store";
import Myinfobanner from "../../../shared/components/myinfo-banner/myinfo-banner";
import { trustBankAction } from "../../../utils/store/trust-bank-slice";
import auth from "../../../utils/store/auth-slice";

const Fields = (props: KeyWithAnyModel) => {
  const stageSelector = useSelector((state: StoreModel) => state.stages.stages);
    const stageSelectorThankYou = useSelector((state: StoreModel) => state.stages.stages);

  const madatoryFieldSelector = useSelector(
    (state: StoreModel) => state.fielderror.mandatoryFields
  );
  const isAgeValidSelector = useSelector((state:StoreModel)=>state.ageValidation.isAgeValid)
 const applicantsSelector = useSelector(
    (state: StoreModel) => state.stages.userInput.applicants
  );
  const missingFieldsSelector = useSelector(
    (state: StoreModel) => state.stages.userInput.missingFields
  );
  const conditionalFieldSelector = useSelector(
    (state: StoreModel) => state.stages.conditionalFields
  );
  let myinfoMissingFieldsSelector = useSelector(
    (state: StoreModel) => state.stages.myinfoMissingFields
  );
  const myinfoMissingLogicalFieldsSelector = useSelector(
    (state: StoreModel) => state.stages.myinfoMissingLogicFields
  );
  const updatedStageInputsSelector = useSelector(
    (state: StoreModel) => state.stages.updatedStageInputs
  );
  const userInputSelector = useSelector(
    (state: StoreModel) => state.stages.userInput
  );
  const currentStageSelector = useSelector(
    (state: StoreModel) => state.stages.currentStage
  );
  const lastStageSelector = useSelector(
    (state: any) => state.stages.lastStageId
  );
  const dependencyFieldsSelector = useSelector(
    (state: StoreModel) => state.stages.dependencyFields
  );
  const myinfoResSelector = useSelector(
    (state: StoreModel) => state.stages.myinfoResponse
  );
  const ibankingResSeletor = useSelector(
    (state: StoreModel) => state.stages.ibankingResponse
  );
  const valueSelector = useSelector((state: StoreModel) => state.valueUpdate);
  const applicationJourney = useSelector(
    (state: StoreModel) => state.stages.journeyType
  );
  const lovSelector = useSelector((state: StoreModel) => state.lov);
  const resumeSelector = useSelector(
    (state: StoreModel) => state.urlParam.resume
  );
  const bancaSelector = useSelector(
    (state: StoreModel) => state.bancaList.bancaDetails
  );
  const otpTriggerSelector = useSelector(
    (state: StoreModel) => state.stages.otpTrigger
  );
  const taxSelector = useSelector((state: StoreModel) => state.tax);
  const aliasSelector = useSelector((state: StoreModel) => state.alias);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [fields, setFields] = useState<FieldModel | null>();
  const [userInputs, setUserInputs] = useState<KeyWithAnyModel>({});
  const [stageId, setStageId] = useState<string>(stageSelector[0].stageId);
  const [otherMyinfo, setOtherMyinfo] = useState(false);
  const [showAgePopup, setShowAgePopup] = useState(false);
  const [showUSPopup, setShowUSPopup] = useState(false);
  const [cpfContributionData, setCpfContributionData] = useState([]);
  const [showNationalityPopup, setShowNationalityPopup] = useState(false);
  const [ageInvalidMessage, setAgeInvalidMessage] = useState("");
  const otherMyinfoSelector = useSelector(
    (state: StoreModel) => state.valueUpdate
  );
  let currentStageSection: KeyWithAnyModel = {};
  const [isRequiredValid, setIsRequiredValid] = useState("form-valid");
  const [isFormValid, setIsFormValid] = useState(true);
  const [checkboxStatus, setCheckboxStatus] = useState(false);
  const [isCASAProduct, setIsCASAProduct] = useState<boolean>(false);
  const productsSelector = useSelector(
    (_state: StoreModel) => stageSelector[0].stageInfo.products
  );
  const errorSelector = useSelector((state: StoreModel) => state.error);
  const showPopupSelector = useSelector((state: StoreModel) => state.postalCode.showPopup);
  const [showPostalPopup, setShowPostalPopup] = useState(false);
  const referralcodeSelector = useSelector((state: StoreModel) => state.referralcode);
  const [showReferralcodePopup, setShowReferralcodePopup] = useState(false);
  const [continueWithoutReferralcode, setContinueWithoutReferralcode] =
    useState(false);

  const [banckaMandatory, setBanckaMandatory] = useState<any>();
  const [basicResponse,setBasicResponse]=useState();
  const stage = store.getState();
  const td_multi_currency_products:any = getUrl.getProductInfo();
  useEffect(() => {
    if (props.selectedLeftMenu !== undefined) {
      const selectLeftMenu: string = props.selectedLeftMenu;
      leftMenuHandler(selectLeftMenu);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.selectedLeftMenu]);
  
  useEffect(() => {
   if(stageSelector[0].stageInfo.products[0].product_type === '280'){
      if(stageSelector[0].stageId ==="ld-1"){
    setShowPostalPopup(!!showPopupSelector);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  useEffect(() => {
    if (props.selectedLeftMenu !== undefined) {
      const selectLeftMenu: string = props.selectedLeftMenu;
      leftMenuHandler(selectLeftMenu);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.selectedLeftMenu]);
  useEffect(() => {
    if (otherMyinfo) {
      const checkProductType = checkProductDetails(productsSelector);
      setIsCASAProduct(checkProductType ? true : false);
      if (
        stageSelector &&
        stageSelector.length > 0 &&
        stageSelector[0].stageInfo.applicants.Cpfcontributions
      ) {
        setCpfContributionData(
          stageSelector[0].stageInfo.applicants.Cpfcontributions
        );
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otherMyinfo]);
  useEffect(() => {
        let updateUserInputs = { ...userInputs };
    if (Object.keys(updateUserInputs).length > 0) {
      dispatch(
        deleteConditionalFieldSelector(
          updateUserInputs,
          conditionalFieldSelector
        )
      ).then((updateUserInputsResponse: any) => {
        updateUserInputs = updateUserInputsResponse;
      });
    }
    if (Object.keys(conditionalFieldSelector.newFields).length > 0) {
      for (let key in conditionalFieldSelector.newFields) {
        const stageData = stageSelector[0].stageInfo.applicants[key + "_a_1"];
        updateUserInputs[key] = stageData || "";
      }
    }
    if (dependencyFieldsSelector.workType) {
      dispatch(
        removeUserInput(
          updateUserInputs,
          dependencyFieldsSelector,
          conditionalFieldSelector
        )
      ).then((updateUserInputsResponse: any) => {
        setUserInputs(updateUserInputsResponse);
      });
    }
    if (Object.keys(updateUserInputs).length > 0) {
      let getUsInput = applicantsSelector;
      dispatch(assignUpdateUserInput(getUsInput, updateUserInputs)).then(
        (updateUserInputsResponse: any) => {
          delete updateUserInputs.add_tax_residency;
          delete updateUserInputs.add_tax_residency_note;
          delete updateUserInputs.enter_account_info;
          if("tax_id_no" in updateUserInputsResponse && 
            updateUserInputsResponse.tax_id_no===undefined){
            delete updateUserInputs.tax_id_no;
          }
          if(stageSelector[0].stageId==="ad-2" && stage.stages.journeyType === "NTC"){
            const updatedResponse={...updateUserInputsResponse,embossed_name: stageSelector[0].stageInfo.applicants["full_name_a_1"]}
            setUserInputs(updatedResponse);
          }
          else{
          setUserInputs(updateUserInputsResponse);
          }
        }
      );
    } else if (!dependencyFieldsSelector.workType) {
      setUserInputs(updateUserInputs);
    }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conditionalFieldSelector]);

  useEffect(() => {
    if (!!currentStageSelector) {
      setStageId(currentStageSelector!);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStageSelector]);

  useEffect(() => {
    if (stageSelector && stageSelector.length > 0) {
      if (stageId === "ssf-1" && window.adobeDataLayer.length < 1) {
        trackEvents.atViewStart();
        trackEvents.triggerAdobeEvent("formStart");
      }
      if (stageId !== "doc" && stageId !== "rp") {
        setFields(stageFields(stageSelector, stageId));
      } else {
        setFields(null);
      }

      if(stageSelector[0].stageId === "bd-3" && (applicationJourney === 'NTC'||applicationJourney === 'NTB'||applicationJourney === 'ETB'||applicationJourney === 'ECA')){
        if(stageSelector[0].stageInfo.products[0].product_category === 'CC' || stageSelector[0].stageInfo.products[0].product_type === '280'){
         setOtherMyinfo(true);
        }
      }
    }
    pageScrollTop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageSelector, stageId]);

  useEffect(() => {
    if (valueSelector.value !== false && stageId !== "doc") {
      if (fields && fields["fields"] && fields["fields"].length > 0) {
                let mandatoryFields: Array<string> = [];
        if(banckaMandatory) {
          mandatoryFields = Object.keys(banckaMandatory);
        }
        let value: KeyStringModel = {};
        fields.fields.forEach((res: FieldsetModel) => {
          res.fields.forEach((fName: KeyWithAnyModel) => {
            if (
              fName.mandatory === "Yes" &&
              fName.logical_field_name !== "see_other_myInfo_details"
            ) {
              let logicalFieldVal =
                stageSelector[0].stageInfo.applicants[
                  fName.logical_field_name + "_a_1"
                ];
                if (
                 (!logicalFieldVal && 
                  fName.logical_field_name === "embossed_name" &&
                  new RegExp(fName.regex).test(
                    stageSelector[0].stageInfo.applicants["full_name_a_1"]
                  ) && stage.stages.journeyType === "NTC") || (!logicalFieldVal && 
                    fName.logical_field_name === "embossed_name" &&
                    new RegExp(fName.regex).test(
                      stageSelector[0].stageInfo.applicants["full_name_a_1"]
                    ) && stage.stages.journeyType === "ETC")
                ) {
                const fullName =
                  stageSelector[0].stageInfo.applicants["full_name_a_1"];
                if (fullName && fullName.length >= 19) {
                  const firstName = fullName.split(" ")[0];
                  logicalFieldVal = firstName.length >= 19 ? "" : firstName;
                } else {
                  logicalFieldVal = fullName;
                }
              }
              let residentialData: string | null = null;
              if (fName.logical_field_name === "residential_address") {
                residentialData = residentialAddress(stageSelector);
              }
              if (residentialData !== null) {
                value[fName.logical_field_name] = residentialData;
              } else {
                if (fName.logical_field_name === "passport_no") {
                  value[fName.logical_field_name] = logicalFieldVal
                    ? logicalFieldVal
                    : userInputSelector.applicants[
                        fName.logical_field_name + "_a_1"
                      ];
                } else {
                  value[fName.logical_field_name] = logicalFieldVal
                    ? logicalFieldVal
                    : "";
                }
              }
              mandatoryFields.push(fName.logical_field_name);
              if (
                stageSelector[0].stageId === "ad-2" &&
                taxSelector &&
                taxSelector.fields
              ) {
                taxSelector.fields.forEach((field, index) => {
                  const isMandatoryField = !mandatoryFields.find(
                    (logical_name) => logical_name === field
                  );
                  let seqNo = field.split("_")[3];
                  if (isMandatoryField) {
                    if (field.substr(0, 9) === "tax_id_no") {
                      if (
                        seqNo &&
                        userInputSelector.applicants[field + "_a_1"]
                      ) {
                        mandatoryFields.push(field);
                      }
                    } else {
                      mandatoryFields.push(field);
                    }
                  }
                  if (index % 2 === 1 && seqNo) {
                    if (
                      userInputSelector.applicants[
                        "crs_reason_code_" + seqNo + "_a_1"
                      ]
                    ) {
                      mandatoryFields.push("crs_reason_code_" + seqNo);
                    }
                    if (
                      userInputSelector.applicants[
                        "crs_comments_" + seqNo + "_a_1"
                      ]
                    ) {
                      mandatoryFields.push("crs_comments_" + seqNo);
                    }
                  }
                });
              }
              if (
                aliasSelector &&
                aliasSelector.fields &&
                (stageSelector[0].stageId === "ssf-1" ||
                  stageSelector[0].stageId === "bd-1")
              ) {
                aliasSelector.fields.forEach((field) => {
                  const isMandatoryField = !mandatoryFields.find(
                    (logical_name) => logical_name === field
                  );
                  if (isMandatoryField) {
                    mandatoryFields.push(field);
                  }
                });
              } 
              if (
                (
                  stageSelector[0].stageId === "bd-2")
              ) {
               mandatoryFields.push("gender","country_of_birth","education_level","postal_code","postal_code_other","block","street_name");
                  
                }
                if (
                  (
                    stageSelector[0].stageId === "ad-2")
                ) {
                  mandatoryFields.push("crs_reason_code","crs_comments");
                }
                if ((stageSelector[0].stageId === "bd-1")) {
                  if(!mandatoryFields.includes("residency_status")){
                    if(stageSelector[0].stageInfo.applicants.residency_status_a_1 === "CT" ||
                      stageSelector[0].stageInfo.applicants.residency_status_a_1 === "PR"){
                        mandatoryFields.push("residency_status","NRIC");
                    } else if (stageSelector[0].stageInfo.applicants.residency_status_a_1 === "FR") {
                      mandatoryFields.push("residency_status","passport_no");
                    }
                  }
                }
            } 
          });
        }); 
        
        if(banckaMandatory && (stageId === "ad-1" || (stageId === "bd-3" && userInputSelector.applicants["credit_limit_consent_a_1"] === "N")) 
        && bancaSelector && bancaSelector.banca_product_applicable_a_1 === "Y") {
          setUserInputs({...value, ...banckaMandatory});          
        } else {
          if(stageSelector[0].stageId ==="bd-2"&& stage.stages.journeyType === "NTC" && authenticateType() ==="manual" &&stageSelector[0].stageInfo.applicants.residency_status_a_1 !== "FR"){
             const updatedResponse = {...value,postal_code:"",street_name:"",block:""}
             setUserInputs(updatedResponse)
          }
          else{
          setUserInputs(value);
          }
        }
        if (lastStageSelector !== "doc") {
          dispatch(fieldErrorAction.getMandatoryFields(null));
          // dispatch(stagesAction.setLastStageId(null));
        }
        dispatch(fieldErrorAction.getMandatoryFields(mandatoryFields));
      } else {
        dispatch(fieldErrorAction.getMandatoryFields(null));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields, dispatch, valueSelector.value, stageSelector, banckaMandatory]);

  useEffect(() => {
    if (valueSelector.value !== false && stageId !== "doc") {
      let mandatoryFields:any = {};
        if (
          (stageId === "ad-1" ||
            (stageId === "bd-3" &&
              userInputSelector.applicants["credit_limit_consent_a_1"] === "N")) &&  bancaSelector 
              && bancaSelector.banca_product_applicable_a_1 === "Y"
        ) {
          bancaSelector.eligible_banca_insurances.forEach((eligibleBancaInsurance: any) => {
            let insuranceVal =
              stageSelector[0].stageInfo.applicants["insurance_consent_" + eligibleBancaInsurance + "_a_1"];            
            mandatoryFields["insurance_consent_" + eligibleBancaInsurance] = insuranceVal || '';
            setBanckaMandatory(mandatoryFields);
          });
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bancaSelector, stageId]);

  useEffect(() => {
    if (
      (stageSelector[0].stageId === "ssf-2" ||
        stageSelector[0].stageId === "ssf-1") &&
      authenticateType() !== "manual"
    ) {
      dispatch(stagesAction.mergeBasicInputs());
    } else {
      dispatch(
        stagesAction.mergeLastStageInputs(
          valueSelector.backNavigation.lastStageId
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStageSelector]);

  useEffect(() => {
    stateUrl(stageId);
    if (stageSelector[0] && stageSelector[0].stageId !== "ffd-1") {
      gaTrackEvents.pageView(stageId);
    }
    if (stageId !== "ssf-1" && (getUrl.getParameterByName("auth") !== "upload" && !store.getState().stages.isDocumentUpload)) {
      trackEvents.atViewStart();
      trackEvents.triggerAdobeEvent("formStepCompletions");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageId]);

  const leftMenuHandler = (selectLeftMenu: string) => {
    const stageIndex = FindIndex(stageSelector[0].stageInfo, selectLeftMenu);
    const getNewStageID =
      stageSelector[0].stageInfo.fieldmetadata.data.stages[stageIndex];
    if (getNewStageID) {
      setFields(getNewStageID.fields);
      setStageId(getNewStageID.stageId);
      dispatch(stagesAction.resetCurrentStage(getNewStageID.stageId));
      dispatch(stagesAction.updateStageId(getNewStageID.stageId));
    }
  };

  //Handle back if checks -- sonar fixes

  const ageValidStageCheck = () => {
    return (stageSelector[0].stageId === "ssf-1" ||
      stageSelector[0].stageId === "ssf-2") &&
      stageSelector
      ? true
      : false;
  };

  const otherMyinfoCheck = () => {
    let isFormValid = true;
    if (
      myinfoMissingLogicalFieldsSelector &&
      myinfoMissingLogicalFieldsSelector.length > 0
    ) {
      const isStageExits = updatedStageInputsSelector.findIndex(
        (ref: any) => ref.stageId === "ssf-2"
      );
      myinfoMissingLogicalFieldsSelector.forEach((logicalField: string) => {
        if (
          !(
            stageSelector[0].stageInfo.applicants[logicalField] ||
            userInputSelector.applicants[logicalField] ||
            (isStageExits >= 0
              ? updatedStageInputsSelector[isStageExits].applicants[
                  logicalField
                ]
              : null)
          )
        ) {
          isFormValid = false;
        }
      });
    }

    return otherMyinfoSelector.otherMyInfo &&
      otherMyinfoSelector.backNavigation.formChange &&
      otherMyinfoSelector.backNavigation.lastStageId !== null &&
      isFormValid
      ? true
      : false;
  };

  const navigateToNextStage = () => {
    if (authenticateType() === "myinfo" && otherMyinfoCheck()) {
      myinfoMissingFieldsSelector = false;
    }
    dispatch(userInputPayload(applicantsSelector, stageSelector));
    dispatch(stagesAction.resetNewAndOldFields());
    trackEvents.triggerAdobeEvent("ctaClick", "Continue");
    if (!((stageSelector[0].stageInfo.products[0].product_category === 'CC'
     || stageSelector[0].stageInfo.products[0].product_category === 'PL') && applicationJourney === 'NTC') &&
      authenticateType() === "myinfo" &&
      stageSelector[0].stageId === "ssf-1" || stageSelector[0].stageId === "bd-1" &&
      myinfoMissingFieldsSelector &&
      myinfoMissingLogicalFieldsSelector
    ) {
        dispatch(stagesAction.updateLastStageInput(stageSelector[0].stageId));
        let stateInfofield = stageSelector[0].stageInfo;
        const productCategory = stageSelector[0].stageInfo.products.map((product:any)=>product.product_category);
        const productCategories=productCategory.join(",");
        let fieldUpdate:any;
        let fullName = stateInfofield.applicants.full_name_a_1||"";
        let nameParts =fullName.split(/\s+/);
        let firstName="";
        let lastName:"";
        if(nameParts.length>=2){
          firstName=`${nameParts[0]} ${nameParts[1]}`;
          lastName=nameParts.slice(2).join("");
        }
        else if(nameParts.length===1){
          firstName =nameParts[0];
        }
        lastName=nameParts.length>1? nameParts[nameParts.length -1]:"";
        
                  if(stageSelector[0].stageInfo.products[0].product_category==="CC"&&stageSelector[0].stageInfo.products[1].product_category==="PL"){
                    fieldUpdate = {...stateInfofield,
                      applicants:{
                        ...stateInfofield.applicants,
                        account_currency_9_p_2:applicantsSelector["account_currency_9_a_1"],
                        first_name_a_1:firstName,
                        middle_name_a_1:lastName,
                        address_usage_indicator_a_1: "MIF",
                        product_categories:productCategories
                      }
                    }
                  }else{
                    fieldUpdate = {...stateInfofield,
                    applicants:{
                      ...stateInfofield.applicants,
                      first_name_a_1:stateInfofield.applicants.full_name_a_1,
                      address_usage_indicator_a_1: "MIF",
                      product_categories:productCategories
                    }
                  }
                  }
        for (let key in applicantsSelector) {
          fieldUpdate.applicants[key] = applicantsSelector[key];
        }
        submitBasicDataMyInfo(fieldUpdate,dispatch).then((res:any)=>{
          let channelReferenceNumber = getTokenChno().channelRefNo;
          if(res){
            dispatch(
              stagesAction.getStage({
                  id:"ssf-1",
                  formConfig: res,
             }));
            
                  dispatch(dispatchLoader(true));
                  let fieldUpdate:any;
                  if(res.applicant_documents[0].journey_type==='NTC' || res.applicant_documents[0].journey_type==='NTB'
                  ||res.applicant_documents[0].journey_type==='ECA' || res.applicant_documents[0].journey_type==='ETB' || res.applicant_documents[0].journey_type==='ECC'){
                      fieldUpdate = {...res,
                        stage:{
                          ...res.stage,
                          page_id: "bd-2",
                        }
                      };
                  }
                  else if(res.applicant_documents[0].journey_type==='ETC'){
                    let state:any;
                    if(productsSelector[0].product_category==="CC"
                    && productsSelector[1].product_category==="CC"){
                      state="ad-1"
                    }else{
                      state="ad-2"
                    }
                      fieldUpdate = {...res,
                        stage:{
                        ...res.stage,
                        stage_id:"AD",
                        page_id: state,
                        workflow_stage_id:null
                      }
                    };
                  }
            channelReference(fieldUpdate,channelReferenceNumber,dispatch).then((response:any)=>{
              setBasicResponse(response.data);
              if (response.data && response.data.applicant_documents[0].journey_type) {
                dispatch(
                  stagesAction.setJourneyType(response.data.applicant_documents[0].journey_type)
                );
              }
              if((response.data.applicant_documents[0].journey_type === 'NTC' || response.data.applicant_documents[0].journey_type === 'NTB'
               || response.data.applicant_documents[0].journey_type === 'ETB' || response.data.applicant_documents[0].journey_type === 'ECA'|| response.data.applicant_documents[0].journey_type==='ECC')
               && stageSelector[0].stageInfo.products[1].product_category!=="PL" ){
                dispatch(stagesAction.updateLastStageInput(stageSelector[0].stageId));
                setFields(
                  stageFields(
                    stageSelector,
                    "bd-2",
                    missingFieldsSelector,
                  "othermyinfo"
                  )
                );
                stateUrl("bd-2");
                dispatch(stagesAction.resetCurrentStage("bd-2"));
                dispatch(stagesAction.updateStageId("bd-2"));
              }
             else if((response.data.applicant_documents[0].journey_type === 'NTC' || response.data.applicant_documents[0].journey_type === 'NTB'
              || response.data.applicant_documents[0].journey_type === 'ETB' || response.data.applicant_documents[0].journey_type === 'ECA'|| response.data.applicant_documents[0].journey_type==='ECC')
              &&(stageSelector[0].stageInfo.products[0].product_category==="CC"&&stageSelector[0].stageInfo.products[1].product_category==="PL")){
                setShowPostalPopup(!showPopupSelector);
             }
            else if (response.data.applicant_documents[0]?.journey_type === 'ETC' ){
                dispatch(
                  stagesAction.setJourneyType(response.data.applicant_documents[0].journey_type)
                );
                dispatch(stagesAction.updateLastStageInput(stageSelector[0].stageId));
                let state:any;
                if(stageSelector[0].stageInfo.products[0].product_category==="CC"
                &&stageSelector[0].stageInfo.products[1].product_category==="CC"){
                  state="ad-1"
                }else{
                  state="ad-2"
                }
                setFields(
                  stageFields(
                    stageSelector,
                    state,
                    missingFieldsSelector,
                     "othermyinfo",
                  )
                );
                stateUrl(state);
                dispatch(stagesAction.resetCurrentStage(state));
                dispatch(stagesAction.updateStageId(state));  
              }
            })
          }
        })      
    } else if (
      stageSelector[0].stageId === "rp" &&
      stageSelector[0].stageInfo.products[0].product_type === "005"
    ) {
      navigate("/otp");
    } else if (
      stageSelector[0].stageId === "bd-3" &&
      applicantsSelector.credit_limit_consent_a_1 === "Y" &&
      otpTriggerSelector
    ) {
      dispatch(stagesAction.setOtpShow(true));
    } else if (
      stageSelector[0].stageId === "ssf-1" || stageSelector[0].stageId === "bd-1" && authenticateType() === "manual"
    ) {
      let channelReferenceBasicData = stageSelector[0].stageInfo.application.channel_reference;
      const fieldUpdate = JSON.parse(JSON.stringify(stageSelector[0].stageInfo));
      for (let key in applicantsSelector) {
        fieldUpdate.applicants[key] = applicantsSelector[key];
      }
      let stateInfofield = {...fieldUpdate,
        applicants:{
          ...fieldUpdate.applicants,
          address_usage_indicator_a_1: "NEW"
        },
        td_multi_currency_products:td_multi_currency_products
      };
      submitBasicData(stateInfofield,channelReferenceBasicData,dispatch).then((response)=>{
          if(response){
          setBasicResponse(response);
          if(response.customerDetails[0]?.journey_type === 'NTC'&&stageSelector[0].stageInfo.products[0].product_type !== '280'){
            dispatch(
              stagesAction.setJourneyType(response.customerDetails[0].journey_type)
            );
            dispatch(stagesAction.updateLastStageInput(stageSelector[0].stageId));
            setFields(
              stageFields(
                stageSelector, 
                "bd-2"
              )
            );
            stateUrl("bd-2");
            dispatch(stagesAction.resetCurrentStage("bd-2")); 
            dispatch(stagesAction.updateStageId("bd-2"));
          }
        else if (response.applicant_documents[0]?.journey_type === 'ETC'){
          dispatch(
            stagesAction.setJourneyType(response.applicant_documents[0].journey_type)
          );
          dispatch(stagesAction.updateLastStageInput(stageSelector[0].stageId));
                    setFields(
            stageFields(
              stageSelector,
              "ad-2"
            )
          );
          stateUrl("ad-2");
          dispatch(stagesAction.resetCurrentStage("ad-2"));
          dispatch(stagesAction.updateStageId("ad-2"));   
        }
      }
      })
    }
    else if ((stageSelector[0].stageId === "bd-2"||stageSelector[0].stageId === "ld-1") && (stage.stages.journeyType === "NTC" || stage.stages.journeyType === "NTB"
    || stage.stages.journeyType === "ETB" || stage.stages.journeyType === "ECA" || stage.stages.journeyType === "ECC")) {
      let channelReferenceBasicData = stageSelector[0].stageInfo.application.channel_reference;
      const fieldUpdate = JSON.parse(JSON.stringify(basicResponse));
      if(authenticateType() === "myinfo"){
      for (let key in applicantsSelector) {
        if(key !== "marital_status_a_1"){
        fieldUpdate.applicants[key] = applicantsSelector[key];
        }     
       }}
        else {
        for (let key in applicantsSelector) {
          fieldUpdate.applicants[key] = applicantsSelector[key];
      }}
      let stateInfofield = {...fieldUpdate,stage:{
        ...fieldUpdate.stage,
        page_id: "bd-2",
      }};
      channelReference(stateInfofield,channelReferenceBasicData,dispatch)
      .then((response:any) =>{
        if(response){
          channelReference({...response.data,
            stage:{
              ...response.data.stage,
              page_id: "bd-3",
            }},channelReferenceBasicData,dispatch).then((res:any)=>{
              if(res){
                setBasicResponse(res.data);
                dispatch(
                  stagesAction.getStage({
                    id: "setApplicantList",
                    formConfig: res.data.applicants
                  })
                );
                dispatch(stagesAction.updateLastStageInput(stageSelector[0].stageId));
                setFields(
                  stageFields(
                    stageSelector, 
                    "bd-3"
                  )
                );
                stateUrl("bd-3");
                dispatch(stagesAction.resetCurrentStage("bd-3"));
                dispatch(stagesAction.updateStageId("bd-3"));
                setIsFormValid(false);
              }
            })
        }
      })
    }
    else if (stageSelector[0].stageId === "bd-3" && (stage.stages.journeyType === "NTC" || stage.stages.journeyType === "NTB"
    || stage.stages.journeyType === "ETB" || stage.stages.journeyType === "ECA" || stage.stages.journeyType === "ECC")) {
      let channelReferenceBasicData = stageSelector[0].stageInfo.application.channel_reference;
      const fieldUpdate = JSON.parse(JSON.stringify(basicResponse));
      for (let key in applicantsSelector) {
        fieldUpdate.applicants[key] = applicantsSelector[key];
      }
      let stateInfofield:any;
      if(cpfContributionData.length > 0){
        stateInfofield = {...fieldUpdate,
          applicants:{
            ...fieldUpdate.applicants,
            "noa_valid_a_1": "Y",
            "cpf_valid_a_1": "Y",
          },
          stage: {
            ...fieldUpdate.stage,
            workflow_stage_id: null,
              page_id: "bd-3",
              stage_params: {
                ...fieldUpdate.stage.stage_params,
                  is_dedupe_required: false,
                  current_applicant: 1,
              },
          },
        };
      }
      else{
        stateInfofield = {...fieldUpdate,
        applicants:{
          ...fieldUpdate.applicants,
          "noa_valid_a_1": "N",
          "cpf_valid_a_1": "N",
        },
        stage: {
          ...fieldUpdate.stage,
          workflow_stage_id: null,
            page_id: "bd-3",
            stage_params: {
              ...fieldUpdate.stage.stage_params,
                is_dedupe_required: false,
                current_applicant: 1,
            },
        },
      }
    };
        submitBasicDataDocument(stateInfofield,channelReferenceBasicData,dispatch).then((response:any)=>{
          setBasicResponse(response.data)
          if(response && response.data.applicant_documents[0]?.document_list?.length>0){
            channelReference({...response.data,
              stage:{
                ...response.data.stage,
                page_id: "doc",
              }},channelReferenceBasicData,dispatch).then((response:any)=>{
              if(response){
              setBasicResponse(response.data);
               dispatch(stagesAction.updateLastStageInput(stageSelector[0].stageId));
               dispatch(
                 stagesAction.getStage({
                     id: "setDocumentList",
                     formConfig: response.data,
                   }))
               stateUrl("doc");
               dispatch(stagesAction.resetCurrentStage("doc"));
               dispatch(stagesAction.updateStageId("doc"));
             }
          })
        }
        else{
          let channelReferenceBasicData = stageSelector[0].stageInfo.application.channel_reference;
            const fieldUpdate = JSON.parse(JSON.stringify(basicResponse));
            for (let key in applicantsSelector) {
              fieldUpdate.applicants[key] = applicantsSelector[key];
            }
            let state:any;
            if(stageSelector[0].stageInfo.products[0].product_category==="CC"
              &&stageSelector[0].stageInfo.products[1].product_category==="CC"){
                    state="ad-1"
            }else{
                    state="ad-2"
            }
            let stateInfofield = {...fieldUpdate,
              stage:{
              ...fieldUpdate.stage,
              page_id: state,
            }}; 
            channelReference(stateInfofield,channelReferenceBasicData,dispatch).then((response)=>{
              setBasicResponse(response.data);
              if(response){
               dispatch(lovRequests(stageSelector[0].stageInfo, state));
                dispatch(stagesAction.updateLastStageInput(stageSelector[0].stageId));
                setFields(
                  stageFields(
                    stageSelector,
                    state
                  )
                );
                stateUrl(state);
                dispatch(stagesAction.resetCurrentStage(state));
                dispatch(stagesAction.updateStageId(state));
          }
        })      
        }
    });
     }
     else if (stageSelector[0].stageId === "ad-2" && (stage.stages.journeyType === "NTC" || stage.stages.journeyType === "NTB"
     || stage.stages.journeyType === "ETB" || stage.stages.journeyType === "ECA" || stage.stages.journeyType === "ECC" || stage.stages.journeyType === "ETC")) {
      let channelReferenceBasicData = stageSelector[0].stageInfo.application.channel_reference;
      const fieldUpdate = JSON.parse(JSON.stringify(basicResponse));
      let stateInfofield;
      for (let key in applicantsSelector) {
        if(applicantsSelector[key]!=="" && typeof applicantsSelector[key]==="string"){
          fieldUpdate.applicants[key] = applicantsSelector[key];
        }
      }
      stateInfofield = {...fieldUpdate,
          stage: {
            ...fieldUpdate.stage,
            workflow_stage_id: null,
              page_id: "ad-2",
              stage_params: {
                ...fieldUpdate.stage.stage_params,
                  is_dedupe_required: false,
                  current_applicant: 1,
              },
          },
      };
      channelReference(stateInfofield,channelReferenceBasicData,dispatch).then((response)=>{
        setBasicResponse(response.data);
        if(response){
          dispatch(
            stagesAction.getStage({
              id: "setApplicantList",
              formConfig: response.data.applicants
            })
          );
          dispatch(stagesAction.updateLastStageInput(stageSelector[0].stageId));
          setFields(
            stageFields(
              stageSelector,
              "ad-1"
            )
          );
          stateUrl("ad-1");
          dispatch(stagesAction.resetCurrentStage("ad-1"));
          dispatch(stagesAction.updateStageId("ad-1"));
    }
  })   
     }
     else if (stageSelector[0].stageId ==="rp") 
    {
     const channelReference = stageSelector[0].stageInfo.application.channel_reference;
     const fieldUpdate = JSON.parse(JSON.stringify(basicResponse));
     for (let key in applicantsSelector) {
       fieldUpdate.applicants[key] = applicantsSelector[key];
     }
     let updatedField = {...fieldUpdate,
              stage: {
                ...fieldUpdate.stage,
                "stage_id": "FFD",
                "page_id": "rp",
              }
    }
     thankYouPage(updatedField,channelReference,dispatch)
     .then((response) =>{
      if(response){
       dispatch(stagesAction.updateLastStageInput(stageSelector[0].stageId));
       setFields(
         stageFields(
           stageSelector, 
           "ffd-1"
         ));
         stateUrl("ffd-1");
       dispatch(stagesAction.resetCurrentStage("ffd-1"));
       dispatch(stagesAction.updateStageId("ffd-1"));  
         }
     })
     navigate("/sg/thankyou");
     }
     
    else if (stageSelector[0].stageId === "ad-1" && (stage.stages.journeyType === "NTC" || stage.stages.journeyType === "NTB"
    || stage.stages.journeyType === "ETB" || stage.stages.journeyType === "ECA" || stage.stages.journeyType === "ECC" || stage.stages.journeyType === "ETC"))
    {
      let channelReferenceBasicData = stageSelector[0].stageInfo.application.channel_reference;
      const fieldUpdate = JSON.parse(JSON.stringify(basicResponse));
      for (let key in applicantsSelector) {
        if(applicantsSelector[key]!=="" && typeof applicantsSelector[key]==="string"){
          fieldUpdate.applicants[key] = applicantsSelector[key];
        }
      }
      delete fieldUpdate.applicants.purpose_of_account_a_1;
      let stateInfofield = {...fieldUpdate,
        applicants:{
          ...fieldUpdate.applicants,
          purpose_of_account_p_2:applicantsSelector["purpose_of_account_a_1"],
          work_type_a_1:stageSelector[0].stageInfo.applicants.work_type_a_1
        },
        stage:{
        ...fieldUpdate.stage,
        stage_id:'AD',
        page_id: "ad-1",
      }};
      creditToTrust(stateInfofield,channelReferenceBasicData,dispatch).then((response)=>{
        if(response){ 
          // getOfferData({...response.data,
          //   applicants:{
          //     ...response.data.applicants,
          //     phoenix_customer_a_1 : "Y",
          //     limit_porting_eligible_flag_a_1 : "Y",
          //    customer_consent_for_limit_porting_a_1: "P"
          //   },
          //   stage:{
          //     ...response.data.stage,
          //     stage_id:"ACD",
          //     page_id: "ACD",
          //   }
          // },dispatch)
          const channelReferenceBasicData = stageSelector[0].stageInfo.application.channel_reference;
          // const updatedProducts=response.data.products.map((product:any)=>({
          //   ...product,
          //   offer_details:  [{"offer_type":"Initial ACD","offer_sequence_number":1,"offer_status":"APPROVE","approved_amount":8000.0,"approved_amount_currency":"SGD","approved_tendor":0,"base_rate":0.0,"base_spread":0.0,"risk_based_pricing":0.0,"prime_rate":null,"waived_risk_based_pricing":null,"effective_rate":0.0,"monthly_instalment":null,"monthly_instalment_crrency":"SGD","apr":null,"reason_code_descriptions":[{"reason_description":"APPROVED","reason_code":null}],"fees":[{"fee_amount":null,"fee_currency":null,"fee_code":"","fee_type":"","fee_percentage":"0.0","fee_label":"","fee_terms":null,"appeal_fee_amount":null,"appeal_fee_percentage":null}],"customer_requested_rate_percentage":null,"customer_requested_spread_percentage":null,"appeal_flag":null,"appeal_code":null,"price_escalation_remarks":null,"pricing_categories":null,"appeal_remarks":null,"price_escalation_flag":null,"appeal":null,"accept":null,"decline":null,"price_negotiate":null,"resubmit":null,"appeal_amount":null,"appeal_tenor":null,"appeal_rate":null,"appeal_fee_amount":null,"appeal_fee_percent":null,"effective_rate_for_BTCOC":null}]
          // }))
          offerData({...response.data,
            // applicants:{
            //       ...response.data.applicants,
            //       phoenix_customer_a_1 : "Y",
            //       limit_porting_eligible_flag_a_1 : "Y",
            //      customer_consent_for_limit_porting_a_1: "P",
            //      minimum_limit_amount_portable_a_1: "8000.00",
            //      maximum_limit_amount_portable_a_1: "11000.00",
            //      phoenix_customer_limit_a_1:"8000"
            //     },
              // products:updatedProducts,
            stage:{
              ...response.data.stage,
              stage_id:"ACD",
              page_id: "ACD",
            }
          },channelReferenceBasicData,dispatch).then((response:any)=>{
            if (response.status === 200) {
              // let updatedResponse={...response.data,
              //   applicants:{
              //         ...response.data.applicants,
              //         phoenix_customer_a_1 : "Y",
              //         limit_porting_eligible_flag_a_1 : "Y",
              //        customer_consent_for_limit_porting_a_1: "P",
              //        minimum_limit_amount_portable_a_1: "8000.00",
              //        maximum_limit_amount_portable_a_1: "11000.00",
              //        phoenix_customer_limit_a_1:"8000"
              //       },
              //       products:updatedProducts,
              //     }
              setBasicResponse(response.data)
              if (
                response.data.applicants &&
                (response.data.applicants.phoenix_customer_a_1 == "Y" &&
                response.data.applicants.limit_porting_eligible_flag_a_1 == "Y" &&
                  (response.data.applicants.customer_consent_for_limit_porting_a_1 == "P" ||
                  response.data.applicants.customer_consent_for_limit_porting_a_1 === "Y")
                )
              ) {
                dispatch(trustBankAction.UpdateTrustBank(response.data));
                const stageTo = CONSTANTS.STAGE_NAMES.ACD;
                if (stageTo !== "doc" && stageTo !== "rp") {
                  dispatch(lovRequests(stageSelector[0].stageInfo, stageTo));
                }
                const updatedStageSelector=[{stageId:stageTo,stageInfo:response.data}];
                setFields(stageFields(updatedStageSelector, stageTo));
                stateUrl("ACD");
                dispatch(stagesAction.resetCurrentStage("ACD"));
                dispatch(stagesAction.updateStageId("ACD"));
               
              } else {
                //gift screen landing to be added
                const fieldUpdate = JSON.parse(JSON.stringify(basicResponse));
                let stateInfofield = {...fieldUpdate,
                  stage:{
                  ...response.data.stage,
                  stage_id:'FFD',
                  page_id: "rp",
                }};
                channelReference(stateInfofield,response.data.application.channel_reference,dispatch).then((response)=>{
                  if(response){
                    // dispatch(
                    //   stagesAction.getStage({
                    //       id: "rp",
                    //       formConfig: response.data,
                    //  }));
                     const stageTo = CONSTANTS.STAGE_NAMES.RP;
                     dispatch(stagesAction.updateStageId(stageTo));
                     stateUrl("rp");
                     dispatch(stagesAction.resetCurrentStage("rp"));
                     dispatch(stagesAction.updateStageId("rp"));  
              }
            })    
              }
              dispatch(dispatchLoader(false));
            } else {
              defaultError();
            }
          })
        }
      })
    }

    else if (stageSelector[0].stageId ==="ACD") 
    {
     const channelReferenceBasicData = stageSelector[0].stageInfo.application.channel_reference;
     const fieldUpdate = JSON.parse(JSON.stringify(basicResponse));
     for (let key in applicantsSelector) {
       fieldUpdate.applicants[key] = applicantsSelector[key];
     }
     offerData(fieldUpdate,channelReferenceBasicData,dispatch).then((response:any)=>{
      if(response.status===200){
        let stateInfofield = {...response.data,
          stage:{
          ...response.data.stage,
          stage_id:'FFD',
          page_id: "rp",
        }};
        channelReference(stateInfofield,response.data.application.channel_reference,dispatch).then((response:any)=>{
          if(response){
            // dispatch(
            //   stagesAction.getStage({
            //       id: "rp",
            //       formConfig: response.data,
            //  }));
             const stageTo = CONSTANTS.STAGE_NAMES.RP;
             dispatch(stagesAction.updateStageId(stageTo));
             stateUrl("rp");
             dispatch(stagesAction.resetCurrentStage("rp"));
             dispatch(stagesAction.updateStageId("rp"));  
      }
    })
      }
     })
    }
    else {
      let stagePayload = applicantsSelector;
      const otpAuth = false;
      dispatch(
        submitRequest(
          stagePayload,
          stageSelector[0],
          stageSelectorThankYou,
          valueSelector,
          applicationJourney,
          lovSelector,
          userInputSelector,
          errorSelector,
          otpAuth,
          false,
          false,
          bancaSelector
        )
      )
        .then((stage: string) => {
          setOtherMyinfo(false);
          if (stage === "ffd-1") {
            navigate("/sg/thankyou");
          } else {
            setStageId(stage);
          }
          pageScrollTop();
        })
        .catch((_err: any) => {
          // do nothing
        });
    }
  };

  const myinfoFieldDispatch = () => {
    if (stageSelector && stageSelector.length > 0) {
      if (stageSelector[0].stageId === "ssf-1") {
        dispatch(stagesAction.updateLastStageInput(stageSelector[0].stageId));
      }
      if (
        stageSelector[0].stageId !== "ssf-1" &&
        Object.values(applicantsSelector).length > 0
      ) {
        dispatch(userInputPayload(applicantsSelector, stageSelector, "ssf-2"));
      }
      setFields(
        stageFields(
          stageSelector,
          "ssf-2",
          missingFieldsSelector,
          "othermyinfo"
        )
      );
      setOtherMyinfo(true);
      if (missingFieldsSelector !== null) {
        dispatch(stagesAction.removeMandatoryFields([]));
      }
      dispatch(stagesAction.revertMyinfoMandatoryFields(stageSelector));
    }
  };

  const removeUserInputData = (): any => {
    return async () => {
          madatoryFieldSelector.forEach((data: string) => {
          if (userInputs[data]) {
          delete userInputs[data];
          delete userInputs["first_name"];
          delete userInputs["office_phone_number"];
          delete userInputs["credit_limit_consent_info_5"];
          delete userInputs["credit_limit_consent_info_8"];
          if(stageSelector[0].stageId==='ad-2' || stageSelector[0].stageId==='ad-1'){
            delete userInputs["job_title"];
            delete userInputs["name_of_employer"];
            delete userInputs["nature_of_employer"];
            delete userInputs["name_of_business"];
            delete userInputs["office_phone_number"];
            }
        }
      });
    };
  };
  const handleSubmit = async (
    event: React.FormEvent<EventTarget>,
    fieldName?: string
  ): Promise<void> => {
    event.preventDefault();
    await removeUserInputData();
    // let ageInValid = false;
    // if (ageValidStageCheck()) {
    //   let age = validateService.calculateAge(
    //     userInputSelector.applicants.date_of_birth_a_1 ||
    //       stageSelector[0].stageInfo.applicants.date_of_birth_a_1
    //   );
    //   ageInValid = validateService.validateAge(
    //     age,
    //     stageSelector[0].stageInfo.products[0].product_type,
    //     stageSelector[0].stageInfo.products[0].product_category
    //   );
    // }
    // if (ageInValid) {
    //   setAgeInvalidMessage(
    //     validateService.getValidationMsg(
    //       stageSelector[0].stageInfo.products[0].product_type,
    //       stageSelector[0].stageInfo.products[0].product_category
    //     )
    //   );
    //   ;
    // } 
  
      if (
        currentStageSelector === "ad-2" && applicantsSelector.casa_fatca_declaration_a_1 === "Y"
       ) {
        setShowUSPopup(true);
        return;
      }
      
  if (checkForDuplicateNationalities()) {
      setShowNationalityPopup(true);
    } else if (currentStageSelector === "rp") {
      dispatch(
        stagesAction.updateUserInputFields({
          terms_conditions_consent_a_1: "Y",
        })
      );
      navigateToNextStage();
    } else if (!(Object.keys(userInputs).length > 0)) {
       if (referralcodeSelector && referralcodeSelector.refer && referralcodeSelector.refer === "true"){
        validateReferFlag(fieldName, otherMyinfoSelector, stageSelector)
      }else{
        toProceedNextStage(fieldName, otherMyinfoSelector, stageSelector);
      }    
    } else {
      dispatch(
        fieldErrorAction.getFieldError({
          fieldName: userInputs,
          stageId:stageSelector[0].stageId
        })
      );
      smoothScroll();
    }
    event.preventDefault();
    };

  const toProceedNextStage = (
    fieldName: string | undefined,
    otherMyinfoSelector: any,
    stageSelector: any
  ) => {
    dispatch(stagesAction.setLastStageId(stageSelector[0].stageId));
    if (fieldName === "see_other_myInfo_details") {
      stateUrl("ssf-2");
      dispatch(stagesAction.resetCurrentStage("ssf-2"));
      dispatch(stagesAction.updateStageId("ssf-2"));
      dispatch(ValueUpdateAction.updateOtherMyinfo(true));
      if (!otherMyinfoSelector.otherMyInfo) {
        dispatch(dispatchLoader(true));
        dispatch(lovRequests(stageSelector[0].stageInfo, "ssf-2", null));
      }
      myinfoFieldDispatch();
    } else {    
        navigateToNextStage();
    }
  };

  const handleCallback = (
    fieldProps: KeyWithAnyModel,
    childData: string | number
  ) => {
    currentStageSection = fieldProps;
    if (
      madatoryFieldSelector &&
      madatoryFieldSelector.indexOf(fieldProps.logical_field_name) !== -1
    ) {
      setUserInputs((prevUser: KeyStringModel) => ({
        ...prevUser,
        [fieldProps.logical_field_name]: childData,
      }));
    }
  };

  const handleFieldDispatch = (
    fieldName: string,
    childData: string | number,
    event?: any
  ) => {
    if (fieldName !== "see_other_myInfo_details") {
      let fieldValue: string | null | undefined = null;
      if (fieldName === "residential_address") {
        const postal_code = myinfoResSelector["postal_code_a_1"];
        const block = myinfoResSelector["block_a_1"];
        const building_name = myinfoResSelector["building_name_a_1"];

        fieldValue =
          postal_code !== null && block !== null && building_name !== null
            ? ""
            : null;
      } else if (
        fieldName === "mobile_number" &&
        !childData.toString().includes("65-")
      ) {
        childData = "65-" + childData;
      } else {
        fieldValue = myinfoResSelector[fieldName + "_a_1"];
      }
      /** rewrite condition to avoid unnecessary dispatch */

      /** ibanking prepopulating fields */
      let isIbanking = false;
      if (
        ibankingResSeletor &&
        Object.keys(ibankingResSeletor).length &&
        Object.keys(ibankingResSeletor).length > 0
      ) {
        fieldValue = ibankingResSeletor[fieldName + "_a_1"];
        isIbanking = true;
      }
     let nonEditablecheck = DEFAULT_NONEDITABLE.NONEDITABLE.indexOf(fieldName) >= 0 ? false : true;
      if ( nonEditablecheck && (
        fieldValue === null ||
        fieldValue === undefined ||
        (CONSTANTS.DEFAULT_EDITABLE.indexOf(fieldName) > -1))
      ) {
        dispatch(
          stagesAction.modifyStage({
            isIbanking: isIbanking,
            fieldData: {
              fieldName: fieldName,
              value: childData,
            },
            currentStageSection: { data: currentStageSection },
          })
        );
      }
    } else {
      handleSubmit(event, fieldName);
    }
  };

  // Sonar findings
  const setFieldsForBackStage = (
    stageUpdate: string,
    formUpdateState: boolean | undefined | null
  ) => {
    dispatch(fieldErrorAction.getMandatoryFields(null));
    dispatch(isFormUpdate(true));
    setStageId(stageUpdate);
    dispatch(stagesAction.resetCurrentStage(stageUpdate));
    dispatch(stagesAction.updateStageId(stageUpdate));
    pageScrollTop();
  };
  const backHandler = async (formUpdateState: boolean | undefined | null) => {
    dispatch(stagesAction.setLastStageId(stageSelector[0].stageId));
    trackEvents.triggerAdobeEvent("ctaClick", "Back");
    dispatch(stagesAction.resetNewAndOldFields());
    if (valueSelector.backNavigation.formChange !== false) {
      dispatch(
        ValueUpdateAction.getChangeUpdate({
          id: stageSelector[0].stageId!,
          changes: true,
        })
      );
    }
    const stageUpdate = getStageName(
      stageSelector[0].stageId!,
      applicationJourney
    );
    //Adding lov call incase of resume for previous stages, back navigation
    if (resumeSelector) {
      dispatch(
        getLovMissing(
          stageUpdate,
          stageSelector[0].stageInfo.fieldmetadata.data.stages,
          lovSelector
        )
      );
    }
    setFieldsForBackStage(stageUpdate, formUpdateState);
    //setDocBack(formUpdateState !== false ? true : false);
    dispatch(stagesAction.updateLastStageInput(stageSelector[0].stageId));
    dispatch(fieldErrorAction.getFieldError(null));
  };

  const updateCheckboxStatus = (checkedStatus: boolean) => {
    if (checkedStatus === true) {
      setIsRequiredValid("form-valid");
      setCheckboxStatus(checkedStatus);
    } else {
      setIsRequiredValid("form-invalid");
    }
  };

  useEffect(() => {
    if (madatoryFieldSelector && stageSelector[0].stageId !== "rp") { 
            dispatch(removeUserInputData()).then(
        // deleting data from userInput
        () => {
           if (
            isFormValid && 
            !(Object.keys(userInputs).length > 0) &&
            confirmBancaEtc()
          ) {
            setIsRequiredValid("form-valid");
          } else {
            setIsRequiredValid("form-invalid");
          }
        }
      );
    }else if(stageSelector[0].stageId === "rp"){
      setIsRequiredValid("form-valid");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFormValid, userInputs, madatoryFieldSelector]);
  const confirmBancaEtc = () => {
    const applicants = userInputSelector.applicants;
    if (
      (stageId === "ad-1") &&
      // applicants["credit_limit_consent_a_1"] === "N" &&
      bancaSelector &&
      bancaSelector.banca_product_applicable_a_1 === "Y"
    ) {
      if (bancaSelector.eligible_banca_insurances.every((eligibleBancaInsurance: any) => (
          applicants["insurance_consent_" + eligibleBancaInsurance + "_a_1"] === "Y" ||
          applicants["insurance_consent_" + eligibleBancaInsurance + "_a_1"] === "N" ||
          stageSelector[0].stageInfo.applicants["insurance_consent_" + eligibleBancaInsurance + "_a_1"] === "Y" ||
          stageSelector[0].stageInfo.applicants["insurance_consent_" + eligibleBancaInsurance + "_a_1"] === "N"
        ))
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  };

  
  const validateForm = (e: FormEvent<HTMLFormElement> | null) => {
    if (e && e.currentTarget.checkValidity()) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  };
  // const validateForm = (e: FormEvent<HTMLFormElement> | null) => {
  //   if (e && e.currentTarget.checkValidity() && stageSelector[0].stageId !=="ssf-1") {
  //     setIsFormValid(true);
  //   }
  //  else {
  //         if(e && e.currentTarget.checkValidity() &&stageSelector[0].stageId !=="ssf-1"){

  //               setIsFormValid(true);
  //         }
  //         else if(isAgeValidSelector&&e && e.currentTarget.checkValidity() &&stageSelector[0].stageId ==="ssf-1"){
  //           setIsFormValid(true);

  //         }

  //     else{
  //     setIsFormValid(false);
  //     }
  //   }
  // };

  useEffect(()=>{

     if(
      stageSelector[0].stageId ==="ssf-1"&&isAgeValidSelector && authenticateType() === "manual" &&
      stageSelector[0].stageInfo.fieldmetadata.data.stages[0].fields[4].logical_field_name==="date_of_birth"
    ){
      setIsFormValid(true);
    }
     else  {
      if(stageSelector[0].stageId ==="ssf-1"&&authenticateType()==="manual"){
      setIsFormValid(false);
      }
    }

  },[isAgeValidSelector,valueSelector])
 

  const handlePopupBackButton = () => {
    setShowUSPopup(false);
    setShowNationalityPopup(false);
    setShowPostalPopup(false);
  };

  const checkForDuplicateNationalities = () => {
    let isFound: boolean = false;
    if (
      currentStageSelector === "ad-2" &&
      stageSelector[0].stageInfo.applicants.nationality_a_1 &&
      userInputSelector.applicants.country_of_tax_residence_a_1
    ) {
      taxSelector.fields.forEach(field => {
        const fieldIndex = field.split("_").pop(); 
        const fieldValue = userInputSelector.applicants[`${field}_a_1`];
        const countryOfTaxField = `country_of_tax_residence_${fieldIndex}`;
          if (taxSelector.fields.includes(countryOfTaxField)) {
            if(fieldValue===userInputSelector.applicants.country_of_tax_residence_a_1){
              isFound = true;
            }
          }
      });
      // if (nationalityArray) {
      //   nationalityArray.forEach((national: string) => {
      //     if (
      //       national === stageSelector[0].stageInfo.applicants.nationality_a_1
      //     ) {
      //       isFound = true;
      //     }
      //   });
      // }
    }
    return isFound;
  };

  const validateInsurance = (logicalFieldName: string, value: string) => {
    dispatch(
      stagesAction.modifyStage({
        fieldData: {
          fieldName: logicalFieldName,
          value: value,
        },
        currentStageSection: { data: currentStageSection },
      })
    );
    let updateUserInputs = { ...userInputs };
    updateUserInputs[logicalFieldName] = value;
    setUserInputs(updateUserInputs);
  };
  const validateReferFlag = (fieldName : string | undefined, otherMyinfoSelector :any, stageSelector :any) =>{
    if (
      referralcodeSelector &&
      referralcodeSelector.referId !== null &&
        referralcodeSelector.referId !== "" &&
      referralcodeSelector.referId.length > 0 &&
      referralcodeSelector.referId.length <= 4
    ) {
      dispatch(
        referralcodeAction.setReferralErrorMsg(
           errorMsg.referralcodeerror
        )
      );
    } else if (
      referralcodeSelector.refer !== null &&
      fieldName === "see_other_myInfo_details" &&
      !continueWithoutReferralcode &&
      referralcodeSelector &&
      (referralcodeSelector.referId === null ||
        referralcodeSelector.referId === "")
    ) {
      setOtherMyinfo(true);
      setShowReferralcodePopup(true);
    } else if (
      referralcodeSelector.refer !== null &&
      referralcodeSelector.refer &&
      fieldName !== "see_other_myInfo_details"
    ) {
      setOtherMyinfo(false);
      validateReferralCode();
    } else if (
      referralcodeSelector.refer !== null &&
      fieldName === "see_other_myInfo_details" &&
      (continueWithoutReferralcode ||
        (referralcodeSelector && referralcodeSelector.referId && referralcodeSelector.referId.length >= 5))
    ) {
      toProceedNextStage(fieldName, otherMyinfoSelector, stageSelector);
    } else if (
      referralcodeSelector.refer === null &&
      (getUrl.getParameterByName("auth") === "resume" || resumeSelector)
    ) {
      validateReferralCode();
    }

  }
  const validateReferralCode = () => {
    if (referralcodeSelector && referralcodeSelector.refer && referralcodeSelector.refer === 'true') {
      if ((referralcodeSelector.referId === "" || referralcodeSelector.referId === null )&& !continueWithoutReferralcode) {
        setShowReferralcodePopup(true);
      }
      if (
        (referralcodeSelector.referId === "" ||
          referralcodeSelector.referId === null) &&
        continueWithoutReferralcode &&
        !otherMyinfo
      ) {
        setShowReferralcodePopup(false);
        navigateToNextStage();
      }
      if (
        referralcodeSelector.referId &&
        referralcodeSelector.referId.length >= 5 &&
        !otherMyinfo
      ) {
        setShowReferralcodePopup(false);
        navigateToNextStage();
      }
      if (
        otherMyinfo &&
        (referralcodeSelector.referId === "" ||
          referralcodeSelector.referId === null) &&
        continueWithoutReferralcode
      ) {
        setShowReferralcodePopup(false);
      }
    }
  };
  useEffect(() => {
    if (continueWithoutReferralcode && otherMyinfo) {
      toProceedNextStage(
        "see_other_myInfo_details",
        otherMyinfoSelector,
        stageSelector
      );
    }
    if (continueWithoutReferralcode && !otherMyinfo) {
      navigateToNextStage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otherMyinfo, continueWithoutReferralcode]);
  
  return (
    <>
      {/* {showAgePopup && (
        <Model name="ageHardStop" body_content={ageInvalidMessage} />
      )} */}

      {showUSPopup && (
        <Model name="usHardStop" handlebuttonClick={handlePopupBackButton} />
      )}

      {showPostalPopup && <Model name="postal_code" handlebuttonClick={handlePopupBackButton} />}

      {showNationalityPopup && (
        <Model
          name="nationalityHardStop"
          handlebuttonClick={handlePopupBackButton}
        />
      )}
      {stageId === "doc" && <DocumentUpload backHandler={backHandler} />}
      {stageId !== "doc" && (
        <form className="form" onSubmit={handleSubmit} onChange={validateForm}>
          {stageId === "rp" && (
            <ReviewPage updateCheckboxStatus={updateCheckboxStatus} />
          )}
          {/* {(((stageSelector[0].stageInfo.products[0].product_category === 'CC'
           || stageSelector[0].stageInfo.products[0].product_type === '280') && applicationJourney === 'NTC' )
            && stageSelector[0].stageId === "bd-3" ) &&
            <Myinfobanner/>} */}
          {stageId !== "rp" &&
            fields &&
            fields["fields"] &&
            fields["fields"].map(
              (currentSection: KeyWithAnyModel, i: number) => {                
                return (
                  <div key={`fields${i}`}>
                    {currentSection["field_set_name"] &&
                      currentSection["fields"].length > 0 && (
                        <>
                          {stageSelector[0].stageId!=='bd-3'?
                          <div
                            className={`field__group ${stageSelector[0].stageId ==="bd-1" ? "field_group_basic" : ""}`}
                            key={currentSection["field_set_name"]}
                          >
                            {currentSection["field_set_name"] !== "Insurance Protection" &&
                            currentSection["field_set_name"].trim() !== "" &&
                              currentSection["fields"][0].field_set !==
                                "No" && (
                                <div
                                  aria-details={
                                    currentSection["field_set_name"]
                                  }
                                  className="stage-header"
                                >
                                  {currentSection["field_set_name"]}
                                </div>
                              )
                              } 
                              {currentSection["field_set_name"] === "Insurance Protection" &&(stageId === "ad-1" ||
                              stageId === "bd-3" &&
                                userInputSelector.applicants["credit_limit_consent_a_1"] ===
                                  "N") &&
                              bancaSelector &&
                              bancaSelector.banca_product_applicable_a_1 === "Y" && 
                              bancaSelector.eligible_banca_insurance_informations.map(
                                  (insuranceInformation: KeyWithAnyModel, i: number) => {
                                    return (
                                      <div
                                      className="field__group">
                                      <div
                                        aria-details={currentSection["field_set_name"]}
                                        className="stage-header"
                                      >
                                        {currentSection["field_set_name"]}
                                      </div><BancaDetails
                                          insuranceInformation={insuranceInformation}
                                          validateInsurance={validateInsurance}
                                          handleFieldDispatch={handleFieldDispatch}
                                          handleCallback={handleCallback} />
                                      </div>
                                    );
                                  }
                            )}
                            {currentSection["fields"].map(
                              (
                                currentSectionDetails: KeyWithAnyModel,
                                index: number
                              ) => {
                                currentStageSection = currentSectionDetails;
                                return renderComponent(
                                  currentSectionDetails,
                                  index,
                                  handleCallback,
                                  handleFieldDispatch,
                                  userInputs
                                );
                              }
                            )}
                          </div>:
                          <div  className="moveOfficeNumberToBottom">
                            <div
                            className="field__group"
                            key={currentSection["field_set_name"]}
                          >
                            {currentSection["field_set_name"].trim() !== "" &&
                              currentSection["fields"][0].field_set !==
                                "No" && (
                                <div
                                  aria-details={
                                    currentSection["field_set_name"]
                                  }
                                  className="stage-header"
                                >
                                  {currentSection["field_set_name"]}
                                </div>
                              )}
                            {currentSection["fields"].map(
                              (
                                currentSectionDetails: KeyWithAnyModel,
                                index: number
                              ) => {
                                currentStageSection = currentSectionDetails;
                                return renderComponent(
                                  currentSectionDetails,
                                  index,
                                  handleCallback,
                                  handleFieldDispatch,
                                  userInputs
                                );
                              }
                            )}
                          </div>
                          </div>
              }
                        </>
                      )}
                  </div>
                );
              }
            )}
          
           {otherMyinfo && isCASAProduct === false && stageId !== "ld-1" 
           && stageId !== "bd-2" && stageId === "bd-3" &&  
          <div className="field__group">
                        { stageSelector[0].stageInfo.applicants.yearly_assessable_income_a_1 &&<div aria-details="Employment Details" className="stage-header">NOA Income Details</div>}
            {stageSelector[0].stageInfo.applicants.year_of_assessment_a_1 &&
          <div className="text"><label htmlFor="NRIC">Year of Assessment</label>
            <div className="text__count ">
                 <input type="Text" name="NRIC" aria-label="NRIC" id="NRIC_a_1" disabled={true} value={stageSelector[0].stageInfo.applicants.year_of_assessment_a_1} />
            </div>
          </div>}
          {stageSelector[0].stageInfo.applicants.yearly_assessable_income_a_1 &&
          <div className="text"><label htmlFor="NRIC">Yearly Assessment Income</label>
          <div className="text__count ">
               <input type="Text" name="NRIC" aria-label="NRIC" id="NRIC_a_1" disabled={true} value={stageSelector[0].stageInfo.applicants.yearly_assessable_income_a_1}/>
          </div>
          </div>
          }
          </div>
         }
          {otherMyinfo &&
            isCASAProduct === false && stageId !== "ld-1" && stageId !== "bd-2" && stageId !== "bd-1" && stageId !== "rp" && stageId !=="ad-2" && stageId !=="ACD" &&stageId !=="ad-1" &&
            cpfContributionData.length > 0 && 
            (
              <CPFContribution
                cpfContrubutionLogicalValue={cpfContributionData}
              />
            )}
            {referralcodeSelector &&
            referralcodeSelector.refer &&
            showReferralcodePopup &&
            continueWithoutReferralcode !== true && (
              <Model
                name="referral_code"
                setContinueWithoutReferralcode={setContinueWithoutReferralcode}
                setShowReferralcodePopup={setShowReferralcodePopup}
              />
            )}
          <div className="app__footer">
            <Footer
              otherMyinfo={otherMyinfo}
              backHandler={backHandler}
              validateNxt={isRequiredValid}
              journeyType={applicationJourney}
            />
          </div>
          
        </form>
      )}
    </>
  );
};

export default React.memo(Fields);
