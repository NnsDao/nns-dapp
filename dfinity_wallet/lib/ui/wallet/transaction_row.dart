import 'package:dfinity_wallet/data/icp.dart';
import 'package:dfinity_wallet/data/transaction_type.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:intl/intl.dart';
import 'package:flutter/material.dart';

import '../../dfinity.dart';

class TransactionRow extends StatelessWidget {
  final Transaction transaction;
  final Account currentAccount;

  const TransactionRow(
      {Key? key, required this.transaction, required this.currentAccount})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    final dateFormatter = DateFormat.yMd().add_jm();
    final isReceive = transaction.from != currentAccount.accountIdentifier;
    final isSend = transaction.to != currentAccount.accountIdentifier;

    return Card(
      color: Color(0xff292a2e),
      child: Container(
        width: double.infinity,
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(transaction.type.getName(isReceive),
                        style: context.textTheme.headline3),
                    VerySmallFormDivider(),
                    Text(dateFormatter.format(transaction.date),
                        style: context.textTheme.bodyText2),
                    VerySmallFormDivider(),
                    if (isReceive)
                      SelectableText("Source: ${transaction.from}",
                          style: context.textTheme.bodyText2),
                    if (isSend)
                      SelectableText(
                        "To: ${transaction.to}",
                        style: context.textTheme.bodyText2,
                      ),
                  ],
                ),
              ),
              SizedBox(
                width: 20,
              ),
              TransactionAmountDisplayWidget(
                fee: transaction.fee,
                amount: transaction.amount,
                type: transaction.type,
                isReceive: isReceive,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class TransactionAmountDisplayWidget extends StatelessWidget {
  final ICP amount;
  final ICP fee;
  final TransactionType type;
  final bool isReceive;

  const TransactionAmountDisplayWidget(
      {Key? key,
      required this.fee,
      required this.amount,
      required this.type,
      required this.isReceive})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    final myLocale = Localizations.localeOf(context);
    final sign = isReceive ? "+" : "-";
    final color = isReceive ? AppColors.green500 : AppColors.gray50;
    final secondaryColor = isReceive ? AppColors.green600 : AppColors.gray200;

    final displayAmount = amount + (type.shouldShowFee(isReceive) ? this.fee : ICP.zero);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      mainAxisAlignment: MainAxisAlignment.center,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          "$sign${(displayAmount).asString(myLocale.languageCode)}",
          style: TextStyle(
              color: color,
              fontFamily: Fonts.circularBold,
              fontSize: 30.toDouble()),
        ),
        SizedBox(
          width: 7,
        ),
        Text("ICP",
            style: TextStyle(
                color: secondaryColor,
                fontFamily: Fonts.circularBook,
                fontSize: 20.0))
      ],
    );
  }
}
