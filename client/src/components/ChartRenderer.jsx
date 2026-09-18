import React from 'react';
import {
    LineChart, Line, BarChart, Bar, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const ChartRenderer = ({ config }) => {
    if (!config) return null;

    const { type, xKey, data, series } = config;
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
            <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
            <YAxis
                yAxisId="left"
                domain={['auto', 'auto']}
                tick={{ fontSize: 12 }}
                width={50}
            />
            {hasRightAxis && (
                <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 12 }}
                    width={50}
                />
            )}
            <Tooltip formatter={formatTooltip} />
            <Legend wrapperStyle={{ fontSize: 13 }} />
        </>
    );

    if (type === 'bar') {
        return (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
                <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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