import fs from "fs"
import algosdk from "algosdk"
import { initializeApp, getApps } from "firebase/app"

import { getFirestore } from "firebase/firestore"
import { doc, setDoc, getDoc } from "firebase/firestore"


const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
}


console.log(firebaseConfig)

let firebase_app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const db = getFirestore(firebase_app)


//SMART CONTRACT DEPLOYMENT
  // declare application state storage (immutable)
  const localInts = 0;
  const localBytes = 0;
  const globalInts = 0; 
  const globalBytes = 0;

  // get accounts from mnemonic
  const creatorMnemonic = ""
  const userMnemonic = ""
  const creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic)
  const userAccout =  algosdk.mnemonicToSecretKey(userMnemonic)

  const creatorSecret = creatorAccount.sk
  const creatorAddress = creatorAccount.addr
  const sender = userAccout.addr

  //Generate Account
  //const account = algosdk.generateAccount()
  //const secrekey = account.sk
  // const mnemonic = algosdk.secretKeyToMnemonic(secrekey)
  // console.log("mnemonic " + mnemonic )
  // console.log("address " + account.addr )

  console.log()
  // Connect your client
  const algodToken = "";
  const baseServer = 'https://node.algoexplorerapi.io/';
  const port = "";
  const headers ={"X-API-Key": ""}  
    
  //console.log(process.env) 
  const client = new algosdk.Algodv2('', 'https://mainnet-api.algonode.cloud', 443)

  const indexerClient = new algosdk.Indexer('', 'https://mainnet-idx.algonode.cloud', 443)

  


  // Read Teal File
  let approvalProgram = ''
  let clear_state_program = ''

  try {
    approvalProgram = fs.readFileSync('vote_approval.teal', 'utf8')
    clear_state_program = fs.readFileSync('vote_clear_state.teal', 'utf8')
    

  
    
    //console.log(approvalProgram)
    //console.log(clear_state_program)
  } catch (err) {
    console.error(err)
  }

  

  // Compile Program
  const compileProgram = async (client, programSource) => {
  let encoder = new TextEncoder();
  let programBytes = encoder.encode(programSource);
  let compileResponse = await client.compile(programBytes).do();
  let compiledBytes = new Uint8Array(Buffer.from(compileResponse.result, "base64"));
  // console.log(compileResponse)
  return compiledBytes;
}

// Rounds
const waitForRound = async (round) => {
  let last_round = await client.status().do()
  let lastRound = last_round['last-round']
  console.log("Waiting for round " + lastRound)
  while (lastRound < round) {
    lastRound +=1
  const block =  await client.statusAfterBlock(lastRound).do()
  console.log("Round " + block['last-round'])
  }
}

// convert 64 bit integer i to byte string
const intToBytes = (integer) => {
  return integer.toString()
}

//CREATE APP
// create unsigned transaction
const createApp = async (sender, 
  approvalProgram, clearProgram, 
  localInts, localBytes, globalInts, globalBytes, app_args) => {
    try{
      const onComplete = algosdk.OnApplicationComplete.NoOpOC;

      let params = await client.getTransactionParams().do()
      params.fee = 1000;
      params.flatFee = true;
      
      console.log("suggestedparams" + params)

        let txn = algosdk.makeApplicationCreateTxn(sender, params, onComplete, 
          approvalProgram, clearProgram, 
          localInts, localBytes, globalInts, globalBytes, app_args, undefined, undefined, undefined, undefined, undefined, undefined, 3, undefined);
        let txId = txn.txID().toString();
        // Sign the transaction
        let signedTxn = txn.signTxn(creatorAccount.sk);
        console.log("Signed transaction with txID: %s", txId);
        
        // Submit the transaction
        await client.sendRawTransaction(signedTxn).do()                           
            // Wait for transaction to be confirmed
           let confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);
            console.log("confirmed" + confirmedTxn)

            //Get the completed Transaction
            console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
            // display results
            let transactionResponse = await client.pendingTransactionInformation(txId).do()
            let appId = transactionResponse['application-index'];
            console.log("Created new app-id: ",appId);
      }catch(err){
      console.log("error: " + err)
    }
}

//OPTIN
// create unsigned transaction
const Optin = async (sender, index) => {
  try{
    let params = await client.getTransactionParams().do()
    params.fee = 1000;
    params.flatFee = true;

    let txn = algosdk.makeApplicationOptInTxn(sender, params, index);
    let txId = txn.txID().toString();
    // sign, send, await
    // Sign the transaction
    let signedTxn = txn.signTxn(userAccout.sk);
    console.log("Signed transaction with txID: %s", txId);

    // Submit the transaction
    await client.sendRawTransaction(signedTxn).do()                           
        // Wait for transaction to be confirmed
       const confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);
        console.log("confirmed" + confirmedTxn)

        //Get the completed Transaction
        console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
        // display results
    // display results
    let transactionResponse = await client.pendingTransactionInformation(txId).do();
    console.log("Opted-in to app-id:",transactionResponse['txn']['txn']['apid'])
  }catch(err){
    console.log(err)
  }
}




