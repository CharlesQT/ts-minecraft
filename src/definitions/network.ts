import { Socket } from 'net';
import zlib from 'zlib'
import * as ByteBuffer from 'bytebuffer'
export type Side = 'server' | 'client'
import 'reflect-metadata'

export interface Context {
    forward: (message: any) => void
    context: { [key: string]: any }
}
export interface Handler<T> {
    handle(message: T, context: Context): void;
}

class Node {
    constructor(readonly name: string,
        readonly context: { [key: string]: any },
        readonly handler: Handler<any>,
        public next?: Node,
        public prev?: Node) {
    }

    onMessage(message: any) {
        this.handler.handle(message, this);
    }
    forward(msg: any) {
        if (this.next) this.next.onMessage(msg)
    }
}

export class Pipeline {
    private head: Node;
    private tail: Node;

    readonly context = {};
    constructor() { }
    addFirst(handler: Handler<any>, name: string = ''): this {
        const nHead = new Node(name, this.context, handler, this.head);
        if (this.head) this.head.prev = nHead;
        this.head = nHead;
        if (!this.tail) this.tail = nHead;
        return this;
    }
    insertAfter(name: string, handler: Handler<any>): this {
        return this;
    }
    insertBefore(name: string, handler: Handler<any>): this {
        return this;
    }
    addLast(handler: Handler<any>, name: string = ''): this {
        const nTail = new Node(name, this.context, handler, undefined, this.tail);
        if (this.tail) this.tail.next = nTail;
        this.tail = nTail;
        if (!this.head) this.head = nTail;
        return this;
    }

    push(message: any): any {
        this.head.onMessage(message);
    }
}

class Decoder implements Handler<Buffer> {
    private remainLength = 0;
    private buffer: ByteBuffer;

    handle(message: Buffer, context: Context): void {
        if (this.remainLength === 0) { // new packet
            const byteBuffer = ByteBuffer.wrap(message);
            const totalLength = byteBuffer.readVarint32();
            this.remainLength = totalLength - byteBuffer.remaining();
            this.buffer = byteBuffer.slice();
            if (this.remainLength === 0) {
                context.forward(this.buffer);
            }
            if (this.remainLength < 0) {
                throw new Error()
            }
        } else { // continued packet
            this.buffer.append(message);
            this.remainLength -= message.byteLength;
            if (this.remainLength === 0) {
                context.forward(this.buffer);
            }
            if (this.remainLength < 0) {
                throw new Error()
            }
        }
    }
}

class Decompressor implements Handler<ByteBuffer> {
    handle(message: ByteBuffer, context: Context): void {
        if (context.context.compressed) {
            const lenAfterDecomp = message.readVarint32();
            const remain = message.slice();
            if (lenAfterDecomp === 0) { // not compressed
                context.forward(message)
            } else { // compressed
                zlib.inflate(Buffer.from(remain.buffer), (err, result) => {
                    if (err) {
                        console.error(err)
                    } else {
                        context.forward(ByteBuffer.wrap(result))
                    }
                })
            }
        }
    }
}

class Encoder implements Handler<ByteBuffer> {
    handle(message: ByteBuffer, context: Context): void {
        const buffer = new ByteBuffer()
        buffer.writeVarint32(message.remaining());
        buffer.append(buffer);
        // context.send(Buffer.from(buffer.buffer))
    }
}

class Compressor implements Handler<ByteBuffer> {
    handle(message: ByteBuffer, context: Context): void {
        if (context.context.compressed && context.context.compressedThreadHold) {
            const threadhold = context.context.compressedThreadHold;
            const len = message.remaining();
            if (len > threadhold) {
                zlib.deflate(Buffer.from(message.buffer), (err, result) => {
                    if (err) {
                        console.error(err)
                    } else {
                        const buf = new ByteBuffer();
                        buf.writeVarint32(result.byteLength);
                        buf.append(buf);
                        context.forward(buf);
                    }
                })
            } else {
                const buf = new ByteBuffer();
                buf.writeVarint32(0);
                buf.append(message);
                context.forward(buf);
            }
        }
    }
}

export interface PacketCoder<T> {
    create: () => T
    encode: (buffer: ByteBuffer, data: T, context?: any) => void
    decode: (buffer: ByteBuffer, data: T, context?: any) => T
}

export interface ClientPacket {
    onClient(): void;
}
export interface ServerPacket {
    onServer(): void;
}

export interface BiPacket extends ClientPacket, ServerPacket {
}

class Classifier implements Handler<any> {
    constructor(private packetCoders: { [packetType: string]: PacketCoder<any> }) {
    }
    handle(message: any, context: Context): void {
        const type = Object.getPrototypeOf(message);
        const coder = this.packetCoders[type];
        if (coder && coder.encode) {
            const buf = new ByteBuffer();
            coder.encode(buf, message);
            context.forward(buf);
        } else throw new Error('')
    }
}

class Dispatcher implements Handler<ByteBuffer> {
    constructor(private packetCoders: { [packetId: number]: PacketCoder<any> }) { }
    handle(message: ByteBuffer, context: Context): void {
        const packetId = message.readVarint32();
        const packetContent = message.slice();
        const coder = this.packetCoders[packetId];
        if (coder) {
            const inst = coder.create();
            coder.decode(message, inst);
            switch (context.context.side) {
                case 'client':
                    inst.onClient()
                case 'server':
                    inst.onServer()
            }
        } else {
            console.error(`Unknown packet ${packetContent}.`)
        }
    }
}


export class MinecraftNetwork {
    private inbound: Pipeline;
    private outbound: Pipeline;
    private coderById: { [packetId: number]: PacketCoder<any> } = {};
    private coderByType: { [packetType: string]: PacketCoder<any> } = {};

    constructor(readonly side: Side, readonly socket: Socket) {
        this.inbound = new Pipeline();
        this.outbound = new Pipeline();

        this.inbound.addFirst(new Decoder())
            .addLast(new Decompressor())
            .addLast(new Dispatcher(this.coderById));
        this.outbound.addFirst(new Classifier(this.coderByType))
            .addLast(new Compressor())
            .addLast(new Encoder())
            .addLast({
                handle(message: ByteBuffer, context: Context): void {
                    socket.write(Buffer.from(message.buffer))
                }
            });
        socket.on('data', (data) => {
            this.inbound.push(data);
        });
    }

    register(packetId: number, type: Class | string, side: Side[] | Side, coder: PacketCoder<any>): this {
        const typeName = typeof type === 'string' ? type : type.prototype.constructor.name;
        if (this.coderById[packetId]) throw new Error()
        if (this.coderByType[typeName]) throw new Error()

        this.coderById[packetId] = coder;
        this.coderByType[typeName] = coder;
        return this;
    }

    send(message: any): this {
        this.outbound.push(message);
        return this;
    }

    Packet(id: number, side: Side[] | Side) {
        return (constructor: Function) => {
            const fields = Reflect.getMetadata('packet:fields', constructor.prototype) || []
            this.register(id, constructor.name, side, {
                encode(buffer, value) {
                    fields.forEach((cod: any) => {
                        cod.type.encode(buffer, value[cod.name]);
                    })
                },
                decode(buffer, value) {
                    fields.forEach((cod: any) => {
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
            })
        }
    }

    Type(type: any) {
        return (target: any, key: string) => {
            if (!Reflect.hasMetadata('packet:fields', target)) {
                Reflect.defineMetadata('packet:fields', [], target)
            }
            Reflect.getMetadata('packet:fields', target).push({ name: key, type })
        }
    }
}
