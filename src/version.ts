import * as paths from 'path'
import * as fs from 'fs-extra'

import { MinecraftLocation } from '../index';

function getPlatform() {
    const os = require('os')
    let arch = os.arch();
    if (arch.startsWith('x')) arch = arch.substring(1);
    const version = os.release();
    let name: string = 'unknown'
    switch (os.platform()) {
        case 'darwin':
            return { name: 'osx', version, arch }
        case 'linux':
            return { name, version, arch }
        case 'win32':
            return { name: 'windows', version, arch }
        default:
            return { name: 'unknown', version, arch }
    }
}

export interface Download {
    readonly sha1: string,
    readonly size: number,
    readonly url: string
}
export interface AssetIndex extends Download {
    readonly id: string,
    readonly totalSize: number
}
export interface Artifact extends Download {
    readonly path: string
}
export interface LoggingFile extends Download {
    readonly id: string
}
export interface Version {
    inheritsFrom?: string,
    assetIndex: AssetIndex,
    assets: string,
    downloads: {
        client: Download,
        server: Download,
        [key: string]: Download,
    },
    libraries: Library[],
    id: string,
    mainClass: string,
    jvmArguments: string,
    minecraftArguments: string,
    minimumLauncherVersion: number,
    releaseTime: string,
    time: string,
    type: string,
    logging?: {
        [key: string]: {
            file: Download,
            argument: string,
            type: string,
        }
    }
}
export namespace Version {
    export function parse(minecraftPath: MinecraftLocation, version: string): Promise<Version> {
        return resolveDependency(minecraftPath, version).then(e => {
            if (e.length == 0) throw new Error('Dependency error!');
            return parseVersionHierarchy(e)
        })
    }
}
export class Library {
    constructor(readonly name: string, readonly download: Artifact) { }
}
export class Native extends Library {
    constructor(name: string, download: Artifact, readonly extractExclude?: string[]) {
        super(name, download);
    }
}

export function resolveDependency(path: MinecraftLocation, version: string): Promise<Version[]> {
    const folderLoc = typeof path === 'string' ? path : path.root;
    return new Promise<Version[]>((res, rej) => {
        let stack: Version[] = []
        let fullPath = paths.join(folderLoc, 'versions', version, version + '.json')
        if (!fs.existsSync(fullPath)) rej(new Error('No version file for ' + version));
        function interal(fullPath: string): Promise<Version[]> {
            return fs.readFile(fullPath).then((value) => {
                let ver = parseVersionJson(value.toString());
                stack.push(ver);
                if (ver.inheritsFrom)
                    return interal(paths.join(folderLoc, 'versions', ver.inheritsFrom, ver.inheritsFrom + '.json'))
                else
                    return stack
            })
        }
        interal(fullPath).then(r => res(r), e => rej(e))
    })
}


function parseVersionHierarchy(hierarchy: Version[]): Version {
    if (hierarchy.length === 0) throw new Error('The hierarchy cannot be empty!');
    let id: string = hierarchy[0].id;
    let assetIndex: AssetIndex = hierarchy[0].assetIndex;
    let assets: string

    let downloadsMap: { [key: string]: Download } = {};
    let librariesMap: { [key: string]: Library } = {};
    let nativesMap: { [key: string]: Native } = {};

    let mainClass: string
    let jvmArguments: string
    let minecraftArguments: string
    let minimumLauncherVersion: number = hierarchy[0].minimumLauncherVersion;
    let releaseTime: string = hierarchy[0].releaseTime;
    let time: string = hierarchy[0].time;
    let type: string
    let logging: any;

    let json: Version;
    do {
        json = hierarchy.pop() as Version;
        jvmArguments = json.jvmArguments;
        minecraftArguments = json.minecraftArguments;
        logging = json.logging;
        assets = json.assets;
        type = json.type;
        mainClass = json.mainClass;
        if (json.assetIndex) assetIndex = json.assetIndex
        if (json.libraries) {
            json.libraries.forEach(lib => {
                if (lib instanceof Native) {
                    nativesMap[lib.name] = lib;
                } else {
                    librariesMap[lib.name] = lib;
                }
            })
        }
        if (json.downloads)
            for (let key in json.downloads)
                downloadsMap[key] = json.downloads[key]
    } while (hierarchy.length != 0);

    if (!mainClass)
        throw new Error("Missing mainClass");
    if (!minecraftArguments)
        throw new Error("Missing gameArguments");
    if (!jvmArguments)
        throw new Error('Missing jvmArguments')
    if (!assetIndex)
        throw new Error('Missing asset!');

    return {
        id, assetIndex, assets,
        downloads: downloadsMap,
        libraries: Object.keys(librariesMap).map(k => librariesMap[k]).concat(Object.keys(nativesMap).map(k => nativesMap[k])),
        minecraftArguments,
        mainClass, minimumLauncherVersion, jvmArguments, releaseTime, time, type, logging,
    } as Version
}

function parseVersionJson(versionString: string): Version {
    const platform = getPlatform();
    const checkAllowed = (rules: { action?: string, os?: any }[]) => {
        // by default it's allowed
        if (!rules) return true;
        // else it's disallow by default
        let allow = false;
        for (let rule of rules) {
            let action = rule.action == "allow";
            // apply by default
            let apply = true;
            if (rule["os"]) {
                // don't apply by default if has os rule
                apply = false;
                let osRule = rule.os;
                if (platform.name == osRule.name
                    && (!osRule.version || platform.version.match(osRule.version)))
                    apply = true;
            }
            if (apply) allow = action;
        }
        return allow;
    }
    const parseLibs = (libs: Array<any>) => {
        const empty = new Library('', { path: '', sha1: '', size: 0, url: '' })
        return libs.map(lib => {
            if (lib.rules && !checkAllowed(lib.rules)) return empty;
            if (lib.natives) {
                if (!lib.natives[platform.name]) return empty;
                const classifier = (lib.natives[platform.name] as string).replace('${arch}', platform.arch);
                const nativArt = lib.downloads.classifiers[classifier]
                if (!nativArt) return empty;
                return new Native(lib.name, lib.downloads.classifiers[classifier], lib.extract ? lib.extract.exclude ? lib.extract.exclude : undefined : undefined);
            } else {
                if(!lib.downloads) return empty;
                return new Library(lib.name, lib.downloads.artifact)
            }
        }).filter(l => l !== empty)
    }
    const parseArgs = (args: any) => {
        if (args.jvm) args.jvm = args.jvm.map((a: string | any) => {
            if (typeof a === 'object') return checkAllowed(a.rules) ? a.value : undefined
            return a;
        }).filter((a: any) => a !== undefined).reduce((a: Array<string>, b: string | Array<string>) => {
            if (b instanceof Array) a.push(...b);
            else a.push(b);
            return a
        }, [])
        if (args.game) args.game = args.game.filter((a: string) => typeof a === 'string')
        return args;
    }
    const parsed = JSON.parse(versionString, (key, value) => {
        if (key === 'libraries') return parseLibs(value)
        if (key === 'arguments') return parseArgs(value)
        return value;
    })
    if (parsed.arguments) {
        parsed.minecraftArguments = parsed.arguments.game.join(' ')
        parsed.jvmArguments = parsed.arguments.jvm.join(' ')
        delete parsed.arguments
    } else {
        parsed.jvmArguments = '-Djava.library.path=${natives_directory} -Dminecraft.launcher.brand=${launcher_name} -Dminecraft.launcher.version=${launcher_version} -cp ${classpath}'
    }
    return parsed as Version;
}