//READ STATE
// read local state of application from user account
const readLocalState = async (index) => {
  try{
    let accountInfoResponse = await client.accountInformation(userAccout.addr).do();
    let localState = accountInfoResponse['apps-local-state']
    return localState.map((item)=> {
      if(item['id'] == index){
        console.log("User's local state:" + item.id);
        let localStateItem = accountInfoResponse['apps-local-state'][item]['key-value']
        localStateItem.map((local) =>{
          console.log(local)
          return local
        })
      }
      return item
    })
  }catch(err){
    console.log(err)
  }
}


// read global state of application
const readGlobalState = async (index) => {
  try{
    let applicationInfoResponse = await client.getApplicationByID(index).do();
    let globalState = applicationInfoResponse['params']['global-state']
    return globalState.map((state) =>{
      return state
    })
  }catch(err){
    console.log(err)
  }
}

//UPDATE
// create unsigned transaction
const update = async (sender, index, approvalProgram, clearProgram) => {
  try{
    let params = await client.getTransactionParams().do()
    params.fee = 1000;
    params.flatFee = true;

  let txn = algosdk.makeApplicationUpdateTxn(sender, params, index, approvalProgram, clearProgram);
// sign, send, await
  let txId = txn.txID().toString();
  // Sign the transaction
  let signedTxn = txn.signTxn(creatorAccount.sk);
  console.log("Signed transaction with txID: %s", txId);

  // Submit the transaction
  await client.sendRawTransaction(signedTxn).do()                           
      // Wait for transaction to be confirmed
     const confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);
      console.log("confirmed" + confirmedTxn)

      //Get the completed Transaction
      console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);

  // display results
  let transactionResponse = await client.pendingTransactionInformation(txId).do();
  let appId = transactionResponse['txn']['txn'].apid;
  console.log("Updated app-id: ",appId);
  }catch(err){
    console.log(err)
  }
}


// CLOSE OUT
// create unsigned transaction
const  closeOut = async (sender, index) => {
  try{
    let params = await client.getTransactionParams().do()
    params.fee = 1000;
    params.flatFee = true;
    let txn = algosdk.makeApplicationCloseOutTxn(sender, params, index)
  // sign, send, await
    let txId = txn.txID().toString();
      // Sign the transaction
      let signedTxn = txn.signTxn(userAccout.sk);
      console.log("Signed transaction with txID: %s", txId);

      // Submit the transaction
      await client.sendRawTransaction(signedTxn).do()                           
          // Wait for transaction to be confirmed
         const confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);
          console.log("confirmed" + confirmedTxn)

          //Get the completed Transaction
          console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);

      // display results
      let transactionResponse = await client.pendingTransactionInformation(txId).do();
      console.log("Closed out from app-id:",transactionResponse['txn']['txn']['apid'])
  }catch(err){
    console.log(err)
  }
}


//DELETE
// create unsigned transaction
const deleteApp = async (sender, index) => {
  try{
    let params = await client.getTransactionParams().do()
    params.fee = 1000;
    params.flatFee = true;
    let txn = algosdk.makeApplicationDeleteTxn(sender, params, index);
    // sign, send, await
    let txId = txn.txID().toString();
      // Sign the transaction
      let signedTxn = txn.signTxn(creatorAccount.sk);
      console.log("Signed transaction with txID: %s", txId);

      // Submit the transaction
      await client.sendRawTransaction(signedTxn).do()                           
          // Wait for transaction to be confirmed
         const confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);
          console.log("confirmed" + confirmedTxn)

          //Get the completed Transaction
          console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);

    // display results
    let transactionResponse = await client.pendingTransactionInformation(txId).do();
    let appId = transactionResponse['txn']['txn'].apid;
    console.log("Deleted app-id: ",appId);
  }catch(err){
    console.log(err)
  }
}


// CLEAR STATE
// create unsigned transaction
const clearState = async (sender, index) => {
  try{
    let params = await client.getTransactionParams().do()
    params.fee = 1000;
    params.flatFee = true;
  let txn = algosdk.makeApplicationClearStateTxn(sender, params, index);
  let txId = txn.txID().toString();
  // sign, send, await
  let signedTxn = txn.signTxn(userAccout.sk);
    console.log("Signed transaction with txID: %s", txId);

    // Submit the transaction
    await client.sendRawTransaction(signedTxn).do()                           
        // Wait for transaction to be confirmed
       const confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);
        console.log("confirmed" + confirmedTxn)

        //Get the completed Transaction
        console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
  // display results
  let transactionResponse = await client.pendingTransactionInformation(txId).do();
  let appId = transactionResponse['txn']['txn'].apid;
  console.log("Cleared local state for app-id: ",appId);
  }catch(err){
    console.log(err)
  }
}

