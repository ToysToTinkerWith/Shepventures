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
        App.box_put(Concat(Itob(Txn.assets[0]), Bytes("time")), Itob(Txn.first_valid())),
        xp := App.box_get(Concat(Itob(Txn.assets[0]), Bytes("xp"))),
        If(Not(xp.hasValue()),
           App.box_put(Concat(Itob(Txn.assets[0]), Bytes("xp")), Itob(Int(0)))
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
            xp := App.box_get(Concat(Itob(Txn.assets[0]), Bytes("xp"))),
            time := App.box_get(Concat(Itob(Txn.assets[0]), Bytes("time"))),
            App.box_put(Concat(Itob(Txn.assets[0]), Bytes("xp")), Itob(Add(Btoi(xp.value()), Div(Minus(Txn.first_valid(), Btoi(time.value())), Int(1000))))),
            App.box_put(Concat(Itob(Txn.assets[0]), Bytes("time")), Itob(Txn.first_valid()))
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
        xp := App.box_get(Concat(Itob(Txn.assets[0]), Bytes("xp"))),
        time := App.box_get(Concat(Itob(Txn.assets[0]), Bytes("time"))),
        shepStats := App.box_get(Concat(Itob(Txn.assets[0]), Bytes("stats"))),
        surRoll.store(Mod(Add(Block.timestamp(Minus(Txn.first_valid(), Int(1))), Btoi(Substring(Txn.tx_id(), Int(0), Int(8)))), Int(200))),
        powRoll.store(Mod(Block.timestamp(Minus(Txn.first_valid(), Int(1))), Int(100))),
        level.store(Sqrt(Div(Btoi(xp.value()), Int(100))) + Int(1)),
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
            App.box_put(Concat(Itob(Txn.assets[0]), Bytes("xp")), Itob(Add(Btoi(xp.value()), Div(Minus(Txn.first_valid(), Btoi(time.value())), Int(1000))))),
            App.box_put(Concat(Itob(Txn.assets[0]), Bytes("time")), Itob(Txn.first_valid()))
        )],
        [place.value() == Bytes("ocean"), Seq(
            Assert(Txn.first_valid() - Add(Btoi(time.value()), Mul(Minus(Int(200), Minus(Add(Btoi(Extract(shepStats.value(), Int(24), Int(8))), speed.load()), Int(300))), Int(600))) > Int(0)),
            App.box_put(Concat(Itob(Txn.assets[0]), Bytes("xp")), Itob(Add(Minus(Mul(Int(4), Add(Btoi(Extract(shepStats.value(), Int(16), Int(8))), Xp.load())), Int(1400)), Btoi(xp.value())))),
            App.box_put(Concat(Itob(Txn.assets[0]), Bytes("result")), Concat(Itob(surRoll.load()), Itob(powRoll.load()), Itob(Minus(Mul(Int(4), Add(Btoi(Extract(shepStats.value(), Int(0), Int(8))), survival.load())), Int(1420))), Itob(Minus(Mul(Int(2), Add(Btoi(Extract(shepStats.value(), Int(8), Int(8))), power.load())), Int(775))))),
            Assert(App.box_delete(Concat(Itob(Txn.assets[0]), Bytes("time"))))
        )]
        ),
        Int(1)
    )

    # number of items in category Div(Len(uncommonsBox.value()), Int(16))
    # random number based on items available Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(uncommonsBox.value()), Int(16)))
    # starting index of amount of item granted Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(uncommonsBox.value()), Int(16))), Int(16)), Int(8))

    # get number of available for the granted item and subtract 1 Itob(Btoi(Extract(uncommonsBox.value(), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(uncommonsBox.value()), Int(16))), Int(16)), Int(8)), Int(8))) - Int(1))

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
        [place.value() == Bytes("ocean"), Seq(
            If(Btoi(Extract(result.value(), Int(0), Int(8))) <= Btoi(Extract(result.value(), Int(16), Int(8))),
               If(Btoi(Extract(result.value(), Int(8), Int(8))) <= Btoi(Extract(result.value(), Int(24), Int(8))),
                  Seq(
                    uncommonsBox := App.box_get(Bytes("uncommons")),
                    App.box_replace(Bytes("uncommons"), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(uncommonsBox.value()), Int(16))), Int(16)), Int(8)), Itob(Btoi(Extract(uncommonsBox.value(), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(uncommonsBox.value()), Int(16))), Int(16)), Int(8)), Int(8))) - Int(1))),
                    App.box_put(Concat(Itob(Txn.assets[0]), Bytes("reward")), Itob(Btoi(Extract(uncommonsBox.value(), Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(uncommonsBox.value()), Int(16))), Int(16)), Int(8))))),
                    If(Btoi(Extract(uncommonsBox.value(), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(uncommonsBox.value()), Int(16))), Int(16)), Int(8)), Int(8))) - Int(1) == Int(0),
                       Seq(
                           Assert(App.box_delete(Bytes("uncommons"))),
                           App.box_put(Bytes("uncommons"), Concat(Substring(uncommonsBox.value(), Int(0), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(uncommonsBox.value()), Int(16))), Int(16)), Int(8)) - Int(8)), Substring(uncommonsBox.value(), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(uncommonsBox.value()), Int(16))), Int(16)), Int(8)) + Int(8), Len(uncommonsBox.value()))))
                       )
                    ),
                  ),
                  Seq(
                    commonsBox := App.box_get(Bytes("commons")),
                    App.box_replace(Bytes("commons"), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(commonsBox.value()), Int(16))), Int(16)), Int(8)), Itob(Btoi(Extract(commonsBox.value(), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(commonsBox.value()), Int(16))), Int(16)), Int(8)), Int(8))) - Int(1))),
                    App.box_put(Concat(Itob(Txn.assets[0]), Bytes("reward")), Itob(Btoi(Extract(commonsBox.value(), Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(commonsBox.value()), Int(16))), Int(16)), Int(8))))),
                    If(Btoi(Extract(commonsBox.value(), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(commonsBox.value()), Int(16))), Int(16)), Int(8)), Int(8))) - Int(1) == Int(0),
                       Seq(
                           Assert(App.box_delete(Bytes("commons"))),
                           App.box_put(Bytes("commons"), Concat(Substring(commonsBox.value(), Int(0), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(commonsBox.value()), Int(16))), Int(16)), Int(8)) - Int(8)), Substring(commonsBox.value(), Add(Mul(Mod(Btoi(Extract(result.value(), Int(8), Int(8))), Div(Len(commonsBox.value()), Int(16))), Int(16)), Int(8)) + Int(8), Len(commonsBox.value()))))
                       )
                    ),
                  )   
               )
            ),
        )],
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
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.AssetTransfer,
            TxnField.xfer_asset: Txn.assets[1],
            TxnField.asset_receiver: Txn.sender(),
            TxnField.asset_amount: Int(1),
        }),
        InnerTxnBuilder.Submit(),
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
        App.box_put(Txn.application_args[1], Txn.application_args[2]),
        Int(1)
    )

    deleteBox = Seq(
        Assert(Txn.sender() == Addr("NSPLIQLVYV7US34UDYGYPZD7QGSHWND7AWSWPD4FTLRGW5IF2P2R3IF3EQ")),
        Assert(App.box_delete(Txn.application_args[1])),
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
        [Txn.application_args[0] == Bytes("deleteBox"), Return(deleteBox)]



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