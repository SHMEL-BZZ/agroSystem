const sequelize = require('../db')
const { DataTypes } = require('sequelize')

// модели
// пользователи
const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_пользователя'
    },
    login: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: 'логин'
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'пароль'
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
        field: 'почта'
    }
}, {
    tableName: 'пользователи',
    timestamps: false
})

// клапаны
const Valve = sequelize.define('Valve', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_клапана'
    },
    manufacturer: {
        type: DataTypes.STRING(50),
        field: 'производитель'
    },
    model: {
        type: DataTypes.STRING(50),
        field: 'модель'
    },
    constructionType: {
        type: DataTypes.STRING(50),
        field: 'тип_конструкции',
        validate: {
            isIn: [['электромагнитный', 'шаровый', 'дисковый', 'игольчатый']]
        }
    },
    diameter: {
        type: DataTypes.DECIMAL(5, 2),
        field: 'диаметр'
    },
    state: {
        type: DataTypes.STRING(20),
        defaultValue: 'работает',
        field: 'состояние',
        validate: {
            isIn: [['работает', 'отключен', 'аварийное']]
        }
    },
    waterSupply: {
        type: DataTypes.DECIMAL(10, 2),
        field: 'подача_воды'
    }
}, {
    tableName: 'клапаны',
    timestamps: false
})

// теплицы 
const GreenhouseBlock = sequelize.define('GreenhouseBlock', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_блока_теплиц'
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'название'
    },
    description: {
        type: DataTypes.TEXT,
        field: 'описание'
    }
}, {
    tableName: 'список_блока_теплиц',
    timestamps: false
})

// связь теплиц и клапанов 
const GreenhouseValve = sequelize.define('GreenhouseValve', {
    valveId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        field: 'id_клапана'
    },
    blockId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        field: 'id_блока_теплиц'
    }
}, {
    tableName: 'теплицы_клапаны',
    timestamps: false
})

// назначение баков
const TankPurpose = sequelize.define('TankPurpose', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_назначения'
    },
    description: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'описание'
    }
}, {
    tableName: 'назначение_баков',
    timestamps: false
})

// баки
const Tank = sequelize.define('Tank', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_бака'
    },
    volume: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'объем'
    },
    purposeId: {
        type: DataTypes.INTEGER,
        field: 'id_назначения_бака'
    }
}, {
    tableName: 'баки',
    timestamps: false
})

// ежедневные условия
const DailyCondition = sequelize.define('DailyCondition', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_ежуслов'
    },
    valveId: {
        type: DataTypes.INTEGER,
        field: 'id_клапана'
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'дата'
    },
    dayTemperature: {
        type: DataTypes.DECIMAL(5, 2),
        field: 'температура_по_дню'
    },
    weather: {
        type: DataTypes.STRING(50),
        field: 'погода'
    },
    avgHumidity: {
        type: DataTypes.DECIMAL(5, 2),
        field: 'ср_влажность'
    },
    avgConductivity: {
        type: DataTypes.DECIMAL(5, 2),
        field: 'ср_электропроводность'
    },
    avgPh: {
        type: DataTypes.DECIMAL(4, 2),
        field: 'ср_ph'
    }
}, {
    tableName: 'ежедневные_условия',
    timestamps: false
})

// добавки
const Additive = sequelize.define('Additive', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_добавки'
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'название'
    },
    stockVolume: {
        type: DataTypes.DECIMAL(10, 2),
        field: 'остаток_объем'
    },
    unit: {
        type: DataTypes.STRING(10),
        defaultValue: 'г',
        field: 'ед_измерения',
        validate: {
            isIn: [['г', 'мл', 'л']]
        }
    }
}, {
    tableName: 'добавки',
    timestamps: false
})

// история раствора
const SolutionHistory = sequelize.define('SolutionHistory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_раствора'
    },
    tankId: {
        type: DataTypes.INTEGER,
        field: 'id_бака'
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'дата'
    },
    totalVolume: {
        type: DataTypes.DECIMAL(10, 2),
        field: 'общий_объем'
    }
}, {
    tableName: 'история_раствора',
    timestamps: false
})

// состав раствора
const SolutionComposition = sequelize.define('SolutionComposition', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_состава'
    },
    solutionId: {
        type: DataTypes.INTEGER,
        field: 'id_раствора'
    },
    additiveId: {
        type: DataTypes.INTEGER,
        field: 'id_добавки'
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'количество_добавки'
    },
    unit: {
        type: DataTypes.STRING(10),
        field: 'ед_измерения',
        validate: {
            isIn: [['г', 'мл', 'л']]
        }
    }
}, {
    tableName: 'состав_раствора',
    timestamps: false
})

// история полива
const WateringHistory = sequelize.define('WateringHistory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_полива'
    },
    conditionId: {
        type: DataTypes.INTEGER,
        field: 'id_ежуслов'
    },
    solutionId: {
        type: DataTypes.INTEGER,
        field: 'id_раствора'
    },
    startTime: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'время_начала_полива'
    },
    duration: {
        type: DataTypes.INTEGER,
        field: 'длительность_полива'
    },
    waterVolume: {
        type: DataTypes.DECIMAL(10, 2),
        field: 'объем_воды'
    }
}, {
    tableName: 'история_поливов',
    timestamps: false
})

