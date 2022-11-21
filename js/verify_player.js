$(document).ready(function () {
    setTimeout(async function () {
        if (gameState === "1") {
            Swal.fire({
                title: 'Game state Closed',
                text: 'Sorry! This round has been closed! Try again after sometime',
                icon: 'info',
                confirmButtonText: 'See Game Status'
            }).then(() => {
                window.location.replace('../html/end_game.html')
            })
        }

        //verify if player is already a member of the game
        await verifyPlayer()

    }, 500)
})

async function verifyPlayer() {
    for (let i = 1; i < counter; i++) {
        let player = await contract.methods.players(i).call()

        if (player === account[0]) {
            window.location.replace('../html/end_game.html')
        }
    }
}