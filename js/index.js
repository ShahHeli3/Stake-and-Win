let gameEntryFee = null

$(document).ready(function () {
        if (!window.ethereum) {
            document.getElementById('metamask-extension-not-installed').style.display = 'block'
            document.getElementById('connect-wallet').style.display = 'none'
        } else {
            //timeout for verify_player.js to fetch the contract
            setTimeout(async function () {
                gameEntryFee = await contract.methods.entryFee().call()
                const minimumBal = gameEntryFee / Math.pow(10, 18)

                document.getElementById('stake-ether').append("Game Fee: " + minimumBal + " Eth")
                document.getElementById('note').append(minimumBal + " Eth")

                account = await web3.eth.getAccounts()
                if (account.length > 0) {
                    await getConnectedAccount()
                }

            }, 1500)
        }
    }
)

async function getConnectedAccount() {
    document.getElementById('connect-wallet').style.display = 'none'
    document.getElementById('join-game').style.display = 'block'
    document.getElementById('connected-wallet').innerText = account[0]
    document.getElementById('wallet-balance').innerText = await getWalletBalance()

    if (account[0] === owner) {
        document.getElementById('only-owner').style.display = 'block'
    } else {
        document.getElementById('only-owner').style.display = 'none'
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
    const balance = parseInt(account_balance) / Math.pow(10, 18) + ' Eth'
    return balance
}

async function connectWallet() {
    {
        await ethereum.request({
            method: "eth_requestAccounts"
        }).catch((err) => {
            if (err.code === 4001) {
                // If this happens, the user rejected the connection request.
                Swal.fire({
                    title: 'Connection Rejected',
                    text: 'You need to connect your MetaMask wallet to play the game',
                    icon: 'error',
                    confirmButtonColor: '#4B983BFF',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    allowEnterKey: false,
                    iconColor: 'beige',
                    customClass: 'swal-style'
                })
            } else if (err.code === -32002) {
                // If this happens, there is already a request pending in the user's wallet, and he has asked for
                // another connection
                Swal.fire({
                    title: 'Request Pending',
                    text: 'There is already a request pending in your MetaMask. Please accept it',
                    icon: 'info',
                    confirmButtonColor: '#4B983BFF',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    allowEnterKey: false,
                    iconColor: 'beige',
                    customClass: 'swal-style'
                })
            } else {
                console.log(err)
                Swal.fire({
                    title: 'Connection Error',
                    text: 'There was some error in connecting your wallet. Please try again.',
                    icon: 'error',
                    confirmButtonColor: '#4B983BFF',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    allowEnterKey: false,
                    iconColor: 'beige',
                    customClass: 'swal-style'
                })
            }
        })
    }
}

async function playGame() {
    window.location.replace("../html/select_number.html")
}
