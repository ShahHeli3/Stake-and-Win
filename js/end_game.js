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
    const lastWinningNumber = await contract.methods.winningNumber().call()
    $('#winning-number').append(lastWinningNumber)

    const lastWinners = await contract.methods.getWinnersList().call()

    if (lastWinners.length > 0) {
        for (let i = 0; i < lastWinners.length; i++) {
            $('#winner-list').append("<p>" + lastWinners[i] + "</p>")
        }
    } else {
        $('#winner-list').append("<p>Nobody guessed the winning number</p><p>No winners for the previous round</p>")
    }
}

async function endGame() {
    autoReload = false
    document.getElementById('end-game-btn').style.pointerEvents = 'none'

    //only owner can end the game
    if (account[0] !== owner) {
        Swal.fire({
            title: 'Unauthorized',
            text: 'Only the contract owner can end the game',
            icon: 'error',
            confirmButtonColor: '#4B983BFF',
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false,
            iconColor: 'beige',
            customClass: 'swal-style'
        }).then(async () => {
            window.location.reload()
        })
    }

    //cannot end game if only one player is there
    else if (counter <= 2) {
        Swal.fire({
            title: 'Cannot End Game',
            text: 'Atleast 2 players are required before ending the game',
            icon: 'warning',
            confirmButtonColor: '#4B983BFF',
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false,
            iconColor: 'beige',
            customClass: 'swal-style'
        }).then(async () => {
            window.location.reload()
        })
    }

    // cannot end game if game state is already closed
    else if (gameState === "1") {
        Swal.fire({
            title: 'Calculating winner',
            html: 'Game state is already closed.<br>Wait till the winner is decided',
            icon: 'info',
            confirmButtonColor: '#4B983BFF',
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false,
            iconColor: 'beige',
            customClass: 'swal-style'
        }).then(async () => {
            window.location.reload()
        })
    } else {
        await closeGameState()
    }
}

async function closeGameState() {
    contract.methods.closeGameState().send({'from': owner})
        .on('transactionHash', function (hash) {
            Swal.fire({
                title: 'Closing the game state',
                html: `Your transaction is pending...<br>Please wait till we close the game state.<br>Do not close this page.` +
                    `<br>Click <a href="https://goerli.etherscan.io/tx/${hash}" target="_blank">here</a> to view your transaction`,
                icon: 'info',
                showConfirmButton: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false,
                iconColor: 'beige',
                customClass: 'swal-style'
            })
        }).on('receipt', function (receipt) {
        if (receipt.status === true) {
            Swal.fire({
                title: 'Game State Closed',
                html: `Congratulations!!! <br>Your transaction was successful.<br>Game Closed.` +
                    `<br>Click <a href="https://goerli.etherscan.io/tx/${receipt.transactionHash}" target="_blank">here</a> to view your transaction`,
                imageUrl: "../static/images/success.png",
                imageHeight: '70px',
                confirmButtonColor: '#4B983BFF',
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false,
                customClass: 'swal-style'
            }).then(() => {
                document.getElementById('end-game-body').style.pointerEvents = 'none'
                selectWinner()
            })
        } else {
            Swal.fire({
                title: 'Transaction Error',
                html: 'Oops! There was some error in completing your transaction.<br>Please try again.',
                icon: 'error',
                confirmButtonColor: '#4B983BFF',
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false,
                iconColor: 'beige',
                customClass: 'swal-style'
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
                confirmButtonColor: '#4B983BFF',
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false,
                iconColor: 'beige',
                customClass: 'swal-style'
            }).then(() => {
                window.location.reload()
            })
        } else {
            console.log(error)
            Swal.fire({
                title: 'Transaction Error',
                text: 'Oops! There was some error in completing your transaction. Please try again',
                icon: 'error',
                confirmButtonColor: '#4B983BFF',
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false,
                iconColor: 'beige',
                customClass: 'swal-style'
            }).then(() => {
                window.location.reload()
            })
        }
    });
}

async function selectWinner() {
    let randomNumber = Math.floor(Math.random() * 10) + 1;
    winningNumber = randomNumber.toString()

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
            document.getElementById('end-game-body').style.pointerEvents = 'auto'
            Swal.fire({
                title: 'Calculating the winners',
                html: `Your transaction is pending...<br>Please wait till we calculate the winners.<br>Do not close this page.` +
                    `<br>Click <a href="https://goerli.etherscan.io/tx/${hash}" target="_blank">here</a> to view your transaction`,
                icon: 'info',
                showConfirmButton: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false,
                iconColor: 'beige',
                customClass: 'swal-style'
            })
        }).on('receipt', function (receipt) {
        document.getElementById('end-game-body').style.pointerEvents = 'auto'
        if (receipt.status === true) {
            Swal.fire({
                title: 'Game Ended',
                html: `Congratulations!!! <br>Your transaction was successful.<br>Game Ended.` +
                    `<br>Click <a href="https://goerli.etherscan.io/tx/${receipt.transactionHash}" target="_blank">here</a> to view your transaction`,
                imageUrl: "../static/images/success.png",
                imageHeight: '70px',
                confirmButtonColor: '#4B983BFF',
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false,
                iconColor: 'beige',
                customClass: 'swal-style'
            }).then(() => {
                window.location.reload()
            })
        } else {
            Swal.fire({
                title: 'Transaction Error',
                html: 'Oops! There was some error in completing your transaction.<br>Please try again',
                icon: 'error',
                confirmButtonColor: '#4B983BFF',
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false,
                iconColor: 'beige',
                customClass: 'swal-style'
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
                confirmButtonColor: '#4B983BFF',
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false,
                iconColor: 'beige',
                customClass: 'swal-style'
            }).then(() => {
                window.location.reload()
            })
        } else {
            console.log(error)
            Swal.fire({
                title: 'Transaction Error',
                html: 'Oops! There was some error in completing your transaction.<br>Please try again',
                icon: 'error',
                confirmButtonColor: '#4B983BFF',
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false,
                iconColor: 'beige',
                customClass: 'swal-style'
            }).then(() => {
                window.location.reload()
            })
        }
    });
}