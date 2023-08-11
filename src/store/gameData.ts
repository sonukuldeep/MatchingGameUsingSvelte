import { browser } from '$app/environment';
import { writable } from 'svelte/store';

type GameData = { time: number; gameMode: string }
const defaultValue: GameData = { time: 20, gameMode: 'Human' }
const data = browser ? window.localStorage.getItem('gameData') : null
const initialValue: GameData = data ? JSON.parse(data) : defaultValue

const gameData = writable<GameData>(initialValue)

gameData.subscribe(data => {
    if (browser) {
        window.localStorage.setItem('gameData', JSON.stringify(data))
    }
})
export default gameData
