<script lang="ts">
    import gameData from "../store/gameData";

    type State = "start" | "playing" | "paused" | "won" | "lost" | "settings";
    type GameData = { time: number; gameMode: string };
    const pets = Array.from({ length: 33 }, (_, i) => i);
    let state: State = "start";
    let size = 12;
    let grid = createGrid();
    let maxMatches = grid.length / 2;
    let selected: number[] = [];
    let matches: number[] = [];
    let timerId: number | null = null;
    let time = 20;
    let gameMode = "Human";

    (function getLocalStorage() {
        const data = $gameData;
        time = data.time;
        gameMode = data.gameMode;
    })();

    function setLocalStorage() {
        const data: GameData = { time, gameMode };
        gameData.set(data);
    }

    function startGameTimer() {
        function coundDown() {
            // state !== "paused" && (time -= 1);
        }
        timerId = setInterval(coundDown, 1000);
    }

    function createGrid() {
        let cards = new Set<number>();
        let maxSize = size / 2;

        while (cards.size < maxSize) {
            const randomIndex = Math.floor(Math.random() * pets.length);
            cards.add(pets[randomIndex]);
        }
        return shuffle([...cards, ...cards]);
    }

    function shuffle<Items>(array: Items[]) {
        return array.sort(() => Math.random() - 0.5);
    }

    function selectCard(cardIndex: number) {
        selected = selected.concat(cardIndex);
    }

    function matchCards() {
        const [first, second] = selected;
        if (grid[first] === grid[second]) {
            matches = matches.concat(grid[first]);
        }
        setTimeout(() => {
            selected = [];
        }, 300);
    }

    function resetGame() {
        timerId && clearInterval(timerId);
        grid = createGrid();
        maxMatches = grid.length / 2;
        selected = [];
        matches = [];
        timerId = null;
        time = 20;
    }

    function gameWon() {
        state = "won";
        resetGame();
    }

    function gameLost() {
        state = "lost";
        resetGame();
    }

    function pauseGame(e: KeyboardEvent) {
        if (e.key === "Escape") {
            switch (state) {
                case "playing":
                    state = "paused";
                    break;
                case "paused":
                    state = "playing";
                    break;
            }
        }
    }

    $: if (state === "playing") {
        !timerId && startGameTimer();
    }

    $: selected.length === 2 && matchCards();
    $: maxMatches === matches.length && gameWon();
    $: time === 0 && gameLost();
</script>

<svelte:window on:keydown={pauseGame} />

<div class="difficulty">
    <div>Difficulty: {gameMode}</div>
    {#if state === "playing"}
        <button on:click={() => (state = "paused")}>Pause</button>
    {/if}
    {#if state === "settings"}
        <button on:click={() => (state = "start")}>Home</button>
    {/if}
    {#if state === "paused"}
        <button on:click={() => (state = "playing")}>Resume</button>
    {/if}
</div>

{#if state === "paused"}
    <h1>Game paused</h1>
{/if}

{#if state === "start"}
    <h1>Matching game</h1>
    <button
        class="UIBtn"
        on:click={() => {
            state = "playing";
        }}>Play</button
    >
    <button
        class="UIBtn"
        on:click={() => {
            state = "settings";
        }}>Settings</button
    >
{/if}

{#if state === "settings"}
    <h1>Game difficulty</h1>
    <button
        class="UIBtn"
        on:click={() => {
            state = "start";
            time = 40;
            gameMode = "Ape";
            setLocalStorage();
        }}>Ape</button
    >
    <button
        class="UIBtn"
        on:click={() => {
            state = "start";
            time = 20;
            gameMode = "Human";
            setLocalStorage();
        }}>Human</button
    >
    <button
        class="UIBtn"
        on:click={() => {
            state = "start";
            time = 10;
            gameMode = "Bot";
            setLocalStorage();
        }}>Bot</button
    >
{/if}

{#if state === "playing"}
    <h1 class="timer">
        <span class:pulse={time <= 10}>{time}</span>
    </h1>

    <div class="cards">
        {#each grid as card, cardIndex}
            {@const isSelected = selected.includes(cardIndex)}
            {@const isSelectedOrMatched =
                selected.includes(cardIndex) || matches.includes(card)}
            {@const match = matches.includes(card)}
            <button
                class="card"
                class:selected={isSelected}
                disabled={isSelectedOrMatched}
                class:flip={isSelectedOrMatched}
                on:click={() => selectCard(cardIndex)}
            >
                <div class:match class="back">
                    <img
                        style="left: calc(-1 * {card} * 96px + 10px); clip-path: inset(0px calc(3072px - 96px * {card}) 0px calc(96px * {card}));"
                        class="pet-image"
                        src="/pets.png"
                        alt="pets"
                    />
                </div>
            </button>
        {/each}
    </div>
{/if}

{#if state === "lost"}
    <h1>You lost! 💩</h1>
    <button on:click={() => (state = "playing")}>Play again</button>
{/if}

{#if state === "won"}
    <h1>You won! 🏆</h1>
    <button on:click={() => (state = "playing")}>Play again</button>
{/if}

<img hidden class="pets" src="/pets.png" alt="" />

<style>
    .cards {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.4rem;
        max-width: 768px;
    }
    .card {
        height: 120px;
        width: 120px;
        max-width: 22vw;
        max-height: 22vw;
        font-size: 4rem;
        background-color: var(--bg-2);
        position: relative;
        transition: rotate 0.3s ease-out;
        transform-style: preserve-3d;
        border: 4px solid transparent;
    }

    .UIBtn {
        border: 4px solid var(--txt-1);
        margin-top: 2rem;
    }

    .card.selected {
        border: 4px solid var(--border);
    }
    .card .match {
        transition: opacity 0.3s easa-out;
        opacity: 0.4;
    }

    .card.flip {
        rotate: y 180deg;
        pointer-events: none;
    }

    .card .back {
        position: absolute;
        inset: 0;
        display: grid;
        place-content: center;
        backface-visibility: hidden;
        rotate: y 180deg;
        overflow: hidden;
        width: 100%;
        height: 100%;
        background-color: white;
        border-radius: 4px;
    }

    .pet-image {
        --value: 2;
        position: absolute;
        bottom: -5px;
        height: 120px;
        /* object-fit: cover; */
        /* left: calc(-1 * var(--value) * 96px + 10px);
        clip-path: inset(0px calc(3072px - 96px * var(--value)) 0px calc(96px * var(--value))); */
    }

    .timer {
        transition: color 0.3s ease;
    }

    .pulse {
        color: var(--pulse);
        animation: pulse 1s infinite ease;
        display: inline-block;
    }

    .difficulty {
        position: absolute;
        top: 5px;
        left: 5px;
        font-weight: 400;
        font-size: small;
    }

    .difficulty button {
        font-size: inherit;
        padding: 0;
        width: 100%;
        border: 1px solid var(--txt-1);
        border-radius: 4px;
        padding: 4px 0;
        font-weight: 400;
        margin-top: 4px;
    }

    @keyframes pulse {
        to {
            scale: 1.4;
        }
    }
</style>
