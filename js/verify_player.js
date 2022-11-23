$(document).ready(function () {
    setTimeout(async function () {
        if (gameState === "1") {
            Swal.fire({
                title: 'Game state Closed',
                text: 'Sorry! This round has been closed! Try again after sometime',
                icon: 'info',
                confirmButtonText: 'See Game Status',
                confirmButtonColor: '#4B983BFF',
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false,
                iconColor: 'beige',
                customClass: 'swal-style'
            }).then(() => {
                window.location.replace('../html/end_game.html')
            })
        }

        //verify if player is already a member of the game
        await verifyPlayer()

    }, 1000)
})

async function verifyPlayer() {
    console.log("verify")
    for (let i = 1; i < counter; i++) {
        let player = await contract.methods.players(i).call()

        if (player === account[0]) {
            window.location.replace('../html/end_game.html')
        }
    }
}