//  CALL(NOOP)
// call application with arguments
const noop = async (sender, index, assetID)  => {

  try{

    
    const appArgs = []
    appArgs.push(
      new Uint8Array(Buffer.from("localAdd")),
      algosdk.encodeUint64(250)
      
    )
  let params = await client.getTransactionParams().do()

  const accounts = []
  const foreignApps = []
    
  const foreignAssets = [assetID]


  let txn = algosdk.makeApplicationNoOpTxn(sender, params, index, appArgs, accounts, foreignApps, foreignAssets, undefined, undefined, undefined);

    let txId = txn.txID().toString();
    // Sign the transaction
    let signedTxn = txn.signTxn(creatorAccount.sk);
    console.log("Signed transaction with txID: %s", txId);

    // Submit the transaction
    await client.sendRawTransaction(signedTxn).do()                           
        // Wait for transaction to be confirmed
       const confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);
        console.log("confirmed" + confirmedTxn)

        //Get the completed Transaction
        console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);

  }catch(err){
    console.log(err)
  }
}

const longToByteArray = (long) => {
  // we want to represent the input as a 8-bytes array
  var byteArray = [0, 0, 0, 0, 0, 0, 0, 0];

  for ( var index = byteArray.length - 1; index > 0; index -- ) {
      var byte = long & 0xff;
      byteArray [ index ] = byte;
      long = (long - byte) / 256 ;
  }

  return byteArray;
};

const byteArrayToLong = (byteArray) => {
  var value = 0;
  for ( var i = 0; i < byteArray.length; i++) {
      value = (value * 256) + byteArray[i];
  }

  return value;
};



const addItem = async () => {

  const indexerClient = new algosdk.Indexer('', 'https://mainnet-idx.algonode.cloud', 443)

  let createdAssets = await indexerClient.lookupAccountCreatedAssets("3G4PM64BTRW2X452WVYXKRZSD76Z4HR5E7YLGBIC7PWI67HNXMZKCAG2EM").do()

  createdAssets.assets.forEach(async (asset) => {


    if (asset.index == 2534864633) {

      let assetConfig = await indexerClient.lookupAssetTransactions(asset.index)
      .txType("acfg")
      .do();

      let properties = JSON.parse(atob(assetConfig.transactions[assetConfig.transactions.length - 1].note))

      console.log(properties)

      let itemData = [...longToByteArray(Number(properties.properties.Survival) + 100), ...longToByteArray(Number(properties.properties.Power) + 100), ...longToByteArray(Number(properties.properties.XP) + 100), ...longToByteArray(Number(properties.properties.SPEED) + 100)]
      let itemName = [...longToByteArray(asset.index), ...Buffer.from("armour")]

      console.log(itemData)
      console.log(itemName)

      const appArgs = []
      appArgs.push(
        new Uint8Array(Buffer.from("addBox")),
        new Uint8Array(Buffer.from(itemName)),
        new Uint8Array(Buffer.from(itemData)),
        
      )

      console.log(appArgs)
      let params = await client.getTransactionParams().do()

      const accounts = []
      const foreignApps = []
        
      const foreignAssets = []

      let boxes = [{appIndex: 0, name: new Uint8Array(Buffer.from(itemName))}]

      let txn = algosdk.makeApplicationNoOpTxn(creatorAddress, params, 2254344958, appArgs, accounts, foreignApps, foreignAssets, undefined, undefined, undefined, boxes);

      let txId = txn.txID().toString();
      // Sign the transaction
      let signedTxn = txn.signTxn(creatorAccount.sk);
      console.log("Signed transaction with txID: %s", txId);

      // Submit the transaction
      await client.sendRawTransaction(signedTxn).do()                           
        // Wait for transaction to be confirmed
      const confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);
      console.log("confirmed" + confirmedTxn)

      //Get the completed Transaction
      console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
    
    }

    // if (properties.properties.Category == "Accessory") {
    

    //   const appArgs = []
    //   appArgs.push(
    //     new Uint8Array(Buffer.from("addItem")),
    //     new Uint8Array(Buffer.from("extra")),
    //     new Uint8Array(Buffer.from(itemData)),
        
    //   )

    //   console.log(appArgs)
    //   let params = await client.getTransactionParams().do()

    //   const accounts = []
    //   const foreignApps = []
        
    //   const foreignAssets = [asset.index]

    //   let itemArray = longToByteArray(asset.index)

    //   let boxes = [{appIndex: 0, name: new Uint8Array([...itemArray, ...new Uint8Array(Buffer.from("extra"))])}]

    //   let txn = algosdk.makeApplicationNoOpTxn(creatorAddress, params, 1371810703, appArgs, accounts, foreignApps, foreignAssets, undefined, undefined, undefined, boxes);

    //   let txId = txn.txID().toString();
    //   // Sign the transaction
    //   let signedTxn = txn.signTxn(creatorAccount.sk);
    //   console.log("Signed transaction with txID: %s", txId);

    //   // Submit the transaction
    //   await client.sendRawTransaction(signedTxn).do()                           
    //     // Wait for transaction to be confirmed
    //   const confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);
    //   console.log("confirmed" + confirmedTxn)

    //   //Get the completed Transaction
    //   console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);


    // }

  })

}