// история дренажа
const DrainHistory = sequelize.define('DrainHistory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_дренажа'
    },
    wateringId: {
        type: DataTypes.INTEGER,
        field: 'id_полива'
    },
    measurementTime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'время_измерения'
    },
    drainVolume: {
        type: DataTypes.DECIMAL(10, 2),
        field: 'объем_дренажа'
    }
}, {
    tableName: 'история_дренажа',
    timestamps: false
})

// расписание полива (основная таблица)
const WateringSchedule = sequelize.define('WateringSchedule', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_расписания'
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'дата'
    },
    periodNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'номер_периода'
    },
    startTime: {
        type: DataTypes.TIME,
        allowNull: false,
        field: 'время_начала'
    },
    durationMin: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'длительность_мин'
    },
    periodVolume: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'объем_периода'
    }
}, {
    tableName: 'расписание_полива',
    timestamps: false
})

// связь расписания с баками (с объёмом)
const ScheduleTank = sequelize.define('ScheduleTank', {
    scheduleId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        field: 'id_расписания'
    },
    tankId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        field: 'id_бака'
    },
    volume: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'объем'
    }
}, {
    tableName: 'расписание_баки',
    timestamps: false
})

// связь расписания с клапанами (с объёмом)
const ScheduleValve = sequelize.define('ScheduleValve', {
    scheduleId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        field: 'id_расписания'
    },
    valveId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        field: 'id_клапана'
    },
    volume: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'объем'
    }
}, {
    tableName: 'расписание_клапаны',
    timestamps: false
})


// связи

// Клапаны <-> Блоки теплиц (M2M через теплицы_клапаны)
Valve.belongsToMany(GreenhouseBlock, {
    through: GreenhouseValve,
    foreignKey: 'valveId',
    otherKey: 'blockId',
    as: 'blocks'
})
GreenhouseBlock.belongsToMany(Valve, {
    through: GreenhouseValve,
    foreignKey: 'blockId',
    otherKey: 'valveId',
    as: 'valves'
})

// Клапаны -> Ежедневные условия
Valve.hasMany(DailyCondition, { foreignKey: 'valveId', as: 'conditions' })
DailyCondition.belongsTo(Valve, { foreignKey: 'valveId', as: 'valve' })

// Баки -> История раствора
Tank.hasMany(SolutionHistory, { foreignKey: 'tankId', as: 'solutions' })
SolutionHistory.belongsTo(Tank, { foreignKey: 'tankId', as: 'tank' })

// История раствора -> Состав раствора
SolutionHistory.hasMany(SolutionComposition, { foreignKey: 'solutionId', as: 'composition' })
SolutionComposition.belongsTo(SolutionHistory, { foreignKey: 'solutionId', as: 'solution' })

// Добавки -> Состав раствора
Additive.hasMany(SolutionComposition, { foreignKey: 'additiveId', as: 'usages' })
SolutionComposition.belongsTo(Additive, { foreignKey: 'additiveId', as: 'additive' })

// Ежедневные условия -> История поливов
DailyCondition.hasMany(WateringHistory, { foreignKey: 'conditionId', as: 'waterings' })
WateringHistory.belongsTo(DailyCondition, { foreignKey: 'conditionId', as: 'condition' })

// История раствора -> История поливов
SolutionHistory.hasMany(WateringHistory, { foreignKey: 'solutionId', as: 'waterings' })
WateringHistory.belongsTo(SolutionHistory, { foreignKey: 'solutionId', as: 'solution' })

// История поливов -> История дренажа
WateringHistory.hasMany(DrainHistory, { foreignKey: 'wateringId', as: 'drains' })
DrainHistory.belongsTo(WateringHistory, { foreignKey: 'wateringId', as: 'drains' })

// Расписание -> баки (M:N через расписание_баки)
WateringSchedule.belongsToMany(Tank, {
    through: ScheduleTank,
    foreignKey: 'scheduleId',
    otherKey: 'tankId',
    as: 'tanks'
})
Tank.belongsToMany(WateringSchedule, {
    through: ScheduleTank,
    foreignKey: 'tankId',
    otherKey: 'scheduleId',
    as: 'schedules'
})

// Расписание -> клапаны (M:N через расписание_клапаны)
WateringSchedule.belongsToMany(Valve, {
    through: ScheduleValve,
    foreignKey: 'scheduleId',
    otherKey: 'valveId',
    as: 'valves'
})
Valve.belongsToMany(WateringSchedule, {
    through: ScheduleValve,
    foreignKey: 'valveId',
    otherKey: 'scheduleId',
    as: 'schedules'
})
TankPurpose.hasMany(Tank, { foreignKey: 'purposeId', as: 'tanks' })
Tank.belongsTo(TankPurpose, { foreignKey: 'purposeId', as: 'purpose' })

module.exports = {
    sequelize,
    User,
    Valve,
    GreenhouseBlock,
    GreenhouseValve,
    TankPurpose,
    Tank,
    DailyCondition,
    Additive,
    SolutionHistory,
    SolutionComposition,
    WateringHistory,
    DrainHistory,
    WateringSchedule,
    ScheduleTank,
    ScheduleValve,
}
