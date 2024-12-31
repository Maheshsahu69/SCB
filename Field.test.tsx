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

