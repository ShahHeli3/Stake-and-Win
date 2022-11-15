const web3 = new Web3(Web3.givenProvider)
let contractAddress = "0xafE06092437c528444d3ae370475BfC6f89823fC"
let playerAddress = null

$(document).ready(function () {
    fetch("../contract_abi.json").then(
        response => {
            return response.json()
        }
    ).then(async data => {
        abi = data;
        contract = new web3.eth.Contract(abi, contractAddress);
        address = await web3.eth.getAccounts()
        playerAddress = address[0]
        Swal.fire({
                    title: 'Transaction Error',
                    text: 'Oops! There was some error in completing your transaction. Please select a number again',
                    icon: 'error',
                })
    })
})

function select_number(selected_number) {
    console.log(selected_number + "-----")

    if (confirm("Click on OK to stake your eth on number " + selected_number +
        ". Click cancel if you want to change the number")) {

        transaction = contract.methods.addPlayer(playerAddress, selected_number).send({from: playerAddress,})
            .on('transactionHash', function (hash) {
                Swal.fire({
                    title: 'Transaction status',
                    text: 'Your transaction is pending at ' + hash + 'Please wait till we confirm it.' +
                        'Do not close this page. You will soon be redirected to the game',
                    icon: 'info',
                    showConfirmButton: false
                })
                for (let i = 1; i <= 10; i ++) {
                    document.getElementById('btn-' + i).disabled = true;
                }
            })
            .on('confirmation', function (confirmationNumber, receipt) {
                if (receipt.status === true) {
                    window.location.replace("./end_game.html")
                } else {
                    Swal.fire({
                        title: 'Transaction Error',
                        text: 'Oops! There was some error in completing your transaction. Please select a number again',
                        icon: 'error',
                    })
                    window.location.reload()
                }
            })
            .on('error', function (error) {
                console.log("error", error)
            });

    } else {
        window.location.reload()
    }
}