import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import Fields from "./fields";
import { userInputPayload } from "./fields.utils";
import { stagesAction } from "../../../utils/store/stages-slice";
import { fieldErrorAction } from "../../../utils/store/field-error-slice";
import { CONSTANTS } from "../../../utils/common/constants";
import * as preApprovalPostServices from '../../../modules/preApproval/services/preApprovalPostServices';

jest.mock('../../../modules/preApproval/services/preApprovalPostServices', () => ({
  postSaveData: jest.fn(),
  postFulFilmentData:jest.fn(),
}));

jest.mock("axios", () => ({
  __esModule: true,
}));

jest.mock("@lottiefiles/react-lottie-player", () => ({
  __esModule: true,
  Player: jest.fn().mockReturnValue(null),
}));

// Mock dependencies
jest.mock("../footer/footer", () => () => <div data-testid="footer" />);
jest.mock("../review-page/review-page", () => () => (
  <div data-testid="review-page" />
));
jest.mock("../../../shared/components/spinner/spinner", () => () => (
  <div data-testid="spinner" />
));
jest.mock(
  "../../preApproval/commonComponents/fundDisbursement/fund-disbursement",
  () => () => <div data-testid="fund-disbursement" />
);

// Mock Redux actions and services
jest.mock("./fields.utils", () => ({
  ...jest.requireActual("./fields.utils.ts"),
  getLovMissing: jest.fn(() => jest.fn()),
  stageFields: jest.fn(() => jest.fn()),
  getStagePayload: jest.fn(() => jest.fn()),
  stageSelectFields: jest.fn(() => jest.fn()),
  submitRequest: jest.fn(),
  // userInputPayload: jest.fn(),
  assignUpdateUserInput: jest.fn(),
}));
jest.mock("../../../services/track-events", () => ({
  triggerAdobeEvent: jest.fn(),
}));
jest.mock("../../../utils/common/change.utils.ts", () => ({
  ...jest.requireActual("../../../utils/common/change.utils.ts"),
  FindIndex: jest.fn(() => 0),
}));

// Configure mock store with thunk middleware
const mockStore = configureStore([thunk]);

