$(document).ready(function () {
    setTimeout(async function () {
        //validate owner
        if (account[0] !== owner) {
            Swal.fire({
                title: 'Unauthorized',
                text: 'Only the owner has access to this page',
                icon: 'error'
            }).then(() => {
                window.location.replace('../html/index.html')
            })
        }
    }, 1000)
})

function transferOwnership() {
    let new_owner = document.getElementById('transfer-ownership-to').value

    //check if the field is empty
    if (new_owner.length === 0) {
        Swal.fire({
            title: 'Address Field Empty',
            text: 'Please enter an address to transfer the ownership',
            icon: 'warning'
        })
    } else {
        //check if the address is valid
        if (web3.utils.isAddress(new_owner) === false) {
            Swal.fire({
                title: 'Invalid Address',
                text: 'Please enter a valid address to transfer the ownership',
                icon: 'error'
            })
        } else {
            if (new_owner === owner) {
                Swal.fire({
                    title: 'Invalid Request',
                    text: 'You are already the owner',
                    icon: 'info'
                })
            } else {
                Swal.fire({
                    title: 'Confirm Ownership Transfer',
                    text: 'Are you sure you want to transfer the ownership to ' + new_owner,
                    icon: 'info',
                    showDenyButton: true,
                    confirmButtonText: "Yes, transfer.",
                    denyButtonText: "No"
                }).then((response) => {
                    document.getElementById('transfer-ownership-body').style.pointerEvents = 'none'

                    if (response.isConfirmed) {
                        //send the transfer ownership transaction
                        contract.methods.transferOwnership(new_owner).send({'from': owner})
                            .on('transactionHash', function (hash) {
                                Swal.fire({
                                    title: 'Transferring Ownership',
                                    text: 'Your transaction is pending at ' + hash + 'Please wait till we complete the transfer.' +
                                        ' Do not close this page.',
                                    icon: 'info',
                                    showConfirmButton: false
                                })
                            }).on('receipt', function (receipt) {
                            document.getElementById('transfer-ownership-body').style.pointerEvents = 'auto'
                            if (receipt.status === true) {
                                Swal.fire({
                                    title: 'Transaction Confirmed',
                                    text: 'Congratulations! Your transaction at ' + receipt.transactionHash + ' was successful. ' +
                                        'Ownership transferred to ' + new_owner,
                                    icon: 'success',
                                }).then(() => {
                                    window.location.replace("../html/index.html")
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
                            document.getElementById('transfer-ownership-body').style.pointerEvents = 'auto'
                            if (error.code === 4001) {
                                Swal.fire({
                                    title: 'Transaction Rejected',
                                    text: 'You need to confirm the transaction to transfer the ownership.',
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
                    } else {
                        window.location.reload()
                    }
                })
            }
        }
    }
}