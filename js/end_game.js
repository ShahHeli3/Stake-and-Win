let selectedNumbers = []
let players = []
let winners = []
let winningNumber = null
let autoReload = true

$(document).ready(function () {

        //timeout for verify_player.js to fetch the contract
        setTimeout(async function () {
            owner = await contract.methods.owner().call()

            if (account[0] === owner) {
                document.getElementById('only-owner').style.display = 'block'
            }

            await getWinningAmount()
            await getGameDetails()
            await getContractDetails()
            await getWinnerDetails()
            await getPlayerDetails()
        }, 2000)
    }
)

async function getWinningAmount() {
    let contractBalance = await web3.eth.getBalance(contractAddress)
    let winning_amount = ((contractBalance * 80) / 100)

    $('#winning-amount').empty().append('<p><b>Winning amount in wei: </b><br>' + winning_amount + '</p>' +
        '<p><b>Winning amount in eth: </b><br>' + winning_amount * (10 ** (-18)) + '</p>')
}

async function getGameDetails() {
    gameState = await contract.methods.game_state().call()

    if (gameState === "0") {
        $('#game-details').empty().append('<p><b>Game State: </b><br>OPEN</p>' +
            '<p id="total-players"><b>Total Players: </b><br>' + (counter - 1) + '</p>')
    } else {
        document.getElementById('game-open-message').style.display = "none"
        document.getElementById('game-end-message').style.display = "block"
        $('#game-details').empty().append('<p><b>Game State: </b>CLOSED</p>')
    }
}

async function getContractDetails() {
    $('#contract-details').empty().append('<p><b>Contract Address: </b><br>' + contractAddress + '</p>' +
        '<p><b>Contract Owner: </b><br>' + owner + '</p>')
}

async function getPlayerDetails() {
    counter = 10

    if (counter === "1") {
        document.getElementById('no-players').style.display = 'block'
        document.getElementById('player-details').style.display = 'none'
    } else {
        document.getElementById('no-players').style.display = 'none'
        document.getElementById('player-details').style.display = 'block'

        $("#table-body").empty()

        for (let i = 1; i < counter; i++) {
            players[i] = await contract.methods.players(i).call()
            selectedNumbers[i] = await contract.methods.guessedNumber(i).call()
            $('#table-body').append("<tr><td style='width: 80%'>" + players[i] + "</td><td style='width: 20%'>" + selectedNumbers[i] + "</td>")
        }
    }
}

async function getWinnerDetails() {
    winningNumber = await contract.methods.winningNumber().call()
    $('#div-winning-number').empty().append(winningNumber)

    winners = await contract.methods.getWinnersList().call()
    $('#div-winner-list').empty()

    if (winners.length > 0) {
        for (let i = 0; i < winners.length; i++) {
            $('#div-winner-list').append("<p>" + winners[i] + "</p>")
        }
    } else {
        $('#div-winner-list').append("<p>Nobody guessed the winning number</p><p>No winners for the previous round</p>")
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

    await contract.methods.closeGameState().send({'from': owner})
        .on('transactionHash', function (hash) {
            Swal.fire({
                title: 'Closing the game state',
                html: `Your transaction is pending...<br>Please wait till we close the game state.<br>Do not close this page.` +
                    `<br>Click <a style="color: #8f5dc3; font-style: italic" href="https://goerli.etherscan.io/tx/${hash}" target="_blank">here</a> to view your transaction`,
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
                        `<br>Click <a style="color: #8f5dc3; font-style: italic" href="https://goerli.etherscan.io/tx/${receipt.transactionHash}" target="_blank">here</a> to view your transaction`,
                    imageUrl: "../static/images/success.png",
                    imageHeight: '70px',
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
                    html: `Oops! There was some error in completing your transaction.<br>Please try again.` +
                        `<br>Click <a style="color: #8f5dc3; font-style: italic" href="https://goerli.etherscan.io/tx/${receipt.transactionHash}" target="_blank">here</a> to view your transaction`,
                    icon: 'error',
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
            console.log(error)
            if (error.code === 4001) {
                Swal.fire({
                    title: 'Transaction Rejected',
                    text: 'You need to confirm the transaction to close the game state.',
                    icon: 'error',
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
                    text: 'Oops! There was some error in completing your transaction. Please try again',
                    icon: 'error',
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
    await contract.methods.endGame(winners, winningNumber).send({'from': owner})
        .on('transactionHash', function (hash) {
            document.getElementById('end-game-body').style.pointerEvents = 'auto'
            Swal.fire({
                title: 'Calculating the winners',
                html: `Your transaction is pending...<br>Please wait till we calculate the winners.<br>Do not close this page.` +
                    `<br>Click <a style="color: #8f5dc3; font-style: italic" href="https://goerli.etherscan.io/tx/${hash}" target="_blank">here</a> to view your transaction`,
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
                        `<br>Click <a style="color: #8f5dc3; font-style: italic" href="https://goerli.etherscan.io/tx/${receipt.transactionHash}" target="_blank">here</a> to view your transaction`,
                    imageUrl: "../static/images/success.png",
                    imageHeight: '70px',
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
                    html: `Oops! There was some error in completing your transaction.<br>Please try again` +
                        `<br>Click <a style="color: #8f5dc3; font-style: italic" href="https://goerli.etherscan.io/tx/${receipt.transactionHash}" target="_blank">here</a> to view your transaction`,
                    icon: 'error',
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
            console.log(error)
            if (error.code === 4001) {
                Swal.fire({
                    title: 'Transaction Rejected',
                    text: 'You need to confirm the transaction to end the game.',
                    icon: 'error',
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

//custom scroll bar
$(document).ready(function () {
    $("#table-body, #div-winner-list").niceScroll(
        {
            cursorwidth: '4px',
            autohidemode: false,
            zindex: 999,
            cursorcolor: "#3f215d",
            cursorborder: "transparent"
        });
});


window.setInterval(async () => {
    const currentOwner = await contract.methods.owner().call()

    if (currentOwner !== owner) {
        owner = currentOwner
        await getContractDetails()
    }

    const currentCounter = await contract.methods.counter().call()

    if (counter < currentCounter) {
        counter = currentCounter
        await getWinningAmount()
        await getGameDetails()
        await getPlayerDetails()
    }

    if (counter > currentCounter) {
        counter = currentCounter
        await getWinnerDetails()
    }

    const currentGameState = await contract.methods.game_state().call()

    if (currentGameState !== gameState) {
        await getGameDetails()
        await getWinnerDetails()
    }

}, 15000)