const optItem = async () => {

  const indexerClient = new algosdk.Indexer('', 'https://mainnet-idx.algonode.cloud', 443)

  let createdAssets = await indexerClient.lookupAccountCreatedAssets("3G4PM64BTRW2X452WVYXKRZSD76Z4HR5E7YLGBIC7PWI67HNXMZKCAG2EM").do()

  createdAssets.assets.forEach(async (asset) => {

    let assetConfig = await indexerClient.lookupAssetTransactions(asset.index)
    .txType("acfg")
    .do();

    let properties = JSON.parse(atob(assetConfig.transactions[assetConfig.transactions.length - 1].note))

      console.log(properties.properties)
      let itemData = [...longToByteArray(Number(properties.properties.Survival) + 100), ...longToByteArray(Number(properties.properties.Power) + 100), ...longToByteArray(Number(properties.properties.XP) + 100), ...longToByteArray(Number(properties.properties.SPEED) + 100)]
      console.log(itemData)
      let itemName = [longToByteArray(asset.index)]
      console.log(itemName)

      const appArgs = []
      appArgs.push(
        new Uint8Array(Buffer.from("optItem"))
        
      )

      console.log(appArgs)
      let params = await client.getTransactionParams().do()

      const accounts = []
      const foreignApps = []
        
      const foreignAssets = [asset.index]

      

      let txn = algosdk.makeApplicationNoOpTxn(creatorAddress, params, 2254344958, appArgs, accounts, foreignApps, foreignAssets, undefined, undefined, undefined);

      let txId = txn.txID().toString();
      // Sign the transaction
      let signedTxn = txn.signTxn(creatorAccount.sk);
      console.log("Signed transaction with txID: %s", txId);

      // Submit the transaction
      await client.sendRawTransaction(signedTxn).do()                           
        // Wait for transaction to be confirmed
      const confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);
      console.log("confirmed" + confirmedTxn)

      //Get the completed Transaction
      console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);


    

  })
}

const addShep = async () => {

  const indexerClient = new algosdk.Indexer('', 'https://mainnet-idx.algonode.cloud', 443)

  let createdAssets = await indexerClient.lookupAccountCreatedAssets("SHEPWD4POJMJ65XPSGUCJ4GI2SGDJNDX2C2IXI24EK5KXTOV5T237ULUCU").limit(1000).do()

  console.log(createdAssets.assets.length)

  createdAssets.assets.slice(700).forEach(async (asset) => {
    //console.log(asset)

    let assetBytes = longToByteArray(asset.index)

    let shepStats = new Uint8Array([...assetBytes, ...new Uint8Array(Buffer.from("stats"))])
    let shepItems = new Uint8Array([...assetBytes, ...new Uint8Array(Buffer.from("items"))])

    const appArgs = []
      appArgs.push(
        new Uint8Array(Buffer.from("addShep")),
        new Uint8Array([...longToByteArray(400), ...longToByteArray(400), ...longToByteArray(400), ...longToByteArray(400)]),
        new Uint8Array([...longToByteArray(0), ...longToByteArray(0), ...longToByteArray(0), ...longToByteArray(0)])
      )

      console.log(appArgs)
      let params = await client.getTransactionParams().do()

      const accounts = []
      const foreignApps = []
        
      const foreignAssets = [asset.index]

      let boxes = [{appIndex: 0, name: shepStats}, {appIndex: 0, name: shepItems}]

      let txn = algosdk.makeApplicationNoOpTxn(creatorAddress, params, 1371810703, appArgs, accounts, foreignApps, foreignAssets, undefined, undefined, undefined, boxes);

      let txId = txn.txID().toString();
      // Sign the transaction
      let signedTxn = txn.signTxn(creatorAccount.sk);
      console.log("Signed transaction with txID: %s", txId);

      // Submit the transaction
      await client.sendRawTransaction(signedTxn).do()                           
        // Wait for transaction to be confirmed
      const confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);
      console.log("confirmed" + confirmedTxn)

      //Get the completed Transaction
      console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);

  })

}



