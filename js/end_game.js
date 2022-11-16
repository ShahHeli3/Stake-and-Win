const web3 = new Web3(Web3.givenProvider)
let contractAddress = "0xafE06092437c528444d3ae370475BfC6f89823fC"
let contract = null
let gameState = null

//reload page after 15s
window.setTimeout(function () {
    window.location.reload();
}, 15000);

$(document).ready(function () {
    console.log("reload")
    fetch("../contract_abi.json").then(
        response => {
            return response.json()
        }
    ).then(async abi => {
        contract = new web3.eth.Contract(abi, contractAddress);
        gameState = await contract.methods.game_state().call()

        if (gameState === "1") {
            document.getElementById('game-open-message').style.display = "none"
            document.getElementById('game-close-message').style.display = "block"
        }

        await getGameDetails()
        await getContractDetails()
        await getPlayerDetails()

        // transaction = contract.methods.endGame(['0x5b78527FaDb775e747A4D4a22f01d5A6a2cBD25e']).send({from: contractAddress})
    })
})

async function getGameDetails() {
    let contractBalance = await web3.eth.getBalance(contractAddress)
    let winning_amount = ((contractBalance * 80) / 100)

    document.getElementById('winning-amount-wei').append(winning_amount)
    document.getElementById('winning-amount-eth').append(winning_amount * (10 ** (-18)))
}

async function getContractDetails() {
    document.getElementById('contract-address').append(contractAddress)

    let contractOwner = await contract.methods.owner().call()
    document.getElementById('contract-owner').append(contractOwner)
}

async function getPlayerDetails() {

    if (gameState === "0") {
        document.getElementById('game-state').append("OPEN")
    } else {
        document.getElementById('game-state').append("CLOSED")
    }

    let counter = await contract.methods.counter().call()
    document.getElementById('total-players').append(counter - 1)

    for (let i = 1; i < counter; i++) {
        player = await contract.methods.players(i).call()
        selected_number = await contract.methods.guessedNumber(i).call()
        console.log(player, selected_number)
        $('#player-address').append("<p>" + player + "</p>")
        $('#player-number').append("<p>" + selected_number + "</p>")
    }
}