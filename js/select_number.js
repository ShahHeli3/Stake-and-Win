let playerAddress = null
let gameEntryFee = null

$(document).ready(function () {
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
    Swal.fire({
        title: 'Confirm your selection',
        text: 'Please confirm your selection',
        confirmButtonText: 'Stake on ' + selected_number,
        showDenyButton: true,
        denyButtonText: 'Change Selection',
        icon: 'question',
        confirmButtonColor: '#00031CFF',
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        // color: '#00031CFF',
        // iconColor: '#00031CFF',
        // customClass: 'swal-style'
    }).then((result) => {
        document.getElementById('select-number-body').style.pointerEvents = 'none'

        if (result.isConfirmed) {
            //send add player transaction
            playerAddress = account[0]

            contract.methods.addPlayer(playerAddress, selected_number).send({from: playerAddress, value: gameEntryFee})
                .on('transactionHash', function (hash) {
                    Swal.fire({
                        title: 'Adding you to the game',
                        text: 'Your transaction is pending at ' + hash + '. Please wait till we add you. ' +
                            'Do not close this page. You will soon be redirected to the game',
                        icon: 'info',
                        showConfirmButton: false
                    })
                })
                .on('receipt', function (receipt) {
                    document.getElementById('select-number-body').style.pointerEvents = 'auto'
                    if (receipt.status === true) {
                        Swal.fire({
                            title: 'Transaction successful',
                            text: 'Congratulations! Your transaction at ' + receipt.transactionHash + ' was successful. ' +
                                'You are added to the game',
                            icon: 'success',
                            confirmButtonText: 'See Game Status',
                            confirmButtonColor: '#00031CFF',
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                            allowEnterKey: false
                        }).then(() => {
                            window.location.replace("./end_game.html")
                        })
                    } else {
                        Swal.fire({
                            title: 'Transaction Error',
                            text: 'Oops! There was some error in completing your transaction. Please select a number again',
                            icon: 'error',
                            confirmButtonColor: '#00031CFF',
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                            allowEnterKey: false
                        }).then(() => {
                            window.location.reload()
                        })
                    }
                })
                .on('error', function (error) {
                    document.getElementById('select-number-body').style.pointerEvents = 'auto'
                    if (error.code === 4001) {
                        Swal.fire({
                            title: 'Transaction Rejected',
                            text: 'You need to confirm the transaction to enter the game.',
                            icon: 'error',
                            confirmButtonColor: '#00031CFF',
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                            allowEnterKey: false
                        }).then(() => {
                            window.location.reload()
                        })

                    } else {
                        console.log(error)
                        Swal.fire({
                            title: 'Transaction Error',
                            text: 'Oops! There was some error in completing your transaction. Please select a number again',
                            icon: 'error',
                            confirmButtonColor: '#00031CFF',
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                            allowEnterKey: false
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