const addRewards = async () => {

  const indexerClient = new algosdk.Indexer('', 'https://mainnet-idx.algonode.cloud', 443)

  let assets = await indexerClient.lookupAccountAssets("NA4ARVXN5LZIDIBVF4KHWMOLEKN6FENRCMAHZMFXXXVUDO5TL4OOQEM24I").do()

  let createdAssets = await indexerClient.lookupAccountCreatedAssets("3G4PM64BTRW2X452WVYXKRZSD76Z4HR5E7YLGBIC7PWI67HNXMZKCAG2EM").do()


  let common = []
  let uncommon = []
  let rare = []
  let legendary = []

  count = 0

  createdAssets.assets.forEach(async (asset) => {

    if (asset.params["unit-name"] == "ITEM ") {
      if (asset.params.total == 500) {
        common.push({assetId: asset.index})
      }
      else if (asset.params.total == 100) {
        uncommon.push({assetId: asset.index})
      }
      else if (asset.params.total == 25) {
        rare.push({assetId: asset.index})
      }
      else if (asset.params.total == 10) {
        legendary.push({assetId: asset.index})
      }
      count++
    }

  })

  console.log(count)

  common.forEach((item, index) => {
    assets.assets.forEach((asset) => {
      if (item.assetId == asset["asset-id"]) {
        common[index].amount = asset.amount
      }
    })
  })

  console.log(common)

  uncommon.forEach((item, index) => {
    assets.assets.forEach((asset) => {
      if (item.assetId == asset["asset-id"]) {
        uncommon[index].amount = asset.amount
      }
    })
  })

  console.log(uncommon)

  rare.forEach((item, index) => {
    assets.assets.forEach((asset) => {
      if (item.assetId == asset["asset-id"]) {
        rare[index].amount = asset.amount
      }
    })
  })

  console.log(rare)

  legendary.forEach((item, index) => {
    assets.assets.forEach((asset) => {
      if (item.assetId == asset["asset-id"]) {
        legendary[index].amount = asset.amount
      }
    })
  })

  console.log(legendary)

  let rewardBox = []

  legendary.forEach((asset) => {
    
    rewardBox = new Uint8Array([...rewardBox, ...longToByteArray(asset.assetId), ...longToByteArray(asset.amount)])

  })



  console.log(rewardBox)

  const appArgs = []
      appArgs.push(
        new Uint8Array(Buffer.from("addBox")),
        new Uint8Array(Buffer.from("legendarys")),
        rewardBox
      )

      console.log(appArgs)
      let params = await client.getTransactionParams().do()

      const accounts = []
      const foreignApps = []
        
      const foreignAssets = []

      let box = new Uint8Array(Buffer.from("legendarys"))

      let boxes = [{appIndex: 0, name: box}, {appIndex: 0, name: box}]

      let txn = algosdk.makeApplicationNoOpTxn(creatorAddress, params, 2254344958, appArgs, accounts, foreignApps, foreignAssets, undefined, undefined, undefined, boxes);

      let txId = txn.txID().toString();
      // Sign the transaction
      let signedTxn = txn.signTxn(creatorAccount.sk);
      console.log("Signed transaction with txID: %s", txId);

      // Submit the transaction
      await client.sendRawTransaction(signedTxn).do()                           
        // Wait for transaction to be confirmed
      const confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);
      console.log("confirmed" + confirmedTxn)

      //Get the completed Transaction
      console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);



}

const copyBoxes = async () => {

  const indexerClient = new algosdk.Indexer('', 'https://mainnet-idx.algonode.cloud', 443)

let oldBoxes = []

const responsePage1 = await indexerClient
       .searchForApplicationBoxes(1371810703)
       .limit(1000)
       .do();

console.log(responsePage1.boxes.length)

oldBoxes = [...oldBoxes, ...responsePage1.boxes]

const responsePage2 = await indexerClient
       .searchForApplicationBoxes(1371810703)
       .limit(1000)
       .nextToken(responsePage1.nextToken)
       .do();

console.log(responsePage2.boxes.length)

oldBoxes = [...oldBoxes, ...responsePage2.boxes]

const responsePage3 = await indexerClient
       .searchForApplicationBoxes(1371810703)
       .limit(1000)
       .nextToken(responsePage2.nextToken)
       .do();

console.log(responsePage3.boxes.length)

oldBoxes = [...oldBoxes, ...responsePage3.boxes]

console.log(responsePage3.boxes[0])

console.log(oldBoxes)

let count = 0


while (oldBoxes.length > 0) {

  console.log(count)

  const boxResponse = await indexerClient
       .lookupApplicationBoxByIDandName(1371810703, oldBoxes[count].name)
       .do();
  
  const boxValue = boxResponse.value;

  console.log(oldBoxes[count].name)

  console.log(boxValue)

  const appArgs = []
      appArgs.push(
        new Uint8Array(Buffer.from("addBox")),
        oldBoxes[count].name,
        boxValue
      )

      let params = await client.getTransactionParams().do()

      const accounts = []
      const foreignApps = []
        
      const foreignAssets = []

      let boxes = [{appIndex: 0, name: oldBoxes[count].name}]

      let txn = algosdk.makeApplicationNoOpTxn(creatorAddress, params, 2254344958, appArgs, accounts, foreignApps, foreignAssets, undefined, undefined, undefined, boxes);

      let txId = txn.txID().toString();
      // Sign the transaction
      let signedTxn = txn.signTxn(creatorAccount.sk);

      // Submit the transaction
      await client.sendRawTransaction(signedTxn).do()                           
        // Wait for transaction to be confirmed
      const confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);
      console.log("confirmed" + confirmedTxn)

      

  count++

    }

}

const sendAsset = async () => {


    const appArgs = []
      appArgs.push(
        new Uint8Array(Buffer.from("sendAsset")),
        algosdk.encodeUint64(Number(50))
        
      )

      let params = await client.getTransactionParams().do()

      const accounts = ["ADYPJJIQZFQZXIRU7D43U5HIH5GSYUF3VRYA5UJXHWGNMWZR23CRH7CIKY"]
      const foreignApps = []
        
      const foreignAssets = [2557493157]

      let boxes = []

      let txn = algosdk.makeApplicationNoOpTxn(creatorAddress, params, 2575065768, appArgs, accounts, foreignApps, foreignAssets, undefined, undefined, undefined, boxes);

      let txId = txn.txID().toString();
      // Sign the transaction
      let signedTxn = txn.signTxn(creatorAccount.sk);

      // Submit the transaction
      await client.sendRawTransaction(signedTxn).do()                           
        // Wait for transaction to be confirmed
      const confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);
      console.log("confirmed" + confirmedTxn)

}

