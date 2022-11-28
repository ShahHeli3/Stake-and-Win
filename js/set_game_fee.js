let gameEntryFee = null

$(document).ready(function () {
    setTimeout(async function () {
        //validate owner
        if (account[0] !== owner) {
            Swal.fire({
                title: 'Unauthorized',
                text: 'Only the owner has access to this page',
                icon: 'error',
                confirmButtonColor: '#4B983BFF',
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false,
                iconColor: 'beige',
                customClass: 'swal-style'
            }).then(() => {
                window.location.replace('../html/index.html')
            })
        }
        gameEntryFee = await contract.methods.entryFee().call()
        $('#current-fee').append(gameEntryFee + " wei (" + gameEntryFee / Math.pow(10, 18) + " eth)")
    }, 1000)
})

function setEntryFee() {
    let new_entry_fee = document.getElementById('new-entry-fee').value

    //check if the field is empty
    if (new_entry_fee.length === 0) {
        Swal.fire({
            title: 'Game Fee value is Empty',
            text: 'Please enter an amount in wei to update the game fee',
            icon: 'warning',
            confirmButtonColor: '#4B983BFF',
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false,
            iconColor: 'beige',
            customClass: 'swal-style'
        })
    } else {
        //check if the fee is valid
        let num_entry_fee = Number(new_entry_fee)

        if (Number.isInteger(num_entry_fee) === false || num_entry_fee <= 0 ) {
            Swal.fire({
                title: 'Invalid Amount',
                text: 'Please enter a valid amount in wei to set the new entry fee',
                icon: 'error',
                confirmButtonColor: '#4B983BFF',
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false,
                iconColor: 'beige',
                customClass: 'swal-style'
            })
        } else {
            if (num_entry_fee === Number(gameEntryFee)) {
                Swal.fire({
                    title: 'Invalid Request',
                    text: 'The current entry fee value is the same as requested',
                    icon: 'info',
                    confirmButtonColor: '#4B983BFF',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    allowEnterKey: false,
                    iconColor: 'beige',
                    customClass: 'swal-style'
                })
            } else {
                Swal.fire({
                    title: 'Confirm New Entry Fee',
                    text: 'Are you sure you want to set the entry fee to ' + num_entry_fee,
                    icon: 'info',
                    showDenyButton: true,
                    confirmButtonText: "Yes, update.",
                    denyButtonText: "No",
                    confirmButtonColor: '#4B983BFF',
                    denyButtonColor: '#E53F3FFF',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    allowEnterKey: false,
                    iconColor: 'beige',
                    customClass: 'swal-style'
                }).then(async (response) => {
                    if (response.isConfirmed) {
                        //send the transfer ownership transaction
                        await contract.methods.setEntryFee(new_entry_fee).send({'from': owner})
                            .on('transactionHash', function (hash) {
                                Swal.fire({
                                    title: 'Updating Game Entry Fee',
                                    html: `Your transaction is pending...<br>Please wait till we complete the transfer.<br>Do not close this page.` +
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
                                        title: 'Transaction Confirmed',
                                        html: `Your transaction was successful.<br>Game Fee updated to ` + num_entry_fee +
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
                                        window.location.replace("../html/index.html")
                                    })
                                } else {
                                    Swal.fire({
                                        title: 'Transaction Error',
                                        html: `Oops! There was some error in completing your transaction.<br>Please try again` +
                                            `<br>Click <a href="https://goerli.etherscan.io/tx/${receipt.transactionHash}" target="_blank">here</a> to view your transaction`,
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
                                console.log(error)
                                if (error.code === 4001) {
                                    Swal.fire({
                                        title: 'Transaction Rejected',
                                        text: 'You need to confirm the transaction to update the entry fee.',
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
                    } else {
                        window.location.reload()
                    }
                })
            }
        }
    }
}