describe("Fields Component", () => {
  let store: any;
  beforeEach(()=>{
    document.body.innerHTML = `<div class="appHeight" style="height:100px; overflow:scroll;"></div>`
  })

  beforeEach(() => {
    store = mockStore({
      stages: {
        stages: [
          {
            stageId: CONSTANTS.STAGE_NAMES.LD_1,
            stageInfo: {
              fieldMetaData: {
                data: {
                  stages: [
                    { id: "pd-1", name: "Personal Details" },
                    { id: "ad-1", name: "Address Details" },
                  ],
                },
              },
              products:[
                {
                  "name": "debt-consolidation",
                  "relation_type_code": null,
                  "insta_account_no": null,
                  "campaign": "HKBDC23PESTP10",
                  "product_sequence_number": "1",
                  "product_type": "1312",
                  "product_category": "PL",
                  "is_joint_allowed": null,
                  "is_supplementary": null,
                  "status": null,
                  "bundle_name": null,
                  "product_image": null,
                  "company_category": "NA",
                  "segment": null,
                  "relationshipNo": null,
                  "error": null,
                  "campaingn":"SpecialOffer"
                }
              ],
            },
          },
        ],
        userInput: {
          applicants: [
            {
              work_type: "S001",
            },
          ],
        },
        parentChildFields: {
          selectFields: [],
          addSelectFields: [],
          deleteSelectFields: [],
        },
        conditionalFields: { newFields: {} },
        currentStage: "pd-1",
        journeyType: "type",
      },
      lov: {},
      urlParam: { resume: false },
      fielderror: { mandatoryFields: [], error: [] },
      valueUpdate: { value: false, changesUpdate: { changes: false } },
      error: { submit: false },
      continueBtnSlice: { continueEnable: false },
      preApproval: { currentStage: "pd-1", formConfigmetaData: {} },
    });

    jest.clearAllMocks();
  });

  it("renders the component and displays a form", () => {
    render(
      <Provider store={store}>
        <Fields />
      </Provider>
    );

    expect(screen.getByRole("form")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  it("renders the FundDisbursement component for `ld-1` stageId", () => {
    store = mockStore({
      ...store.getState(),
      stages: {
        ...store.getState().stages,
        stages: [{ stageId: "ld-1", stageInfo: {
          products:[
            {
              "name": "debt-consolidation",
              "relation_type_code": null,
              "insta_account_no": null,
              "campaign": "HKBDC23PESTP10",
              "product_sequence_number": "1",
              "product_type": "1312",
            }]
        } }],
      },
    });

    render(
      <Provider store={store}>
        <Fields />
      </Provider>
    );

    expect(screen.getByTestId("fund-disbursement")).toBeInTheDocument();
  });

  it("renders the ReviewPage component for `rp` stageId", () => {
    store = mockStore({
      ...store.getState(),
      stages: {
        ...store.getState().stages,
        stages: [{ stageId: "rp", stageInfo: {
          products:[
            {
              "name": "debt-consolidation",
              "relation_type_code": null,
              "insta_account_no": null,
              "campaign": "HKBDC23PESTP10",
              "product_sequence_number": "1",
              "product_type": "1312",
            }]
        } }],
      },
    });

    render(
      <Provider store={store}>
        <Fields />
      </Provider>
    );

    expect(screen.getByTestId("review-page")).toBeInTheDocument();
  });
    it("handles back button click", () => {
    render(
      <Provider store={store}>
        <Fields />
      </Provider>
    );

    const backButton = screen.getByTestId("footer");
    fireEvent.click(backButton);

    expect(screen.getByRole("form")).toBeInTheDocument();
  });
  
  it("validates form onChange event", () => {
    render(
      <Provider store={store}>
        <Fields />
      </Provider>
    );

    const formElement = screen.getByRole("form");
    fireEvent.change(formElement);

    expect(formElement).toHaveClass("form");
  });

  it("handles continue button click", () => {
    render(
      <Provider store={store}>
        <Fields />
      </Provider>
    );

    const continueButton = screen.getByTestId("footer");
    fireEvent.click(continueButton);

    expect(screen.getByRole("form")).toBeInTheDocument();
  });


  it("validates form onSubmit event", async() => {
    store = mockStore({
      ...store.getState(),
      stages: {
        ...store.getState().stages,
        stages: [{ stageId: "ld-1", stageInfo: {
          products:[
            {
              "name": "debt-consolidation",
              "relation_type_code": null,
              "insta_account_no": null,
              "campaign": "HKBDC23PESTP10",
              "product_sequence_number": "1",
              "product_type": "1312",
            }],
            applicants:[
              {
                "card_type_a_1": "3268",
                "enquriy_nature_of_bussiness_a_1": "",
              }
            ]
        } }],
      },
    });

    jest.spyOn(preApprovalPostServices,'postSaveData').mockImplementation(()=>{
      // return async(dispatch:any)=>{
      const mockResponse ={
          status:200,
          data:{
            application:{
              application_status: "E01",
              response_type:"INFO",
              response_action:"SUCCESS",
            }
          }
      };
      return Promise.resolve(mockResponse);
    // }
  });

  jest.spyOn(preApprovalPostServices,'postFulFilmentData').mockImplementation(()=>{
    // return async(dispatch:any)=>{
    const mockResponse ={
        status:200,
        data:{
          application:{
            application_status: "E01",
            response_type:"INFO",
            response_action:"SUCCESS",
          }
        }
    };
    return Promise.resolve(mockResponse);
  // }
});
window.HTMLElement.prototype.scrollTo = function() {};
    render(
      <Provider store={store}>
        <Fields />
      </Provider>
    );

    await waitFor(() => { 
    const formElement = screen.getByRole("form");
    fireEvent.submit(formElement);
    expect(formElement).toHaveClass("form");
    });

  });


  // it("Dispatch setOtpShow when stageId is PD_1", async() => {
  //   render(
  //     <Provider store={store}>
  //       <Fields  stageId="PD_1" continueBtnSelector={true}/>
  //     </Provider>
  //   );

  //   await waitFor(() => {  
  //     // expect(mockDispatch).toHaveBeenCalledWith(stagesAction.setOtpShow(true));
  //   });
  //  });


});


import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import Fields from "./fields";
import { stagesAction } from "../../../utils/store/stages-slice";
import { fieldErrorAction } from "../../../utils/store/field-error-slice";
import { CONSTANTS } from "../../../utils/common/constants";
import * as preApprovalPostServices from "../../../modules/preApproval/services/preApprovalPostServices";
import * as fieldsUtils from "./fields.utils";
import * as stageUtils from "./stage.utils";

// Mock API Calls
jest.mock("../../../modules/preApproval/services/preApprovalPostServices", () => ({
  postSaveData: jest.fn(),
  postFulFilmentData: jest.fn(),
}));

// Mock Redux Actions
jest.mock("../../../utils/store/stages-slice", () => ({
  stagesAction: {
    updateStageId: jest.fn(),
    modifyStage: jest.fn(),
    getStage: jest.fn(),
    resetCurrentStage: jest.fn(),
    setOtpShow: jest.fn(),
  },
}));
jest.mock("../../../utils/store/field-error-slice", () => ({
  fieldErrorAction: {
    getMandatoryFields: jest.fn(),
    getFieldError: jest.fn(),
    removeToggleFieldError: jest.fn(),
  },
}));

// Configure mock store with thunk middleware
const mockStore = configureStore([thunk]);

describe("Fields Component Dispatch Actions", () => {
  let store: any, dispatchSpy: jest.SpyInstance;

  beforeEach(() => {
    store = mockStore({
      stages: {
        stages: [
          {
            stageId: CONSTANTS.STAGE_NAMES.LD_1,
            stageInfo: {
              fieldMetaData: {
                data: {
                  stages: [
                    { id: "pd-1", name: "Personal Details" },
                    { id: "ad-1", name: "Address Details" },
                  ],
                },
              },
            },
          },
        ],
        userInput: {
          applicants: [{ work_type: "S001" }],
        },
        parentChildFields: {
          selectFields: [],
          addSelectFields: [],
          deleteSelectFields: [],
        },
        conditionalFields: { newFields: {} },
        currentStage: "pd-1",
        journeyType: "type",
      },
      fielderror: { mandatoryFields: [], error: [] },
      valueUpdate: { value: false, changesUpdate: { changes: false } },
      error: { submit: false },
      continueBtnSlice: { continueEnable: false },
      preApproval: { currentStage: "pd-1", formConfigmetaData: {} },
    });

    dispatchSpy = jest.spyOn(store, "dispatch");
    jest.clearAllMocks();
  });

  it("dispatches `updateStageId` on back button click", () => {
    render(
      <Provider store={store}>
        <Fields />
      </Provider>
    );

    const backButton = screen.getByTestId("footer");
    fireEvent.click(backButton);

    expect(stagesAction.updateStageId).toHaveBeenCalled();
  });

  it("dispatches `modifyStage` when field input changes", () => {
    render(
      <Provider store={store}>
        <Fields />
      </Provider>
    );

    const inputField = document.createElement("input");
    inputField.setAttribute("name", "test-field");
    document.body.appendChild(inputField);

    fireEvent.change(inputField, { target: { value: "New Value" } });

    expect(stagesAction.modifyStage).toHaveBeenCalledWith({
      fieldData: { fieldName: "test-field", value: "New Value" },
      currentStageSection: { data: {} },
    });
  });

  it("dispatches `getMandatoryFields` on form validation", () => {
    render(
      <Provider store={store}>
        <Fields />
      </Provider>
    );

    fireEvent.submit(screen.getByRole("form"));

    expect(fieldErrorAction.getMandatoryFields).toHaveBeenCalled();
  });

  it("dispatches `setOtpShow` when stage is PD_1 and continue button is clicked", async () => {
    store = mockStore({
      ...store.getState(),
      stages: {
        ...store.getState().stages,
        stages: [{ stageId: "pd-1", stageInfo: {} }],
      },
    });

    render(
      <Provider store={store}>
        <Fields />
      </Provider>
    );

    fireEvent.submit(screen.getByRole("form"));

    await waitFor(() => {
      expect(stagesAction.setOtpShow).toHaveBeenCalledWith(true);
    });
  });

  it("dispatches `postSaveData` when continue button is clicked", async () => {
    jest.spyOn(preApprovalPostServices, "postSaveData").mockResolvedValue({
      status: 200,
      data: { application: { response_action: "SUCCESS" } },
    });

    render(
      <Provider store={store}>
        <Fields />
      </Provider>
    );

    fireEvent.submit(screen.getByRole("form"));

    await waitFor(() => {
      expect(preApprovalPostServices.postSaveData).toHaveBeenCalled();
    });
  });

  it("dispatches `resetCurrentStage` when stage changes", () => {
    render(
      <Provider store={store}>
        <Fields />
      </Provider>
    );

    expect(stagesAction.resetCurrentStage).toHaveBeenCalled();
  });

  it("dispatches `getLovMissing` when stage changes", () => {
    jest.spyOn(fieldsUtils, "getLovMissing");

    render(
      <Provider store={store}>
        <Fields />
      </Provider>
    );

    expect(fieldsUtils.getLovMissing).toHaveBeenCalled();
  });

  it("dispatches `getStageName` when back button is clicked", () => {
    jest.spyOn(stageUtils, "getStageName");

    render(
      <Provider store={store}>
        <Fields />
      </Provider>
    );

    const backButton = screen.getByTestId("footer");
    fireEvent.click(backButton);

    expect(stageUtils.getStageName).toHaveBeenCalled();
  });

  it("dispatches `removeToggleFieldError` on validation", async () => {
    render(
      <Provider store={store}>
        <Fields />
      </Provider>
    );

    fireEvent.submit(screen.getByRole("form"));

    await waitFor(() => {
      expect(fieldErrorAction.removeToggleFieldError).toHaveBeenCalled();
    });
  });

  it("dispatches `postFulFilmentData` on final stage", async () => {
    jest.spyOn(preApprovalPostServices, "postFulFilmentData").mockResolvedValue({
      status: 200,
      data: { application: { response_action: "SUCCESS" } },
    });

    render(
      <Provider store={store}>
        <Fields />
      </Provider>
    );

    fireEvent.submit(screen.getByRole("form"));

    await waitFor(() => {
      expect(preApprovalPostServices.postFulFilmentData).toHaveBeenCalled();
    });
  });
});
