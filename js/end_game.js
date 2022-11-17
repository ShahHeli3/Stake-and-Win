const web3 = new Web3(Web3.givenProvider)
let contractAddress = "0x2Ff4Ee5974b68a349C3A2243D1bd9910377640bC"
let contract = null
let gameState = null
let account = null
let owner = null
let counter = null
let selectedNumbers = []
let players = []
let winners = []

// reload page after 15s
window.setTimeout(function () {
    if (gameState === "0") {
        window.location.reload();
    }
}, 15000);

$(document).ready(function () {
    fetch("../contract_abi.json").then(
        response => {
            return response.json()
        }
    ).then(async abi => {
        contract = new web3.eth.Contract(abi, contractAddress);
        gameState = await contract.methods.game_state().call()

        if (gameState === "1") {
            document.getElementById('game-open-message').style.display = "none"
            document.getElementById('game-end-message').style.display = "block"
            document.getElementById('previous-game-results').style.display = "none"
            document.getElementById('current-game-results').style.display = "block"
        }

        account = await web3.eth.getAccounts()
        owner = await contract.methods.owner().call()

        if (account[0] === owner) {
            document.getElementById('end-game-btn').style.display = 'block'
        }

        await getWinningDetails()
        await getContractDetails()
        await getGameDetails()
        await getWinnerDetails()
    })
})

async function getWinningDetails() {
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

async function getGameDetails() {

    if (gameState === "0") {
        document.getElementById('game-state').append("OPEN")
    } else {
        document.getElementById('game-state').append("CLOSED")
    }

    counter = await contract.methods.counter().call()
    document.getElementById('total-players').append(counter - 1)

    for (let i = 1; i < counter; i++) {
        let player = await contract.methods.players(i).call()
        players[i] = player

        let selected_number = await contract.methods.guessedNumber(i).call()
        selectedNumbers[i] = selected_number

        $('#player-address').append("<p>" + player + "</p>")
        $('#player-number').append("<p>" + selected_number + "</p>")

    }
}

async function getWinnerDetails() {
    const winningNumber = await contract.methods.winningNumber().call()
    $('#winning-number').append(winningNumber)

    winners = await contract.methods.getWinnersList().call()

    if (winners.length > 0) {
        for (let i = 0; i < winners.length; i++){
            $('#winner-list').append("<p>" + winners[i] + "</p>")
        }
    } else {
        $('#winner-list').append("<p>Nobody guessed the winning number</p><p>No winners for the game</p>")
    }
}

async function endGame() {
    //only owner can end the game
    if (account[0] !== owner) {
        Swal.fire({
            title: 'Unauthorized',
            text: 'Only the contract owner can end the game',
            icon: 'error'
        }).then(async () => {
            window.location.reload()
        })
    }

    //cannot end game if only one player is there
    if (counter <= 2) {
        Swal.fire({
            title: 'Cannot End Game',
            text: 'Atleast 2 players are required before ending the game',
            icon: 'warning'
        }).then(async () => {
            window.location.reload()
        })
    }

    //cannot end game if game state is already closed
    // if (gameState === "1") {
    //     Swal.fire({
    //         title: 'Calculating winner',
    //         text: 'Game state is already closed. Wait till the winner is decided',
    //         icon: 'info'
    //     }).then(async () => {
    //         window.location.reload()
    //     })
    // }

    await closeGameState()
    selectWinner()
    console.log(winners)

    //call endgame function
    contract.methods.endGame(winners).send({'from': owner})
        .on('transactionHash', function (hash) {
            Swal.fire({
                title: 'Transaction status',
                text: 'Your transaction is pending at ' + hash + 'Please wait till we confirm it.' +
                    'Do not close this page.',
                icon: 'info',
                showConfirmButton: false
            })
            document.getElementById('end-game-btn').style.pointerEvents = 'none'
        }).on('receipt', function (receipt) {
        if (receipt.status === true) {
            Swal.fire({
                title: 'Transaction Confirmed',
                text: 'Congratulations! Your transaction at: ' + receipt.transactionHash + 'was successful. GAME ENDED!',
                icon: 'success',
            }).then(() => {
                window.location.reload()
            })
        } else {
            Swal.fire({
                title: 'Transaction Error',
                text: 'Oops! There was some error in completing your transaction. Please try again',
                icon: 'error',
            }).then(() => {
                window.location.reload()
            })
        }
    }).on('error', function (error) {
        if (error.code === 4001) {
            Swal.fire({
                title: 'Transaction Rejected',
                text: 'You need to confirm the transaction to end the game.',
                icon: 'error',
            }).then(() => {
                window.location.reload()
            })
        } else {
            console.log(error)
            Swal.fire({
                title: 'Transaction Error',
                text: 'Oops! There was some error in completing your transaction. Please try again',
                icon: 'error',
            }).then(() => {
                window.location.reload()
            })
        }
    });
}

async function closeGameState() {
    contract.methods.closeGameState().send({'from': owner})
        .on('transactionHash', function (hash) {
            Swal.fire({
                title: 'Transaction status',
                text: 'Your transaction is pending at ' + hash + 'Please wait till we confirm it.' +
                    'Do not close this page.',
                icon: 'info',
                showConfirmButton: false
            })
            document.getElementById('end-game-btn').style.pointerEvents = 'none'
        }).on('receipt', function (receipt) {
        if (receipt.status === true) {
            Swal.fire({
                title: 'Transaction Confirmed',
                text: 'Congratulations! Your transaction at: ' + receipt.transactionHash + 'was successful. Game closed.',
                icon: 'success',
            })
        } else {
            Swal.fire({
                title: 'Transaction Error',
                text: 'Oops! There was some error in completing your transaction. Please try again.',
                icon: 'error',
            }).then(() => {
                window.location.reload()
            })
        }
    }).on('error', function (error) {
        if (error.code === 4001) {
            Swal.fire({
                title: 'Transaction Rejected',
                text: 'You need to confirm the transaction to close the game state.',
                icon: 'error',
            }).then(() => {
                window.location.reload()
            })
        } else {
            console.log(error)
            Swal.fire({
                title: 'Transaction Error',
                text: 'Oops! There was some error in completing your transaction. Please try again',
                icon: 'error',
            }).then(() => {
                window.location.reload()
            })
        }
    });
}

function selectWinner() {
    // let randomNumber = Math.floor(Math.random() * 10) + 1;
    let randomNumber = 3
    let winningNumber = randomNumber.toString()
    console.log(winningNumber)

    //selecting winners
    for (let i = 1; i < counter; i++) {
        if (selectedNumbers[i] === winningNumber) {
            winners.push(players[i])
        }
    }
}