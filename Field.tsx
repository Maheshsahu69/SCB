import React, { FormEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./fields.scss";

import renderComponent from "./renderer";
import {
  getLovMissing,
  stageFields,
  getStagePayload,
  stageSelectFields,
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
  dispatchError,
  ibankEncrypt,
  isFormUpdate,
  lovRequests,
} from "../../../services/common-service";
import { stagesAction } from "../../../utils/store/stages-slice";
import { getStageName, pageScrollTop, stateUrl } from "./stage.utils";
import { fieldErrorAction } from "../../../utils/store/field-error-slice";
import { CONSTANTS } from "../../../utils/common/constants";
import { ValueUpdateAction } from "../../../utils/store/value-update-slice";
import ReviewPage from "../review-page/review-page";
import { FindIndex, getUrl } from "../../../utils/common/change.utils";

import {
  assignUpdateUserInput,
  deleteConditionalFieldSelector,
} from "./fields-methods";
import { AxiosError } from "axios";
import { lovDescAction } from "../../../utils/store/lov-desc-slice";
import { errorAction } from "../../../utils/store/error-slice";
import { ContinueBtnAction } from "../../../utils/store/continue-validation-slice";
import trackEvents from "../../../services/track-events";
import { preApprovalAction } from "../../preApproval/store/preApproval-slice";
import {
  getOffer,
  getOffer2,
} from "../../preApproval/services/preApprovalServices";
import {
  postAditionalData,
  postBasicData,
  postFulFilmentData,
  postPdfPreview,
  postSaveData,
} from "../../preApproval/services/preApprovalPostServices";

import Spinner from "../../../shared/components/spinner/spinner";
import Close from "../../../shared/components/close/close";
import FundDisbursement from "../../preApproval/commonComponents/fundDisbursement/fund-disbursement";
import Model from "../../../shared/components/model/model";
import { store } from "../../../utils/store/store";

const Fields = (props: KeyWithAnyModel) => {
  const stageSelector = useSelector((state: StoreModel) => state.stages.stages);
  const lovSelector = useSelector((state: StoreModel) => state.lov);
  const resumeSelector = useSelector(
    (state: StoreModel) => state.urlParam.resume
  );
  const parentChildToggleSelector = useSelector(
    (state: StoreModel) => state.stages.parentChildFields
  );
  const employeeToggleSelector = useSelector(
    (state: StoreModel) => state.stages.natureOfEmployeeField
  );
  const madatoryFieldSelector = useSelector(
    (state: StoreModel) => state.fielderror.mandatoryFields
  );
  const resumeFlag = useSelector((state: StoreModel) => state.stages);
  const applicantsSelector = useSelector(
    (state: StoreModel) => state.stages.userInput.applicants[0]
  );
  const conditionalFieldSelector = useSelector(
    (state: StoreModel) => state.stages.conditionalFields
  );
  const userInputSelector = useSelector(
    (state: StoreModel) => state.stages.userInput
  );
  const currentStageSelector = useSelector(
    (state: StoreModel) => state.stages.currentStage
  );
  const valueSelector = useSelector((state: StoreModel) => state.valueUpdate);
  const applicationJourney = useSelector(
    (state: StoreModel) => state.stages.journeyType
  );
  const continueBtnSelector = useSelector(
    (state: StoreModel) => state.continueBtnSlice.continueEnable
  );
  const currentStage = useSelector(
    (state: StoreModel) => state.preApproval.currentStage
  );
  const formConfigmetaData = useSelector(
    (state: StoreModel) => state.preApproval.formConfigmetaData
  );

  const dispatch = useDispatch();
  const [fields, setFields] = useState<FieldModel>();
  const [userInputs, setUserInputs] = useState<KeyWithAnyModel>({});
  const [stageId, setStageId] = useState<string>(CONSTANTS.STAGE_NAMES.PD_1);
  let currentStageSection: KeyWithAnyModel = {};
  const [isRequiredValid, setRequiredFormValidation] = useState("form-invalid");
  const [isFormValid, setFormValidation] = useState(true);
  const [checkboxStatus, setCheckboxStatus] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const errorSelector = useSelector((state: StoreModel) => state.error);
  const fieldErrorSelector = useSelector(
    (state: StoreModel) => state.fielderror.error
  );
  const language = getUrl.getLanguageInfo("lang");
  const [backText, setBackText] = useState("Continue");
  const [stage, setStage] = useState(0);
  const workType = applicantsSelector.work_type;
  const productType = stageSelector[0].stageInfo?.products[0].product_type;
  const campaign = stageSelector[0].stageInfo?.products[0].campaign;

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
        updateUserInputs[key] = "";
      }
    }

    // if (Object.keys(updateUserInputs).length > 0) {
    let getUsInput = applicantsSelector;
    dispatch(assignUpdateUserInput(getUsInput, updateUserInputs)).then(
      (updateUserInputsResponse: any) => {
        delete updateUserInputs.add_tax_residency;
        setUserInputs(updateUserInputsResponse);
      }
    );
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conditionalFieldSelector]);

  useEffect(() => {
    if (!!currentStageSelector) {
      setStageId(currentStageSelector!);
    }
  }, [currentStageSelector]);

  useEffect(() => {
    if (stageSelector[0]) {
      setStageId(stageSelector[0].stageId);
    }
  }, [stageSelector]);

  useEffect(() => {
    if (stageSelector && stageSelector.length > 0) {
      const stageId =
        stageSelector[0].stageId === CONSTANTS.STAGE_NAMES.LD_1
          ? "ad-11"
          : stageSelector[0].stageId;
      const stageIndex = FindIndex(stageSelector[0].stageInfo, stageId);

      if (
        stageId === "bd-5" &&
        parentChildToggleSelector.selectFields.length > 0
      ) {
        const resultAdd = stageSelector[0].stageInfo.fieldMetaData.data.stages[
          stageIndex
        ].fields.map((res: KeyWithAnyModel) => {
          return {
            ...res,
            default_visibility:
              parentChildToggleSelector.addSelectFields.includes(
                res.logical_field_name
              )
                ? "Yes"
                : "No",
          };
        });
        const resultRemove = resultAdd.map((res: KeyWithAnyModel) => {
          return {
            ...res,
            default_visibility:
              parentChildToggleSelector.deleteSelectFields.includes(
                res.logical_field_name
              ) && res.default_visibility === "Yes"
                ? "No"
                : res.default_visibility,
          };
        });
        dispatch(stagesAction.updateAddressFields(resultRemove));

        setFields(stageSelectFields(stageSelector, stageId, resultRemove));
      } else {
        if (
          stageSelector[0].stageInfo?.fieldMetaData?.data.stages[stageIndex]
        ) {
          dispatch(
            stagesAction.updateAddressFields(
              stageSelector[0].stageInfo.fieldMetaData.data.stages[stageIndex]
                .fields
            )
          );

          setFields(stageFields(stageSelector, stageId));
        }
      }
    }
  }, [
    stageSelector,
    stageId,
    parentChildToggleSelector,
    employeeToggleSelector,
  ]);

  let mandatoryFields: Array<string> = [];
  let value: KeyStringModel = {};

  useEffect(() => {
    if (valueSelector.value !== false) {
      let FieldsIgnore = [
        "client_pl_sc_consent2",
        "client_pl_consent4",
        "client_pl_sc_consent5",
        "client_pl_sc_consent",
        "client_sc_consent_title",
        "client_sc_consent", 
        "client_sc_consent2","sc_tips",
        "sc_tips_pl",
        "name_of_related_person",
        "relationship_of_related_person",
        "total_outstanding_other_loan_amount",
        "total_outstanding_other_monthly_payment",
        "marketing_questionaires",
        "direct_marketing_opt_out",
        "marketing_opt_out",
        "res_floor",
        "res_block",
        "off_floor",
        "off_block","fill_in_note"
      ];

      if (
        workType === "S001" ||
        workType === "S002" ||
        workType === "S006" ||
        workType === "S103"
      ) {
        FieldsIgnore.push("business_est_date");
      }
      if(userInputSelector.applicants[0]['id type']==='Passport'){
        FieldsIgnore.push("HKID");
        mandatoryFields.push('passport_no','country_of_issue','expiry_date');
      } 
      if(userInputSelector.applicants[0].priority_banking ==='Yes' && stageSelector[0].stageId==='ad-5'){
        mandatoryFields.push('rewards_360_indicator');
        FieldsIgnore.push('choice_label','priority_banking');
      }
      if(userInputSelector.applicants[0].priority_banking ==='No' && stageSelector[0].stageId==='ad-5'){
        FieldsIgnore.push('choice_label','priority_banking','rewards_360_indicator');
      } 
      if(userInputSelector.applicants[0]['id type']==='HKID'){
        FieldsIgnore.push("Passport");
      }
      if (fields && fields["fields"] && fields["fields"].length > 0) {
        fields.fields.forEach((res: FieldsetModel) => {
          res.fields.forEach((fName: KeyWithAnyModel) => {
            if (FieldsIgnore.indexOf(fName.logical_field_name) === -1) {
              if (
                fName.mandatory === "Yes" ||
                fName.mandatory === "Conditional"
              ) {
                let logicalFieldVal =
                  stageSelector[0].stageInfo.applicants[0][
                    fName.logical_field_name + "_a_1"
                  ];
                if (!logicalFieldVal) {
                  const fullName =
                    stageSelector[0].stageInfo.applicants[0]["full_name_a_1"];
                  if (fullName && fullName.length >= 19) {
                    const firstName = fullName.split(" ")[0];
                    logicalFieldVal = firstName.length >= 19 ? "" : firstName;
                  } else {
                    logicalFieldVal = fullName;
                  }
                }
                let fieldValue =
                  userInputSelector.applicants[0][fName.logical_field_name];

                if (stageId === CONSTANTS.STAGE_NAMES.AD_2) {
                  value[fName.logical_field_name] = fieldValue
                    ? fieldValue
                    : "";
                  mandatoryFields.push(fName.logical_field_name);
                } else if (stageId === CONSTANTS.STAGE_NAMES.RP) {
                  if (fName.logical_field_name === "acknowledgement_cert") {
                    value[fName.logical_field_name] =
                      fieldValue !== "N" ? fieldValue : "";
                    mandatoryFields.push(fName.logical_field_name);
                  }
                  if (fName.logical_field_name === "client_declaration_cert") {
                    value[fName.logical_field_name] =
                      fieldValue !== "N" ? fieldValue : "";
                    mandatoryFields.push(fName.logical_field_name);
                  }
                }
                else {
                  value[fName.logical_field_name] = fieldValue
                    ? fieldValue
                    : "";
                  mandatoryFields.push(fName.logical_field_name);
                }
              } else {
                if (stageId === CONSTANTS.STAGE_NAMES.BD_1) {
                  const applicants = userInputSelector.applicants[0];
                  const resFloorValue = applicants.res_floor;
                  const resRoomFlatValue = applicants.res_room_flat;
                  const resBlockValue = applicants.res_block;
                  // Add all three back to mandatory if none are filled
                  if (!resFloorValue && !resRoomFlatValue && !resBlockValue) {
                    mandatoryFields = [...mandatoryFields, "res_room_flat"];
                  }
                  else {
                    mandatoryFields = mandatoryFields.filter(
                      (item) => item !== "res_room_flat" && item !== "res_floor" && item !== "res_block"
                    );
                    dispatch(fieldErrorAction.removeToggleFieldError("res_floor"));
                    dispatch(fieldErrorAction.removeToggleFieldError("res_block"));
                  }
                }
                if (stageId === CONSTANTS.STAGE_NAMES.AD_3) {
                  const applicants = userInputSelector.applicants[0];
                  const offFloorValue = applicants.off_floor;
                  const offRoomFlatValue = applicants.off_room_flat;
                  const offBlockValue = applicants.off_block;
                  // Add all three back to mandatory if none are filled

                  if (!offFloorValue && !offRoomFlatValue && !offBlockValue) {
                    mandatoryFields = [...mandatoryFields, "off_room_flat"];
                  }
                  else {
                    mandatoryFields = mandatoryFields.filter(
                      (item) => item !== "off_room_flat" && item !== "off_floor" && item !== "off_block"
                    );
                    dispatch(fieldErrorAction.removeToggleFieldError("off_floor"));
                    dispatch(fieldErrorAction.removeToggleFieldError("off_block"));
                  }
                }
              }
            }
          });
        });
        setUserInputs(value);
        dispatch(fieldErrorAction.getMandatoryFields(null));
        dispatch(fieldErrorAction.getMandatoryFields(mandatoryFields));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields, dispatch, valueSelector.value, stageSelector, userInputSelector]);

  useEffect(() => {
    stateUrl(stageId);
    if (stageId !== "ssf-1" && backText === "Continue") {
      /* Adobe Analytics - users who complete each step in the form journey, when the user lands on an intermediate step (on page load) */
      trackEvents.triggerAdobeEvent("formStepCompletions");
    } else if (backText === "Back") {
      /* Adobe Analytics - for clicks on a CTA */
      trackEvents.triggerAdobeEvent("ctaClick", "Back");
    }
  }, [stageId, backText]);

  useEffect(() => {
    if (errorSelector.submit) {
      dispatch(errorAction.getExceptionList([]));
      submitSuccess();
      dispatch(errorAction.toggleSubmit(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorSelector.submit]);

  const submitSuccess = () => {
    dispatch(
      submitRequest(
        applicantsSelector,
        stageSelector[0],
        valueSelector,
        lovSelector,
        applicationJourney,
        userInputSelector,
        errorSelector,
        resumeFlag
      )
    ).then((stage: string) => {
            if (stage === "pd-1") {
        dispatch(stagesAction.setOtpShow(true));
      }
      // if (stage === "rp") {
      //   console.log('submit review here')
      // }
      else {
        setStageId(stage);
      }
      pageScrollTop();
    });
    trackEvents.triggerAdobeEvent("ctaClick", "Continue");
    if (stageId === CONSTANTS.STAGE_NAMES.RP) {
      /* Adobe Analytics - for when the user completes intermediate stepsin the form and lands on thankyou page */
      trackEvents.triggerAdobeEvent("formSubmit");
    }
  };

  const SetNextStageDetaisAfterSave = (
    Nextstage: string,
    PreviousStage: string
  ) => {
    dispatch(stagesAction.updateStageId(Nextstage));
    setStageId(Nextstage);
    dispatch(lovRequests(stageSelector[0].stageInfo, Nextstage));
    let saveData: any = null;
    if (stageId === CONSTANTS.STAGE_NAMES.BD_1) {
      saveData = postBasicData();
    }
   else if(stageId === CONSTANTS.STAGE_NAMES.AD_7) {
      saveData = dispatch(ibankEncrypt(userInputSelector))
    }
    else {
      saveData = postSaveData();
    }
      saveData.then((res: any) => {
      if (res.status === 200) {
        if(stageId === CONSTANTS.STAGE_NAMES.AD_7){
          setShowSpinner(false);
          let stageData = JSON.parse(
            JSON.stringify(stageSelector[0].stageInfo)
          );
          stageData.applicants[0]["password_a_1"] = "";
          stageData.applicants[0]["securityNonce"] = "";
          stageData.applicants[0]["is_banking_registered_a_1"] = "";
          stageData.applicants[0]["ibankingregDate_a_1"] = "";
          dispatch(
            stagesAction.getStage({
              id: CONSTANTS.STAGE_NAMES.RP,
              formConfig: stageData,
            })
          );
        }
        else {
          let responseType = res.data.application.response_type.toUpperCase();
          let responseAction = res.data.application.response_action.toUpperCase();
          let statusText = "";
          let statusCode = "";
          if (res.data.application.application_status === "E01") {
            statusText = "Technical Error";
            statusCode = "E01";
            dispatch(
              errorAction.getError({
                statusCode: statusCode,
                statusText: statusText,
              })
            );
            setShowSpinner(false);
            let stageData = JSON.parse(
              JSON.stringify(stageSelector[0].stageInfo)
            );
            stageData.application = res.data.application;
            dispatch(
              stagesAction.getStage({
                id: Nextstage,
                formConfig: stageData,
              })
            );
          }
          if (
            responseAction === "SUCCESS" ||
            responseType === "INFO" ||
            (responseType === "SOFT" && responseAction === "CONTINUE")
          ) {
            setShowSpinner(false);
            let stageData = JSON.parse(
              JSON.stringify(stageSelector[0].stageInfo)
            );
            stageData.application = res.data.application;
            stageData.applicants = [res.data.applicants];
            dispatch(
              stagesAction.getStage({
                id: Nextstage,
                formConfig: stageData,
              })
            );
          } else {
            HardStop(res);
          }
        }
      }
    });
  };

  const HardStop = (response: any) => {
    let responseType = response.data.application.response_type.toUpperCase();
    let responseAction =
      response.data.application.response_action.toUpperCase();
    let PreviousStage = stageSelector[0].stageId;
    var errorResp = response.data.application.error;
    let statusText = "";
    let statusCode = "";
    let errorCode=errorResp?.application_error[0]["rtobCode"];
    if (
      errorResp.application_error?.length > 0 ||
      errorResp.applicant_error?.length > 0 ||
      errorResp.product_error?.length > 0
    ) {
      if (
        errorResp.application_error?.length > 0 &&
        errorResp.application_error[0].error_description &&
        errorResp.application_error[0]["error_description"] !== null
      ) {
        statusText = errorResp.application_error[0]["error_description"];
        statusCode = errorResp.application_error[0]["rtobCode"];
      }
      if (
        errorResp.applicant_error?.length > 0 &&
        errorResp.applicant_error[0].error_description &&
        errorResp.applicant_error[0]["error_description"] !== null
      ) {
        statusText = errorResp.applicant_error[0]["error_description"];
        statusCode = errorResp.applicant_error[0]["rtobCode"];
      }
      if (
        errorResp.product_error?.length > 0 &&
        errorResp.product_error[0].error_description &&
        errorResp.product_error[0]["error_description"] !== null
      ) {
        statusText = errorResp.product_error[0]["error_description"];
        statusCode = errorResp.product_error[0]["rtobCode"];
      }
    }
    if (
      responseType === "HARD" &&
      (responseAction === "STOP" || responseAction === "RESUBMIT")
    ) {
      setShowSpinner(false);
      if (responseAction === "STOP") {
        if(errorCode==="A55"){
          responseAction = "DECLINERLS";
        }else{
          responseAction = "DECLINE";
        }
      }
      else if (responseAction === 'RESUBMIT') {
        if(errorCode ==="A20" || errorCode ==="A26"){
          responseAction="ErrorCode";
          statusCode=errorCode;
        }else{
          responseAction="RESUBMIT";
        }
      }
      dispatch(stagesAction.updateStageId(PreviousStage));
      dispatch(
        errorAction.getExceptionList([
          {
            statusCode: statusCode,
            statusText: statusText,
            responseAction,
            responseType,
          },
        ])
      );
    }
    if (responseType === "HARD" && responseAction === "CORRECT RESUBMIT") {
      setShowSpinner(false);
      dispatch(stagesAction.updateStageId(PreviousStage));
      dispatch(
        errorAction.getExceptionList([
          {
            statusCode: statusCode,
            statusText: statusText,
            responseAction,
            responseType,
          },
        ])
      );
    }
  };
  const handleSubmit = (event: React.FormEvent<EventTarget>): void => {
        setBackText("Continue");

    madatoryFieldSelector.forEach((data: string) => {
      if (userInputs[data]) {
        delete userInputs[data];
        delete userInputs["first_name"];
        delete userInputs["marketing_tooltip"];
        delete userInputs["estatement_tooltip"];
      }
    });

    if (Object.keys(userInputs).length >= 0) {
      dispatch(
        userInputPayload(
          getStagePayload(stageSelector, applicantsSelector),
          stageSelector
        )
      );
      dispatch(
        userInputPayload(userInputSelector.applicants[0], stageSelector)
      );
      dispatch(stagesAction.resetNewAndOldFields());
      setShowSpinner(true);
      if (stageId === CONSTANTS.STAGE_NAMES.PD_1) {
        dispatch(stagesAction.setOtpShow(true));
        if (continueBtnSelector === true) {
          dispatch(stagesAction.setOtpShow(true));
        }       
      } else if (stageId === CONSTANTS.STAGE_NAMES.BD_1A && applicationJourney === "ETC") { 
        SetNextStageDetaisAfterSave(
          CONSTANTS.STAGE_NAMES.AD_1A,
          CONSTANTS.STAGE_NAMES.BD_1A
        );
      } else if (stageId === CONSTANTS.STAGE_NAMES.BD_1A) {
        SetNextStageDetaisAfterSave(
          CONSTANTS.STAGE_NAMES.BD_1,
          CONSTANTS.STAGE_NAMES.BD_1A
        );
      } 
      else if (stageId === CONSTANTS.STAGE_NAMES.BD_1) {
        SetNextStageDetaisAfterSave(
          CONSTANTS.STAGE_NAMES.AD_1,
          CONSTANTS.STAGE_NAMES.BD_1
        );
      } else if (stageId === CONSTANTS.STAGE_NAMES.AD_1) {
        SetNextStageDetaisAfterSave(
          CONSTANTS.STAGE_NAMES.AD_1A,
          CONSTANTS.STAGE_NAMES.AD_1
        );
      } else if (stageId === CONSTANTS.STAGE_NAMES.AD_1A) {
        if (
          (applicantsSelector.work_type === "S105" || stageSelector[0].stageInfo.applicants[0].work_type_a_1 === "S105") ||
          (applicantsSelector.work_type === "S107" || stageSelector[0].stageInfo.applicants[0].work_type_a_1 === "S107") ||
          (applicantsSelector.work_type === "S108" || stageSelector[0].stageInfo.applicants[0].work_type_a_1 === "S108") 
        ) {
          if(productType === '1241' && (campaign === "HKSPG17VAWV000"  || campaign === "HKSPB17VAWV000")) {
            SetNextStageDetaisAfterSave(
              CONSTANTS.STAGE_NAMES.AD_5,
              CONSTANTS.STAGE_NAMES.AD_1A
            );
          } else {
          SetNextStageDetaisAfterSave(
            CONSTANTS.STAGE_NAMES.AD_6,
            CONSTANTS.STAGE_NAMES.AD_1A
          );
        }
        } else {
          SetNextStageDetaisAfterSave(
            CONSTANTS.STAGE_NAMES.AD_2,
            CONSTANTS.STAGE_NAMES.AD_1A
          );
        }
      } else if (stageId === CONSTANTS.STAGE_NAMES.AD_2 && applicationJourney === "ETC") {
        SetNextStageDetaisAfterSave(
          CONSTANTS.STAGE_NAMES.AD_6,
          CONSTANTS.STAGE_NAMES.AD_2
        );
      } else if (stageId === CONSTANTS.STAGE_NAMES.AD_2) {
        SetNextStageDetaisAfterSave(
          CONSTANTS.STAGE_NAMES.AD_3,
          CONSTANTS.STAGE_NAMES.AD_2
        );
      } else if (stageId === CONSTANTS.STAGE_NAMES.AD_3) {
        if(productType === '1241'){
          SetNextStageDetaisAfterSave(
            CONSTANTS.STAGE_NAMES.AD_5,
            CONSTANTS.STAGE_NAMES.AD_3
          );
        } else {
          SetNextStageDetaisAfterSave(
            CONSTANTS.STAGE_NAMES.AD_6,
            CONSTANTS.STAGE_NAMES.AD_3
          );
        }
      } else if (stageId === CONSTANTS.STAGE_NAMES.AD_5) {
        SetNextStageDetaisAfterSave(
          CONSTANTS.STAGE_NAMES.AD_6,
          CONSTANTS.STAGE_NAMES.AD_5
        );
      } else if (stageId === CONSTANTS.STAGE_NAMES.AD_6) {
        if(productType === '1241' || productType === '1282'){
          SetNextStageDetaisAfterSave(
            CONSTANTS.STAGE_NAMES.AD_7,
            CONSTANTS.STAGE_NAMES.AD_6
          );
        } else {
        SetNextStageDetaisAfterSave(
          CONSTANTS.STAGE_NAMES.RP,
          CONSTANTS.STAGE_NAMES.AD_6
        );
        }
      }  else if (stageId === CONSTANTS.STAGE_NAMES.AD_7) {
        SetNextStageDetaisAfterSave(
          CONSTANTS.STAGE_NAMES.RP,
          CONSTANTS.STAGE_NAMES.AD_7
        );
      } else if (stageId === CONSTANTS.STAGE_NAMES.RP) {
        dispatch(stagesAction.updateStageId(CONSTANTS.STAGE_NAMES.ACD_1));
        setStageId(CONSTANTS.STAGE_NAMES.ACD_1);
        postAditionalData().then(async (res: any) => {
          if (res.status === 200) {
            let responseType = res.data.application.response_type.toUpperCase();
            let responseAction =
              res.data.application.response_action.toUpperCase();
            if (
              responseAction === "SUCCESS" ||
              responseType === "INFO" ||
              (responseType === "SOFT" && responseAction === "CONTINUE")
            ) {
              let stageData = JSON.parse(JSON.stringify(res.data));
              delete stageData.applicants;
              delete stageData.fieldmetadata;
              stageData.fieldMetaData = res.data.fieldmetadata;
              stageData.applicants = [res.data.applicants];
              dispatch(
                stagesAction.getStage({
                  id: CONSTANTS.STAGE_NAMES.ACD_1,
                  formConfig: stageData,
                })
              );
              dispatch(stagesAction.updateStageId(CONSTANTS.STAGE_NAMES.ACD_1)); 
              await getOffer(res.data).then(async (offerResponse: any) => {
                if (offerResponse.status === 200) {
                  let applicants = offerResponse.data.applicants;
                  let application = offerResponse.data.application;
                  let responseType =
                    offerResponse.data.application.response_type.toUpperCase();
                  let responseAction =
                    offerResponse.data.application.response_action.toUpperCase();

                  let channel_reference =
                    offerResponse.data.application.channel_reference;
                  let offer_status =
                    offerResponse.data.products[0].offer_details[0]
                      .offer_status;
                  if (
                    responseAction === "SUCCESS" ||
                    responseType === "INFO" ||
                    (responseType === "SOFT" && responseAction === "CONTINUE")
                  ) {
                    let formStageData = JSON.parse(
                      JSON.stringify(formConfigmetaData)
                    );
                    formStageData.applicants = applicants;
                    dispatch(
                      preApprovalAction.setFormConfigMetaData(formStageData)
                    );

                    let stageData = Object.assign(
                      {},
                      stageSelector[0].stageInfo
                    );
                    delete stageData.applicants;
                    delete stageData.fieldmetadata;
                    stageData.applicant_bureau_details =
                      offerResponse.data.applicant_bureau_details;
                    stageData.fieldMetaData = offerResponse.data.fieldmetadata;
                    stageData.applicants = [offerResponse.data.applicants];
                    stageData.products = offerResponse.data.products;
                    stageData.applicant_documents =
                      offerResponse.data.applicant_documents;
                    dispatch(
                      stagesAction.getStage({
                        id: CONSTANTS.STAGE_NAMES.ACD_3,
                        formConfig: stageData,
                      })
                    );
                    if (offer_status === "1001" || offer_status === "1003") {
                      if (
                        offerResponse.data.products[0].product_category === "PL"
                      ) {
                        if(offerResponse.data.products[0].offer_details[0].bestOffer === "N") {
                        dispatch(
                          stagesAction.getStage({
                            id: CONSTANTS.STAGE_NAMES.ACD_3,
                            formConfig: stageData,
                          })
                        );
                        setShowSpinner(false);
                        dispatch(
                          preApprovalAction.setCurrentStage("LD")
                        );
                      } else {
                        dispatch(
                          stagesAction.updateStageId(
                            CONSTANTS.STAGE_NAMES.ACD_2
                          )
                        );
                        let newOfferData = offerResponse.data;
                        await getOffer2(newOfferData).then(
                          async (offerRes: any) => {
                            if (offerRes.status === 200) {
                              let responseType =
                                offerRes.data.application.response_type.toUpperCase();
                              let responseAction =
                                offerRes.data.application.response_action.toUpperCase();
                              if ( responseAction === "SUCCESS" || responseType === "INFO" || (responseType === "SOFT" && responseAction === "CONTINUE") ) {
                                let stageData = Object.assign(
                                  {},
                                  stageSelector[0].stageInfo
                                );
                                delete stageData.applicants;
                                delete stageData.fieldmetadata;
                                stageData.applicant_bureau_details =
                                  offerRes.data.applicant_bureau_details;
                                stageData.fieldMetaData =
                                  offerRes.data.fieldmetadata;
                                stageData.applicants = [
                                  offerRes.data.applicants,
                                ];
                                stageData.products = offerRes.data.products;
                                stageData.applicant_documents =
                                  offerRes.data.applicant_documents;
                                let offer_status = offerRes.data.products[0].offer_details[1].offer_status;
                                if ((offer_status === "1001" || offer_status === "1003") ) {
                                  dispatch(
                                    stagesAction.getStage({
                                      id: CONSTANTS.STAGE_NAMES.ACD_3,
                                      formConfig: stageData,
                                    })
                                  );
                                  setShowSpinner(false);
                                  dispatch(
                                    preApprovalAction.setCurrentStage("LD")
                                  );
                                  dispatch(
                                    stagesAction.updateStageId(
                                      CONSTANTS.STAGE_NAMES.ACD_3
                                    )
                                  );
                                }
                                else if ((offer_status === "1004" || offer_status === "1002") ) {
                                  setShowSpinner(false);
                                  
                                  let statusText = offerRes.data.products[0].offer_details[1].reason_code_descriptions[0].reason_description;
                                  let statusCode = offerRes.data.products[0].offer_details[1].reason_code_descriptions[0].reason_code;
                                  let responseAction= "DECLINE";
                                  let responseType= "";
                                  dispatch(
                                    errorAction.getExceptionList([
                                      {
                                        statusCode: statusCode,
                                        statusText: statusText,
                                        responseAction,
                                        responseType,
                                      },
                                    ])
                                  );
                                }
                                else {
                                  setShowSpinner(false);
                                  dispatch(preApprovalAction.setCurrentStage("FFD"));
                                }
                              } else {
                                HardStop(offerRes);
                              }
                            }
                          }
                        );
                      }
                    }
                      else {
                        const pdfPreviewRes = await postPdfPreview(
                          channel_reference
                        );
                        if (
                          pdfPreviewRes.status >= 200 &&
                          pdfPreviewRes.status < 300
                        ) {
                          if (
                            offerResponse.data.products[0].product_category === "CC"
                          ) {
                            setShowSpinner(false);
                            dispatch(
                              stagesAction.getStage({
                                id: CONSTANTS.STAGE_NAMES.DOC_3,
                                formConfig: stageData,
                              })
                            );
                            <Model name="preApprovedBanner" />
                            
                          }
                          else{
                            setShowSpinner(false);
                            dispatch(preApprovalAction.setCurrentStage("FFD"));
                          }
                        } else {
                          setShowSpinner(false);
                          dispatch(preApprovalAction.setCurrentStage("FFD"));
                        }
                      }
                    } else if (
                      (offer_status === "1004" || offer_status === "1002") &&
                      offerResponse.data.products[0].product_category ===
                        "PL" &&
                      offerResponse.data.products[0].offer_details[0]
                        .bestOffer === "Y"
                    ) {
                      dispatch(
                        stagesAction.updateStageId(CONSTANTS.STAGE_NAMES.ACD_2)
                      );
                      let newOfferData = offerResponse.data;
                      await getOffer2(newOfferData).then(
                        async (offerRes: any) => {
                          if (offerRes.status === 200) {
                            let responseType =
                              offerRes.data.application.response_type.toUpperCase();
                            let responseAction =
                              offerRes.data.application.response_action.toUpperCase();
                            if (
                              responseAction === "SUCCESS" ||
                              responseType === "INFO" ||
                              (responseType === "SOFT" &&
                                responseAction === "CONTINUE")
                            ) {
                              let stageData = Object.assign(
                                {},
                                stageSelector[0].stageInfo
                              );
                              delete stageData.applicants;
                              delete stageData.fieldmetadata;
                              stageData.applicant_bureau_details =
                                offerRes.data.applicant_bureau_details;
                              stageData.fieldMetaData =
                                offerRes.data.fieldmetadata;
                              stageData.applicants = [offerRes.data.applicants];
                              stageData.products = offerRes.data.products;
                              stageData.applicant_documents =
                                offerRes.data.applicant_documents;
                              let offer_status = offerRes.data.products[0].offer_details[1].offer_status;
                              if ((offer_status === "1001" || offer_status === "1003") ) {
                                dispatch(
                                  stagesAction.getStage({
                                    id: CONSTANTS.STAGE_NAMES.ACD_3,
                                    formConfig: stageData,
                                  })
                                );
                                setShowSpinner(false);
                                dispatch(preApprovalAction.setCurrentStage("LD"));
                                dispatch(
                                  stagesAction.updateStageId(
                                    CONSTANTS.STAGE_NAMES.ACD_3
                                  )
                                );
                              }
                              else if ((offer_status === "1004" || offer_status === "1002") ) {
                                setShowSpinner(false);
                                let statusText = offerRes.data.products[0].offer_details[1].reason_code_descriptions[0].reason_description;
                                let statusCode = offerRes.data.products[0].offer_details[1].reason_code_descriptions[0].reason_code;
                                let responseAction= "DECLINE";
                                let responseType= "";
                                dispatch(
                                  errorAction.getExceptionList([
                                    {
                                      statusCode: statusCode,
                                      statusText: statusText,
                                      responseAction,
                                      responseType,
                                    },
                                  ])
                                );
                              }
                              else {
                                setShowSpinner(false);
                                dispatch(preApprovalAction.setCurrentStage("FFD"));
                              }
                              
                            } else {
                              HardStop(offerRes);
                            }
                          }
                        }
                      );
                    } else if (
                      offer_status === "1004" &&
                      offerResponse.data.products[0].product_category ===
                        "PL" &&
                      offerResponse.data.products[0].offer_details[0]
                        .bestOffer !== "Y"
                    ) {
                      setShowSpinner(false);
                      dispatch(preApprovalAction.setCurrentStage("FFD"));
                    } 
                    else if((offer_status === "1004" || offer_status === "1002") &&
                    offerResponse.data.products[0].product_category ===
                      "CC" ){
                      setShowSpinner(false);
                      //card decline pop up
                      dispatch(
                        errorAction.getExceptionList([
                          {
                            statusCode: "",
                            statusText: "",
                            responseAction:"DECLINE",
                            responseType,
                          },
                        ])
                      );
                    }
                    else {
                      if (
                        offerResponse.data.products[0].product_category === "CC"
                      ) {
                        setShowSpinner(false);
                        dispatch(
                          stagesAction.getStage({
                            id: CONSTANTS.STAGE_NAMES.DOC_3,
                            formConfig: stageData,
                          })
                        );
                        <Model name="preApprovedBanner" />
                        
                      }
                      else{
                        setShowSpinner(false);
                        dispatch(preApprovalAction.setCurrentStage("FFD"));
                      }
                    }
                  } else {
                    HardStop(offerResponse);
                  }
                }
              });
            } else {
              HardStop(res);
            }
          }
        });
      } else if (stageId === CONSTANTS.STAGE_NAMES.LD_1) {
        dispatch(stagesAction.updateStageId(CONSTANTS.STAGE_NAMES.FFD_1));
        setStageId(CONSTANTS.STAGE_NAMES.FFD_1);
        postSaveData().then(async (res: any) => {
          if (res.status === 200) {
            let responseType = res.data.application.response_type.toUpperCase();
            let responseAction =
              res.data.application.response_action.toUpperCase();
            if (
              responseAction === "SUCCESS" ||
              responseType === "INFO" ||
              (responseType === "SOFT" && responseAction === "CONTINUE")
            ) {
              setStageId(CONSTANTS.STAGE_NAMES.FFD_2);
              await postFulFilmentData(res.data).then(async (fulres: any) => {
                if (res.status >= 200 && res.status < 300) {
                  dispatch(
                    stagesAction.updateStageId(CONSTANTS.STAGE_NAMES.FFD_2)
                  );
                  let stageData = JSON.parse(
                    JSON.stringify(stageSelector[0].stageInfo)
                  );
                  stageData.applicants = [fulres.data.applicants];
                  stageData.application = fulres.data.application;
                  dispatch(
                    stagesAction.getStage({
                      id: CONSTANTS.STAGE_NAMES.FFD_2,
                      formConfig: stageData,
                    })
                  );
                  let responseType =
                    res.data.application.response_type.toUpperCase();
                  let responseAction =
                    res.data.application.response_action.toUpperCase();
                  if (
                    responseAction === "SUCCESS" ||
                    responseType === "INFO" ||
                    (responseType === "SOFT" && responseAction === "CONTINUE")
                  ) {
                    await postFulFilmentData(fulres.data).then(
                      async (res: any) => {
                        if (res.status >= 200 && res.status < 300) {
                          let responseType =
                            res.data.application.response_type.toUpperCase();
                          let responseAction =
                            res.data.application.response_action.toUpperCase();
                          if (
                            responseAction === "SUCCESS" ||
                            responseType === "INFO" ||
                            (responseType === "SOFT" &&
                              responseAction === "CONTINUE")
                          ) {
                            setShowSpinner(false);
                            let stageData = JSON.parse(
                              JSON.stringify(stageSelector[0].stageInfo)
                            );
                            stageData.applicants = [res.data.applicants];
                            stageData.application = res.data.application;
                            dispatch(
                              stagesAction.getStage({
                                id: CONSTANTS.STAGE_NAMES.FFD_2,
                                formConfig: stageData,
                              })
                            );
                            dispatch(preApprovalAction.setCurrentStage("FFD"));
                          } else {
                            HardStop(res);
                          }
                        }
                      }
                    );
                  } else {
                    HardStop(res);
                  }
                }
              });
            } else {
              HardStop(res);
            }
          }
        });
      } 
      else {
        if (
          (resumeFlag.otpResume === true &&
            (continueBtnSelector === null || continueBtnSelector === true)) ||
          continueBtnSelector === true
        ) {
          submitSuccess();
        }
      }
      pageScrollTop();
    } else {
      dispatch(
        fieldErrorAction.getFieldError({
          fieldName: userInputs,
        })
      );
      window.scroll(0, 0);
    }
    event.preventDefault();
  };

  const handleCallback = (
    fieldProps: KeyWithAnyModel,
    childData: string | number | null
  ) => {
    currentStageSection = fieldProps;
    if (
      madatoryFieldSelector &&
      madatoryFieldSelector.indexOf(fieldProps.logical_field_name) !== -1
    ) {
      if (stageId !== CONSTANTS.STAGE_NAMES.AD_2) {
        madatoryFieldSelector &&
          madatoryFieldSelector.map((fieldName) => {
            let childValue = userInputSelector.applicants[0][fieldName];
            if (fieldName === fieldProps.logical_field_name) {
              setUserInputs((prevUser: KeyStringModel) => ({
                ...prevUser,
                // [fieldName]: childData,
                [fieldProps.logical_field_name]:
                  stageId === CONSTANTS.STAGE_NAMES.AD_1 ||
                  stageId === CONSTANTS.STAGE_NAMES.RP
                    ? (fieldName === "cb_declaration" ||
                        fieldName === "client_declaration_cert" ||
                        fieldName === "acknowledgement_cert") &&
                      (childData === "N" || childData === undefined)
                      ? undefined
                      : childData
                    : childData
                    ? childData
                    : undefined,
              }));
            }
            if (fieldName !== fieldProps.logical_field_name) {
              setUserInputs((prevUser: KeyStringModel) => ({
                ...prevUser,
                [fieldName]:
                  stageId === CONSTANTS.STAGE_NAMES.AD_1 ||
                  stageId === CONSTANTS.STAGE_NAMES.RP
                    ? (fieldName === "cb_declaration" ||
                        fieldName === "client_declaration_cert" ||
                        fieldName === "acknowledgement_cert") &&
                      (childValue === "N" || childValue === undefined)
                      ? undefined
                      : childValue
                    : childValue
                    ? childValue
                    : undefined,
              }));
            }
            return fieldName;
          });
      } else {
        setUserInputs({});
      }
    }
  };

  const handleFieldDispatch = (
    fieldName: string,
    childData: string | number | null | "",
    option?: string | "" | undefined | null
  ) => {
    dispatch(
      stagesAction.modifyStage({
        fieldData: {
          fieldName: fieldName,
          value: childData,
        },
        currentStageSection: { data: currentStageSection },
      })
    );
    if (
      stageId === CONSTANTS.STAGE_NAMES.BD_2 ||
      stageId === CONSTANTS.STAGE_NAMES.BD_3 ||
      stageId === CONSTANTS.STAGE_NAMES.BD_4 ||
      fieldName === "country_of_tax_residence"
    ) {
      setUserInputs((prevUser: KeyStringModel) => ({
        ...prevUser,
        [fieldName]: childData ? childData : undefined,
      }));
    }
    if (option)
      dispatch(
        lovDescAction.addLovData({
          fieldData: {
            fieldName: fieldName,
            code_desc: option,
            code_value: childData,
          },
        })
      );
  };

  const backHandler = () => {
    setBackText("Back");

    if (valueSelector.changesUpdate.changes) {
      dispatch(
        ValueUpdateAction.getChangeUpdate({
          id: stageSelector[0].stageId!,
          changes: false,
        })
      );
    }
    // }
    let stageUpdate = getStageName(
      stageSelector[0].stageId!,
      applicationJourney
    );

    //Bypass iBanking screen logic
    if (
      stageSelector[0].stageId === CONSTANTS.STAGE_NAMES.AD_2 &&
      applicantsSelector.is_banking_registered &&
      applicantsSelector.is_banking_registered === "true"
    ) {
      stageUpdate = CONSTANTS.STAGE_NAMES.AD_1;
    }

    if (stageSelector[0].stageId === CONSTANTS.STAGE_NAMES.AD_1A && applicationJourney === "ETC") {
      stageUpdate = CONSTANTS.STAGE_NAMES.BD_1A;
    }

    if (stageSelector[0].stageId === CONSTANTS.STAGE_NAMES.AD_6 && applicationJourney === "ETC") {
      stageUpdate = CONSTANTS.STAGE_NAMES.AD_2;
    }

    if(stageSelector[0].stageId === CONSTANTS.STAGE_NAMES.AD_5  && productType === '1241') {
      stageUpdate = CONSTANTS.STAGE_NAMES.AD_3
    }
    if(stageSelector[0].stageId === CONSTANTS.STAGE_NAMES.AD_6 && productType === '1241') {
      stageUpdate = CONSTANTS.STAGE_NAMES.AD_5;
    }
    if (stageSelector[0].stageId === CONSTANTS.STAGE_NAMES.AD_6 || (stageSelector[0].stageId === CONSTANTS.STAGE_NAMES.AD_5 && productType === '1241')) {
      if (
        (applicantsSelector.work_type === "S105" || stageSelector[0].stageInfo.applicants[0].work_type_a_1 === "S105") ||
          (applicantsSelector.work_type === "S107" || stageSelector[0].stageInfo.applicants[0].work_type_a_1 === "S107") ||
          (applicantsSelector.work_type === "S108" || stageSelector[0].stageInfo.applicants[0].work_type_a_1 === "S108") 
      ) {
        stageUpdate = CONSTANTS.STAGE_NAMES.AD_1A;
      }
    }
    if(stageSelector[0].stageId === CONSTANTS.STAGE_NAMES.AD_6 && productType === '1241' && (campaign === "HKSPG17VAWV000"  || campaign === "HKSPB17VAWV000")) {
      stageUpdate = CONSTANTS.STAGE_NAMES.AD_5;
    }
    if(stageSelector[0].stageId === CONSTANTS.STAGE_NAMES.RP) {
      if(productType === '1241' || productType === '1282') {
        stageUpdate = CONSTANTS.STAGE_NAMES.AD_7;
      } else {
        stageUpdate = CONSTANTS.STAGE_NAMES.AD_6;
      }
    }
    if (stageUpdate !== CONSTANTS.STAGE_NAMES.PD_1) {
      if (resumeSelector) {
        dispatch(
          getLovMissing(
            stageUpdate,
            stageSelector[0].stageInfo.fieldMetaData.data.stages,
            lovSelector
          )
        );
      }
      dispatch(fieldErrorAction.getMandatoryFields(null));
      dispatch(ContinueBtnAction.getContinueEnableState(true));
      dispatch(isFormUpdate(true));
      setStageId(stageUpdate);
      dispatch(stagesAction.resetCurrentStage(stageUpdate));
      dispatch(stagesAction.updateStageId(stageUpdate));
      dispatch(
        stagesAction.updateDynamicCityField({
          label: CONSTANTS.LOGICAL_FIELD_NAMES.RES_CITY_3,
          value: "",
        })
      );
      pageScrollTop();
    }
  };

  const getUserInputData = () => {
    let userInputNew = userInputSelector.applicants[0];
    let isUserInput = true;
    madatoryFieldSelector.forEach((data: string) => {
      if (userInputNew[data] && isUserInput) {
        isUserInput = true;
      } else {
        isUserInput = false;
      }
    });
    return isUserInput;
  };

  const updateFormVlidation = () => {
    if (madatoryFieldSelector && madatoryFieldSelector.length > 0) {
      let sortUserInputData: any = getUserInputData();
      if (sortUserInputData && isFormValid && fieldErrorSelector.length === 0) {
        setRequiredFormValidation("form-valid");
      } else if (
        stageSelector[0] &&
        stageSelector[0].stageId === CONSTANTS.STAGE_NAMES.AD_6
      ) {
        //if no, form-valid
        const otherLoans = userInputSelector.applicants[0].other_loans;
        const relatedParty = userInputSelector.applicants[0].related_party;
        const monthly_installment_mortgage_payment =
          userInputSelector.applicants[0].monthly_installment_mortgage_payment;
        const name_of_related_person =
          userInputSelector.applicants[0].name_of_related_person;
        const relationship_of_related_person =
          userInputSelector.applicants[0].relationship_of_related_person;
         
          if (otherLoans === 'N' && relatedParty === 'N') {
            setRequiredFormValidation("form-valid");
          }
          else if (otherLoans === 'Y' && (monthly_installment_mortgage_payment === '' || monthly_installment_mortgage_payment === null || monthly_installment_mortgage_payment=== undefined)|| (monthly_installment_mortgage_payment && monthly_installment_mortgage_payment.trim().length < 3)) {
            setRequiredFormValidation("form-invalid");
          }
          else if (otherLoans === 'Y' && (monthly_installment_mortgage_payment === '' || monthly_installment_mortgage_payment === null || monthly_installment_mortgage_payment=== undefined) && relatedParty === 'N') {
            setRequiredFormValidation("form-invalid");
          }
          else if (otherLoans === 'Y' && (monthly_installment_mortgage_payment !== '' || monthly_installment_mortgage_payment !== null) && relatedParty === 'N' &&(fieldErrorSelector.length > 0)) {
            setRequiredFormValidation("form-invalid");
          }
          else if (otherLoans === 'Y' && (monthly_installment_mortgage_payment !== '' || monthly_installment_mortgage_payment !== null) && relatedParty === 'N' &&(fieldErrorSelector.length === 0)) {
            setRequiredFormValidation("form-valid");
          }
          else if (relatedParty === 'Y' && ((name_of_related_person === '' || name_of_related_person === null ||name_of_related_person===undefined) && (relationship_of_related_person === '' || relationship_of_related_person === null|| relationship_of_related_person=== undefined))) {
            setRequiredFormValidation("form-invalid");
          }
          else if (relatedParty === 'Y' && ((name_of_related_person === '' || name_of_related_person === null || name_of_related_person === undefined) || name_of_related_person.trim().length < 3)) {
            setRequiredFormValidation("form-invalid");
          }
          else if (relatedParty === 'Y' && (relationship_of_related_person === '' || relationship_of_related_person === null|| relationship_of_related_person === undefined)) {
            setRequiredFormValidation("form-invalid");
          }
          else if (relatedParty === 'Y' && name_of_related_person.trim().length > 3 && ((name_of_related_person !== '' || name_of_related_person !== null )&& (relationship_of_related_person !== '' || relationship_of_related_person !== null)) && otherLoans === 'N' 
          &&(fieldErrorSelector.length === 0)
          ) {
            setRequiredFormValidation("form-valid");
          }
          else if (relatedParty === 'Y' && ((name_of_related_person !== '' || name_of_related_person !== null) && (relationship_of_related_person !== '' || relationship_of_related_person !== null)) && otherLoans === 'N' 
          &&(fieldErrorSelector.length > 0)
          ) {
            setRequiredFormValidation("form-invalid");
          }
          else if (otherLoans === 'Y' && relatedParty === 'Y') {
            if (((monthly_installment_mortgage_payment !== '' || monthly_installment_mortgage_payment !== null)
           //  &&(monthly_installment_mortgage_payment.trim().length > 3)
             &&(( name_of_related_person !== '' || name_of_related_person !== null)
             &&( relationship_of_related_person !== '' || relationship_of_related_person !== null)))
             &&(fieldErrorSelector.length === 0)
            //  &&(name_of_related_person.trim().length > 3)
            ){
              setRequiredFormValidation("form-valid");
            }
            else {
              setRequiredFormValidation("form-invalid");
            }
          }
          else {
            setRequiredFormValidation("form-invalid");
          }
        } else {
        setRequiredFormValidation("form-invalid");
      }
    }
    if (
      stageSelector[0] &&
      stageSelector[0].stageId === CONSTANTS.STAGE_NAMES.LD_1
    ) {
      if (
        userInputSelector.applicants[0].oth_bank_name !== "" &&
        userInputSelector.applicants[0].oth_bank_number !== "" &&
        userInputSelector.applicants[0].select_account !== ""
      ) {
        if (userInputSelector.applicants[0].oth_bank_number?.length === 12) {
          setRequiredFormValidation("form-valid");
        }
      }
    }
    if (
      stageSelector[0] &&
      stageSelector[0].stageId === CONSTANTS.STAGE_NAMES.AD_5
    ) {
      if(userInputSelector.applicants[0].priority_banking==="No"){
        setRequiredFormValidation("form-valid");
      }
    }
  };

  useEffect(() => {
    updateFormVlidation();
  }, [
    isFormValid,
    valueSelector,
    fieldErrorSelector,
    userInputs,
    userInputSelector,
    madatoryFieldSelector,
    continueBtnSelector,
    stageSelector,
  ]);

  const validateForm = (e: FormEvent<HTMLFormElement> | null) => {
    if (e && e.currentTarget.checkValidity()) {
      setFormValidation(true);
    } else {
      setFormValidation(false);
      setRequiredFormValidation("form-invalid");
    }
  };

  const updateCheckboxStatus = (checkedStatus: boolean, fieldName: string) => {
    if (
      stageSelector[0].stageId !== CONSTANTS.STAGE_NAMES.AD_2 ||
      stageSelector[0].stageId !== CONSTANTS.STAGE_NAMES.RP
    ) {
      setCheckboxStatus(!checkboxStatus);
      if (checkedStatus === true) {
        if (isFormValid && !(Object.keys(userInputs).length > 0)) {
          setRequiredFormValidation("form-valid");
        }
      } else {
        if (
          stageSelector[0].stageId ===
          CONSTANTS.STAGE_NAMES
            .AD_1 /*|| stageSelector[0].stageId === CONSTANTS.STAGE_NAMES.AD_2*/
        ) {
          dispatch(fieldErrorAction.getMandatoryFields([fieldName]));
        }
        setRequiredFormValidation("form-invalid");
      }
      if (
        stageSelector[0].stageId !== CONSTANTS.STAGE_NAMES.AD_2 ||
        stageSelector[0].stageId !== CONSTANTS.STAGE_NAMES.RP
      ) {
        handleFieldDispatch(fieldName, checkedStatus ? "Y" : "N");
      }
    }
    // AD-2 continue button enable state (Changes done for continue button)
    if (
      stageSelector[0] &&
      stageSelector[0].stageId === CONSTANTS.STAGE_NAMES.AD_2
    ) {
      setRequiredFormValidation("form-valid");
    }
  };

  const confirmCheckboxStatus = (val: boolean) => {
    if (val) {
      setRequiredFormValidation("form-valid");
    } else {
      setRequiredFormValidation("form-invalid");
    }
  };

  return (
    <>
      {showSpinner &&
        (stageId === "ld-1" || stageId === "ffd-1" || stageId === "ffd-2") && (
          <Spinner loaderType="lastStep" />
        )}
      {showSpinner &&
        stageId !== "ld-1" &&
        stageId !== "ffd-1" &&
        stageId !== "ffd-2" && <Spinner type="saving" />}
      {!showSpinner && (
        <form role="form" className="form" onSubmit={handleSubmit} onChange={validateForm}>
          {stageId === "ld-1" && (
            <FundDisbursement
              fields={fields?.fields}
              index
              userInputs
              confirmCheckboxStatus={confirmCheckboxStatus}
              handleCallback={handleCallback}
              handleFieldDispatch={handleFieldDispatch}
            />
          )}
          {stageId === "rp" && (
            <ReviewPage
              fields={fields}
              currentStageSection
              index
              handleCallback={handleCallback}
              handleFieldDispatch={handleFieldDispatch}
              userInputs
              confirmCheckboxStatus={confirmCheckboxStatus}
            />
          )}
          {stageId !== "rp" &&
            stageId !== "ld-1" &&
            fields &&
            fields["fields"] &&
            fields["fields"].map(
              (currentSection: KeyWithAnyModel, i: number) => {
                return (
                  <div key={`fields${i}`}>
                    {currentSection["field_set_name"] &&
                      currentSection["fields"].length > 0 && (
                        <>
                          <div
                            className="field__group"
                            key={currentSection["field_set_name"]}
                          >
                            {
                              currentSection["field_set_name"] !==
                                "Basic Information" &&
                                stageSelector[0].stageId !==
                                  CONSTANTS.STAGE_NAMES.PD_1 && (
                                  <div className="pending__resume-header banner_ext">
                                    <div
                                      className="header-wrapper-hk"
                                      style={{ display: "flex" }}
                                    >
                                      <div className="hk-banner">
                                        <span className="banner-icon banner-icon-mobile"></span>
                                        <div className="card-title card-title-replace">
                                          {currentSection["field_set_name"]}
                                        </div>
                                      </div>
                                    </div>
                                    <Close authType="resume" />
                                  </div>
                                )

                              // </div>
                            }

                            {currentSection["fields"].map(
                              (
                                currentSection: KeyWithAnyModel,
                                index: number
                              ) => {
                                return renderComponent(
                                  (currentStageSection = currentSection),
                                  index,
                                  handleCallback,
                                  handleFieldDispatch,
                                  userInputs,
                                  updateCheckboxStatus
                                );
                              }
                            )}
                          </div>
                        </>
                      )}
                  </div>
                );
              }
            )}
          {stageId !== "rp" && fields && (
            <div className="hk_copyrights">
              <p>© Standard Chartered Bank (HK) Limited</p>
            </div>
          )}
          {/* {stageId !== "rp" && */}
          <div className="app__footer">
            <Footer backHandler={backHandler} validateNxt={isRequiredValid} />
          </div>
          {/* } */}
        </form>
      )}
    </>
  );
};

export default React.memo(Fields);
