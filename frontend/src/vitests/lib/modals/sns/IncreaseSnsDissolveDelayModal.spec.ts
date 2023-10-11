import * as snsGovernanceApi from "$lib/api/sns-governance.api";
import { SECONDS_IN_DAY, SECONDS_IN_YEAR } from "$lib/constants/constants";
import IncreaseSnsDissolveDelayModal from "$lib/modals/sns/neurons/IncreaseSnsDissolveDelayModal.svelte";
import * as authServices from "$lib/services/auth.services";
import { loadSnsParameters } from "$lib/services/sns-parameters.services";
import { snsParametersStore } from "$lib/stores/sns-parameters.store";
import { daysToSeconds, secondsToDays } from "$lib/utils/date.utils";
import { page } from "$mocks/$app/stores";
import {
  createMockIdentity,
  mockPrincipal,
} from "$tests/mocks/auth.store.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import {
  createMockSnsNeuron,
  mockSnsNeuron,
  snsNervousSystemParametersMock,
} from "$tests/mocks/sns-neurons.mock";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { NeuronState } from "@dfinity/nns";
import type { SnsNeuron } from "@dfinity/sns";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { ICPToken, fromDefinedNullable } from "@dfinity/utils";
import { fireEvent } from "@testing-library/dom";
import { waitFor, type RenderResult } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";

vi.mock("$lib/api/sns-governance.api");
vi.mock("$lib/services/sns-parameters.services");

const testIdentity = createMockIdentity(10023);

const roundUpSecondsToWholeDays = (seconds: number): number =>
  daysToSeconds(secondsToDays(seconds));

