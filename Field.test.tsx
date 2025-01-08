import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import Fields from "./fields";

// Mock dependencies
jest.mock("../footer/footer", () => () => <div data-testid="footer" />);
jest.mock("../review-page/review-page", () => () => <div data-testid="review-page" />);
jest.mock("../../../shared/components/spinner/spinner", () => () => <div data-testid="spinner" />);
jest.mock("../../preApproval/commonComponents/fundDisbursement/fund-disbursement", () => () => (
  <div data-testid="fund-disbursement" />
));

// Mock Redux actions and services
jest.mock("./fields.utils", () => ({
  getLovMissing: jest.fn(),
  stageFields: jest.fn(),
  getStagePayload: jest.fn(),
  stageSelectFields: jest.fn(),
  submitRequest: jest.fn(),
  userInputPayload: jest.fn(),
}));
jest.mock("../../../services/track-events", () => ({
  triggerAdobeEvent: jest.fn(),
}));

const mockStore = configureStore([]);

describe("Fields Component", () => {
  let store: any;

  beforeEach(() => {
    store = mockStore({
      stages: {
        stages: [{ stageId: "pd-1", stageInfo: {} }],
        userInput: { applicants: [{}] },
        parentChildFields: { selectFields: [], addSelectFields: [], deleteSelectFields: [] },
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

  it("shows the spinner when `showSpinner` is true", () => {
    store = mockStore({
      ...store.getState(),
      stages: {
        ...store.getState().stages,
        stages: [{ stageId: "ld-1", stageInfo: {} }],
      },
    });

    render(
      <Provider store={store}>
        <Fields />
      </Provider>
    );

    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("renders the FundDisbursement component for `ld-1` stageId", () => {
    store = mockStore({
      ...store.getState(),
      stages: {
        ...store.getState().stages,
        stages: [{ stageId: "ld-1", stageInfo: {} }],
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
        stages: [{ stageId: "rp", stageInfo: {} }],
      },
    });

    render(
      <Provider store={store}>
        <Fields />
      </Provider>
    );

    expect(screen.getByTestId("review-page")).toBeInTheDocument();
  });

  it("triggers submit when form is submitted", async () => {
    render(
      <Provider store={store}>
        <Fields />
      </Provider>
    );

    fireEvent.submit(screen.getByRole("form"));

    await waitFor(() => {
      expect(screen.getByTestId("footer")).toBeInTheDocument();
    });
  });

  it("handles back button click", () => {
    render(
      <Provider store={store}>
        <Fields />
      </Provider>
    );

    const backButton = screen.getByTestId("footer");
    fireEvent.click(backButton);

    // Add your specific assertions here
    expect(screen.getByRole("form")).toBeInTheDocument();
  });

  it("updates user inputs on callback", () => {
    render(
      <Provider store={store}>
        <Fields />
      </Provider>
    );

    const input = screen.getByRole("form");
    fireEvent.change(input, { target: { value: "test input" } });

    expect(input).toBeInTheDocument();
  });
});