const deleteBox = async (shep) => {
        
    let params = await client.getTransactionParams().do()

    let shepBytes = longToByteArray(shep)

    let box = new Uint8Array([...shepBytes, ...new Uint8Array(Buffer.from("time"))])

    let appArgs = []
    appArgs.push(
        new Uint8Array(Buffer.from("deleteBox")),
        box

    )

    console.log(appArgs)

    const accounts = []
    const foreignApps = []
        
    const foreignAssets = []


    let boxes = [{appIndex: 0, name: box}]


    let txn = algosdk.makeApplicationNoOpTxn("NSPLIQLVYV7US34UDYGYPZD7QGSHWND7AWSWPD4FTLRGW5IF2P2R3IF3EQ", params, 2254344958, appArgs, accounts, foreignApps, foreignAssets, undefined, undefined, undefined, boxes);

    let txId = txn.txID().toString();

    let signedTxn = txn.signTxn(creatorAccount.sk);
        
    await client.sendRawTransaction(signedTxn).do()                           
    
    const confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);

    console.log(confirmedTxn)

}

const addBox = async (shep) => {
        
  let params = await client.getTransactionParams().do()

  let shepBytes = longToByteArray(shep)

  let accountItems = await client.getApplicationBoxByName(2254344958, new Uint8Array([...shepBytes, ...new Uint8Array(Buffer.from("items"))])).do();

                   
  let weapon = byteArrayToLong(accountItems.value.slice(0,8))
  console.log(weapon)
  let armour = byteArrayToLong(accountItems.value.slice(8,16))
  let boots = byteArrayToLong(accountItems.value.slice(16,24))
  let extra = byteArrayToLong(accountItems.value.slice(24,32))

  let box = new Uint8Array([...shepBytes, ...new Uint8Array(Buffer.from("items"))])

  let newBox = new Uint8Array([...longToByteArray(2534864660), ...longToByteArray(armour), ...longToByteArray(boots), ...longToByteArray(extra)])

  console.log(newBox)

  let appArgs = []
  appArgs.push(
      new Uint8Array(Buffer.from("addBox")),
      box,
      newBox

  )

  console.log(appArgs)

  const accounts = []
  const foreignApps = []
      
  const foreignAssets = []


  let boxes = [{appIndex: 0, name: box}]


  let txn = algosdk.makeApplicationNoOpTxn("NSPLIQLVYV7US34UDYGYPZD7QGSHWND7AWSWPD4FTLRGW5IF2P2R3IF3EQ", params, 2254344958, appArgs, accounts, foreignApps, foreignAssets, undefined, undefined, undefined, boxes);

  let txId = txn.txID().toString();

  let signedTxn = txn.signTxn(creatorAccount.sk);
      
  await client.sendRawTransaction(signedTxn).do()                           
  
  const confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);

  console.log(confirmedTxn)

}

const opt = async (index) => {

      const appArgs = []
      appArgs.push(
        new Uint8Array(Buffer.from("optItem"))
        
      )

      console.log(appArgs)
      let params = await client.getTransactionParams().do()

      const accounts = []
      const foreignApps = []
        
      const foreignAssets = [index]

      

      let txn = algosdk.makeApplicationNoOpTxn(creatorAddress, params, 2254344958, appArgs, accounts, foreignApps, foreignAssets, undefined, undefined, undefined);

      let txId = txn.txID().toString();
      // Sign the transaction
      let signedTxn = txn.signTxn(creatorAccount.sk);
      console.log("Signed transaction with txID: %s", txId);

      // Submit the transaction
      await client.sendRawTransaction(signedTxn).do()                           
        // Wait for transaction to be confirmed
      const confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);
      console.log("confirmed" + confirmedTxn)

      //Get the completed Transaction
      console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);


    


}

const getAccountTxns = async () => {

  const indexerClient = new algosdk.Indexer('', 'https://mainnet-idx.algonode.cloud', 443)

  const address = "XBYLS2E6YI6XXL5BWCAMOA4GTWHXWENZMX5UHXMRNWWUQ7BXCY5WC5TEPA";
  const accountTxns = await indexerClient.lookupAccountTransactions(address).do();

  console.log(accountTxns)


}

