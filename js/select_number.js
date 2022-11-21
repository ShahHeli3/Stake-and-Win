let playerAddress = null

$(document).ready(function () {
        //timeout for verify_player.js to fetch the contract
        setTimeout(async function () {
            if (account.length === 0) {
                window.location.replace('../html/index.html')
            }
            playerAddress = account[0]
        }, 2000)
    }
)

function select_number(selected_number) {
    Swal.fire({
        title: 'Confirm your selection',
        text: 'Please confirm your selection',
        confirmButtonText: 'Stake on ' + selected_number,
        showDenyButton: true,
        denyButtonText: 'Change Selection',
        icon: 'question'
    }).then((result) => {
        document.getElementById('select-number-body').style.pointerEvents = 'none'
        if (result.isConfirmed) {
            //send add player transaction
            contract.methods.addPlayer(playerAddress, selected_number).send({from: playerAddress,})
                .on('transactionHash', function (hash) {
                    Swal.fire({
                        title: 'Transaction status',
                        text: 'Your transaction is pending at ' + hash + '. Please wait till we confirm it. ' +
                            'Do not close this page. You will soon be redirected to the game',
                        icon: 'info',
                        showConfirmButton: false
                    })
                })
                .on('receipt', function (receipt) {
                    document.getElementById('select-number-body').style.pointerEvents = 'auto'
                    if (receipt.status === true) {
                        Swal.fire({
                            title: 'Transaction Confirmed',
                            text: 'Congratulations! Your transaction at ' + receipt.transactionHash + ' was successful',
                            icon: 'success',
                            confirmButtonText: 'See Game Status'
                        }).then(() => {
                            window.location.replace("./end_game.html")
                        })
                    } else {
                        Swal.fire({
                            title: 'Transaction Error',
                            text: 'Oops! There was some error in completing your transaction. Please select a number again',
                            icon: 'error',
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
                        }).then(() => {
                            window.location.reload()
                        })

                    } else {
                        console.log(error)
                        Swal.fire({
                            title: 'Transaction Error',
                            text: 'Oops! There was some error in completing your transaction. Please select a number again',
                            icon: 'error',
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