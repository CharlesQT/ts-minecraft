import { GameComponent, Space3D } from "./base";
import { Block, BlockStateDictionary, RandomTick, BlockState } from "./block";
import { World } from "./world";

export class Chunk extends GameComponent {
    private _parent: World

    private _layers: ChunkLayer[]
    private _blocks: Map<Position, Block>
}
// ExtendedStorage
export class ChunkLayer extends GameComponent {
    private yLevel: number
    private _nOfBlocks: number
    private _nOfRndTick: number
    blockLights: Space3D<Uint8Array>
    skyLights: Space3D<Uint8Array>
    private _blocks: Space3D<Uint32Array>
    private _dictionary: BlockStateDictionary

    get empty() { return this._nOfBlocks === 0 }
    get randomTick() { return this._nOfRndTick !== 0 }

    set(x: number, y: number, z: number, state: BlockState) {
        const oldState = this.get(x, y, z);

        if (oldState !== BlockStateDictionary.AIR) {
            this._nOfBlocks -= 1;
            if (oldState.type.hasComponent(RandomTick))
                this._nOfRndTick -= 1;
        }
        if (state !== BlockStateDictionary.AIR) {
            this._nOfBlocks += 1;
            if (state.type.hasComponent(RandomTick))
                this._nOfRndTick += 1;
        }

        const id = this._dictionary.getId(state);
        if (!id) throw new Error()
        this._blocks.set(x, y, z, id)
    }

    get(x: number, y: number, z: number) {
        return this._dictionary.getState(this._blocks.get(x, y, z)) || BlockStateDictionary.AIR;
    }
}
