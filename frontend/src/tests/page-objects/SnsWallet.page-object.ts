import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { IcrcTransactionsListPo } from "$tests/page-objects/IcrcTransactionsList.page-object";
import { SignInPo } from "$tests/page-objects/SignIn.page-object";
import { SnsTransactionModalPo } from "$tests/page-objects/SnsTransactionModal.page-object";
import { WalletPageHeaderPo } from "$tests/page-objects/WalletPageHeader.page-object";
import { WalletPageHeadingPo } from "$tests/page-objects/WalletPageHeading.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsWalletPo extends BasePageObject {
  private static readonly TID = "sns-wallet-component";

  static under(element: PageObjectElement): SnsWalletPo {
    return new SnsWalletPo(element.byTestId(SnsWalletPo.TID));
  }

  getWalletPageHeaderPo(): WalletPageHeaderPo {
    return WalletPageHeaderPo.under(this.root);
  }

  getWalletPageHeadingPo(): WalletPageHeadingPo {
    return WalletPageHeadingPo.under(this.root);
  }

  getIcrcTransactionsListPo(): IcrcTransactionsListPo {
    return IcrcTransactionsListPo.under(this.root);
  }

  getSnsTransactionModalPo(): SnsTransactionModalPo {
    return SnsTransactionModalPo.under(this.root);
  }

  getSignInPo(): SignInPo {
    return SignInPo.under(this.root);
  }

  getSendButtonPo(): ButtonPo {
    return this.getButton("open-new-sns-transaction");
  }

  getReceiveButtonPo(): ButtonPo {
    return this.getButton("receive-sns");
  }

  hasSignInButton(): Promise<boolean> {
    return this.getSignInPo().isPresent();
  }

  hasSpinner(): Promise<boolean> {
    return this.isPresent("spinner");
  }

  hasNoTransactions(): Promise<boolean> {
    return this.isPresent("no-transactions-component");
  }

  clickSendButton(): Promise<void> {
    return this.getSendButtonPo().click();
  }

  clickReceiveButton(): Promise<void> {
    return this.getReceiveButtonPo().click();
  }
}
