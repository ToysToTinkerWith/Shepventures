from pyteal import *


def approval_program():
    
    # don't need any real fancy initialization
    handle_creation = Return(Int(1))    
    
    addAsset = Seq(
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
        place := App.box_get(Concat(Itob(Txn.assets[0]), Bytes("place"))),
        Assert(place.hasValue()),
        Assert(App.box_delete(Concat(Itob(Txn.assets[0]), Bytes("place")))),
        time := App.box_get(Concat(Itob(Txn.assets[0]), Bytes("time"))),
        Assert(time.hasValue()),
        Assert(App.box_delete(Concat(Itob(Txn.assets[0]), Bytes("time")))),
        Int(1)
    )

    claim = Seq(
        sender := AssetHolding.balance(Txn.sender(), Txn.assets[0]),
        Assert(sender.hasValue()),
        Assert(sender.value() == Int(1)),
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
        [Txn.application_args[0] == Bytes("claim"), Return(claim)]







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