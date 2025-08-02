from pyteal import *


def approval_program():
    
    # don't need any real fancy initialization
    handle_creation = Return(Int(1))    
    
    addAsset = Seq(
        senderAssetBalance := AssetHolding.balance(Txn.sender(), Txn.assets[0]),
        assetCreator := AssetParam.creator(Txn.assets[0]),
        Assert(senderAssetBalance.value() == Int(1)),
        Assert(assetCreator.value() == Addr("SHEPWD4POJMJ65XPSGUCJ4GI2SGDJNDX2C2IXI24EK5KXTOV5T237ULUCU")),
        place := App.box_get(Concat(Itob(Txn.assets[0]), Bytes("place"))),
        Assert(Not(place.hasValue())),
        App.box_put(Concat(Itob(Txn.assets[0]), Bytes("place")), Txn.application_args[1]),
        time := App.box_get(Concat(Itob(Txn.assets[0]), Bytes("time"))),
        Assert(Not(time.hasValue())),
        If(Txn.application_args[1] == Bytes("train"),
            App.box_put(Concat(Itob(Txn.assets[0]), Bytes("time")), Itob(Txn.first_valid())),
            App.box_put(Concat(Itob(Txn.assets[0]), Bytes("time")), Itob(Txn.first_valid_time()))
        ),
        Int(1)
    )

    removeAsset = Seq(
        senderAssetBalance := AssetHolding.balance(Txn.sender(), Txn.assets[0]),
        assetCreator := AssetParam.creator(Txn.assets[0]),
        Assert(senderAssetBalance.value() == Int(1)),
        Assert(assetCreator.value() == Addr("SHEPWD4POJMJ65XPSGUCJ4GI2SGDJNDX2C2IXI24EK5KXTOV5T237ULUCU")),
        place := App.box_get(Concat(Itob(Txn.assets[0]), Bytes("place"))),
        Assert(place.hasValue()),
        Cond(
        [place.value() == Bytes("train"), Seq(
            xpS2 := App.box_get(Concat(Itob(Txn.assets[0]), Bytes("xpS2"))),
            time := App.box_get(Concat(Itob(Txn.assets[0]), Bytes("time"))),
            App.box_put(Concat(Itob(Txn.assets[0]), Bytes("xpS2")), Itob(Add(Btoi(xpS2.value()), Div(Minus(Txn.first_valid(), Btoi(time.value())), Int(1000))))),
            App.box_put(Concat(Itob(Txn.assets[0]), Bytes("time")), Itob(Txn.first_valid()))
        )],
        [place.value() == Bytes("jump"), Seq(
            
        )],
        [place.value() == Bytes("footie"), Seq(
            
        )],
        [place.value() == Bytes("marathon"), Seq(
            
        )],
        ),
        Assert(App.box_delete(Concat(Itob(Txn.assets[0]), Bytes("place")))),
        time := App.box_get(Concat(Itob(Txn.assets[0]), Bytes("time"))),
        Assert(time.hasValue()),
        Assert(App.box_delete(Concat(Itob(Txn.assets[0]), Bytes("time")))),
        Int(1)
    )

    surRoll = ScratchVar(TealType.uint64)
    powRoll = ScratchVar(TealType.uint64)

    level = ScratchVar(TealType.uint64)

    survival = ScratchVar(TealType.uint64)
    power = ScratchVar(TealType.uint64)
    Xp = ScratchVar(TealType.uint64)
    speed = ScratchVar(TealType.uint64)


    


    roll = Seq(
        senderAssetBalance := AssetHolding.balance(Txn.sender(), Txn.assets[0]),
        assetCreator := AssetParam.creator(Txn.assets[0]),
        Assert(senderAssetBalance.value() == Int(1)),
        Assert(assetCreator.value() == Addr("SHEPWD4POJMJ65XPSGUCJ4GI2SGDJNDX2C2IXI24EK5KXTOV5T237ULUCU")),
        place := App.box_get(Concat(Itob(Txn.assets[0]), Bytes("place"))),
        Assert(place.hasValue()),
        xpS2 := App.box_get(Concat(Itob(Txn.assets[0]), Bytes("xpS2"))),
        time := App.box_get(Concat(Itob(Txn.assets[0]), Bytes("time"))),
        shepStats := App.box_get(Concat(Itob(Txn.assets[0]), Bytes("stats"))),
        surRoll.store(Mod(Mul(Block.timestamp(Minus(Txn.first_valid(), Int(1))), Txn.assets[0]), Int(200)) + Int(1)),
        powRoll.store(Mod(Mul(Block.timestamp(Minus(Txn.first_valid(), Int(1))), Txn.assets[0]), Int(1000)) + Int(1)),
        level.store(Sqrt(Div(Btoi(xpS2.value()), Int(100))) + Int(1)),
        If(level.load() >= Int(1),
            survival.store(Add(Div(Minus(level.load(), Int(1)), Int(5)), Int(1)) + Div(level.load(), Int(5)) + Div(level.load(), Int(10))),
            survival.store(Int(0))
        ),
        If(level.load() >= Int(2),
            power.store(Add(Div(Minus(level.load(), Int(2)), Int(5)), Int(1)) + Div(level.load(), Int(5)) + Div(level.load(), Int(10))),
            power.store(Int(0))
        ),
        If(level.load() >= Int(3),
            Xp.store(Add(Div(Minus(level.load(), Int(3)), Int(5)), Int(1)) + Div(level.load(), Int(5)) + Div(level.load(), Int(10))),
            Xp.store(Int(0))
        ),
        If(level.load() >= Int(4),
            speed.store(Add(Div(Minus(level.load(), Int(4)), Int(5)), Int(1)) + Div(level.load(), Int(5)) + Div(level.load(), Int(10))),
            speed.store(Int(0))
        ),
        Cond(
        [place.value() == Bytes("train"), Seq(
            App.box_put(Concat(Itob(Txn.assets[0]), Bytes("xpS2")), Itob(Add(Btoi(xpS2.value()), Div(Minus(Txn.first_valid(), Btoi(time.value())), Int(1000))))),
            App.box_put(Concat(Itob(Txn.assets[0]), Bytes("time")), Itob(Txn.first_valid()))
        )],
        [place.value() == Bytes("jump"), Seq(
            Assert(Txn.first_valid_time() - Add(Btoi(time.value()), Mul(Minus(Int(200), Minus(Add(Btoi(Extract(shepStats.value(), Int(24), Int(8))), speed.load()), Int(300))), Int(1728))) > Int(0)),
            If(Minus(Mul(Int(2), Add(Btoi(Extract(shepStats.value(), Int(0), Int(8))), survival.load())), Int(700)) * surRoll.load() / Int(100) >= Int(100),
               App.box_put(Concat(Itob(Txn.assets[0]), Bytes("xpS2")), Itob(Add(Minus(Div(Mul(Int(40), Add(Btoi(Extract(shepStats.value(), Int(16), Int(8))), Xp.load())), Int(10)), Int(1400)), Btoi(xpS2.value())))),
               App.box_put(Concat(Itob(Txn.assets[0]), Bytes("xpS2")), Itob(Add(Minus(Div(Mul(Int(40), Add(Btoi(Extract(shepStats.value(), Int(16), Int(8))), Xp.load())), Int(10)), Int(1400)) / Int(2), Btoi(xpS2.value()))))
            ),
            App.box_put(Concat(Itob(Txn.assets[0]), Bytes("result")), Concat(Itob(surRoll.load()), Itob(powRoll.load()), Itob(Minus(Mul(Int(2), Add(Btoi(Extract(shepStats.value(), Int(0), Int(8))), survival.load())) + surRoll.load(), Int(800))), Itob(Minus(Mul(Int(10), Add(Btoi(Extract(shepStats.value(), Int(8), Int(8))), power.load())) + powRoll.load(), Int(4000))))),
            Assert(App.box_delete(Concat(Itob(Txn.assets[0]), Bytes("time"))))
        )],
        [place.value() == Bytes("footie"), Seq(
            Assert(Txn.first_valid_time() - Add(Btoi(time.value()), Mul(Minus(Int(200), Minus(Add(Btoi(Extract(shepStats.value(), Int(24), Int(8))), speed.load()), Int(300))), Int(2592))) > Int(0)),
            If(Minus(Mul(Int(2), Add(Btoi(Extract(shepStats.value(), Int(0), Int(8))), survival.load())), Int(700)) * surRoll.load() / Int(100) >= Int(60),
               App.box_put(Concat(Itob(Txn.assets[0]), Bytes("xpS2")), Itob(Add(Minus(Div(Mul(Int(72), Add(Btoi(Extract(shepStats.value(), Int(16), Int(8))), Xp.load())), Int(10)), Int(2520)), Btoi(xpS2.value())))),
               App.box_put(Concat(Itob(Txn.assets[0]), Bytes("xpS2")), Itob(Add(Minus(Div(Mul(Int(72), Add(Btoi(Extract(shepStats.value(), Int(16), Int(8))), Xp.load())), Int(10)), Int(2520)) / Int(2), Btoi(xpS2.value()))))
            ),
            App.box_put(Concat(Itob(Txn.assets[0]), Bytes("result")), Concat(Itob(surRoll.load()), Itob(powRoll.load()), Itob(Minus(Mul(Int(2), Add(Btoi(Extract(shepStats.value(), Int(0), Int(8))), survival.load())) + surRoll.load(), Int(800))), Itob(Minus(Mul(Int(10), Add(Btoi(Extract(shepStats.value(), Int(8), Int(8))), power.load())) + powRoll.load(), Int(4000))))),
            Assert(App.box_delete(Concat(Itob(Txn.assets[0]), Bytes("time"))))
        )],
        [place.value() == Bytes("marathon"), Seq(
            Assert(Txn.first_valid_time() - Add(Btoi(time.value()), Mul(Minus(Int(200), Minus(Add(Btoi(Extract(shepStats.value(), Int(24), Int(8))), speed.load()), Int(300))), Int(8640))) > Int(0)),
            If(Minus(Mul(Int(2), Add(Btoi(Extract(shepStats.value(), Int(0), Int(8))), survival.load())), Int(700)) * surRoll.load() / Int(100) >= Int(40),
               App.box_put(Concat(Itob(Txn.assets[0]), Bytes("xpS2")), Itob(Add(Minus(Div(Mul(Int(300), Add(Btoi(Extract(shepStats.value(), Int(16), Int(8))), Xp.load())), Int(10)), Int(10500)), Btoi(xpS2.value())))),
               App.box_put(Concat(Itob(Txn.assets[0]), Bytes("xpS2")), Itob(Add(Minus(Div(Mul(Int(300), Add(Btoi(Extract(shepStats.value(), Int(16), Int(8))), Xp.load())), Int(10)), Int(10500)) / Int(2), Btoi(xpS2.value()))))
            ),
            App.box_put(Concat(Itob(Txn.assets[0]), Bytes("result")), Concat(Itob(surRoll.load()), Itob(powRoll.load()), Itob(Minus(Mul(Int(2), Add(Btoi(Extract(shepStats.value(), Int(0), Int(8))), survival.load())) + surRoll.load(), Int(800))), Itob(Minus(Mul(Int(10), Add(Btoi(Extract(shepStats.value(), Int(8), Int(8))), power.load())) + powRoll.load(), Int(4000))))),
            Assert(App.box_delete(Concat(Itob(Txn.assets[0]), Bytes("time"))))
        )]
        ),
        Int(1)
    )

    # number of items in category Div(Len(box.value()), Int(16))
    # random number based on items available Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16)))
    # starting index of amount of item granted Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8))

    # get number of available for the granted item and subtract 1 Itob(Btoi(Extract(box.value(), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8)), Int(8))) - Int(1))

    rewardShep = Seq(
        senderAssetBalance := AssetHolding.balance(Txn.sender(), Txn.assets[0]),
        assetCreator := AssetParam.creator(Txn.assets[0]),
        Assert(senderAssetBalance.value() == Int(1)),
        Assert(assetCreator.value() == Addr("SHEPWD4POJMJ65XPSGUCJ4GI2SGDJNDX2C2IXI24EK5KXTOV5T237ULUCU")),
        rewardBox := App.box_get(Concat(Itob(Txn.assets[0]), Bytes("reward"))),
        If(rewardBox.hasValue(),
           Assert(App.box_delete(Concat(Itob(Txn.assets[0]), Bytes("reward"))))
        ),
        place := App.box_get(Concat(Itob(Txn.assets[0]), Bytes("place"))),
        Assert(place.hasValue()),
        result := App.box_get(Concat(Itob(Txn.assets[0]), Bytes("result"))),        
        Cond(
            [place.value() == Bytes("jump"), Seq(
            If(Btoi(Extract(result.value(), Int(16), Int(8))) >= Int(160),
               Cond(
                   [Btoi(Extract(result.value(), Int(24), Int(8))) >= Int(950), Seq(
                    Assert(Txn.assets[1] == Int(2582590415)),
                    InnerTxnBuilder.Begin(),
                    InnerTxnBuilder.SetFields({
                        TxnField.type_enum: TxnType.AssetTransfer,
                        TxnField.xfer_asset: Txn.assets[1],
                        TxnField.asset_receiver: Txn.sender(),
                        TxnField.asset_amount: Int(250000000000000),
                    }),
                    InnerTxnBuilder.Submit(),
                  )],
                   [Btoi(Extract(result.value(), Int(24), Int(8))) >= Int(700), Seq(
                    Assert(Txn.assets[1] == Int(2582590415)),
                    InnerTxnBuilder.Begin(),
                    InnerTxnBuilder.SetFields({
                        TxnField.type_enum: TxnType.AssetTransfer,
                        TxnField.xfer_asset: Txn.assets[1],
                        TxnField.asset_receiver: Txn.sender(),
                        TxnField.asset_amount: Int(42069420000000),
                    }),
                    InnerTxnBuilder.Submit(),
                  )],
                   [Int(1), Seq(
                    Assert(Txn.assets[1] == Int(2582590415)),
                    InnerTxnBuilder.Begin(),
                    InnerTxnBuilder.SetFields({
                        TxnField.type_enum: TxnType.AssetTransfer,
                        TxnField.xfer_asset: Txn.assets[1],
                        TxnField.asset_receiver: Txn.sender(),
                        TxnField.asset_amount: Int(6942069000000),
                    }),
                    InnerTxnBuilder.Submit(),
                  )]
               ),
            ),
        )],
        [place.value() == Bytes("footie"), Seq(
            If(Btoi(Extract(result.value(), Int(16), Int(8))) >= Int(100),
               Cond(
                   [Btoi(Extract(result.value(), Int(24), Int(8))) >= Int(900), Seq(
                    box := App.box_get(Bytes("raresS2")),
                    App.box_replace(Bytes("raresS2"), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8)), Itob(Btoi(Extract(box.value(), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8)), Int(8))) - Int(1))),
                    App.box_put(Concat(Itob(Txn.assets[0]), Bytes("reward")), Itob(Btoi(Extract(box.value(), Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8))))),
                    If(Btoi(Extract(box.value(), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8)), Int(8))) - Int(1) == Int(0),
                       Seq(
                           Assert(App.box_delete(Bytes("raresS2"))),
                           App.box_put(Bytes("raresS2"), Concat(Substring(box.value(), Int(0), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8)) - Int(8)), Substring(box.value(), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8)) + Int(8), Len(box.value()))))
                       )
                    ),
                  )],
                   [Btoi(Extract(result.value(), Int(24), Int(8))) >= Int(500), Seq(
                    box := App.box_get(Bytes("uncommonsS2")),
                    App.box_replace(Bytes("uncommonsS2"), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8)), Itob(Btoi(Extract(box.value(), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8)), Int(8))) - Int(1))),
                    App.box_put(Concat(Itob(Txn.assets[0]), Bytes("reward")), Itob(Btoi(Extract(box.value(), Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8))))),
                    If(Btoi(Extract(box.value(), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8)), Int(8))) - Int(1) == Int(0),
                       Seq(
                           Assert(App.box_delete(Bytes("uncommonsS2"))),
                           App.box_put(Bytes("uncommonsS2"), Concat(Substring(box.value(), Int(0), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8)) - Int(8)), Substring(box.value(), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8)) + Int(8), Len(box.value()))))
                       )
                    ),
                  )],
                   [Int(1), Seq(
                    box := App.box_get(Bytes("commonsS2")),
                    App.box_replace(Bytes("commonsS2"), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8)), Itob(Btoi(Extract(box.value(), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8)), Int(8))) - Int(1))),
                    App.box_put(Concat(Itob(Txn.assets[0]), Bytes("reward")), Itob(Btoi(Extract(box.value(), Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8))))),
                    If(Btoi(Extract(box.value(), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8)), Int(8))) - Int(1) == Int(0),
                       Seq(
                           Assert(App.box_delete(Bytes("commonsS2"))),
                           App.box_put(Bytes("commonsS2"), Concat(Substring(box.value(), Int(0), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8)) - Int(8)), Substring(box.value(), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8)) + Int(8), Len(box.value()))))
                       )
                    ),
                  )]
               ),
            ),
        )],
        [place.value() == Bytes("marathon"), Seq(
            If(Btoi(Extract(result.value(), Int(16), Int(8))) >= Int(80),
               Cond(
                   [Btoi(Extract(result.value(), Int(24), Int(8))) >= Int(950), Seq(
                    box := App.box_get(Bytes("legendarysS2")),
                    App.box_replace(Bytes("legendarysS2"), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8)), Itob(Btoi(Extract(box.value(), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8)), Int(8))) - Int(1))),
                    App.box_put(Concat(Itob(Txn.assets[0]), Bytes("reward")), Itob(Btoi(Extract(box.value(), Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8))))),
                    If(Btoi(Extract(box.value(), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8)), Int(8))) - Int(1) == Int(0),
                       Seq(
                           Assert(App.box_delete(Bytes("legendarysS2"))),
                           App.box_put(Bytes("legendarysS2"), Concat(Substring(box.value(), Int(0), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8)) - Int(8)), Substring(box.value(), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8)) + Int(8), Len(box.value()))))
                       )
                    ),
                  )],
                   [Btoi(Extract(result.value(), Int(24), Int(8))) >= Int(600), Seq(
                    box := App.box_get(Bytes("raresS2")),
                    App.box_replace(Bytes("raresS2"), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8)), Itob(Btoi(Extract(box.value(), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8)), Int(8))) - Int(1))),
                    App.box_put(Concat(Itob(Txn.assets[0]), Bytes("reward")), Itob(Btoi(Extract(box.value(), Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8))))),
                    If(Btoi(Extract(box.value(), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8)), Int(8))) - Int(1) == Int(0),
                       Seq(
                           Assert(App.box_delete(Bytes("raresS2"))),
                           App.box_put(Bytes("raresS2"), Concat(Substring(box.value(), Int(0), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8)) - Int(8)), Substring(box.value(), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8)) + Int(8), Len(box.value()))))
                       )
                    ),
                  )],
                   [Btoi(Extract(result.value(), Int(24), Int(8))) >= Int(200), Seq(
                    box := App.box_get(Bytes("uncommonsS2")),
                    App.box_replace(Bytes("uncommonsS2"), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8)), Itob(Btoi(Extract(box.value(), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8)), Int(8))) - Int(1))),
                    App.box_put(Concat(Itob(Txn.assets[0]), Bytes("reward")), Itob(Btoi(Extract(box.value(), Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8))))),
                    If(Btoi(Extract(box.value(), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8)), Int(8))) - Int(1) == Int(0),
                       Seq(
                           Assert(App.box_delete(Bytes("uncommonsS2"))),
                           App.box_put(Bytes("uncommonsS2"), Concat(Substring(box.value(), Int(0), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8)) - Int(8)), Substring(box.value(), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8)) + Int(8), Len(box.value()))))
                       )
                    ),
                  )],
                   [Int(1), Seq(
                    box := App.box_get(Bytes("commonsS2")),
                    App.box_replace(Bytes("commonsS2"), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8)), Itob(Btoi(Extract(box.value(), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8)), Int(8))) - Int(1))),
                    App.box_put(Concat(Itob(Txn.assets[0]), Bytes("reward")), Itob(Btoi(Extract(box.value(), Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8))))),
                    If(Btoi(Extract(box.value(), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8)), Int(8))) - Int(1) == Int(0),
                       Seq(
                           Assert(App.box_delete(Bytes("commonsS2"))),
                           App.box_put(Bytes("commonsS2"), Concat(Substring(box.value(), Int(0), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8)) - Int(8)), Substring(box.value(), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(box.value()), Int(16))), Int(16)), Int(8)) + Int(8), Len(box.value()))))
                       )
                    ),
                  )]
               ),
            ),
        )]
        ),
        Assert(App.box_delete(Concat(Itob(Txn.assets[0]), Bytes("place")))),
        Assert(App.box_delete(Concat(Itob(Txn.assets[0]), Bytes("result")))),
        Int(1)
    )

    equipItem = Seq(
        senderAssetBalance := AssetHolding.balance(Txn.sender(), Txn.assets[1]),
        assetCreator := AssetParam.creator(Txn.assets[1]),
        Assert(senderAssetBalance.value() == Int(1)),
        Assert(assetCreator.value() == Addr("SHEPWD4POJMJ65XPSGUCJ4GI2SGDJNDX2C2IXI24EK5KXTOV5T237ULUCU")),
        Assert(Gtxn[Minus(Txn.group_index(), Int(1))].xfer_asset() == Txn.assets[0]),
        Assert(Gtxn[Minus(Txn.group_index(), Int(1))].asset_receiver() == Global.current_application_address()),
        Assert(Gtxn[Minus(Txn.group_index(), Int(1))].asset_amount() == Int(1)),
        place := App.box_get(Concat(Itob(Txn.assets[1]), Bytes("place"))),
        Assert(Not(place.hasValue())),
        shepItems := App.box_get(Concat(Itob(Txn.assets[1]), Bytes("items"))),
        shepStats := App.box_get(Concat(Itob(Txn.assets[1]), Bytes("stats"))),
        Cond(
        [Txn.application_args[1] == Bytes("weapon"), Assert(Substring(shepItems.value(), Int(0), Int(8)) == Itob(Int(0)))],
        [Txn.application_args[1] == Bytes("armour"), Assert(Substring(shepItems.value(), Int(8), Int(16)) == Itob(Int(0)))],
        [Txn.application_args[1] == Bytes("boots"), Assert(Substring(shepItems.value(), Int(16), Int(24)) == Itob(Int(0)))],
        [Txn.application_args[1] == Bytes("extra"), Assert(Substring(shepItems.value(), Int(24), Int(32)) == Itob(Int(0)))],
        ),
        itemStats := App.box_get(Concat(Itob(Txn.assets[0]), Txn.application_args[1])),
        App.box_replace(Concat(Itob(Txn.assets[1]), Bytes("stats")), Int(0), Itob(Btoi(Extract(shepStats.value(), Int(0), Int(8))) + Btoi(Extract(itemStats.value(), Int(0), Int(8))) - Int(100))),
        App.box_replace(Concat(Itob(Txn.assets[1]), Bytes("stats")), Int(8), Itob(Btoi(Extract(shepStats.value(), Int(8), Int(8))) + Btoi(Extract(itemStats.value(), Int(8), Int(8))) - Int(100))),
        App.box_replace(Concat(Itob(Txn.assets[1]), Bytes("stats")), Int(16), Itob(Btoi(Extract(shepStats.value(), Int(16), Int(8))) + Btoi(Extract(itemStats.value(), Int(16), Int(8))) - Int(100))),
        App.box_replace(Concat(Itob(Txn.assets[1]), Bytes("stats")), Int(24), Itob(Btoi(Extract(shepStats.value(), Int(24), Int(8))) + Btoi(Extract(itemStats.value(), Int(24), Int(8))) - Int(100))),
        Cond(
        [Txn.application_args[1] == Bytes("weapon"), App.box_replace(Concat(Itob(Txn.assets[1]), Bytes("items")), Int(0), Itob(Txn.assets[0]))],
        [Txn.application_args[1] == Bytes("armour"), App.box_replace(Concat(Itob(Txn.assets[1]), Bytes("items")), Int(8), Itob(Txn.assets[0]))],
        [Txn.application_args[1] == Bytes("boots"), App.box_replace(Concat(Itob(Txn.assets[1]), Bytes("items")), Int(16), Itob(Txn.assets[0]))],
        [Txn.application_args[1] == Bytes("extra"), App.box_replace(Concat(Itob(Txn.assets[1]), Bytes("items")), Int(24), Itob(Txn.assets[0]))],
        ),
        Int(1)
    )

    unequipItem = Seq(
        senderAssetBalance := AssetHolding.balance(Txn.sender(), Txn.assets[1]),
        assetCreator := AssetParam.creator(Txn.assets[1]),
        Assert(senderAssetBalance.value() == Int(1)),
        Assert(assetCreator.value() == Addr("SHEPWD4POJMJ65XPSGUCJ4GI2SGDJNDX2C2IXI24EK5KXTOV5T237ULUCU")),
        place := App.box_get(Concat(Itob(Txn.assets[1]), Bytes("place"))),
        Assert(Not(place.hasValue())),
        shepItems := App.box_get(Concat(Itob(Txn.assets[1]), Bytes("items"))),
        Cond(
        [Txn.application_args[1] == Bytes("weapon"), Assert(Substring(shepItems.value(), Int(0), Int(8)) != Itob(Int(0)))],
        [Txn.application_args[1] == Bytes("armour"), Assert(Substring(shepItems.value(), Int(8), Int(16)) != Itob(Int(0)))],
        [Txn.application_args[1] == Bytes("boots"), Assert(Substring(shepItems.value(), Int(16), Int(24)) != Itob(Int(0)))],
        [Txn.application_args[1] == Bytes("extra"), Assert(Substring(shepItems.value(), Int(24), Int(32)) != Itob(Int(0)))],
        ),
        shepStats := App.box_get(Concat(Itob(Txn.assets[1]), Bytes("stats"))),
        itemStats := App.box_get(Concat(Itob(Txn.assets[0]), Txn.application_args[1])),
        App.box_replace(Concat(Itob(Txn.assets[1]), Bytes("stats")), Int(0), Itob(Add(Minus(Btoi(Substring(shepStats.value(), Int(0), Int(8))), Btoi(Substring(itemStats.value(), Int(0), Int(8)))), Int(100)))),
        App.box_replace(Concat(Itob(Txn.assets[1]), Bytes("stats")), Int(8), Itob(Add(Minus(Btoi(Substring(shepStats.value(), Int(8), Int(16))), Btoi(Substring(itemStats.value(), Int(8), Int(16)))), Int(100)))),
        App.box_replace(Concat(Itob(Txn.assets[1]), Bytes("stats")), Int(16), Itob(Add(Minus(Btoi(Substring(shepStats.value(), Int(16), Int(24))), Btoi(Substring(itemStats.value(), Int(16), Int(24)))), Int(100)))),
        App.box_replace(Concat(Itob(Txn.assets[1]), Bytes("stats")), Int(24), Itob(Add(Minus(Btoi(Substring(shepStats.value(), Int(24), Int(32))), Btoi(Substring(itemStats.value(), Int(24), Int(32)))), Int(100)))),
        Cond(
        [Txn.application_args[1] == Bytes("weapon"), App.box_replace(Concat(Itob(Txn.assets[1]), Bytes("items")), Int(0), Itob(Int(0)))],
        [Txn.application_args[1] == Bytes("armour"), App.box_replace(Concat(Itob(Txn.assets[1]), Bytes("items")), Int(8), Itob(Int(0)))],
        [Txn.application_args[1] == Bytes("boots"), App.box_replace(Concat(Itob(Txn.assets[1]), Bytes("items")), Int(16), Itob(Int(0)))],
        [Txn.application_args[1] == Bytes("extra"), App.box_replace(Concat(Itob(Txn.assets[1]), Bytes("items")), Int(24), Itob(Int(0)))],
        ),
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.AssetTransfer,
            TxnField.xfer_asset: Txn.assets[0],
            TxnField.asset_receiver: Txn.sender(),
            TxnField.asset_amount: Int(1),
        }),
        InnerTxnBuilder.Submit(),
        Int(1)
    )

    claimReward = Seq(
        senderAssetBalance := AssetHolding.balance(Txn.sender(), Txn.assets[0]),
        assetCreator := AssetParam.creator(Txn.assets[0]),
        Assert(senderAssetBalance.value() == Int(1)),
        Assert(assetCreator.value() == Addr("SHEPWD4POJMJ65XPSGUCJ4GI2SGDJNDX2C2IXI24EK5KXTOV5T237ULUCU")),
        reward := App.box_get(Concat(Itob(Txn.assets[0]), Bytes("reward"))),
        Assert(Btoi(reward.value()) == Txn.assets[1]),
        If(Btoi(reward.value()) == Int(2582590415),
           Seq(
               InnerTxnBuilder.Begin(),
                InnerTxnBuilder.SetFields({
                    TxnField.type_enum: TxnType.AssetTransfer,
                    TxnField.xfer_asset: Txn.assets[1],
                    TxnField.asset_receiver: Txn.sender(),
                    TxnField.asset_amount: Int(6942069000000),
                }),
                InnerTxnBuilder.Submit()
           ),
           Seq(
               InnerTxnBuilder.Begin(),
                InnerTxnBuilder.SetFields({
                    TxnField.type_enum: TxnType.AssetTransfer,
                    TxnField.xfer_asset: Txn.assets[1],
                    TxnField.asset_receiver: Txn.sender(),
                    TxnField.asset_amount: Int(1),
                }),
                InnerTxnBuilder.Submit(),
           )
        ),
        Assert(App.box_delete(Concat(Itob(Txn.assets[0]), Bytes("reward")))),
        Int(1)
    )

    optItem = Seq(
        Assert(Txn.sender() == Addr("NSPLIQLVYV7US34UDYGYPZD7QGSHWND7AWSWPD4FTLRGW5IF2P2R3IF3EQ")),
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.AssetTransfer,
            TxnField.xfer_asset: Txn.assets[0],
            TxnField.asset_receiver: Global.current_application_address(),
            TxnField.asset_amount: Int(0),
        }),
        InnerTxnBuilder.Submit(),
        Int(1)
    )

    addBox = Seq(
        Assert(Txn.sender() == Addr("NSPLIQLVYV7US34UDYGYPZD7QGSHWND7AWSWPD4FTLRGW5IF2P2R3IF3EQ")),
        box := App.box_get(Txn.application_args[1]),
        If(box.hasValue(), Assert(App.box_delete(Txn.application_args[1]))),
        App.box_put(Txn.application_args[1], Txn.application_args[2]),
        Int(1)
    )

    deleteBox = Seq(
        Assert(Txn.sender() == Addr("NSPLIQLVYV7US34UDYGYPZD7QGSHWND7AWSWPD4FTLRGW5IF2P2R3IF3EQ")),
        Assert(App.box_delete(Txn.application_args[1])),
        Int(1)
    )

    sendAsset = Seq(
        Assert(Txn.sender() == Addr("NSPLIQLVYV7US34UDYGYPZD7QGSHWND7AWSWPD4FTLRGW5IF2P2R3IF3EQ")),
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.AssetTransfer,
            TxnField.xfer_asset: Txn.assets[0],
            TxnField.asset_receiver: Txn.accounts[1],
            TxnField.asset_amount: Btoi(Txn.application_args[1]),
        }),
        InnerTxnBuilder.Submit(),
        Int(1)
    )

    # doesn't need anyone to opt in
    handle_optin = Return(Int(1))

    # only the creator can closeout the contract
    handle_closeout = Return(Int(1))

    # nobody can update the contract
    handle_updateapp =  Return(Txn.sender() == Global.creator_address())

    # only creator can delete the contract
    handle_deleteapp = Return(Txn.sender() == Global.creator_address())


    # handle the types of application calls
    program = Cond(
        [Txn.application_id() == Int(0), handle_creation],
        [Txn.on_completion() == OnComplete.OptIn, handle_optin],
        [Txn.on_completion() == OnComplete.CloseOut, handle_closeout],
        [Txn.on_completion() == OnComplete.UpdateApplication, handle_updateapp],
        [Txn.on_completion() == OnComplete.DeleteApplication, handle_deleteapp],
        [Txn.application_args[0] == Bytes("addAsset"), Return(addAsset)],
        [Txn.application_args[0] == Bytes("removeAsset"), Return(removeAsset)],
        [Txn.application_args[0] == Bytes("roll"), Return(roll)],
        [Txn.application_args[0] == Bytes("rewardShep"), Return(rewardShep)],
        [Txn.application_args[0] == Bytes("equipItem"), Return(equipItem)],
        [Txn.application_args[0] == Bytes("unequipItem"), Return(unequipItem)],
        [Txn.application_args[0] == Bytes("claimReward"), Return(claimReward)],
        [Txn.application_args[0] == Bytes("optItem"), Return(optItem)],
        [Txn.application_args[0] == Bytes("addBox"), Return(addBox)],
        [Txn.application_args[0] == Bytes("deleteBox"), Return(deleteBox)],
        [Txn.application_args[0] == Bytes("sendAsset"), Return(sendAsset)]




    )
    
    return program

# let clear state happen
def clear_state_program():
    program = Return(Int(1))
    return program
    


if __name__ == "__main__":
    with open("vote_approval.teal", "w") as f:
        compiled = compileTeal(approval_program(), mode=Mode.Application, version=8)
        f.write(compiled)

    with open("vote_clear_state.teal", "w") as f:
        compiled = compileTeal(clear_state_program(), mode=Mode.Application, version=8)
        f.write(compiled)