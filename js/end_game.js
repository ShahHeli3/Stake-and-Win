let selectedNumbers = []
let players = []
let winners = []
let winningNumber = null
let autoReload = true

// reload page after 15s
window.setTimeout(function () {
    if (autoReload && gameState === "0") {
        window.location.reload();
    }
}, 30000);

$(document).ready(function () {

        //timeout for verify_player.js to fetch the contract
        setTimeout(async function () {
            if (gameState === "1") {
                document.getElementById('game-open-message').style.display = "none"
                document.getElementById('game-end-message').style.display = "block"
                document.getElementById('previous-game-results').style.display = "none"
                document.getElementById('current-game-results').style.display = "block"
            }

            if (account[0] === owner) {
                document.getElementById('only-owner').style.display = 'block'
            }

            await getWinningDetails()
            await getContractDetails()
            await getGameDetails()
            await getWinnerDetails()
        }, 2000)
    }
)

async function getWinningDetails() {
    let contractBalance = await web3.eth.getBalance(contractAddress)
    let winning_amount = ((contractBalance * 80) / 100)

    document.getElementById('winning-amount-wei').append(winning_amount)
    document.getElementById('winning-amount-eth').append(winning_amount * (10 ** (-18)))
}

async function getContractDetails() {
    document.getElementById('contract-address').append(contractAddress)
    document.getElementById('contract-owner').append(owner)
}

async function getGameDetails() {
    if (gameState === "0") {
        document.getElementById('game-state').append("OPEN")
    } else {
        document.getElementById('game-state').append("CLOSED")
    }

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
        for (let i = 0; i < winners.length; i++) {
            $('#winner-list').append("<p>" + winners[i] + "</p>")
        }
    } else {
        $('#winner-list').append("<p>Nobody guessed the winning number</p><p>No winners for the game</p>")
    }
}

async function endGame() {
    autoReload = false
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

    // cannot end game if game state is already closed
    if (gameState === "1") {
        Swal.fire({
            title: 'Calculating winner',
            text: 'Game state is already closed. Wait till the winner is decided',
            icon: 'info'
        }).then(async () => {
            window.location.reload()
        })
    }

    document.getElementById('end-game-body').style.pointerEvents = 'none'
    await closeGameState()
}

async function closeGameState() {
    contract.methods.closeGameState().send({'from': owner})
        .on('transactionHash', function (hash) {
            Swal.fire({
                title: 'Transaction status',
                text: 'Your transaction is pending at ' + hash + '. Please wait till we confirm it.' +
                    'Do not close this page.',
                icon: 'info',
                showConfirmButton: false
            })
        }).on('receipt', function (receipt) {
        document.getElementById('end-game-body').style.pointerEvents = 'auto'
        if (receipt.status === true) {
            Swal.fire({
                title: 'Transaction Confirmed',
                text: 'Congratulations! Your transaction at ' + receipt.transactionHash + ' was successful. Game closed.',
                icon: 'success',
            }).then(() => {
                document.getElementById('end-game-body').style.pointerEvents = 'none'
                selectWinner()
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
        document.getElementById('end-game-body').style.pointerEvents = 'auto'
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

async function selectWinner() {
    let randomNumber = Math.floor(Math.random() * 10) + 1;
    console.log("RANDOM---->", randomNumber)
    // let randomNumber = 3
    winningNumber = randomNumber.toString()
    console.log(winningNumber)

    //selecting winners
    for (let i = 1; i < counter; i++) {
        if (selectedNumbers[i] === winningNumber) {
            winners.push(players[i])
        }
    }

    await callEndGameFromContract()
}

async function callEndGameFromContract() {
    //call endgame function
    contract.methods.endGame(winners, winningNumber).send({'from': owner})
        .on('transactionHash', function (hash) {
            Swal.fire({
                title: 'Transaction status',
                text: 'Your transaction is pending at ' + hash + '. Please wait till we confirm it.' +
                    'Do not close this page.',
                icon: 'info',
                showConfirmButton: false
            })
            document.getElementById('end-game-btn').style.pointerEvents = 'none'
        }).on('receipt', function (receipt) {
        document.getElementById('end-game-body').style.pointerEvents = 'auto'
        if (receipt.status === true) {
            Swal.fire({
                title: 'Transaction Confirmed',
                text: 'Congratulations! Your transaction at ' + receipt.transactionHash + ' was successful. GAME ENDED!',
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
        document.getElementById('end-game-body').style.pointerEvents = 'auto'
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