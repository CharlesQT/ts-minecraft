
import * as fs from 'fs-extra'
import NBT from '../nbt'

interface Level {
    version: number
}

class TsType {
    private _content: string = '{ \n';
    field(name: string, type: string) {
        this._content += ` ${name}: ${type},\n`
    }
    end() { return this._content + ' }' }
}

function ptToString(type: any) {
    if (typeof type === 'number')
        switch (type) {
            case NBT.TagType.Byte:
            case NBT.TagType.Int:
            case NBT.TagType.Short:
            case NBT.TagType.Long:
            case NBT.TagType.Float:
            case NBT.TagType.Double:
                return 'number'
            case NBT.TagType.String:
                return 'string'
            case NBT.TagType.ByteArray:
            case NBT.TagType.IntArray:
            case NBT.TagType.LongArray:
                return 'Array<number>'
            case NBT.TagType.List:
                return 'Array<any>'
            case NBT.TagType.Compound:
                return 'any'
            default: throw new Error(`${type}`)
        }
    else {
        let target = type
        if (type instanceof Array) {
            target = type[0];
        }
        const t = new TsType();
        const keys = Object.keys(target);
        keys.forEach(k => {
            try {
                t.field(k, ptToString(target[k]))
            } catch (e) {
                console.error(`Error on field ${k}`)
                console.error(e)
            }
        })
        return t.end();
    }
}

function generateDefinition(name: string, type: any) {
    return `
        interface ${name} 
        ${ptToString(type)}
        \n
    `
}

async function main() {
    const nbt = NBT.Serializer.deserialize(await fs.readFile(`/Users/ci010/Workspace/ts-minecraft/tests/assets/sample-map/level.dat`), true)
    // console.log(nbt.type)
    const type = generateDefinition('Level', nbt.type)
    fs.writeFile('/Users/ci010/Workspace/ts-minecraft/typed.ts', type)
    // fs.writeFile('/Users/ci010/Workspace/ts-minecraft/typed.json', JSON.stringify(nbt.type, null, 4))
    // fs.writeFile('/Users/ci010/Workspace/ts-minecraft/value.json', JSON.stringify(nbt.value, null, 4))
    // const n = JSON.stringify(nbt, null, 4);
    // console.log(n)
}

main().then(() => { })