import React from 'react';
import {
    LineChart, Line, BarChart, Bar, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const ChartRenderer = ({ config }) => {
    if (!config) return null;

    const { type, xKey, data, series, xLabel, yLeftLabel, yRightLabel } = config;
    const hasRightAxis = series.some((s) => s.yAxisId === 'right');

    const unitByKey = series.reduce((acc, s) => {
        acc[s.key] = s.unit || '';
        return acc;
    }, {});

    const formatTooltip = (value, name, props) => {
        const unit = unitByKey[props.dataKey] || '';
        return [`${value} ${unit}`.trim(), name];
    };

    const commonAxes = (
        <>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />

            <XAxis
                dataKey={xKey}
                tick={{ fontSize: 12 }}
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
                domain={['auto', 'auto']}
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
                    domain={['auto', 'auto']}
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

    // Отступы нужно увеличить, чтобы подписи осей не обрезались
    const margin = { top: 20, right: hasRightAxis ? 40 : 20, left: 10, bottom: xLabel ? 50 : 20 };

    if (type === 'bar') {
        return (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={margin}>
                    {commonAxes}
                    {series.map((s) => (
                        <Bar
                            key={s.key}
                            dataKey={s.key}
                            name={s.name}
                            fill={s.color}
                            yAxisId={s.yAxisId || 'left'}
                            radius={[4, 4, 0, 0]}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        );
    }

    if (type === 'area') {
        return (
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={margin}>
                    {commonAxes}
                    {series.map((s) => (
                        <Area
                            key={s.key}
                            type="monotone"
                            dataKey={s.key}
                            name={s.name}
                            stroke={s.color}
                            fill={s.color}
                            fillOpacity={0.3}
                            yAxisId={s.yAxisId || 'left'}
                        />
                    ))}
                </AreaChart>
            </ResponsiveContainer>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={margin}>
                {commonAxes}
                {series.map((s) => (
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
                        yAxisId={s.yAxisId || 'left'}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
};

export default ChartRenderer;