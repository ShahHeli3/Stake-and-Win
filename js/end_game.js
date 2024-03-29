let selectedNumbers = []
let players = []
let winners = []
let winningNumber = null

$(document).ready(function () {
        if (!window.ethereum) {
            window.location.replace("../html/index.html")
        }

        //timeout for verify_player.js to fetch the contract
        setTimeout(async function () {
            owner = await contract.methods.owner().call()

            if (account[0] === owner) {
                document.getElementById('only-owner').style.display = 'block'
            }
            await getGameDetails()
            await getWinningAmount()
            await getContractDetails()
            await getPlayerDetails()
            await getWinnerDetails()
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
    $('#game-state').empty().append('<b>Game State: </b><br>OPEN')
    $('#total-players').empty().append('<b>Total Players: </b><br>' + (counter - 1) + '</p>')
}

async function getContractDetails() {
    $('#contract-details').empty().append('<p><b>Contract Address: </b><br>' + contractAddress + '</p>' +
        '<p><b>Contract Owner: </b><br>' + owner + '</p>')
}

async function getPlayerDetails() {
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
        }

        for (let i = 1; i < counter; i++) {
            $('#table-body').append("<tr><td style='width: 80%'>" + players[i] + "</td><td style='width: 20%'>" + selectedNumbers[i] + "</td>")
        }
    }
}

async function getWinnerDetails() {
    winningNumber = await contract.methods.winningNumber().call()
    $('#div-winning-number').empty().append(winningNumber)

    let total_winners = await contract.methods.winnerCounter().call()


    for (i = 1; i < total_winners; i++) {
        winners[i] = await contract.methods.winners(i).call()
    }

    $('#div-winner-list').empty()

    if (winners.length > 1) {
        for (let i = 1; i < winners.length; i++) {
            $('#div-winner-list').append("<p>" + winners[i] + "</p>")
        }
    } else {
        $('#div-winner-list').append("<p>Nobody guessed the winning number</p><p>No winners for the previous round</p>")
    }
}

async function endGame() {
    document.getElementById('end-game-btn').style.pointerEvents = 'none'
    document.getElementById('end-game-nav').style.pointerEvents = 'none'

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

    //cannot end game if less than 2 players are there
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

    // call the endgame function from the smart contract and end the game
    else {
        await contract.methods.endGame().send({from: owner})
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

    const currentCounter = await contract.methods.counter().call()

    if (counter !== currentCounter) {

        if (counter > currentCounter) {
            await getWinnerDetails()
        }
        counter = currentCounter

        await getGameDetails()
        await getWinningAmount()
        await getPlayerDetails()
    }

    if (counter < currentCounter) {
        counter = currentCounter
        await getGameDetails()
        await getWinningAmount()
        await getPlayerDetails()
    }

    if (counter > currentCounter) {
        counter = currentCounter
        await getGameDetails()
        await getWinnerDetails()
        await getWinningAmount()
        await getPlayerDetails()
    }

    const currentOwner = await contract.methods.owner().call()
    if (currentOwner !== owner) {
        owner = currentOwner
        await getContractDetails()
    }

}, 5000)