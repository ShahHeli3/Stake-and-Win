const web3 = new Web3(Web3.givenProvider)
let account = window.ethereum.selectedAddress
let balance = null
let abi = null
let contract = null
let gameEntryFee = null
let contractAddress = "0xafE06092437c528444d3ae370475BfC6f89823fC"

$(document).ready(function () {
    fetch("./contract_abi.json").then(
        response => {
            return response.json()
        }
    ).then(data => {
        abi = data;
        contract = new web3.eth.Contract(abi, contractAddress);
    })
    setTimeout(async function () {
        gameEntryFee = await contract.methods.entryFee().call()

        if (!window.ethereum) {
            document.getElementById('metamask-extension-not-installed').style.display = 'block'
            document.getElementById('connect-wallet').style.display = 'none'
        }
    }, 500)
})

async function connectWallet() {
    {
        const accounts = await ethereum.request({
            method: "eth_requestAccounts"
        }).catch((err) => {
            if (err.code === 4001) {
                // If this happens, the user rejected the connection request.
                alert('Please connect your MetaMask wallet to play the game')
            } else if (err.code === -32002) {
                // If this happens, there is already a request pending in the user's wallet, and he has asked for
                // another connection
                alert('There is already a request pending in your MetaMask. Please accept it.')
            } else {
                alert("An error occurred")
                console.log(err)
            }
        })

        if (accounts) {
            account = await web3.eth.getAccounts()
            document.getElementById('connected-wallet').innerText = account
            document.getElementById('wallet-balance').innerText = await getWalletBalance()
            document.getElementById('connect-wallet').style.display = 'none'
            document.getElementById('join-game').style.display = 'block'
        }
    }
}

//to get balance of the account
async function getWalletBalance() {
    let account_balance = await window.ethereum.request({
        method: "eth_getBalance",
        params: [
            window.ethereum.selectedAddress,
            'latest'
        ]
    })
    balance = parseInt(account_balance) / Math.pow(10, 18) + ' Eth'
    return balance
}

//to pay the entry fee to join game
async function joinGame() {

    const transactionParameters = {
        // gasPrice: await web3.eth.getGasPrice(),
        gas: '0x186A0',
        to: contractAddress,
        from: account[0],
        value: gameEntryFee,
    };

    await web3.eth.sendTransaction(transactionParameters)
        .once('transactionHash', function (hash) {
            alert("Transaction pending at " + hash)
        })
        .once('receipt', function (receipt) {
            alert("Transaction confirmed at " + receipt.transactionHash)
        })
        .on('error', function (error) {
            if (error.code === 4001) {
                // If this happens, the user rejected the transaction
                alert('You need to confirm the transaction to join the game')
            } else {
                alert("Oops! There was some error in the transaction")
                console.log(error)
            }
        })
        .then(async function () {
            document.getElementById('wallet-balance').innerText = await getWalletBalance()
            window.location.replace('../StakeAndWin/html/select_number.html')
        });
}


// async function transferOwnership() {
//     getOwner()
//     setTimeout(function () {
//         if (account === owner) {
//             new_owner = document.getElementById('transfer-ownership-to').value
//             if (new_owner.length === 0) {
//                 alert("Please enter an address in the input box")
//             } else {
//                 $.ajax({
//                     method: 'POST',
//                     url: '/transfer_ownership',
//                     headers: {
//                         "X-CSRFToken": getCookie("csrftoken")
//                     },
//                     data: {
//                         'new_owner': new_owner,
//                         'chain_id': chainId
//                     },
//                     success: function (response) {
//                         alert(response['response'])
//                     }
//                 })
//             }
//         } else {
//             alert("Only the owner has access to this function")
//         }
//     }, 1500);
// }
//

// if the user changes the account from MetaMask or disconnects
window.ethereum.on('accountsChanged', async function () {
    account = await web3.eth.getAccounts()

    //if the user disconnects all the accounts from MetaMask
    if (account.length === 0) {
        window.location.reload();
    } else {
        document.getElementById('connected-wallet').innerText = account
        document.getElementById('wallet-balance').innerText = await getWalletBalance()
    }
})

// if the user switches the chain
window.ethereum.on('chainChanged', function (_chainId) {
    window.location.reload();
})