const getLeaderboards = async () => {

  const status = await client.status().do();

  const currentRound = status['last-round'];

  console.log(currentRound)

  const boxesResponse = await client.getApplicationBoxes(2254344958).do();

  console.log(boxesResponse)

  let count = 0

  let shepXp = []
  let shepTrain = []
  let shepItems = []

  while (count < boxesResponse.boxes.length) {

    let shepId = byteArrayToLong(boxesResponse.boxes[count].name.slice(0,8))
    console.log(shepId)

    const strArray = boxesResponse.boxes[count].name.slice(8)

    const str = String.fromCharCode(...strArray);

    if (str == "xp") {

      console.log(str)

      let boxValue = await client.getApplicationBoxByName(2254344958, boxesResponse.boxes[count].name).do();

      console.log(boxValue)

      shepXp.push({shepId: shepId, shepXp: byteArrayToLong(boxValue.value)})

    }

    else if (str == "place") {

      let boxValue = await client.getApplicationBoxByName(2254344958, boxesResponse.boxes[count].name).do();

      const strArray = boxValue.value

      const str = String.fromCharCode(...strArray);

      let assetBox = algosdk.encodeUint64(shepId)

      if (str == "train") {

        let boxValue = await client.getApplicationBoxByName(2254344958, new Uint8Array([...assetBox, ...new Uint8Array(Buffer.from("time"))])).do();

        let trainTime = byteArrayToLong(boxValue.value)

        console.log("trainTime:" + trainTime)

        shepTrain.push({shepId: shepId, trainTime: currentRound - trainTime})

      }

    }

    else if (str == "items") {

      let assetBox = algosdk.encodeUint64(shepId)

      let boxValue = await client.getApplicationBoxByName(2254344958, new Uint8Array([...assetBox, ...new Uint8Array(Buffer.from("items"))])).do();

      let itemScore = 0

      let weapon = byteArrayToLong(boxValue.value.slice(0,8))

      console.log(weapon)

      if (weapon != 0) {

        let assetConfig = await indexerClient.lookupAssetTransactions(weapon)
        .txType("acfg")
        .do();

        let weaponProperties = JSON.parse(atob(assetConfig.transactions[assetConfig.transactions.length - 1].note))

        console.log(weaponProperties)

        itemScore += Number(weaponProperties.properties.Survival)
        itemScore += Number(weaponProperties.properties.Power)
        itemScore += Number(weaponProperties.properties.XP)
        itemScore += Number(weaponProperties.properties.SPEED)

      }

      let armour = byteArrayToLong(boxValue.value.slice(8,16))

      if (armour != 0) {

        let assetConfig = await indexerClient.lookupAssetTransactions(armour)
        .txType("acfg")
        .do();

        let armourProperties = JSON.parse(atob(assetConfig.transactions[assetConfig.transactions.length - 1].note))

        console.log(armourProperties)

        itemScore += Number(armourProperties.properties.Survival)
        itemScore += Number(armourProperties.properties.Power)
        itemScore += Number(armourProperties.properties.XP)
        itemScore += Number(armourProperties.properties.SPEED)

      }      

      let boots = byteArrayToLong(boxValue.value.slice(16,24))

      if (boots != 0) {

        let assetConfig = await indexerClient.lookupAssetTransactions(boots)
        .txType("acfg")
        .do();

        let bootsProperties = JSON.parse(atob(assetConfig.transactions[assetConfig.transactions.length - 1].note))

        console.log(bootsProperties)

        itemScore += Number(bootsProperties.properties.Survival)
        itemScore += Number(bootsProperties.properties.Power)
        itemScore += Number(bootsProperties.properties.XP)
        itemScore += Number(bootsProperties.properties.SPEED)

      }

      let extra = byteArrayToLong(boxValue.value.slice(24,32))

      if (extra != 0) {

        let assetConfig = await indexerClient.lookupAssetTransactions(extra)
        .txType("acfg")
        .do();

        let extraProperties = JSON.parse(atob(assetConfig.transactions[assetConfig.transactions.length - 1].note))

        console.log(extraProperties)

        itemScore += Number(extraProperties.properties.Survival)
        itemScore += Number(extraProperties.properties.Power)
        itemScore += Number(extraProperties.properties.XP)
        itemScore += Number(extraProperties.properties.SPEED)

      }

      shepItems.push({shepId: shepId, itemScore: itemScore})

    }

    count++

    console.log(count)

  }

  shepXp.sort((a, b) => b.shepXp - a.shepXp)

  console.log(shepXp)
  console.log(shepTrain)

  shepTrain.forEach((shep) => {

    const index = shepXp.findIndex((item) => item.shepId === shep.shepId)

    shepXp[index].shepXp = shepXp[index].shepXp + Math.floor(shep.trainTime / 1000)

  })

  shepXp.sort((a, b) => b.shepXp - a.shepXp)

  console.log(shepXp)

  let top20Xp = shepXp.slice(0,20)

  top20Xp.forEach((shep, index) => {

    let userRef = doc(db, "LeaderboardXP", String(index + 1));

    setDoc(userRef, {shepId: shep.shepId, shepXp: shep.shepXp})

  })

  shepItems.sort((a, b) => b.itemScore - a.itemScore)

  let top20Items = shepItems.slice(0,20)

  console.log(top20Items)

  top20Items.forEach((shep, index) => {

    let userRef = doc(db, "LeaderboardItems", String(index + 1));

    setDoc(userRef, {shepId: shep.shepId, itemScore: shep.itemScore})

  })

}

