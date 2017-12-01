
interface Class {
    prototype: Object
}

interface ArrayLiked<T> {
    readonly length: number;
    [n: number]: T;
}

interface Position {
    x: number
    y: number
    z: number
}

interface Box3D {
    x: number
    y: number
    z: number

    toX: number
    toY: number
    toZ: number
}
