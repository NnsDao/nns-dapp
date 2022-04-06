/**
 * @jest-environment jsdom
 */

import { fireEvent } from "@testing-library/dom";
import { waitFor } from "@testing-library/svelte";
import NewTransactionModal from "../../../../lib/modals/accounts/NewTransactionModal.svelte";
import { accountsStore } from "../../../../lib/stores/accounts.store";
import {
  mockAccountsStoreSubscribe,
  mockSubAccount,
} from "../../../mocks/accounts.store.mock";
import en from "../../../mocks/i18n.mock";
import { renderModal } from "../../../mocks/modal.mock";

describe("NewTransactionModal", () => {
  jest
    .spyOn(accountsStore, "subscribe")
    .mockImplementation(mockAccountsStoreSubscribe([mockSubAccount]));

  it("should display modal", async () => {
    const { container } = await renderModal({
      component: NewTransactionModal,
      props: { canSelectAccount: true },
    });

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  const goToStep2 = async ({ container, getByText }) => {
    const mainAccount = container.querySelector(
      'article[role="button"]:first-of-type'
    ) as HTMLButtonElement;
    fireEvent.click(mainAccount);

    await waitFor(() =>
      expect(
        getByText(en.accounts.select_destination, { exact: false })
      ).toBeInTheDocument()
    );
  };

  const goToStep3 = async ({ container, getByText }) => {
    const subAccount = container.querySelector(
      'article[role="button"]:last-of-type'
    ) as HTMLButtonElement;
    fireEvent.click(subAccount);

    await waitFor(() =>
      expect(
        getByText(en.accounts.enter_icp_amount, { exact: false })
      ).toBeInTheDocument()
    );
  };

  const goBack = async ({ container, getByText, title }) => {
    const back = container.querySelector("button.back") as HTMLButtonElement;
    fireEvent.click(back);

    await waitFor(() =>
      expect(getByText(title, { exact: false })).toBeInTheDocument()
    );
  };

  it("should navigate back and forth between steps", async () => {
    const { container, getByText } = await renderModal({
      component: NewTransactionModal,
      props: { canSelectAccount: true },
    });

    // Is step 1 active?

    expect(
      getByText(en.accounts.select_source, { exact: false })
    ).toBeInTheDocument();

    // Go to step 2.
    await goToStep2({ container, getByText });

    // Go back to step 1.
    await goBack({ container, getByText, title: en.accounts.select_source });

    // Go to step 2.
    await goToStep2({ container, getByText });

    // Go to step 3.
    await goToStep3({ container, getByText });

    // Go back to step 2.
    await goBack({
      container,
      getByText,
      title: en.accounts.select_destination,
    });
  });
});
