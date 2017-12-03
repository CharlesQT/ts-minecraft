import { PacketCoder, Side } from "../network";

export const registry = {

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
        const fields = Reflect.getMetadata('packet:fields', constructor.prototype) || []
        if (constructor.prototype.onClient && constructor.prototype.onServer) {

        } else if (constructor.prototype.onClient) {

        } else if (constructor.prototype.onServer) {

        } else {

        }
        // this.register(id, constructor.name, side, {
        //     encode(buffer, value) {
        //         fields.forEach((cod: any) => {
        //             cod.type.encode(buffer, value[cod.name]);
        //         })
        //     },
        //     decode(buffer, value) {
        //         fields.forEach((cod: any) => {
        //             const inst = cod.type.create();
        //             try {
        //                 value[cod.name] = cod.type.decode(buffer, inst);
        //             } catch (e) {
        //                 console.error(new Error(`Exception during reciving packet [${id}]${constructor.name}`))
        //                 console.error(e)
        //                 value[cod.name] = inst;
        //             }
        //         })
        //     },
        //     create: () => constructor(),
        // })
    }
}
