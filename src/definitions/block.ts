import { GameComponent } from "./base";

export class BlockType extends GameComponent {
    properties: BlockProperties
}

export class Block extends GameComponent {
    readonly type: BlockType
}

export interface BlockState {
    readonly type: BlockType
}

export namespace BlockStateDictionary {
    export const AIR: BlockState = {
        type: new BlockType()
    }
}
export interface BlockStateDictionary {
    getState(index: number): BlockState
    getId(state: BlockState): number
    size: number
}

export abstract class RandomTick {
    public abstract tick(): void;
}

export interface BlockProperties {
    material: Material
    opcaity: number
    brightness: number
    hardness: number
    resistance: number
    bordering: Box3D
    collision: Box3D
}

export interface Material {
    isLiquid: boolean
    flammbale: boolean
    replacable: boolean
    isSolid: boolean
    mobility: 'destroy' | 'block' | 'ignore' | 'push_only'
}