describe("IncreaseSnsDissolveDelayModal", () => {
  const nowInSeconds = 1689063315;
  const now = nowInSeconds * 1000;
  const neuron: SnsNeuron = {
    ...mockSnsNeuron,
    dissolve_state: [
      {
        DissolveDelaySeconds: 0n,
      },
    ],
  };
  const reloadNeuron = vi.fn().mockResolvedValue(undefined);
  const renderIncreaseDelayModal = async (
    neuron: SnsNeuron
  ): Promise<RenderResult<SvelteComponent>> => {
    return renderModal({
      component: IncreaseSnsDissolveDelayModal,
      props: {
        rootCanisterId: mockPrincipal,
        neuron,
        token: ICPToken,
        reloadNeuron,
      },
    });
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(authServices, "getAuthenticatedIdentity").mockResolvedValue(
      testIdentity
    );

    vi.clearAllTimers();
    vi.useFakeTimers().setSystemTime(now);

    snsParametersStore.reset();
    snsParametersStore.setParameters({
      certified: true,
      rootCanisterId: mockPrincipal,
      parameters: snsNervousSystemParametersMock,
    });

    setSnsProjects([
      {
        rootCanisterId: mockPrincipal,
        lifecycle: SnsSwapLifecycle.Committed,
      },
    ]);

    page.mock({ data: { universe: mockPrincipal.toText() } });
  });

  it("should display modal", async () => {
    const { container } = await renderIncreaseDelayModal(neuron);

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should use current dissolve delay value when locked", async () => {
    const dissolveDelayDays = 12345;
    const neuron = createMockSnsNeuron({
      id: [1],
      state: NeuronState.Locked,
      dissolveDelaySeconds: BigInt(dissolveDelayDays * SECONDS_IN_DAY),
    });
    const { queryByTestId } = await renderIncreaseDelayModal(neuron);

    expect((queryByTestId("input-range") as HTMLInputElement).value).toBe(
      dissolveDelayDays.toString()
    );
  });

  it("should use current dissolve delay value when dissolving", async () => {
    const whenDissolvedTimestampSeconds = BigInt(
      nowInSeconds + SECONDS_IN_YEAR
    );
    const neuron = createMockSnsNeuron({
      id: [1],
      state: NeuronState.Dissolving,
      whenDissolvedTimestampSeconds,
    });
    const { queryByTestId } = await renderIncreaseDelayModal(neuron);

    expect((queryByTestId("input-range") as HTMLInputElement).value).toBe(
      "366"
    );
  });

  it("should have the update delay button disabled by default", async () => {
    const { container } = await renderIncreaseDelayModal(neuron);

    const updateDelayButton = container.querySelector(
      '[data-tid="go-confirm-delay-button"]'
    );
    expect(updateDelayButton?.getAttribute("disabled")).not.toBeNull();
  });

  it("should be able to change dissolve delay in the confirmation screen using range", async () => {
    const { container } = await renderIncreaseDelayModal(neuron);

    await waitFor(() =>
      expect(container.querySelector('input[type="range"]')).not.toBeNull()
    );
    const inputRange = container.querySelector('input[type="range"]');
    expect(inputRange).not.toBeNull();

    inputRange &&
      (await fireEvent.input(inputRange, {
        target: { value: 365 * 2 },
      }));

    const goToConfirmDelayButton = container.querySelector(
      '[data-tid="go-confirm-delay-button"]'
    );

    expect(goToConfirmDelayButton).toBeDefined();

    await waitFor(() =>
      expect(goToConfirmDelayButton?.getAttribute("disabled")).toBeNull()
    );

    goToConfirmDelayButton && (await fireEvent.click(goToConfirmDelayButton));

    await waitFor(() =>
      expect(
        container.querySelector('[data-tid="confirm-dissolve-delay-container"]')
      ).not.toBeNull()
    );

    const confirmButton = container.querySelector(
      '[data-tid="confirm-delay-button"]'
    );

    expect(confirmButton).toBeDefined();
    expect(snsGovernanceApi.setDissolveDelay).toBeCalledTimes(0);

    confirmButton && (await fireEvent.click(confirmButton));

    await waitFor(() =>
      expect(snsGovernanceApi.setDissolveDelay).toBeCalledTimes(1)
    );
  });

  it("should be able to change dissolve delay in the confirmation screen using input", async () => {
    const { container, queryByTestId } = await renderIncreaseDelayModal(neuron);

    await waitFor(() =>
      expect(queryByTestId("input-ui-element")).toBeInTheDocument()
    );

    const dissolveDelaySeconds = roundUpSecondsToWholeDays(SECONDS_IN_YEAR * 2);
    const inputElement = queryByTestId("input-ui-element");

    inputElement &&
      (await fireEvent.input(inputElement, {
        target: { value: `${Math.round(secondsToDays(dissolveDelaySeconds))}` },
      }));

    const goToConfirmDelayButton = container.querySelector(
      '[data-tid="go-confirm-delay-button"]'
    );

    expect(goToConfirmDelayButton).toBeDefined();

    await waitFor(() =>
      expect(goToConfirmDelayButton?.getAttribute("disabled")).toBeNull()
    );

    goToConfirmDelayButton && (await fireEvent.click(goToConfirmDelayButton));

    await waitFor(() =>
      expect(
        container.querySelector('[data-tid="confirm-dissolve-delay-container"]')
      ).not.toBeNull()
    );

    const confirmButton = container.querySelector(
      '[data-tid="confirm-delay-button"]'
    );

    expect(confirmButton).toBeDefined();
    expect(snsGovernanceApi.setDissolveDelay).toBeCalledTimes(0);

    confirmButton && (await fireEvent.click(confirmButton));

    await waitFor(() =>
      expect(snsGovernanceApi.setDissolveDelay).toBeCalledTimes(1)
    );
    expect(snsGovernanceApi.setDissolveDelay).toBeCalledWith(
      expect.objectContaining({
        dissolveTimestampSeconds: dissolveDelaySeconds + nowInSeconds,
      })
    );
  });

  it("should be able to set minimum by clicking on min button", async () => {
    const { queryByTestId } = await renderIncreaseDelayModal(neuron);

    await waitFor(() =>
      expect(queryByTestId("min-button")).toBeInTheDocument()
    );

    const minButton = queryByTestId("min-button");
    const inputElement = queryByTestId("input-ui-element");

    const minValue = fromDefinedNullable(
      snsNervousSystemParametersMock.neuron_minimum_dissolve_delay_to_vote_seconds
    );

    await fireEvent.click(minButton);

    await waitFor(() =>
      expect((inputElement as HTMLInputElement).value).toEqual(
        `${secondsToDays(Number(minValue))}`
      )
    );
  });

  it("should be able to set maximum by clicking on max button", async () => {
    const { queryByTestId } = await renderIncreaseDelayModal(neuron);

    await waitFor(() =>
      expect(queryByTestId("max-button")).toBeInTheDocument()
    );

    const maxValue = fromDefinedNullable(
      snsNervousSystemParametersMock.max_dissolve_delay_seconds
    );
    const maxButton = queryByTestId("max-button");
    const inputElement = queryByTestId("input-ui-element");

    await fireEvent.click(maxButton);

    await waitFor(() =>
      expect((inputElement as HTMLInputElement).value).toEqual(
        `${secondsToDays(Number(maxValue))}`
      )
    );
  });

  it("should trigger `loadSnsParameters`", async () => {
    await renderIncreaseDelayModal(neuron);

    expect(loadSnsParameters).toBeCalled();
  });
});