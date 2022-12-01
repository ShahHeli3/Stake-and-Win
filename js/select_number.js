let playerAddress = null
let gameEntryFee = null

$(document).ready(function () {
        if (!window.ethereum) {
            window.location.replace("../html/index.html")
        }
        //timeout for verify_player.js to fetch the contract
        setTimeout(async function () {
            if (account.length === 0) {
                window.location.replace('../html/index.html')
            }

            gameEntryFee = await contract.methods.entryFee().call()
        }, 1000)
    }
)

async function select_number(selected_number) {
    await verifyPlayer()
    document.getElementById('number-buttons').style.pointerEvents = 'none'
    Swal.fire({
        title: 'Confirm your selection',
        text: 'Are you sure you want to stake on ' + selected_number + ' ?',
        confirmButtonText: 'Stake on ' + selected_number,
        icon: 'question',
        showDenyButton: true,
        denyButtonText: 'Change Selection',
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        iconColor: 'beige',
        customClass: 'swal-style'
    }).then(async (result) => {
        if (result.isConfirmed) {
            //send add player transaction
            playerAddress = account[0]

            await contract.methods.addPlayer(playerAddress, selected_number).send({
                from: playerAddress,
                value: gameEntryFee
            })
                .on('transactionHash', function (hash) {
                    Swal.fire({
                        title: 'Adding you to the game',
                        html: `Your transaction is pending...<br>Please wait till we add you to the game.<br>Do not close this page.` +
                            `<br>Click <a style="color: #8f5dc3; font-style: italic" href="https://goerli.etherscan.io/tx/${hash}" target="_blank">here</a> to view your transaction`,
                        icon: 'info',
                        showConfirmButton: false,
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        allowEnterKey: false,
                        iconColor: 'beige',
                        customClass: 'swal-style'
                    })
                })
                .on('receipt', function (receipt) {
                    if (receipt.status === true) {
                        Swal.fire({
                            title: 'Transaction successful',
                            html: `Congratulations!!! <br>Your transaction was successful.<br>You are added to the game.` +
                                `<br>Click <a style="color: #8f5dc3; font-style: italic" href="https://goerli.etherscan.io/tx/${receipt.transactionHash}" target="_blank">here</a> to view your transaction`,
                            imageUrl: "../static/images/success.png",
                            imageHeight: '70px',
                            confirmButtonText: 'See Game Status',
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                            allowEnterKey: false,
                            customClass: 'swal-style'
                        }).then(() => {
                            window.location.replace("./end_game.html")
                        })
                    } else {
                        Swal.fire({
                            title: 'Transaction Error',
                            html: `Oops! There was some error in completing your transaction.<br>Please select a number again` +
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
                })
                .on('error', function (error) {
                    console.log(error)
                    if (error.code === 4001) {
                        Swal.fire({
                            title: 'Transaction Rejected',
                            text: 'You need to confirm the transaction to enter the game.',
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
                            html: 'Oops! There was some error in completing your transaction.<br>Please select a number again',
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
        } else {
            window.location.reload()
        }
    })
}

// if the user changes the account from MetaMask or disconnects
window.ethereum.on('accountsChanged', async function () {
    window.location.replace('../html/index.html')
})