const craftRewards = async () => {

  let params = await client.getTransactionParams().do()

  let rewards = []
  let craftRewards = []

  let legendarysBox = await client.getApplicationBoxByName(2254344958, new Uint8Array(Buffer.from("legendarys"))).do();

  for(let i = 0; i < legendarysBox.value.length; i+=16) {

    let item = byteArrayToLong(legendarysBox.value.slice(i, i+8))
    let amount = byteArrayToLong(legendarysBox.value.slice(i+8, i+16))

    if (amount > 0) {
      rewards.push({assetId: item, amount: amount})
    }


  }

  console.log(rewards)

  let uncommons = [2164941792, 2164941794, 2164941797, 2164941807, 2164941815, 2164941818, 2164941858, 2164941860, 2164941862, 2164941894, 2164941910, 2164961032]
  let rares = [2164941820, 2164941822, 2164941824, 2164941826, 2164941829, 2164941831, 2164941865, 2164941868, 2164941870, 2164941897, 2164941921, 2164961034]
  let legendarys = [2164941833, 2164941835, 2164941837, 2164941841, 2164941846, 2164941872, 2164941877, 2164941904, 2164941923, 2164961027, 2164961029, 2164961036]

  const responseCraft = await indexerClient.lookupAccountAssets("4E7OY45TM5DY264HBPF7UYHLTGYUXTCSDKHGG6VB346XZNORURU2BAETBA").do();

  responseCraft.assets.forEach((asset) => {
    if (legendarys.includes(asset["asset-id"])) {
      let item = asset["asset-id"]
      let amount = asset.amount

      if (amount > 0) {
        craftRewards.push({assetId: item, amount: amount})

        let found = false
        rewards.forEach((reward) => {
          if(reward.assetId == item) {
            found = true
            reward.amount += amount
          }
        })
        if (!found) {
          rewards.push({assetId: item, amount: amount})
        }
      }

      
    }
  })

  console.log(rewards)
  console.log(craftRewards)

  craftRewards.forEach(async (reward) => {

    console.log(reward)
    
    let appArgs = []
    appArgs.push(
    new Uint8Array(Buffer.from("sendToRewards")),
    algosdk.encodeUint64(reward.amount)
    )

    let accounts = ["NA4ARVXN5LZIDIBVF4KHWMOLEKN6FENRCMAHZMFXXXVUDO5TL4OOQEM24I"]
    let foreignApps = []
    
    let foreignAssets = [reward.assetId]
    
    const boxes = []

    let txn = algosdk.makeApplicationNoOpTxn("NSPLIQLVYV7US34UDYGYPZD7QGSHWND7AWSWPD4FTLRGW5IF2P2R3IF3EQ", params, 2575065768, appArgs, accounts, foreignApps, foreignAssets, undefined, undefined, undefined, boxes);
    
    let signedTxn = txn.signTxn(creatorAccount.sk);

    const { txId } = await client.sendRawTransaction(signedTxn).do()

    console.log(txId)

    let confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);

    console.log(confirmedTxn)

  })

  
  let rewardsBox = []

  rewards.forEach((reward) => {
    rewardsBox = [...rewardsBox, ...longToByteArray(reward.assetId), ...longToByteArray(reward.amount)]
  })

  console.log(rewardsBox)

  rewardsBox = new Uint8Array(rewardsBox)

  let box = new Uint8Array((Buffer.from("legendarys")))

  console.log(rewardsBox)
  console.log(box)

  let appArgs = []
    appArgs.push(
    new Uint8Array(Buffer.from("addBox")),
    box,
    rewardsBox
    )

    let accounts = []
    let foreignApps = []
    
    let foreignAssets = []
    
    let boxes = [{appIndex: 0, name: box}]

    let txn = algosdk.makeApplicationNoOpTxn("NSPLIQLVYV7US34UDYGYPZD7QGSHWND7AWSWPD4FTLRGW5IF2P2R3IF3EQ", params, 2254344958, appArgs, accounts, foreignApps, foreignAssets, undefined, undefined, undefined, boxes);
    
    let signedTxn = txn.signTxn(creatorAccount.sk);

    const { txId } = await client.sendRawTransaction(signedTxn).do()

    console.log(txId)

    let confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);

    console.log(confirmedTxn)

}

const main = async () => {

  craftRewards()

  //getLeaderboards()

  // getAccountTxns()

  // await sendAsset()

  // const address = "3G4PM64BTRW2X452WVYXKRZSD76Z4HR5E7YLGBIC7PWI67HNXMZKCAG2EM";
  // const accountCreatedAssets = await indexerClient.lookupAccountCreatedAssets(address).do();

  // console.log(accountCreatedAssets.length)

  // accountCreatedAssets.assets.slice(30).forEach(async (asset) => {
  //   await opt(asset.index)
  // })

  //await opt(2689195676)

  //noop(creatorAddress, 1278098285, 877451592)

  //await addRewards()
  
 // await addItem()

 // await optItem()

 // await addShep()

 // await deleteBox(779750051)

 //await addBox(779742825)

const approval_program = await compileProgram(client, approvalProgram)
const clear_program = await compileProgram(client, clear_state_program )

// configure registration and voting period
//let status = await client.status().do()


// create list of bytes for app args
let appArgs = [];


// create new application
//const appId =  await createApp(creatorAddress, approval_program, clear_program , localInts, localBytes, globalInts, globalBytes, appArgs)

//const updateId = await update(creatorAddress, 2254344958, approval_program, clear_program)



}

main()