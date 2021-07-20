import 'package:dfinity_wallet/ui/_components/confirm_dialog.dart';
import 'package:dfinity_wallet/ui/_components/overlay_base_widget.dart';
import 'package:dfinity_wallet/ui/_components/responsive.dart';
import 'package:dfinity_wallet/ui/wallet/percentage_display_widget.dart';
import '../../../dfinity.dart';

GlobalKey _toolTipKey = GlobalKey();

class NeuronRewardsCard extends StatelessWidget {
  final Neuron neuron;

  const NeuronRewardsCard({Key? key, required this.neuron}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final myLocale = Localizations.localeOf(context);
    return Card(
      color: AppColors.background,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            "Maturity",
                            style: Responsive.isMobile(context)
                                ? context.textTheme.headline6
                                : context.textTheme.headline3,
                          ),
                          GestureDetector(
                            onTap: () {
                              final dynamic _toolTip = _toolTipKey.currentState;
                              _toolTip.ensureTooltipVisible();
                            },
                            child: Tooltip(
                              key: _toolTipKey,
                              padding: EdgeInsets.all(16),
                              margin: Responsive.isMobile(context)
                                  ? const EdgeInsets.only(
                                      left: 100.0, right: 100.0)
                                  : Responsive.isTablet(context)
                                      ? const EdgeInsets.only(
                                          left: 300.0, right: 300.0)
                                      : EdgeInsets.only(
                                          left: MediaQuery.of(context)
                                                  .size
                                                  .width *
                                              0.30,
                                          right: 700.0),
                              textStyle: Responsive.isMobile(context)
                                  ? context.textTheme.headline5
                                  : context.textTheme.headline4,
                              message:
                                  "When your neuron votes, its maturity increases. This allows you to spawn a new neuron containing newly minted ICP. Increases in maturity can occur up to 3 days after voting took place.",
                              child: Icon(
                                Icons.info,
                                color: context.textTheme.bodyText1?.color,
                                size: Responsive.isMobile(context) ? 18 : 25,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                SizedBox(
                  width: 24,
                ),
                IntrinsicHeight(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      PercentageDisplayWidget(
                        amount: neuron.stake.asE8s() > BigInt.zero
                            ? (100 *
                                (neuron.maturityICPEquivalent.asE8s() /
                                    neuron.stake.asE8s()))
                            : 0,
                        amountSize: Responsive.isMobile(context) ? 20 : 24,
                        locale: myLocale.languageCode,
                      ),
                      Expanded(
                          child: ConstrainedBox(
                              constraints: BoxConstraints(minHeight: 40),
                              child: Container())),
                      Align(
                        alignment: Alignment.bottomRight,
                        child: ElevatedButton(
                            onPressed: () {
                              OverlayBaseWidget.show(
                                  context,
                                  ConfirmDialog(
                                    title: "Really Spawn Neuron",
                                    description:
                                        "Are you sure you wish to spawn a new neuron?",
                                    onConfirm: () async {
                                      context.callUpdate(() async {
                                        final newNeuron = await context.icApi
                                            .spawnNeuron(
                                                neuronId:
                                                    neuron.identifier.toBigInt);
                                        context.nav.push(
                                            NeuronPageDef.createPageConfig(
                                                newNeuron));
                                      });
                                    },
                                  ));
                            }.takeIf((e) =>
                                neuron.maturityICPEquivalent.asE8s() >
                                    BigInt.from(E8S_PER_ICP) &&
                                neuron.isCurrentUserController),
                            child: Padding(
                              padding: const EdgeInsets.all(12.0),
                              child: Text(
                                "Spawn Neuron",
                                style: TextStyle(
                                    fontSize:
                                        Responsive.isMobile(context) ? 14 : 16),
                              ),
                            )),
                      )
                    ],
                  ),
                )
              ],
            ),
          ],
        ),
      ),
    );
  }
}
