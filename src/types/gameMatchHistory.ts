import {Winner, RoomType} from "./enum"
export interface UserMatchHistoryResponse {
    matchId: string,
    matchType: RoomType,
    player1Id: number,
    player1Name: string,
    player1Avatar: string,
    player1Score: number,
    player2Id: number,
    player2Name: string,
    player2Avatar: string,
    player2Score: number,
    winnerPlayer: Winner,
    userNumber: number,
    plusPoint: number,
    createdAt: string
}