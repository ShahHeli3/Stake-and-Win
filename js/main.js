const web3 = new Web3(Web3.givenProvider)
let contractAddress = "0xafE06092437c528444d3ae370475BfC6f89823fC"
let contract = null
let account = null
let gameState = null
let counter = null

$(document).ready(function () {
    fetch("../contract_abi.json").then(
        response => {
            return response.json()
        }
    ).then(async abi => {
        contract = new web3.eth.Contract(abi, contractAddress);

        //check the game state
        gameState = await contract.methods.game_state().call()

        if (gameState === "1"){
            window.location.replace('../html/end_game.html')
        }

        //check if the user is already a player
        account = await web3.eth.getAccounts()
        counter = await contract.methods.counter().call()

        for (let i = 1; i < counter; i++) {
            let player = await contract.methods.players(i).call()

            if (player === account[0]) {
                window.location.replace('../html/end_game.html')
            }
        }
    })
})

// if the user changes the account from MetaMask or disconnects
window.ethereum.on('accountsChanged', async function () {
    account = await web3.eth.getAccounts()

    //if the user disconnects all the accounts from MetaMask
    if (account.length === 0) {
        window.location.replace('../html/index.html')
    } else {
        await verifyPlayer()
        document.getElementById('connected-wallet').innerText = account
        document.getElementById('wallet-balance').innerText = await getWalletBalance()
    }
})

// if the user switches the chain
window.ethereum.on('chainChanged', function (_chainId) {
    window.location.replace('../html/index.html')
})
