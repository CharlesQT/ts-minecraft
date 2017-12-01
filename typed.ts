
interface Level {
    Data: {
        RandomSeed: number,
        generatorName: string,
        BorderCenterZ: number,
        Difficulty: number,
        BorderSizeLerpTime: number,
        raining: number,
        DimensionData: {
            1: {
                DragonFight: {
                    Gateways: {
                    },
                    DragonKilled: number,
                    PreviouslyKilled: number,
                },
            },
        },
        Time: number,
        GameType: number,
        MapFeatures: number,
        BorderCenterX: number,
        BorderDamagePerBlock: number,
        BorderWarningBlocks: number,
        BorderSizeLerpTarget: number,
        Version: {
            Snapshot: number,
            Id: number,
            Name: string,
        },
        DayTime: number,
        initialized: number,
        allowCommands: number,
        SizeOnDisk: number,
        GameRules: {
            doTileDrops: string,
            doFireTick: string,
            reducedDebugInfo: string,
            naturalRegeneration: string,
            disableElytraMovementCheck: string,
            doMobLoot: string,
            keepInventory: string,
            doEntityDrops: string,
            mobGriefing: string,
            randomTickSpeed: string,
            commandBlockOutput: string,
            spawnRadius: string,
            doMobSpawning: string,
            logAdminCommands: string,
            spectatorsGenerateChunks: string,
            sendCommandFeedback: string,
            doDaylightCycle: string,
            showDeathMessages: string,
        },
        Player: {
            HurtByTimestamp: number,
            SleepTimer: number,
            Attributes: {
                Base: number,
                Name: string,
            },
            Invulnerable: number,
            FallFlying: number,
            PortalCooldown: number,
            AbsorptionAmount: number,
            abilities: {
                invulnerable: number,
                mayfly: number,
                instabuild: number,
                walkSpeed: number,
                mayBuild: number,
                flying: number,
                flySpeed: number,
            },
            FallDistance: number,
            DeathTime: number,
            XpSeed: number,
            XpTotal: number,
            playerGameType: number,
            Motion: {
            },
            UUIDLeast: number,
            Health: number,
            foodSaturationLevel: number,
            Air: number,
            OnGround: number,
            Dimension: number,
            Rotation: {
            },
            XpLevel: number,
            Score: number,
            UUIDMost: number,
            Sleeping: number,
            Pos: {
            },
            Fire: number,
            XpP: number,
            EnderItems: Array<any>,
            DataVersion: number,
            foodLevel: number,
            foodExhaustionLevel: number,
            HurtTime: number,
            SelectedItemSlot: number,
            Inventory: {
                Slot: number,
                id: string,
                Count: number,
                Damage: number,
            },
            foodTickTimer: number,
        },
        SpawnY: number,
        rainTime: number,
        thunderTime: number,
        SpawnZ: number,
        hardcore: number,
        DifficultyLocked: number,
        SpawnX: number,
        clearWeatherTime: number,
        thundering: number,
        generatorVersion: number,
        version: number,
        BorderSafeZone: number,
        generatorOptions: string,
        LastPlayed: number,
        BorderWarningTime: number,
        LevelName: string,
        BorderSize: number,
        DataVersion: number,
    },
}


