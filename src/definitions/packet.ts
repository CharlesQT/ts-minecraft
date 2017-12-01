import { MinecraftNetwork, ClientPacket, BiPacket, ServerPacket, PacketCoder } from './network'
import { Socket, connect } from 'net';
import { v4 } from 'uuid'
import * as Long from 'long';
import { NBT } from '../../index';
// const sock = connect({ host: 'mc.hypixel.org', port: 25565 })
// const net = new MinecraftNetwork('client', sock); //dummy socket


// export class HandshakePacket implements BiPacket {
//     onClient(): void {
//         throw new Error("Method not implemented.");
//     }
//     onServer(): void {
//         throw new Error("Method not implemented.");
//     }
// }

// sock.end()
const id = '004a959f-751b-4632-8596-ab4d8cb515ee'
const components = id.split('-')
if (components.length != 5) throw new Error('Invalid UUID')
const l = Long.fromString(`${components[0]}`, false, 16)
let hi = Long.fromString(components[0], false, 16)
hi = hi.shiftLeft(16)
hi = hi.or(Long.fromString(components[1], false, 16))
hi = hi.shiftLeft(16)
hi = hi.or(Long.fromString(components[2], false, 16))

let lo = Long.fromString(components[3], false, 16)
lo = lo.shiftLeft(48)
lo = lo.or(Long.fromString(components[4], false, 16))

const makeDigit = (hex: string, digit: number) => {
    if (hex.length < digit) {
        let d = ''
        for (let i = 0; i < digit - hex.length; i += 1)
            d += 0;
        return `${d}${hex}`
    }
    return hex;
}
const a = makeDigit(hi.shiftRight(32).toString(16), 8);
const b = makeDigit(hi.shiftRight(16).and(0xFFFF).toString(16), 4)
const c = makeDigit(hi.and(0xFFFF).toString(16), 4)
const d = makeDigit(lo.shiftRight(48).and(0xFFFF).toString(16), 4)
const e = makeDigit(lo.and(0xFFFFFFFFFFFF).toString(16), 12)

const s = `${a}-${b}-${c}-${d}-${e}`
console.log(hi.toString())
console.log(lo.toString())
console.log(s)
console.log(id)
console.log(s == id)


export interface SlotData {
    blockId: number
    itemCount?: number
    itemDamage?: number
    nbt?: NBT.TagCompound
}