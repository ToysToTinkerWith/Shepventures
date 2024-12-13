from pyteal import *


def approval_program():
    
    # don't need any real fancy initialization
    handle_creation = Return(Int(1))

    common = ScratchVar(TealType.uint64)
    rare = ScratchVar(TealType.uint64)

    dust = Seq(
        Assert(Gtxn[Minus(Txn.group_index(), Int(1))].xfer_asset() == Txn.assets[0]),
        Assert(Gtxn[Minus(Txn.group_index(), Int(1))].asset_receiver() == Global.current_application_address()),
        Assert(Gtxn[Minus(Txn.group_index(), Int(1))].asset_amount() == Int(1)),
        Assert(Txn.assets[1] == Int(2557493157)),
        Assert(Txn.assets[2] == Int(2534921654)),
        common.store(Int(0)),
        rare.store(Int(0)),
        Cond(
            [Or(Txn.assets[0] == Int(2164870486), Txn.assets[0] == Int(2164870489), Txn.assets[0] == Int(2164870498), Txn.assets[0] == Int(2164870500), 
                Txn.assets[0] == Int(2164870507), Txn.assets[0] == Int(2164870510), Txn.assets[0] == Int(2164941848), Txn.assets[0] == Int(2164941852), 
                Txn.assets[0] == Int(2164941855), Txn.assets[0] == Int(2164941879), Txn.assets[0] == Int(2164941881), Txn.assets[0] == Int(2164941907)), 
                Seq(
                    common.store(Int(2)),
                )
            ],
            [Or(Txn.assets[0] == Int(2164941792), Txn.assets[0] == Int(2164941794), Txn.assets[0] == Int(2164941797), Txn.assets[0] == Int(2164941807), 
                Txn.assets[0] == Int(2164941815), Txn.assets[0] == Int(2164941818), Txn.assets[0] == Int(2164941858), Txn.assets[0] == Int(2164941860), 
                Txn.assets[0] == Int(2164941862), Txn.assets[0] == Int(2164941894), Txn.assets[0] == Int(2164941910), Txn.assets[0] == Int(2164961032)), 
                Seq(
                    common.store(Int(7)),
                )
            ],
            [Or(Txn.assets[0] == Int(2164941820), Txn.assets[0] == Int(2164941822), Txn.assets[0] == Int(2164941824), Txn.assets[0] == Int(2164941826), 
                Txn.assets[0] == Int(2164941829), Txn.assets[0] == Int(2164941831), Txn.assets[0] == Int(2164941865), Txn.assets[0] == Int(2164941868), 
                Txn.assets[0] == Int(2164941870), Txn.assets[0] == Int(2164941897), Txn.assets[0] == Int(2164941921), Txn.assets[0] == Int(2164961034)), 
                Seq(
                    common.store(Int(15)),
                    rare.store(Int(2))
                )
            ],
            [Or(Txn.assets[0] == Int(2164941833), Txn.assets[0] == Int(2164941835), Txn.assets[0] == Int(2164941837), Txn.assets[0] == Int(2164941841), 
                Txn.assets[0] == Int(2164941846), Txn.assets[0] == Int(2164941872), Txn.assets[0] == Int(2164941877), Txn.assets[0] == Int(2164941904), 
                Txn.assets[0] == Int(2164941923), Txn.assets[0] == Int(2164961027), Txn.assets[0] == Int(2164961029), Txn.assets[0] == Int(2164961036)), 
                Seq(
                    common.store(Int(35)),
                    rare.store(Int(7))
                )
            ]
        ),
        If(common.load() != Int(0),
           Seq(
           InnerTxnBuilder.Begin(),
            InnerTxnBuilder.SetFields({
                TxnField.type_enum: TxnType.AssetTransfer,
                TxnField.xfer_asset: Txn.assets[1],
                TxnField.asset_receiver: Txn.sender(),
                TxnField.asset_amount: common.load(),
            }),
            InnerTxnBuilder.Submit(),
           )
        ),
        If(rare.load() != Int(0),
           Seq(
           InnerTxnBuilder.Begin(),
            InnerTxnBuilder.SetFields({
                TxnField.type_enum: TxnType.AssetTransfer,
                TxnField.xfer_asset: Txn.assets[2],
                TxnField.asset_receiver: Txn.sender(),
                TxnField.asset_amount: rare.load(),
            }),
            InnerTxnBuilder.Submit(),
           )
        ),
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
        [Txn.application_args[0] == Bytes("dust"), Return(dust)],
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