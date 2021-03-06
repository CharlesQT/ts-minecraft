
import Forge from "./forge";
import * as Zip from 'jszip'
import * as fs from 'fs-extra'

export class Mod<Meta> {
    constructor(readonly id: string, readonly meta: Meta) { }
}

export namespace Mod {
    export class File<Meta> {
        constructor(readonly type: string, readonly mods: Mod<Meta>[]) { }
    }

    export type Parser = (data: string | Buffer) => Promise<Mod<any>[]>;

    const registry: { [type: string]: Parser } = {};

    export function register(type: string, parser: Parser) {
        if (registry[type]) throw new Error(`duplicated type [${type}].`)
        registry[type] = parser;
    }

    /**
     * Read mod by the data or file location of the mod file.
     * 
     * @param data 
     * @param type 
     */
    export async function parse(data: string | Buffer, type: string | undefined): Promise<Mod.File<any>> {
        if (type)
            return new Mod.File(type, await registry[type](data));
        for (const type in registry) {
            try {
                const result = await registry[type](data);
                if (!result)
                    throw new Error();
                if (result instanceof Array)
                    if (result.length !== 0)
                        return new Mod.File(type, result);
                    else
                        throw new Error()
                return result;
            }
            catch (e) { }
        }
        const msg = typeof data === 'string' ? `@${data}` : '';
        throw new Error(`Cannot parse mod. ${msg}`)
    }
}

export default Mod;
