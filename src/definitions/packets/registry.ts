import { PacketCoder, Side } from "../network";

const registry: RegistryEntry[] = [];
type FieldRecord = { name: string, type: PacketCoder<any> }

export interface RegistryEntry {
    readonly id: number
    readonly name: string
    readonly side: 'both' | 'client' | 'server'
    readonly coder: PacketCoder<any>
}

export function Field<T>(type: PacketCoder<T>, side?: Side) {
    return (target: any, key: string) => {
        if (!Reflect.hasMetadata('packet:fields', target)) {
            Reflect.defineMetadata('packet:fields', [], target)
        }
        Reflect.getMetadata('packet:fields', target).push({ name: key, type })
    }
}

export function Packet(id: number, namespace: string) {
    return (constructor: Function) => {
        const fields: FieldRecord[] = Reflect.getMetadata('packet:fields', constructor.prototype) || []
        let side: 'both' | 'client' | 'server';
        if (constructor.prototype.onClient && constructor.prototype.onServer) {
            side = 'both'
        } else if (constructor.prototype.onClient) {
            side = 'client'
        } else if (constructor.prototype.onServer) {
            side = 'server'
        } else {
            throw new Error(`Cannot register non-packet class! ${id} ${namespace} ${constructor.name}`);
        }
        registry.push({
            id,
            name: constructor.name,
            side,
            coder: {
                encode(buffer, value) {
                    fields.forEach(cod => {
                        cod.type.encode(buffer, value[cod.name]);
                    })
                },
                decode(buffer, value) {
                    fields.forEach(cod => {
                        const inst = cod.type.create();
                        try {
                            value[cod.name] = cod.type.decode(buffer, inst);
                        } catch (e) {
                            console.error(new Error(`Exception during reciving packet [${id}]${constructor.name}`))
                            console.error(e)
                            value[cod.name] = inst;
                        }
                    })
                },
                create: () => constructor(),
            }
        })
    }
}

export function allEntries() {
    return Array.from(registry);
}
