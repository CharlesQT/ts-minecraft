export class Space3D<T extends ArrayLiked<number>> {
    private _container: T
    set(x: number, y: number, z: number, v: number) {
        const idx = Space3D.getIndex(x, y, z);
        if (idx >= 0 && idx < this._container.length)
            this._container[Space3D.getIndex(x, y, z)] = v;
        else
            throw new Error()
    }

    get(x: number, y: number, z: number) {
        const idx = Space3D.getIndex(x, y, z);
        if (idx >= 0 && idx < this._container.length)
            return this._container[idx]
        else
            throw new Error()
    }

    get length() { return this._container.length; }

    static getIndex(x: number, y: number, z: number) {
        return y << 8 | z << 4 | x;
    }
}

export class GameComponent {
    private _componentsById: { [id: string]: any }
    private _componentsByType: { [type: string]: any }

    getComponent<T>(id: string | Class): T | undefined {
        if (typeof id === 'string') {
            return this._componentsById[id];
        } else {
            const name = id.prototype.constructor.name;
            return this._componentsByType[name]
        }
    }
    hasComponent(type: Class) {
        return this._componentsByType[type.prototype.constructor.name] !== undefined
    }
    addComponent<T>(component: T) {
        const prototype = Object.getPrototypeOf(component);
        if (!prototype) throw new Error();
        this._componentsByType[prototype.constructor.name] = component;
    }
    addIdComponent<T>(id: string, component: T) {
        this.addComponent(component);
        this._componentsById[id] = component;
    }
}

