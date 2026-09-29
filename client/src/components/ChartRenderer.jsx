import React from 'react';
import {
    LineChart, Line, BarChart, Bar, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

// Форматирование коротких дат для оси X (2026-09-15 → 15.09)
const formatDateTick = (value) => {
    if (typeof value !== 'string') return value;
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return value;
    return `${m[3]}.${m[2]}`;
};

const ChartRenderer = ({ config }) => {
    if (!config) return null;

    const { type, xKey, data, series, xLabel, yLeftLabel, yRightLabel } = config;
    const safeSeries = Array.isArray(series) ? series : [];
    const safeData = Array.isArray(data) ? data : [];
    const hasRightAxis = safeSeries.some((s) => s.yAxisId === 'right');
    const isDateAxis = xKey === 'date';

    // Карта единиц измерения по ключу серии
    const unitByKey = safeSeries.reduce((acc, s) => {
        acc[s.key] = s.unit || '';
        return acc;
    }, {});

    // Tooltip: аккуратно скрываем null/undefined
    const formatTooltip = (value, name, props) => {
        if (value === null || value === undefined || value === '') {
            return ['—', name];
        }
        const unit = unitByKey[props.dataKey] || '';
        return [`${value} ${unit}`.trim(), name];
    };

    // Общая конфигурация осей
    const commonAxes = (
        <>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />

            <XAxis
                dataKey={xKey}
                tick={{ fontSize: 12 }}
                tickFormatter={isDateAxis ? formatDateTick : undefined}
                interval="preserveStartEnd"
                minTickGap={20}
                label={
                    xLabel
                        ? {
                            value: xLabel,
                            position: 'insideBottom',
                            offset: 20,
                            fontSize: 13,
                        }
                        : undefined
                }
                height={xLabel ? 60 : 30}
            />

            <YAxis
                yAxisId="left"
                tick={{ fontSize: 12 }}
                width={yLeftLabel ? 70 : 50}
                label={
                    yLeftLabel
                        ? {
                            value: yLeftLabel,
                            angle: -90,
                            position: 'insideLeft',
                            style: { textAnchor: 'middle', fontSize: 13 },
                        }
                        : undefined
                }
            />

            {hasRightAxis && (
                <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12 }}
                    width={yRightLabel ? 70 : 50}
                    label={
                        yRightLabel
                            ? {
                                value: yRightLabel,
                                angle: 90,
                                position: 'insideRight',
                                style: { textAnchor: 'middle', fontSize: 13 },
                            }
                            : undefined
                    }
                />
            )}

            <Tooltip formatter={formatTooltip} />
            <Legend wrapperStyle={{ fontSize: 13, paddingTop: 20 }} />
        </>
    );

    const margin = {
        top: 20,
        right: hasRightAxis ? 40 : 20,
        left: 10,
        bottom: xLabel ? 50 : 20,
    };

    if (!safeData.length) {
        return (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: '#888',
                    fontSize: 14,
                }}
            >
                Нет данных за выбранный период
            </div>
        );
    }

    if (type === 'bar') {
        return (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={safeData} margin={margin}>
                    {commonAxes}
                    {safeSeries.map((s) => (
                        <Bar
                            key={s.key}
                            dataKey={s.key}
                            name={s.name}
                            fill={s.color}
                            yAxisId={s.yAxisId || 'left'}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={60}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        );
    }

    if (type === 'area') {
        return (
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={safeData} margin={margin}>
                    {commonAxes}
                    {safeSeries.map((s) => (
                        <Area
                            key={s.key}
                            type="monotone"
                            dataKey={s.key}
                            name={s.name}
                            stroke={s.color}
                            fill={s.color}
                            fillOpacity={0.3}
                            connectNulls
                            yAxisId={s.yAxisId || 'left'}
                        />
                    ))}
                </AreaChart>
            </ResponsiveContainer>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={safeData} margin={margin}>
                {commonAxes}
                {safeSeries.map((s) => (
                    <Line
                        key={s.key}
                        type="monotone"
                        dataKey={s.key}
                        name={s.name}
                        stroke={s.color}
                        strokeWidth={2}
                        strokeDasharray={s.dashed ? '6 4' : undefined}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                        connectNulls
                        yAxisId={s.yAxisId || 'left'}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
};

export default ChartRenderer;