$(document).ready(function () {
        if (!window.ethereum) {
            document.getElementById('metamask-extension-not-installed').style.display = 'block'
            document.getElementById('connect-wallet').style.display = 'none'
        } else {
            //timeout for main.js to fetch the contract
            setTimeout(async function () {
                await getConnectedAccount()
                owner = await contract.methods.owner().call()

                if (account[0] === owner) {
                    document.getElementById('go-to-end-game').style.display = 'block'
                }
            }, 100)
        }
    }
)

// async function verifyPlayer() {
//     counter = await contract.methods.counter().call()
//
//     for (let i = 1; i < counter; i++) {
//         player = await contract.methods.players(i).call()
//
//         if (player === account[0]) {
//             window.location.replace('../html/end_game.html')
//         }
//     }
// }

async function getConnectedAccount() {
    account = await web3.eth.getAccounts()

    if (account.length > 0) {
        document.getElementById('connect-wallet').style.display = 'none'
        document.getElementById('join-game').style.display = 'block'
        document.getElementById('connected-wallet').innerText = account[0]
        document.getElementById('wallet-balance').innerText = await getWalletBalance()
    }
}

async function connectWallet() {
    {
        const accounts = await ethereum.request({
            method: "eth_requestAccounts"
        }).catch((err) => {
            if (err.code === 4001) {
                // If this happens, the user rejected the connection request.
                Swal.fire({
                    title: 'Connection Rejected',
                    text: 'You need to connect your MetaMask wallet to play the game',
                    icon: 'warning',
                })
            } else if (err.code === -32002) {
                // If this happens, there is already a request pending in the user's wallet, and he has asked for
                // another connection
                Swal.fire({
                    title: 'Request Pending',
                    text: 'There is already a request pending in your MetaMask. Please accept it',
                    icon: 'info',
                })
            } else {
                console.log(err)
                Swal.fire({
                    title: 'Connection Error',
                    text: 'There was some error in connecting your wallet. Please try again.',
                    icon: 'error',
                })
            }
        })
        if (accounts) {
            console.log("connected")
            Swal.fire({
                title: 'Connection Successful',
                text: 'MetaMask Wallet Connected',
                icon: 'success',
            }).then( () => {
                window.location.reload()
            })

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

//to pay the entry fee to join the game
async function joinGame() {
    // verifyPlayer()
    const gameEntryFee = await contract.methods.entryFee().call()

    const transactionParameters = {
        // gasPrice: await web3.eth.getGasPrice(),
        gas: '0x186A0',
        to: contractAddress,
        from: account[0],
        value: gameEntryFee,
    };
    document.getElementById('index-body').style.pointerEvents = 'none'

    await web3.eth.sendTransaction(transactionParameters)
        .once('transactionHash', function (hash) {
            transaction_status = Swal.fire({
                title: 'Transaction status',
                text: 'Your transaction is pending at ' + hash + '. Please wait till we confirm it.' +
                    ' Do not close this page',
                icon: 'info',
                showConfirmButton: false
            })
        })
        .once('receipt', function (receipt) {
            transaction_status.close()
            document.getElementById('index-body').style.pointerEvents = 'auto'

            if (receipt.status === true) {
                Swal.fire({
                    title: 'Transaction Confirmed',
                    text: 'Congratulations! Your transaction at ' + receipt.transactionHash + ' was successful',
                    icon: 'success',
                }).then(() => {
                    window.location.replace('../html/select_number.html')
                })
            } else {
                Swal.fire({
                    title: 'Transaction Error',
                    text: 'Oops! There was some error in completing your transaction.',
                    icon: 'error',
                })
            }
        })
        .on('error', function (error) {
            document.getElementById('index-body').style.pointerEvents = 'auto'

            if (error.code === 4001) {
                Swal.fire({
                    title: 'Transaction Rejected',
                    text: 'You need to confirm the transaction to join the game.',
                    icon: 'error',
                })
            } else {
                console.log(error)
                Swal.fire({
                    title: 'Transaction Error',
                    text: 'Oops! There was some error in completing your transaction',
                    icon: 'error',
                })
            }
        })
        // .then(async function () {
        //     window.location.replace('../html/select_number.html')
        // });
}