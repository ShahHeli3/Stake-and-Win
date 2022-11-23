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
    }, 1000)
})

function transferOwnership() {
    let new_owner = document.getElementById('transfer-ownership-to').value

    //check if the field is empty
    if (new_owner.length === 0) {
        Swal.fire({
            title: 'Address Field Empty',
            text: 'Please enter an address to transfer the ownership',
            icon: 'warning',
            confirmButtonColor: '#4B983BFF',
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false,
            iconColor: 'beige',
            customClass: 'swal-style'
        })
    } else {
        //check if the address is valid
        if (web3.utils.isAddress(new_owner) === false) {
            Swal.fire({
                title: 'Invalid Address',
                text: 'Please enter a valid address to transfer the ownership',
                icon: 'error',
                confirmButtonColor: '#4B983BFF',
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false,
                iconColor: 'beige',
                customClass: 'swal-style'
            })
        } else {
            if (new_owner === owner) {
                Swal.fire({
                    title: 'Invalid Request',
                    text: 'You are already the owner',
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
                    title: 'Confirm Ownership Transfer',
                    text: 'Are you sure you want to transfer the ownership to ' + new_owner,
                    icon: 'info',
                    showDenyButton: true,
                    confirmButtonText: "Yes, transfer.",
                    denyButtonText: "No",
                    confirmButtonColor: '#4B983BFF',
                    denyButtonColor: '#E53F3FFF',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    allowEnterKey: false,
                    iconColor: 'beige',
                    customClass: 'swal-style'
                }).then((response) => {
                    if (response.isConfirmed) {
                        //send the transfer ownership transaction
                        contract.methods.transferOwnership(new_owner).send({'from': owner})
                            .on('transactionHash', function (hash) {
                                Swal.fire({
                                    title: 'Transferring Ownership',
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
                                    html: `Your transaction was successful.<br>Ownership transferred to ` + new_owner +
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
                                    text: 'You need to confirm the transaction to transfer the ownership.',
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
                    } else {
                        window.location.reload()
                    }
                })
            }
        }
    }
}