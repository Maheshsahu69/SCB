import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider, useDispatch, useSelector } from "react-redux";
import configureStore from "redux-mock-store";
import Fields from "./fields";
import { stagesAction } from "../../../utils/store/stages-slice";
import { fieldErrorAction } from "../../../utils/store/field-error-slice";
import { CONSTANTS } from "../../../utils/common/constants";

// Mock Redux hooks
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

// Mock utility functions or other services as needed
jest.mock("./fields-methods", () => ({
  assignUpdateUserInput: jest.fn(),
  deleteConditionalFieldSelector: jest.fn(),
}));

const mockStore = configureStore([]);
const mockDispatch = jest.fn();

describe("Fields Component", () => {
  let store;

  const initialState = {
    stages: {
      stages: [
        {
          stageId: "pd-1",
          stageInfo: {
            fieldMetaData: {
              data: {
                stages: [],
              },
            },
            applicants: [{}],
          },
        },
      ],
      userInput: {
        applicants: [
          {
            work_type: "S001",
            res_room_flat: "",
            res_block: "",
            res_floor: "",
          },
        ],
      },
      parentChildFields: { selectFields: [] },
      journeyType: "journeyType",
      currentStage: "pd-1",
    },
    lov: {},
    fielderror: {
      mandatoryFields: [],
      error: [],
    },
    valueUpdate: {
      value: true,
    },
    continueBtnSlice: {
      continueEnable: true,
    },
    error: {
      submit: false,
    },
  };

  const defaultProps = {};

  beforeEach(() => {
    store = mockStore(initialState);
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useSelector as jest.Mock).mockImplementation((selector) => selector(store.getState()));
    jest.clearAllMocks();
  });

  test("renders the component correctly", () => {
    render(
      <Provider store={store}>
        <Fields {...defaultProps} />
      </Provider>
    );

    expect(screen.getByText("© Standard Chartered Bank (HK) Limited")).toBeInTheDocument();
  });

  test("renders spinner when showSpinner is true", () => {
    const customState = {
      ...initialState,
      stages: {
        ...initialState.stages,
        currentStage: "ld-1",
      },
    };
    const customStore = mockStore(customState);

    render(
      <Provider store={customStore}>
        <Fields {...defaultProps} />
      </Provider>
    );

    expect(screen.queryByText("Spinner")).toBeInTheDocument();
  });

  test("triggers backHandler on clicking back button", async () => {
    render(
      <Provider store={store}>
        <Fields {...defaultProps} />
      </Provider>
    );

    const backButton = screen.getByText("Back");
    fireEvent.click(backButton);

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  test("handles form submission with valid inputs", async () => {
    render(
      <Provider store={store}>
        <Fields {...defaultProps} />
      </Provider>
    );

    const submitButton = screen.getByText("Continue");
    fireEvent.submit(submitButton);

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  test("updates user inputs on callback", () => {
    render(
      <Provider store={store}>
        <Fields {...defaultProps} />
      </Provider>
    );

    // Simulate user input
    const inputField = screen.getByRole("textbox", { name: /res_room_flat/i });
    fireEvent.change(inputField, { target: { value: "123" } });

    expect(mockDispatch).toHaveBeenCalledWith(
      stagesAction.modifyStage({
        fieldData: { fieldName: "res_room_flat", value: "123" },
        currentStageSection: { data: {} },
      })
    );
  });

  test("validates form and updates state", async () => {
    render(
      <Provider store={store}>
        <Fields {...defaultProps} />
      </Provider>
    );

    const form = screen.getByRole("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  test("renders correct fields based on stageId", () => {
    const customState = {
      ...initialState,
      stages: {
        ...initialState.stages,
        currentStage: "rp",
      },
    };
    const customStore = mockStore(customState);

    render(
      <Provider store={customStore}>
        <Fields {...defaultProps} />
      </Provider>
    );

    expect(screen.getByText("Review Page")).toBeInTheDocument();
  });
});





import React from "react";
import { render, screen, act } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import Fields from "./Fields";
import { postBasicData, postSaveData } from "../../preApproval/services/preApprovalPostServices";
import { stagesAction } from "../../../utils/store/stages-slice";
import { errorAction } from "../../../utils/store/error-slice";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("../../preApproval/services/preApprovalPostServices", () => ({
  postBasicData: jest.fn(),
  postSaveData: jest.fn(),
}));

jest.mock("../../../utils/store/stages-slice", () => ({
  stagesAction: {
    updateStageId: jest.fn(),
    getStage: jest.fn(),
  },
}));

jest.mock("../../../utils/store/error-slice", () => ({
  errorAction: {
    getError: jest.fn(),
    getExceptionList: jest.fn(),
  },
}));

describe("Fields Component - SetNextStageDetaisAfterSave", () => {
  const mockDispatch = jest.fn();
  const mockSelector = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useSelector as jest.Mock).mockImplementation(mockSelector);
  });

  it("should update the stage ID and call postBasicData for BD_1", async () => {
    (postBasicData as jest.Mock).mockResolvedValue({
      status: 200,
      data: {
        application: { response_type: "INFO", response_action: "SUCCESS" },
        applicants: [{}],
      },
    });

    mockSelector.mockReturnValue({
      stages: { stageId: "BD_1" },
    });

    // Render component and trigger SetNextStageDetaisAfterSave
    render(<Fields />);
    const instance: any = screen;

    await act(async () => {
      instance.SetNextStageDetaisAfterSave("BD_1", "BD_1A");
    });

    expect(mockDispatch).toHaveBeenCalledWith(stagesAction.updateStageId("BD_1"));
    expect(postBasicData).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith(
      stagesAction.getStage({
        id: "BD_1",
        formConfig: expect.any(Object),
      })
    );
  });

  it("should update the stage ID and call postSaveData for non-BD_1 stages", async () => {
    (postSaveData as jest.Mock).mockResolvedValue({
      status: 200,
      data: {
        application: { response_type: "INFO", response_action: "SUCCESS" },
        applicants: [{}],
      },
    });

    mockSelector.mockReturnValue({
      stages: { stageId: "AD_1" },
    });

    // Render component and trigger SetNextStageDetaisAfterSave
    render(<Fields />);
    const instance: any = screen;

    await act(async () => {
      instance.SetNextStageDetaisAfterSave("AD_1", "BD_1");
    });

    expect(mockDispatch).toHaveBeenCalledWith(stagesAction.updateStageId("AD_1"));
    expect(postSaveData).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith(
      stagesAction.getStage({
        id: "AD_1",
        formConfig: expect.any(Object),
      })
    );
  });

  it("should handle HARD STOP errors correctly", async () => {
    (postSaveData as jest.Mock).mockResolvedValue({
      status: 200,
      data: {
        application: {
          response_type: "HARD",
          response_action: "STOP",
          error: {
            application_error: [
              { error_description: "Technical Error", rtobCode: "E01" },
            ],
          },
        },
      },
    });

    mockSelector.mockReturnValue({
      stages: { stageId: "AD_1" },
    });

    // Render component and trigger SetNextStageDetaisAfterSave
    render(<Fields />);
    const instance: any = screen;

    await act(async () => {
      instance.SetNextStageDetaisAfterSave("AD_1", "BD_1");
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      errorAction.getExceptionList([
        {
          statusCode: "E01",
          statusText: "Technical Error",
          responseAction: "STOP",
          responseType: "HARD",
        },
      ])
    );
  });

  it("should handle error if API fails", async () => {
    (postSaveData as jest.Mock).mockRejectedValue(new Error("API Error"));

    mockSelector.mockReturnValue({
      stages: { stageId: "AD_1" },
    });

    // Render component and trigger SetNextStageDetaisAfterSave
    render(<Fields />);
    const instance: any = screen;

    await act(async () => {
      instance.SetNextStageDetaisAfterSave("AD_1", "BD_1");
    });

    expect(mockDispatch).not.toHaveBeenCalledWith(stagesAction.getStage());
    expect(mockDispatch).not.toHaveBeenCalledWith(
      stagesAction.updateStageId("AD_1")
    );
  });

  it("should dispatch an error when response contains application error", async () => {
    (postSaveData as jest.Mock).mockResolvedValue({
      status: 200,
      data: {
        application: {
          response_type: "HARD",
          response_action: "STOP",
          error: {
            application_error: [
              { error_description: "Application Error", rtobCode: "E02" },
            ],
          },
        },
      },
    });

    mockSelector.mockReturnValue({
      stages: { stageId: "AD_1" },
    });

    // Render component and trigger SetNextStageDetaisAfterSave
    render(<Fields />);
    const instance: any = screen;

    await act(async () => {
      instance.SetNextStageDetaisAfterSave("AD_1", "BD_1");
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      errorAction.getExceptionList([
        {
          statusCode: "E02",
          statusText: "Application Error",
          responseAction: "STOP",
          responseType: "HARD",
        },
      ])
    );
  });
});
