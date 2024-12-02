import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { KeyWithAnyModel, StoreModel } from "../../../utils/model/common-model";
import { fieldError, fieldIdAppend, getUrl, isFieldUpdate, isFieldValueUpdate } from "../../../utils/common/change.utils";
import errorMsg from "../../../assets/_json/error.json";
// import validationMsg from "../../../assets/_json/validation.json";
import { CONSTANTS } from "../../../utils/common/constants";
import { stagesAction } from "../../../utils/store/stages-slice";
import "./text.scss";
import { modelAction } from "../../../utils/store/model-slice";
import { ContinueBtnAction } from "../../../utils/store/continue-validation-slice";
import { lastAction } from "../../../utils/store/last-accessed-slice";


const Text = (props: KeyWithAnyModel) => {
 
  const [error, setError] = useState('');
  const stageSelector = useSelector((state: StoreModel) => state?.stages?.stages);

  const fieldErrorSelector = useSelector(
    (state: StoreModel) => state.fielderror?.error
  );

  const userInputSelector = useSelector(
    (state: StoreModel) => state?.stages?.userInput
  );
  const dispatch = useDispatch();
  const pinyinToggleSelector = useSelector((state: StoreModel) => state?.stages?.pinyinToggle)
  const [defaultValue, setDefaultValue] = useState(props?.data?.ui_defaulted_value !== null ? props?.data?.ui_defaulted_value : "");
  const [textDisabled, setTextDisabled] = useState(false)
  const [showUserNameValid, setShowUserNameValid] = useState(false)

  let placeHolderValue 
  if(props?.data?.rwb_label_name == "Room (If applicable – one input required from Room, Floor or Block)" || props?.data?.rwb_label_name == "Floor (If applicable)"  || props?.data?.rwb_label_name == "Block (If applicable)" ){
    placeHolderValue = "(if-applicable)" 
  } else{
    placeHolderValue = props?.data?.rwb_label_name;
  }

  if(props?.data?.rwb_label_name == "Building / Estate" || props?.data?.rwb_label_name == "Number and Name of Street (optional)"){
    placeHolderValue = "";
  } else{
    placeHolderValue = props?.data?.rwb_label_name;
  }
  const [placeholder, setPlaceHolder] = useState(placeHolderValue)
  const validationCheckList = useSelector((state: StoreModel) => state?.ibnk?.userNameChecks);
  const chineseRegex = /[^\s\u4E00-\u9FFF\u3400-\u4DFF\uF900-\uFAFF]+/g;
  const addressChineseRegex = /[^a-zA-Z\d\u4E00-\u9FFF\u3400-\u4DFF\uF900-\uFAFF.,/?:()#&-\s]+/;
  const addressNonChineseRegex = /([^A-Za-z\d.()/&#,:?-\s]+)/;
  const stateCityPattern = /[^a-zA-Z\s]+/;
  const regexAlphaNumeric = /^[a-zA-Z0-9 ]+$/;
  const chinaIdRegex = "^[0-9]{17}[0-9a-zA-Z]{1}$";
  const user_names = ['admin', 'administrator', 'manager']
  const language = getUrl.getLanguageInfo("lang");
  const [taxIDValue, setTaxIDValue] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  //using declaration page
  // const relatedParty=userInputSelector?.applicants[0].related_party;

  const validationPatterns = () => {
    let pattern; let fieldName = props?.data?.logical_field_name;
    if (props?.data?.logical_field_name === "china_id_number") {
      pattern = '^[0-9]{17}[0-9a-zA-Z]{1}$';
    }
    if (props?.data?.logical_field_name === "full_name_chinese") {
      pattern = "[ \\u4E00-\\u9FFF\\u3400-\\u4DFF\\uF900-\\uFAFF ]+";
    }
    if (fieldName === "res_name_of_street_1" || fieldName === "res_building_estate_1" || fieldName === "res_room_flat_1" || fieldName === "res_room_flat_3" || fieldName === "res_building_estate_3" || fieldName === "res_name_of_street_3") {
      pattern = "^[a-zA-Z\d \\u4E00-\\u9FFF\\u3400-\\u4DFF\\uF900-\\uFAFF.,/?:()#&-\s]+";
    }
    if (fieldName === "address_res_1" || fieldName === "address_res_2" || fieldName === "address_res_3" || fieldName === "address_mailing_1" || fieldName === "address_mailing_2" || fieldName === "address_mailing_3" || fieldName === "res_name_of_street_2" || fieldName === "res_building_estate_2" || fieldName === "res_room_flat_2" || fieldName === "res_floor_4" || fieldName === "res_building_estate_4" || fieldName === "res_name_of_street_4" || fieldName === "res_room_flat_4" || fieldName === "res_block_3") {
      pattern = "^[A-Za-z\d .()/&#,:?-\s]+";   //"^([A-Za-z\d.()/&#,:?-]+\s)*[a-zA-Z\d.()/&#,:?-]+$"   
    }
    if (fieldName === "state_res_1" || fieldName === "state_mailing_1" || fieldName === "city_res_1" || fieldName === "city_mailing_1") {
      pattern = "^[ a-zA-Z\s]+";     //-->  "^[a-zA-Z]+(?: [a-zA-Z]+)*$" ;
    }
    if(fieldName === "user_name_ibk"){
      pattern = "^[a-zA-Z0-9]+$";
    }
    return pattern
  }

  const changeHandler = (
    fieldName: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    debugger;
    if (stageSelector && stageSelector?.[0].stageId === CONSTANTS.STAGE_NAMES.AD_3) {
      dispatch(modelAction.toggleModel(false))
      dispatch(stagesAction.userNameChange());
    }
    
    setShowPopup(true);
    setDefaultValue(event.target.value);
    props.handleCallback(props.data, event.target.value);
    setError('');
    if (( props?.data?.mandatory === "Yes" || props?.data?.mandatory === "Conditional") && `${event.target.value}`.length === 0) {
      setError(`${language === CONSTANTS.LANG_EN ? props?.data?.rwb_label_name + ' ' + errorMsg.required_mandatory : language === CONSTANTS.LANG_CN ? errorMsg.required_mandatory_CN + props?.data?.rwb_label_name : errorMsg.required_mandatory_HK + props?.data?.rwb_label_name}`);
    } else if (`${event.target.value}`[0] === " " || `${event.target.value}`[`${event.target.value}`.length - 1] === " ") {
      setError(`${language === CONSTANTS.LANG_EN ? errorMsg.patterns : language === CONSTANTS.LANG_CN ? errorMsg.patterns_CN : errorMsg.patterns_HK}${ props?.data?.rwb_label_name}`)
    } else if ( props?.data?.logical_field_name === 'EEP' && props?.data?.regex && !(`${event.target.value}`.match( props?.data?.regex))) {
      setError(`${language === CONSTANTS.LANG_EN ? errorMsg.patterns + props?.data?.rwb_label_name + '(i.e. C12345678)' : language === CONSTANTS.LANG_CN ? errorMsg.patterns_CN + props?.data?.rwb_label_name : errorMsg.patterns_HK + props?.data?.rwb_label_name}`)
    } else if (fieldName === 'china_id_number' && !(`${event.target.value}`.match(chinaIdRegex))) {
      setError(`${language === CONSTANTS.LANG_EN ? errorMsg.patternsBank : language === CONSTANTS.LANG_CN ? errorMsg.patterns_CN : errorMsg.patterns_HK}${ props?.data?.rwb_label_name} `)
    } else if (fieldName === 'full_name_chinese' && (`${event.target.value}`.match(chineseRegex))) {
      setError(`${language === CONSTANTS.LANG_EN ? errorMsg.patterns : language === CONSTANTS.LANG_CN ? errorMsg.patterns_CN : errorMsg.patterns_HK}${ props?.data?.rwb_label_name} `)
    } else if (fieldName === 'full_name_chinese' && event.target.value.length < props?.data?.min_length) {
      setError(`${language === CONSTANTS.LANG_EN ? errorMsg.minLength + ' ' + props?.data?.min_length + ' characters' : language === CONSTANTS.LANG_CN ? errorMsg.minLength_CN + props?.data?.min_length + '位字符' : errorMsg.minLength_HK + props?.data?.min_length + '位字符'}`)
    } else if (( props?.data?.mandatory === "Yes") && fieldName === 'last_name'){
       if(event.target.value.length < props?.data?.min_length) {
          return setError(`${language === CONSTANTS.LANG_EN ? errorMsg.minLength + ' ' + props?.data?.min_length + ' characters' : language === CONSTANTS.LANG_CN ? errorMsg.minLength_CN + props?.data?.min_length + '位字符' : errorMsg.minLength_HK + props?.data?.min_length + '位字符'}`)
       }else if(`${event.target.value}`.length === 0){
        return setError(`${language === CONSTANTS.LANG_EN ? errorMsg.surnameRequired : language === CONSTANTS.LANG_CN ? errorMsg.surnameRequired_CN : errorMsg.surnameRequired_HK}`);
       }
       else if(!regexAlphaNumeric.test(event.target.value)) {
        return setError(`${language === CONSTANTS.LANG_EN ? errorMsg.patterns : language === CONSTANTS.LANG_CN ? errorMsg.patterns_CN : errorMsg.patterns_HK}${ props?.data?.rwb_label_name}`);
      }
    } else if (( props?.data?.mandatory === "Yes") && fieldName === 'first_name' ){
      if(event.target.value.length < props?.data?.min_length) {
       return setError(`${language === CONSTANTS.LANG_EN ? errorMsg.minLength + ' ' + props?.data?.min_length + ' characters' : language === CONSTANTS.LANG_CN ? errorMsg.minLength_CN + props?.data?.min_length + '位字符' : errorMsg.minLength_HK + props?.data?.min_length + '位字符'}`)
      }else if(`${event.target.value}`.length === 0){
       return setError(`${language === CONSTANTS.LANG_EN ? errorMsg.givenNameRequired : language === CONSTANTS.LANG_CN ? errorMsg.givenNameRequired_CN : errorMsg.givenNameRequired_HK}`);
      } 
      else if (!regexAlphaNumeric.test(event.target.value)) {
       return setError(`${language === CONSTANTS.LANG_EN ? errorMsg.patterns : language === CONSTANTS.LANG_CN ? errorMsg.patterns_CN : errorMsg.patterns_HK}${ props?.data?.rwb_label_name}`);
      }
    }
    // Promo code validation
    else if(fieldName==="mgm_referral_code"){
      if(!(event.target.value).startsWith("SCB") || !(event.target.value).startsWith("HKR")){
          return setError(`${language===CONSTANTS.LANG_EN?errorMsg.promocodeRequired : language === CONSTANTS.LANG_CN ? errorMsg.promocodeRequired_CN : errorMsg.promocodeRequired_HK}`);
      }else if((event.target.value).includes(' ')){
          return setError(`${language===CONSTANTS.LANG_EN?errorMsg.pleaseDeleteSpace : language === CONSTANTS.LANG_CN ? errorMsg.pleaseDeleteSpace_CN : errorMsg.pleaseDeleteSpace_HK}`);
      }
      else if(fieldName === "mgm_referral_code" && /^[A-Z]\d{7}$/.test(event.target.value)){
        var sum = 0;
          for (var i = 1; i <= 7; i++) {
            sum += parseInt(event.target.value.charAt(i));
          }

          var lookupTable :any = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'J': 9, 'K': 0 };
          

          sum += lookupTable[event.target.value.charAt(0)]; 

          if (sum % 10 !== 0) {
            return setError(`${language===CONSTANTS.LANG_EN?errorMsg.promocodeRequired : language === CONSTANTS.LANG_CN ? errorMsg.promocodeRequired_CN : errorMsg.promocodeRequired_HK}`);
          } else {
            return setError('')
          }
      }

    

    }

    
    else if( props?.data?.logical_field_name === "res_room_flat" && !(event.target.value)){
      setError(`${language===CONSTANTS.LANG_EN?errorMsg.roomRequired : language === CONSTANTS.LANG_CN ? errorMsg.roomRequired_CN : errorMsg.roomRequired_HK}`);
    }

    else if( props?.data?.logical_field_name === "res_room_flat" && (event.target.value)){
      if (!regexAlphaNumeric.test(event.target.value)) {
        setError(`${language===CONSTANTS.LANG_EN?errorMsg.roomRequiredSplChar : language === CONSTANTS.LANG_CN ? errorMsg.roomRequiredSplChar_CN : errorMsg.roomRequiredSplChar_HK}`);
      return 
    }
  }

    else if( props?.data?.logical_field_name === "res_floor" && (event.target.value)){
    if (!regexAlphaNumeric.test(event.target.value)) {
      setError(`${language===CONSTANTS.LANG_EN?errorMsg.floorRequiredSplChar : language === CONSTANTS.LANG_CN ? errorMsg.floorRequiredSplChar_CN : errorMsg.floorRequiredSplChar_HK}`);
    return 
  }
}

else if( props?.data?.logical_field_name === "res_block" && (event.target.value)){
  if (!regexAlphaNumeric.test(event.target.value)) {
    setError(`${language===CONSTANTS.LANG_EN?errorMsg.blockRequiredSplChar : language === CONSTANTS.LANG_CN ? errorMsg.blockRequiredSplChar_CN : errorMsg.blockRequiredSplChar_HK}`);
  return 
}
}

else if( props?.data?.logical_field_name === "res_building_estate_pt" && (event.target.value)){
  if (!regexAlphaNumeric.test(event.target.value)) {
    setError(`${language===CONSTANTS.LANG_EN?errorMsg.buildingEstateSplChar : language === CONSTANTS.LANG_CN ? errorMsg.buildingEstateSplChar_CN : errorMsg.buildingEstateSplChar_HK}`);
  return 
}
}

  else if( props?.data?.logical_field_name === "off_room_flat" && (event.target.value)){
    if (!regexAlphaNumeric.test(event.target.value)) {
      setError(`${language===CONSTANTS.LANG_EN?errorMsg.roomRequiredSplChar : language === CONSTANTS.LANG_CN ? errorMsg.roomRequiredSplChar_CN : errorMsg.roomRequiredSplChar_HK}`);
    return 
  }
}

else if( props?.data?.logical_field_name === "off_floor" && (event.target.value)){
  if (!regexAlphaNumeric.test(event.target.value)) {
    setError(`${language===CONSTANTS.LANG_EN?errorMsg.floorRequiredSplChar : language === CONSTANTS.LANG_CN ? errorMsg.floorRequiredSplChar_CN : errorMsg.floorRequiredSplChar_HK}`);
  return 
}
}

else if( props?.data?.logical_field_name === "off_block" && (event.target.value)){
if (!regexAlphaNumeric.test(event.target.value)) {
  setError(`${language===CONSTANTS.LANG_EN?errorMsg.blockRequiredSplChar : language === CONSTANTS.LANG_CN ? errorMsg.blockRequiredSplChar_CN : errorMsg.blockRequiredSplChar_HK}`);
return 
}
}

else if( props?.data?.logical_field_name === "off_building_estate_pt" && (event.target.value)){
if (!regexAlphaNumeric.test(event.target.value)) {
  setError(`${language===CONSTANTS.LANG_EN?errorMsg.buildingEstateSplChar : language === CONSTANTS.LANG_CN ? errorMsg.buildingEstateSplChar_CN : errorMsg.buildingEstateSplChar_HK}`);
return 
}
}

else if( props?.data?.logical_field_name === "annual_income_pl" && (event.target.value)){
  if (!regexAlphaNumeric.test(event.target.value)) {
    setError(`${language===CONSTANTS.LANG_EN?errorMsg.annualIncomeInvalid : language === CONSTANTS.LANG_CN ? errorMsg.annualIncomeInvalid_CN : errorMsg.annualIncomeInvalid_HK}`);
  return 
  }
  }

  else if( props?.data?.logical_field_name === "name_of_employer" && (event.target.value)){
    if (!regexAlphaNumeric.test(event.target.value)) {
      setError(`${language===CONSTANTS.LANG_EN?errorMsg.companyNameInvalid : language === CONSTANTS.LANG_CN ? errorMsg.companyNameInvalid_CN : errorMsg.companyNameInvalid_HK}`);
    return 
    }
    }

    else if( props?.data?.logical_field_name === "res_building_estate_pt" && !(event.target.value)){
      setError(`${language===CONSTANTS.LANG_EN?errorMsg.buildingEstateRequired : language === CONSTANTS.LANG_CN ? errorMsg.buildingEstateRequired_CN : errorMsg.buildingEstateRequired_HK}`);
    }

    else if( props?.data?.logical_field_name === "off_room_flat" && !(event.target.value)){
      setError(`${language===CONSTANTS.LANG_EN?errorMsg.roomRequired : language === CONSTANTS.LANG_CN ? errorMsg.roomRequired_CN : errorMsg.roomRequired_HK}`);
    }

    else if( props?.data?.logical_field_name === "off_building_estate_pt" && !(event.target.value)){
      setError(`${language===CONSTANTS.LANG_EN?errorMsg.buildingEstateRequired : language === CONSTANTS.LANG_CN ? errorMsg.buildingEstateRequired_CN : errorMsg.buildingEstateRequired_HK}`);
    }

    else if( props?.data?.logical_field_name === "annual_income_pl" && !(event.target.value)){
      setError(`${language===CONSTANTS.LANG_EN?errorMsg.annualIncomePlRequired : language === CONSTANTS.LANG_CN ? errorMsg.annualIncomePlRequired_CN : errorMsg.annualIncomePlRequired_HK}`);
    }

    else if( props?.data?.logical_field_name === "name_of_employer" && !(event.target.value)){
      setError(`${language===CONSTANTS.LANG_EN?errorMsg.nameOfEmpRequired : language === CONSTANTS.LANG_CN ? errorMsg.nameOfEmpRequired_CN : errorMsg.nameOfEmpRequired_HK}`);
    }
    else if( props?.data?.logical_field_name === "name_of_related_person"){
      
      if(event.target.value.length < props?.data?.min_length) {
        return setError(`${language === CONSTANTS.LANG_EN ? errorMsg.minLength + ' ' + props?.data?.min_length + ' characters' : language === CONSTANTS.LANG_CN ? errorMsg.minLength_CN + props?.data?.min_length + '位字符' : errorMsg.minLength_HK + props?.data?.min_length + '位字符'}`)
       }
       else if(event.target.value.length === 0){
        return setError(`${language === CONSTANTS.LANG_EN ? errorMsg.nameofPersonRequired : language === CONSTANTS.LANG_CN ? errorMsg.nameofPersonRequired_CN : errorMsg.nameofPersonRequired_HK}`);
       }
    }


    else if ( props?.data?.logical_field_name === 'email') {
      //eslint-disable-next-line
      const emailCheck = /^[a-zA-Z0-9_%+\-]+([a-zA-Z0-9_%+\.\-]+)@(?!.*?\.\.)([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})/;
      //eslint-disable-next-line
      const emailDomainCheck = /^[a-zA-Z0-9_%+\-]+([a-zA-Z0-9_%+\.\-]+)@(?!.*?\.\.)([a-zA-Z0-9_\-\.]+)\.(ir|kp|cu|sy|IR|KP|CU|SY|iR|kP|cU|sY|Ir|Kp|Cu|Sy)$/;
      if (!emailCheck.test(event.target.value)) {
        setError(`${language === CONSTANTS.LANG_EN ? errorMsg.patterns : language === CONSTANTS.LANG_CN ? errorMsg.patterns_CN : errorMsg.patterns_HK}${ props?.data?.rwb_label_name}`)
      }
      if (emailDomainCheck.test(event.target.value))
        setError(`${language === CONSTANTS.LANG_EN ? errorMsg.emailDomain : language === CONSTANTS.LANG_CN ? errorMsg.emailDomain_CN : errorMsg.emailDomain_HK}`)
    } else if ((fieldName === "res_name_of_street_1" || fieldName === "res_building_estate_1" || fieldName === "res_room_flat_1" || fieldName === "res_room_flat_3" || fieldName === "res_building_estate_3" || fieldName === "res_name_of_street_3") && (`${event.target.value}`.match(addressChineseRegex))) {
      setError(`${language === CONSTANTS.LANG_EN ? errorMsg.patterns : language === CONSTANTS.LANG_CN ? errorMsg.patterns_CN : errorMsg.patterns_HK}${ props?.data?.rwb_label_name} `)
      // address page chinese field less than 5 character pinyin issue fix
      dispatch(isFieldUpdate(props, event.target.value, props?.data?.logical_field_name));
    } else if (((fieldName === "address_res_1" || fieldName === "address_res_2" || fieldName === "address_res_3" || fieldName === "address_mailing_1" || fieldName === "address_mailing_2" || fieldName === "address_mailing_3" || fieldName === "res_name_of_street_2" || fieldName === "res_building_estate_2" || fieldName === "res_room_flat_2" || fieldName === "res_floor_4" || fieldName === "res_building_estate_4" || fieldName === "res_name_of_street_4" || fieldName === "res_room_flat_4" || fieldName === "res_block_3") && (`${event.target.value}`.match(addressNonChineseRegex))) || (event.target.value.includes('  '))) {
      setError(`${language === CONSTANTS.LANG_EN ? errorMsg.patterns : language === CONSTANTS.LANG_CN ? errorMsg.patterns_CN : errorMsg.patterns_HK}${ props?.data?.rwb_label_name} `)
    } else if (((fieldName === "state_res_1" || fieldName === "state_mailing_1" || fieldName === "city_res_1" || fieldName === "city_mailing_1") && (`${event.target.value}`.match(stateCityPattern))) || (event.target.value.includes('  '))) {
      setError(`${language === CONSTANTS.LANG_EN ? errorMsg.patterns : language === CONSTANTS.LANG_CN ? errorMsg.patterns_CN : errorMsg.patterns_HK}${ props?.data?.rwb_label_name} `)
    // } else if ((fieldName === "state_res_1" || fieldName === "state_mailing_1" || fieldName === "city_res_1" || fieldName === "city_mailing_1") && props?.data?.min_length && `${event.target.value}`.length < props?.data?.min_length) { 
    //   setError(`${language === CONSTANTS.LANG_EN ? errorMsg.patterns : language === CONSTANTS.LANG_CN ? errorMsg.patterns_CN : errorMsg.patterns_HK}${ props?.data?.rwb_label_name} `)
    } else if ( props?.data?.min_length && `${event.target.value}`.length < props?.data?.min_length && (fieldName !== 'user_name_ibk')) {
      if (fieldName === 'email') {
        setError(`${language === CONSTANTS.LANG_EN ? errorMsg.patterns : language === CONSTANTS.LANG_CN ? errorMsg.patterns_CN : errorMsg.patterns_HK}${ props?.data?.rwb_label_name}`)
      } else if ((`${event.target.value}`.length > 0 && `${event.target.value}`.length < props?.data?.min_length && (fieldName !== 'user_name_ibk'))) {
        if((fieldName === "res_name_of_street_1" || fieldName === "res_building_estate_1" || fieldName === "res_room_flat_1" || fieldName === "res_room_flat_3" || fieldName === "res_building_estate_3" || fieldName === "res_name_of_street_3")) {
          setError(`${language === CONSTANTS.LANG_EN ? errorMsg.minLength + ' ' + props?.data?.min_length + ' characters' : language === CONSTANTS.LANG_CN ? errorMsg.minLength_CN + props?.data?.min_length + '位字符' : errorMsg.minLength_HK + props?.data?.min_length + '位字符'}`)
          // address page chinese field less than 5 character pinyin issue fix
          dispatch(isFieldUpdate(props, event.target.value, props?.data?.logical_field_name));
        } else {
          setError(`${language === CONSTANTS.LANG_EN ? errorMsg.minLength + ' ' + props?.data?.min_length + ' characters' : language === CONSTANTS.LANG_CN ? errorMsg.minLength_CN + props?.data?.min_length + '位字符' : errorMsg.minLength_HK + props?.data?.min_length + '位字符'}`)
        }
      }
      if (( props?.data?.mandatory === "Yes" || props?.data?.mandatory === "Conditional") && `${event.target.value}`.length === 0) {
        setError(`${language === CONSTANTS.LANG_EN ? props?.data?.rwb_label_name + ' ' + errorMsg.required_mandatory : language === CONSTANTS.LANG_CN ? errorMsg.required_mandatory_CN + props?.data?.rwb_label_name : errorMsg.required_mandatory_HK + props?.data?.rwb_label_name}`);
      }
    }
    else {
      setError((!event.target.validity.valid && (fieldName !== 'user_name_ibk')) ? (`${language === CONSTANTS.LANG_EN ? errorMsg.patterns : language === CONSTANTS.LANG_CN ? errorMsg.patterns_CN : errorMsg.patterns_HK}${ props?.data?.rwb_label_name}`) : '');
    }
    if (stageSelector?.[0].stageId === CONSTANTS.STAGE_NAMES.AD_3) {
      if (fieldName === 'user_name_ibk') {
        if (event.target.value.length > 0) {
          if ( props?.data?.min_length && `${event.target.value}`.length < props?.data?.min_length) {
            setValidationCheckListFn(CONSTANTS.VALIDATION_NAME.LENGTH_CHECK, CONSTANTS.LOV_DATA.NO)
            // setError(`${language === CONSTANTS.LANG_EN ? errorMsg.minLength + ' ' + props?.data?.min_length + ' characters' : language === CONSTANTS.LANG_CN ? errorMsg.minLength_CN + props?.data?.min_length + '位字符' : errorMsg.minLength_HK + props?.data?.min_length + '位字符'}`)
          } else {
            setValidationCheckListFn(CONSTANTS.VALIDATION_NAME.LENGTH_CHECK, CONSTANTS.LOV_DATA.YES)
          }
          if (regexAlphaNumeric.test(event.target.value)) {
            setValidationCheckListFn(CONSTANTS.VALIDATION_NAME.CHARACTER_CHECK, CONSTANTS.LOV_DATA.YES)
            setValidationCheckListFn(CONSTANTS.VALIDATION_NAME.NO_SPECIAL_CHARACTER_CHECK, CONSTANTS.LOV_DATA.YES)
          } else if (!(regexAlphaNumeric.test(event.target.value))) {
            // setValidationCheckListFn(CONSTANTS.VALIDATION_NAME.CHARACTER_CHECK, CONSTANTS.LOV_DATA.NO)
            // setError(`${language === CONSTANTS.LANG_EN ? errorMsg.patterns : language === CONSTANTS.LANG_CN ? errorMsg.patterns_CN : errorMsg.patterns_HK}${ props?.data?.rwb_label_name} `)
            setValidationCheckListFn(CONSTANTS.VALIDATION_NAME.NO_SPECIAL_CHARACTER_CHECK, CONSTANTS.LOV_DATA.NO)
          }
          if (user_names.includes((event.target.value).toLowerCase())) {
            // setError(`${language === CONSTANTS.LANG_EN ? errorMsg.patterns : language === CONSTANTS.LANG_CN ? errorMsg.patterns_CN : errorMsg.patterns_HK}${ props?.data?.rwb_label_name} `)
            setValidationCheckListFn(CONSTANTS.VALIDATION_NAME.FORBIDDEN_CHECK, CONSTANTS.LOV_DATA.NO)
          } else {
            setValidationCheckListFn(CONSTANTS.VALIDATION_NAME.FORBIDDEN_CHECK, CONSTANTS.LOV_DATA.YES)
          }
        } else {
          setValidationCheckListFn(CONSTANTS.VALIDATION_NAME.LENGTH_CHECK, CONSTANTS.NONE)
          setValidationCheckListFn(CONSTANTS.VALIDATION_NAME.NO_SPECIAL_CHARACTER_CHECK, CONSTANTS.NONE)
          setValidationCheckListFn(CONSTANTS.VALIDATION_NAME.CHARACTER_CHECK, CONSTANTS.NONE)
          setValidationCheckListFn(CONSTANTS.VALIDATION_NAME.FORBIDDEN_CHECK, CONSTANTS.NONE)
        }
      }
    }

    // tax info country as HK text box logic
    if(stageSelector?.[0].stageId === CONSTANTS.STAGE_NAMES.AD_1) {
      if (fieldName === 'tax_id_no' || fieldName === 'tax_id_no_1' || fieldName === 'tax_id_no_2' || fieldName === 'tax_id_no_3' || fieldName === 'tax_id_no_4') {
        if (( props?.data?.mandatory === "Yes" || props?.data?.mandatory === "Conditional") && `${event.target.value}`.length === 0) {
          setError(`${language === CONSTANTS.LANG_EN ? props?.data?.rwb_label_name + ' ' + errorMsg.required_mandatory : language === CONSTANTS.LANG_CN ? errorMsg.required_mandatory_CN + props?.data?.rwb_label_name : errorMsg.required_mandatory_HK + props?.data?.rwb_label_name}`);
        } else if(fieldName !== 'tax_id_no') {
          for(let i=1;i<=4;i++){
            if (taxIDValue === CONSTANTS.LOV_DATA.HONG_KONG) {
              const taxInfoRegex = new RegExp("^[A-Z]{1}[A-Z]?[0-9]{6,7}[0-9A]{1}$");
              if((`${event.target.value}`.match(taxInfoRegex))) {
                const tax_id_value = event.target.value;
                setDefaultValue(tax_id_value);
                dispatch(
                isFieldUpdate(props, tax_id_value, props?.data?.logical_field_name)
                );
                props.handleCallback(props.data, tax_id_value);
              } else {
                setError(`${language === CONSTANTS.LANG_EN ? errorMsg.patterns : language === CONSTANTS.LANG_CN ? errorMsg.patterns_CN : errorMsg.patterns_HK}${ props?.data?.rwb_label_name}`);
                return true;
              }
            } else if (taxIDValue !== CONSTANTS.LOV_DATA.HONG_KONG || taxIDValue !== CONSTANTS.LOV_DATA.CHINESE_MAINLAND) {
              const tax_id_value = event.target.value;
              setDefaultValue(tax_id_value);
              dispatch(
                isFieldUpdate(props, tax_id_value, props?.data?.logical_field_name)
              );
              props.handleCallback(props.data, tax_id_value);
              setError('')
            }
          }
        } else {
          if (taxIDValue === CONSTANTS.LOV_DATA.HONG_KONG) {
            const taxInfoRegex = new RegExp("^[A-Z]{1}[A-Z]?[0-9]{6,7}[0-9A]{1}$");
            if((`${event.target.value}`.match(taxInfoRegex))) {
              const tax_id_value = event.target.value;
              setDefaultValue(tax_id_value);
              dispatch(
              isFieldUpdate(props, tax_id_value, props?.data?.logical_field_name)
              );
              props.handleCallback(props.data, tax_id_value);
            } else {
              setError(`${language === CONSTANTS.LANG_EN ? errorMsg.patterns : language === CONSTANTS.LANG_CN ? errorMsg.patterns_CN : errorMsg.patterns_HK}${ props?.data?.rwb_label_name}`);
              return true;
            }
          } else if ((taxIDValue !== CONSTANTS.LOV_DATA.HONG_KONG || taxIDValue !== CONSTANTS.LOV_DATA.CHINESE_MAINLAND)) {
            const tax_id_value = event.target.value;
            setDefaultValue(tax_id_value);
            dispatch(
              isFieldUpdate(props, tax_id_value, props?.data?.logical_field_name)
            );
            props.handleCallback(props.data, tax_id_value);
            setError('')
          }
        }
      }
    }
    else if( props?.data?.logical_field_name === "annual_income_pl") {
      if((Number(event.target.value) === 0)){
        setError(`${language === CONSTANTS.LANG_EN ? errorMsg.annualIncomePlValid : language === CONSTANTS.LANG_CN ? errorMsg.annualIncomePlValid_CN : errorMsg.annualIncomePlValid_HK}`);
      }
      if(!(Number(event.target.value) >= 96000)){
        setError(`${language === CONSTANTS.LANG_EN ? errorMsg.annualIncomePl : language === CONSTANTS.LANG_CN ? errorMsg.annualIncomePl_CN : errorMsg.annualIncomePl_HK}`);
      }
    }
    else {
      setError(!event.target.validity.valid ? (`${language === CONSTANTS.LANG_EN ? errorMsg.patterns : language === CONSTANTS.LANG_CN ? errorMsg.patterns_CN : errorMsg.patterns_HK}${ props?.data?.rwb_label_name}`) : '');
    }
  };

  const setValidationCheckListFn = (type: string, payload: string) => {
    //dispatch(ibnkAction.validationReducer({ type, payload }))
  }

  useEffect(() => {

    if (
      stageSelector &&
      stageSelector?.[0] &&
      stageSelector?.[0].stageInfo &&
      stageSelector?.[0].stageInfo.applicants &&
      stageSelector?.[0].stageInfo.applicants[0]
    ) {
      if (
        stageSelector?.[0].stageInfo.applicants.length>0 && stageSelector?.[0].stageInfo.applicants[0][
        props?.data?.logical_field_name
        ]
      ) {
        let fieldName = props?.data?.logical_field_name;
        let addressFields = (fieldName !== "postal_code_1" || fieldName !== "postal_code_2" /*|| fieldName === "state_res_1" || fieldName === "state_mailing_1" || fieldName === "city_res_1" || fieldName === "city_mailing_1"*/);
        // let displayValue = addressFields && stageSelector?.[0].stageInfo.applicants[0][ props?.data?.logical_field_name].includes('  ')?
        // stageSelector[0].stageInfo.applicants[0][ props?.data?.logical_field_name].replace(/\s\s+/g, ' ').trim() : 
        // stageSelector[0].stageInfo.applicants[0][ props?.data?.logical_field_name];
        let displayValue = addressFields && userInputSelector?.applicants[0][ props?.data?.logical_field_name]?.includes('  ')?
        userInputSelector?.applicants[0][ props?.data?.logical_field_name].replace(/\s\s+/g, ' ').trim() : 
        userInputSelector?.applicants[0][ props?.data?.logical_field_name];
        setDefaultValue(displayValue);
        dispatch(isFieldUpdate(props, displayValue, props?.data?.logical_field_name));
        props.handleCallback(props.data, displayValue);
        setDefaultValue(stageSelector?.[0].stageInfo.applicants[0][ props?.data?.logical_field_name]);
        dispatch(isFieldUpdate(props, stageSelector?.[0].stageInfo.applicants[0][ props?.data?.logical_field_name], props?.data?.logical_field_name));
        props.handleCallback(props.data, stageSelector?.[0].stageInfo.applicants[0][ props?.data?.logical_field_name]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // debugger;
    if(userInputSelector?.applicants?.[0]){
    Object.keys(userInputSelector?.applicants?.[0]).map((key: any) => {
      return props?.data?.logical_field_name === key ? setDefaultValue(userInputSelector?.applicants?.[0][ props?.data?.logical_field_name]?.replace(/\s\s+/g, ' ').trim()) : userInputSelector?.applicants[0][ props?.data?.logical_field_name]
    });
  }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinyinToggleSelector]);

  const bindHandler = (
    fieldName: string,
    event: React.FocusEvent<HTMLInputElement>
  ) => {
    const fieldValue = event.target.value;
    if(fieldName==="last_name" && fieldValue===""){
      setError(`${language === CONSTANTS.LANG_EN ? errorMsg.surnameRequired : language === CONSTANTS.LANG_CN ? errorMsg.surnameRequired_CN : errorMsg.surnameRequired_HK}`);
    }

    if(fieldName==="res_room_flat" && fieldValue===""){
      setError(`${language === CONSTANTS.LANG_EN ? errorMsg.roomRequired + ` "1202"` : language === CONSTANTS.LANG_CN ? errorMsg.roomRequired_CN + ` "1202"` : errorMsg.roomRequired_HK + ` "1202"`}`);
    }

    if(fieldName==="res_building_estate_pt" && fieldValue===""){
      setError(`${language === CONSTANTS.LANG_EN ? errorMsg.buildingEstateRequired : language === CONSTANTS.LANG_CN ? errorMsg.buildingEstateRequired_CN : errorMsg.buildingEstateRequired_HK}`);
    }

    if(fieldName==="off_room_flat" && fieldValue===""){
      setError(`${language === CONSTANTS.LANG_EN ? errorMsg.roomRequired + ` "1202"` : language === CONSTANTS.LANG_CN ? errorMsg.roomRequired_CN + ` "1202"` : errorMsg.roomRequired_HK + ` "1202"`}`);
    }

    if(fieldName==="off_building_estate_pt" && fieldValue===""){
      setError(`${language === CONSTANTS.LANG_EN ? errorMsg.buildingEstateRequired : language === CONSTANTS.LANG_CN ? errorMsg.buildingEstateRequired_CN : errorMsg.buildingEstateRequired_HK}`);
    }

    if(fieldName==="annual_income_pl" && fieldValue===""){
      setError(`${language === CONSTANTS.LANG_EN ? errorMsg.annualIncomePlRequired : language === CONSTANTS.LANG_CN ? errorMsg.annualIncomePlRequired_CN : errorMsg.annualIncomePlRequired_HK}`);
    }

    if(fieldName==="name_of_employer" && fieldValue===""){
      setError(`${language === CONSTANTS.LANG_EN ? errorMsg.nameOfEmpRequired : language === CONSTANTS.LANG_CN ? errorMsg.nameOfEmpRequired_CN : errorMsg.nameOfEmpRequired_HK}`);
    }


    else if(fieldName==="first_name" && fieldValue===""){
      setError(`${language === CONSTANTS.LANG_EN ? errorMsg.givenNameRequired : language === CONSTANTS.LANG_CN ? errorMsg.givenNameRequired_CN : errorMsg.givenNameRequired_HK}`);
    }
    else if(fieldName==="related_party" && fieldValue===""){
      setError(`${language === CONSTANTS.LANG_EN ? errorMsg.givenNameRequired : language === CONSTANTS.LANG_CN ? errorMsg.givenNameRequired_CN : errorMsg.givenNameRequired_HK}`);
    }
    // else if( props?.data?.logical_field_name === "mgm_referral_code" && !(event.target.value).startsWith("SCB")){
    //   setError(`${language===CONSTANTS.LANG_EN?errorMsg.promocodeRequired : language === CONSTANTS.LANG_CN ? errorMsg.promocodeRequired_CN : errorMsg.promocodeRequired_HK}`);
    // }
    if (event.target.validity.valid) {
      props.handleCallback(props.data, event.target.value);
      dispatch(isFieldValueUpdate(props, stageSelector, fieldValue));
      dispatch(isFieldUpdate(props, fieldValue, fieldName));
    }
    let trimmedValue = event.target.value.trimStart();
    if( fieldName === "full_name" || fieldName === "full_name_chinese" || stageSelector?.[0].stageId === CONSTANTS.STAGE_NAMES.BD_5){
    setDefaultValue(trimmedValue.replace(/\s\s+/g, ' ').trimEnd());
    //show error message more than one empty space
    if((fieldName==="state_res_1" || fieldName==="city_res_1" || fieldName === "state_mailing_1" || fieldName === "city_mailing_1")){
      if (`${event.target.value.replace(/\s\s+/g, ' ').trimEnd()}`.match(stateCityPattern)) {
        setError(`${language === CONSTANTS.LANG_EN ? errorMsg.patterns : language === CONSTANTS.LANG_CN ? errorMsg.patterns_CN : errorMsg.patterns_HK}${ props?.data?.rwb_label_name}`);
      } else {
        if(event.target.validity.valid){
          setError('');
        }
      }
    }
    if (fieldName === "res_name_of_street_1" || fieldName === "res_building_estate_1" || fieldName === "res_room_flat_1" || fieldName === "res_room_flat_3" || fieldName === "res_building_estate_3" || fieldName === "res_name_of_street_3") {
      if (`${event.target.value.replace(/\s\s+/g, ' ').trimEnd()}`.match(addressChineseRegex)) {
        setError(`${language === CONSTANTS.LANG_EN ? errorMsg.patterns : language === CONSTANTS.LANG_CN ? errorMsg.patterns_CN : errorMsg.patterns_HK}${ props?.data?.rwb_label_name}`);
      } else {
        setError('');
      }
     }
     if (fieldName === "address_res_1" || fieldName === "address_res_2" || fieldName === "address_res_3" || fieldName === "address_mailing_1" || fieldName === "address_mailing_2" || fieldName === "address_mailing_3" || fieldName === "res_name_of_street_2" || fieldName === "res_building_estate_2" || fieldName === "res_room_flat_2" || fieldName === "res_floor_4" || fieldName === "res_building_estate_4" || fieldName === "res_name_of_street_4" || fieldName === "res_room_flat_4" || fieldName === "res_block_3") {
      if (`${event.target.value.replace(/\s\s+/g, ' ').trimEnd()}`.match(addressNonChineseRegex)) {
        setError(`${language === CONSTANTS.LANG_EN ? errorMsg.patterns : language === CONSTANTS.LANG_CN ? errorMsg.patterns_CN : errorMsg.patterns_HK}${ props?.data?.rwb_label_name}`);
      } else {
        setError('');
      }
    }
  }
   // Promo code validation
   else if(fieldName==="mgm_referral_code"){
    if(!(event.target.value).startsWith("SCB") || !(event.target.value).startsWith("HKR")){
         setError(`${language===CONSTANTS.LANG_EN?errorMsg.promocodeRequired : language === CONSTANTS.LANG_CN ? errorMsg.promocodeRequired_CN : errorMsg.promocodeRequired_HK}`);
    }else if((event.target.value).includes(' ')){
         setError(`${language===CONSTANTS.LANG_EN?errorMsg.pleaseDeleteSpace : language === CONSTANTS.LANG_CN ? errorMsg.pleaseDeleteSpace_CN : errorMsg.pleaseDeleteSpace_HK}`);
    }
    else if(fieldName==="mgm_referral_code" && /^[A-Z]\d{7}$/.test(event.target.value)){
      var sum = 0;
        for (var i = 1; i <= 7; i++) {
          sum += parseInt(event.target.value.charAt(i));
        }

        var lookupTable :any = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'J': 9, 'K': 0 };
        

        sum += lookupTable[event.target.value.charAt(0)]; 

        if (sum % 10 !== 0) {
           setError(`${language===CONSTANTS.LANG_EN?errorMsg.promocodeRequired : language === CONSTANTS.LANG_CN ? errorMsg.promocodeRequired_CN : errorMsg.promocodeRequired_HK}`);
        } else {
           setError('')
        }
    }
  }

  };

  useEffect(() => {
    // let fieldName = props?.data?.logical_field_name;
    if (fieldError(fieldErrorSelector, props)) {
      if ( props?.data?.logical_field_name === 'china_id_number' || props?.data?.logical_field_name === 'full_name_chinese') {
        setError('')
      } else {
        setError(`${language === CONSTANTS.LANG_EN ? errorMsg.patterns : language === CONSTANTS.LANG_CN ? errorMsg.patterns_CN : errorMsg.patterns_HK}${ props?.data?.rwb_label_name}`);
      }
    } else {
      setError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldErrorSelector]);

  useEffect(() => {
    let fieldName = props?.data?.logical_field_name;
    if((fieldName === "address_res_1" || fieldName === "address_res_2" || fieldName === "address_res_3" || fieldName === "address_mailing_1" || fieldName === "address_mailing_2" || fieldName === "address_mailing_3" || fieldName === "res_name_of_street_2" || fieldName === "res_building_estate_2" || fieldName === "res_room_flat_2" || fieldName === "res_floor_4" || fieldName === "res_building_estate_4" || fieldName === "res_name_of_street_4" || fieldName === "res_room_flat_4" || fieldName === "res_block_3") && error !== ""){
    // if(stageSelector[0].stageId === CONSTANTS.STAGE_NAMES.BD_5){
    //   if( props?.data?.logical_field_name && error !== "")
      dispatch(ContinueBtnAction.getContinueEnableState(false));
    } else if (error === "") {
      dispatch(ContinueBtnAction.getContinueEnableState(true));
    } else {
      dispatch(ContinueBtnAction.getContinueEnableState(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps  
  }, [error, dispatch])

  useEffect(() => {
    if ( props?.data?.logical_field_name === 'full_name') {
      setPlaceHolder(language === CONSTANTS.LANG_EN ? 'e.g. For 陈大文, please input CHEN DAWEN. For 张三, please input ZHANG SAN.' : language === CONSTANTS.LANG_CN ? '例：如陈大文，请填写CHEN DAWEN。如张三，则填写ZHANG SAN。' : '例：如陳大文，請填寫CHEN DAWEN。如張三，請填寫ZHANG SAN。')
    } else if ( props?.data?.logical_field_name === 'email') {
      setPlaceHolder('jackiechan@gmail.com')
    } else if ( props?.data?.logical_field_name === 'financial_institution_1') {
      setPlaceHolder(language === CONSTANTS.LANG_EN ? 'Please Input the Name of Your Financial Institution' : language === CONSTANTS.LANG_CN ? '请输入代理交易之金融机构' : '請輸入代理交易之金融機構')
    } /*else if ( props?.data?.logical_field_name === 'china_id_number') {
      setPlaceHolder('')
    }*/ else if ( props?.data?.logical_field_name === 'full_name_chinese') {
      let chineslabel = props?.data?.rwb_label_name.split("(");
      setPlaceHolder(chineslabel[0].trimEnd())
    } else if ( props?.data?.logical_field_name === "res_name_of_street_1" || props?.data?.logical_field_name === "res_building_estate_1" || props?.data?.logical_field_name === "res_room_flat_1" || props?.data?.logical_field_name === "res_room_flat_3" || props?.data?.logical_field_name === "res_building_estate_3" || props?.data?.logical_field_name === "res_name_of_street_3" || props?.data?.logical_field_name === "address_res_1" || props?.data?.logical_field_name === "address_res_2" || props?.data?.logical_field_name === "address_res_3" || props?.data?.logical_field_name === "address_mailing_1" || props?.data?.logical_field_name === "address_mailing_2" || props?.data?.logical_field_name === "address_mailing_3" || props?.data?.logical_field_name === "res_name_of_street_2" || props?.data?.logical_field_name === "res_building_estate_2" || props?.data?.logical_field_name === "res_room_flat_2" || props?.data?.logical_field_name === "res_floor_4" || props?.data?.logical_field_name === "res_building_estate_4" || props?.data?.logical_field_name === "res_name_of_street_4" || props?.data?.logical_field_name === "res_room_flat_4" || props?.data?.logical_field_name === "res_block_3" || props?.data?.logical_field_name === "state_res_1" || props?.data?.logical_field_name === "state_mailing_1" || props?.data?.logical_field_name === "city_res_1" || props?.data?.logical_field_name === "city_mailing_1" || props?.data?.logical_field_name === "postal_code_2" || props?.data?.logical_field_name === "postal_code_1" || props?.data?.logical_field_name === "pincode_res" || props?.data?.logical_field_name === "pincode_mailing") {
      setPlaceHolder(language === CONSTANTS.LANG_EN ? errorMsg.emity + props?.data?.rwb_label_name : language === CONSTANTS.LANG_CN ? errorMsg.emity_CN + props?.data?.rwb_label_name : errorMsg.emity_HK + props?.data?.rwb_label_name)
    }
    // else if ( props?.data?.logical_field_name === 'user_name_ibk') {
    //   setPlaceHolder('')
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps  
  }, [])

  const updateTaxIDNO = (country_logical_fieldname: string, tax_logical_fieldname: string) => {
    if (
      props?.data?.logical_field_name === tax_logical_fieldname &&
      stageSelector &&
      stageSelector?.[0] &&
      stageSelector?.[0].stageInfo &&
      stageSelector?.[0].stageInfo.applicants[0]
    ) {
      setError("");
      let tax_id_value =
        stageSelector?.[0].stageInfo.applicants[0][
        `${ props?.data?.logical_field_name}`
        ];
      if (userInputSelector?.applicants[0][country_logical_fieldname] === CONSTANTS.LOV_DATA.CHINESE_MAINLAND) {
        tax_id_value = stageSelector?.[0].stageInfo.applicants[0][CONSTANTS.LOGICAL_FIELD_NAMES.CHINA_ID_NUMBER];
        setTextDisabled(true)
        setDefaultValue(tax_id_value ? tax_id_value : "");
        dispatch(
          isFieldUpdate(props, tax_id_value, props?.data?.logical_field_name)
        );
        props.handleCallback(props.data, tax_id_value);
      } else {
        setTaxIDValue(userInputSelector?.applicants[0][country_logical_fieldname])
      }
    }
  }
  useEffect(() => {
    if (stageSelector?.[0].stageId === CONSTANTS.STAGE_NAMES.AD_1) {
      updateTaxIDNO('country_of_tax_residence', CONSTANTS.LOGICAL_FIELD_NAMES.TAX_ID_NO)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInputSelector?.applicants[0].country_of_tax_residence]);

  useEffect(() => {
    if (stageSelector?.[0].stageId === CONSTANTS.STAGE_NAMES.AD_1) {
      updateTaxIDNO('country_of_tax_residence_1', CONSTANTS.LOGICAL_FIELD_NAMES.TAX_ID_NO + '_1')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInputSelector?.applicants[0].country_of_tax_residence_1]);

  useEffect(() => {
    if (stageSelector?.[0].stageId === CONSTANTS.STAGE_NAMES.AD_1) {
      updateTaxIDNO('country_of_tax_residence_2', CONSTANTS.LOGICAL_FIELD_NAMES.TAX_ID_NO + '_2')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInputSelector?.applicants[0].country_of_tax_residence_2]);

  useEffect(() => {
    if (stageSelector?.[0].stageId === CONSTANTS.STAGE_NAMES.AD_1) {
      updateTaxIDNO('country_of_tax_residence_3', CONSTANTS.LOGICAL_FIELD_NAMES.TAX_ID_NO + '_3')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInputSelector?.applicants[0].country_of_tax_residence_3]);

  useEffect(() => {
    if (stageSelector?.[0].stageId === CONSTANTS.STAGE_NAMES.AD_1) {
      updateTaxIDNO('country_of_tax_residence_4', CONSTANTS.LOGICAL_FIELD_NAMES.TAX_ID_NO + '_4')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInputSelector?.applicants[0].country_of_tax_residence_4]);

  useEffect(() => {
    if (stageSelector?.[0].stageId === CONSTANTS.STAGE_NAMES.AD_1) {
      if (
        userInputSelector?.applicants[0].country_of_tax_residence !== CONSTANTS.LOV_DATA.CHINESE_MAINLAND &&
        userInputSelector?.applicants[0].country_of_tax_residence_1 !== CONSTANTS.LOV_DATA.CHINESE_MAINLAND &&
        userInputSelector?.applicants[0].country_of_tax_residence_2 !== CONSTANTS.LOV_DATA.CHINESE_MAINLAND &&
        userInputSelector?.applicants[0].country_of_tax_residence_3 !== CONSTANTS.LOV_DATA.CHINESE_MAINLAND &&
        userInputSelector?.applicants[0].country_of_tax_residence_4 !== CONSTANTS.LOV_DATA.CHINESE_MAINLAND
      ) {
        setTextDisabled(false);
      }
    }
    if(props?.data?.logical_field_name === 'currency_pl') {
      setTextDisabled(true);
      props.handleCallback(props.data, defaultValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageSelector, userInputSelector?.applicants[0].country_of_tax_residence, userInputSelector?.applicants[0].country_of_tax_residence_1, userInputSelector?.applicants[0].country_of_tax_residence_2, userInputSelector?.applicants[0].country_of_tax_residence_3, userInputSelector?.applicants[0].country_of_tax_residence_4
  ])

  // const isAllChecksPassed = () => {
  //   let isvalidated = true
  //   Object.entries(validationCheckList).map((value: Array<string>) => {
  //     if (value[1] === CONSTANTS.LOV_DATA.NO) {
  //       isvalidated = false
  //     }
  //     return true
  //   })
  //   return isvalidated
  // }

  // const ValidationList = () => {
  //   return (
  //     <div className="validation-check-list">
  //       {
  //         Object.entries(validationCheckList).map((value: Array<string>, ind: number) => {
  //           return <p key={ind}>
  //             <i className={value[1] === 'Y' ? "icon accepted" : value[1] === 'N' ? "icon rejected" : "icon"}></i>
  //             {Object.entries(language === CONSTANTS.LANG_EN ? validationMsg.EN : language === CONSTANTS.LANG_CN ? validationMsg.CN : validationMsg.HK).map((val: Array<String>) => {
  //               if (val[0] === value[0])
  //                 return val[1]
  //               else
  //                 return ''
  //             })}
  //           </p>
  //         })
  //       }
  //     </div >
  //   )
  // }

  // const onFocusHandler = () => {
  //   setShowUserNameValid(true)

  // }
  const noPlaceholder = props?.data?.logical_field_name === "tax_id_no" || props?.data?.logical_field_name === "tax_id_no_1" || props?.data?.logical_field_name === "tax_id_no_2"
    || props?.data?.logical_field_name === "tax_id_no_3" || props?.data?.logical_field_name === "tax_id_no_4" || props?.data?.logical_field_name === "first_name" || props?.data?.logical_field_name === "last_name" || props?.data?.logical_field_name === "mgm_referral_code";

    const focusHandler = (fieldName: string, event: React.FocusEvent<HTMLInputElement>) => {
      setShowUserNameValid(true)
      dispatch(lastAction.getField(fieldName));
    };

    let statecityPattern = props?.data?.logical_field_name==="state_res_1" || props?.data?.logical_field_name==="city_res_1" || props?.data?.logical_field_name === "state_mailing_1" || props?.data?.logical_field_name === "city_mailing_1" ;

  // const closePopup = () => {
  //   setShowPopup(false);
  // }
  const getMarkup = (desc: string) => {
    return {
      __html: `
          ${desc}
        `,
    };
  }
  debugger;
  return (
    <>
      <div className={props?.data?.component_type=='short-text'?'shorttext tooltip':'text tooltip'} style={{width: textDisabled ? "25%" : ''}}>
        <label htmlFor={props?.data?.logical_field_name}>
          {(!textDisabled && defaultValue && !error) && <div className="tick-class"></div>}
          {props?.data?.logical_field_name == "currency_pl" ?<span></span>: <span style={(!textDisabled && defaultValue && !error)?{marginLeft: "2em"}:{marginLeft:'0'}}>
          {props?.data?.rwb_label_name} </span>}
        </label>
        <input
          title="test_field_input"
          data-testid="input_field"
          type={props?.data?.type}
          name={ props?.data?.logical_field_name}
          aria-label={ props?.data?.logical_field_name}
          id={fieldIdAppend(props)}
          placeholder={noPlaceholder ? "" : placeholder}
          value={defaultValue}
          minLength={ props?.data?.min_length}
          maxLength={ props?.data?.length}
          pattern={ props?.data?.regex ? statecityPattern ? validationPatterns() : props?.data?.regex : validationPatterns()}
          // pattern={ props?.data?.regex ? props?.data?.regex : undefined}
          onChange={changeHandler.bind(this, props?.data?.logical_field_name)}
          onBlur={bindHandler.bind(this, props?.data?.logical_field_name)}
          disabled={ props?.data?.editable ? props?.data?.editable : textDisabled}
          // onFocus={onFocusHandler}
          onFocus={focusHandler.bind(this, props?.data?.logical_field_name)}
          className={error && 'input-error '}
          autoComplete="off"
        />

{/* <span className="infoTipClass">
          {(showPopup) &&
          <InfoTooltips infoTooltips={
            language === CONSTANTS.LANG_EN ? props?.data?.info_tooltips === "Yes" ? props?.data?.details : "":null

          } />
          }
        </span> */}


         { props?.data?.info_tooltips && props?.data?.info_tooltips !== "" &&
            <span className="tooltiptext" dangerouslySetInnerHTML={getMarkup( props?.data?.info_tooltips === "Yes" ? props?.data?.details : "")}></span>
          }
   
        {/* <span className="infoTipClass">
          {(showPopup) &&
            <Model name='info_tooltips' btnTxt={language === CONSTANTS.LANG_EN ? CONSTANTS.OK : language === CONSTANTS.LANG_CN ? CONSTANTS.OK_CN : CONSTANTS.OK_HK} closePopup={closePopup} body_content={<span dangerouslySetInnerHTML={getMarkup( props?.data?.info_tooltips === "Yes" ? props?.data?.details : "")}></span>}> </Model>
          }
        </span> */}
        {error && (
          <div className="error-msg">
            {error}
          </div>
        )}
      </div>
   </>
  );
};

export default Text;
