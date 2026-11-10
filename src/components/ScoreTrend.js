import React, { Fragment } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';
import { categoryColor } from '../utils/progressStats';

const L = 34;
const R = 296;
const T = 22;
const B = 116;

function xAt(i, count) {
  if (count <= 1) return (L + R) / 2;
  return L + (i * (R - L)) / (count - 1);
}

function yAt(value) {
  return B - (value / 100) * (B - T);
}

export default function ScoreTrend({ recent, palette }) {
  const n = recent.length - 1;
  const last = recent[n].pct;
  let line = `M${xAt(0, recent.length)},${yAt(recent[0].pct)}`;
  for (let i = 1; i < recent.length; i += 1) {
    const mid = (xAt(i - 1, recent.length) + xAt(i, recent.length)) / 2;
    line += `C${mid},${yAt(recent[i - 1].pct)} ${mid},${yAt(recent[i].pct)} ${xAt(i, recent.length)},${yAt(recent[i].pct)}`;
  }
  const area = `${line}L${xAt(n, recent.length)},${B}L${xAt(0, recent.length)},${B}Z`;

  return (
    <View>
      <Svg viewBox="0 0 320 146" width="100%" height={146} accessibilityRole="image" accessibilityLabel="Line chart of your last quiz scores">
        <Defs>
          <LinearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={palette.pri} stopOpacity="0.32" />
            <Stop offset="1" stopColor={palette.pri} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        {[0, 50, 100].map((tick) => (
          <Fragment key={tick}>
            <Path
              d={`M${L} ${yAt(tick)} H${R}`}
              stroke={palette.line}
              strokeDasharray="3 4"
              fill="none"
            />
            <SvgText
              x={L - 7}
              y={yAt(tick) + 3}
              fill={palette.mut}
              fontSize="10"
              fontWeight="700"
              textAnchor="end"
            >
              {`${tick}%`}
            </SvgText>
          </Fragment>
        ))}
        <Path d={area} fill="url(#scoreFill)" />
        <Path d={line} fill="none" stroke={palette.pri} strokeWidth="3.5" strokeLinecap="round" />
        {recent.map((point, i) => {
          const end = i === n;
          const color = categoryColor(point.category);
          const x = xAt(i, recent.length);
          const y = yAt(point.pct);
          return (
            <Fragment key={`${point.category}-${i}`}>
              {end ? <Circle cx={x} cy={y} r="12" fill={palette.acc} opacity="0.3" /> : null}
              <Circle
                cx={x}
                cy={y}
                r={end ? 7 : 5}
                fill={end ? palette.acc : palette.card}
                stroke={color}
                strokeWidth="3"
              />
              {end ? null : (
                <SvgText x={x} y={y - 11} fill={palette.ink} fontSize="11" fontWeight="800" textAnchor="middle">
                  {`${point.pct}%`}
                </SvgText>
              )}
              <SvgText x={x} y="138" fill={color} fontSize="10" fontWeight="700" textAnchor="middle">
                {point.category}
              </SvgText>
            </Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

export function trendDelta(recent) {
  const n = recent.length - 1;
  const last = recent[n].pct;
  const delta = n ? last - recent[n - 1].pct : 0;
  if (!n) return { last, tone: 'eq', label: 'Latest quiz' };
  if (delta > 0) return { last, tone: 'up', label: `▲ ${delta} from last quiz` };
  if (delta < 0) return { last, tone: 'dn', label: `▼ ${-delta} from last quiz` };
  return { last, tone: 'eq', label: 'Same as last quiz' };
}
