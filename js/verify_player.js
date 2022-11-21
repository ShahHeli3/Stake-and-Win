$(document).ready(function () {
    setTimeout(async function () {
        if (gameState === "1") {
            window.location.replace('../html/end_game.html')
        }

        //verify if player is already a member of the gae=me
        for (let i = 1; i < counter; i++) {
            let player = await contract.methods.players(i).call()

            if (player === account[0]) {
                window.location.replace('../html/end_game.html')
            }
        }
    }, 500)
})