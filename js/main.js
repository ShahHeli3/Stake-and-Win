const web3 = new Web3(Web3.givenProvider)
let contractAddress = "0x2Ff4Ee5974b68a349C3A2243D1bd9910377640bC"
let contract = null
let account = null
let gameState = null
let counter = null
let owner = null

$(document).ready(function () {
    fetch("../contract_abi.json").then(
        response => {
            return response.json()
        }
    ).then(async abi => {
        contract = new web3.eth.Contract(abi, contractAddress);
        account = await web3.eth.getAccounts()
        counter = await contract.methods.counter().call()
        gameState = await contract.methods.game_state().call()
        owner = await contract.methods.owner().call()
    })
})

// if the user changes the account from MetaMask or disconnects
window.ethereum.on('accountsChanged', async function () {
    window.location.replace('../html/index.html')
})

// if the user switches the chain
window.ethereum.on('chainChanged', function (_chainId) {
    window.location.replace('../html/index.html')
})
