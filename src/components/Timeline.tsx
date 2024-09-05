import { CSSProperties, Fragment } from "react";
import { Timeline as TimelineType } from "../timeline";

export function Timeline({ timeline, maxValue = timeline.end, style = {} }: { timeline: TimelineType, maxValue?: number, style?: CSSProperties }) {
    const GUTTER_WIDTH = 20
    const GUTTER_TOP = timeline.title ? 28 : 0
    const GUTTER_BOTTOM = 6

    const EVENT_HEIGHT = 20
    const EVENT_SPACING = 6

    const CORNER_RADIUS = 2.5

    const TIME_SCALE = 1280 / (2 * 60 * 1000)

    const width = maxValue * TIME_SCALE

    const blockEvents = timeline.events.filter(e => e.end)
    const singleEvents = timeline.events.filter(e => typeof e.end === "undefined")

    const eventCount = timeline.events.length

    const height = eventCount * (EVENT_HEIGHT + EVENT_SPACING) + GUTTER_TOP + GUTTER_BOTTOM

    const blockEventsHeight = blockEvents.length * (EVENT_HEIGHT + EVENT_SPACING)

    return (
        <svg viewBox={`${-GUTTER_WIDTH} ${-GUTTER_TOP} ${width + GUTTER_WIDTH} ${height}`} style={{ width, height, ...style }}>
            <defs>
                {
                    blockEvents.map((_, i) => {
                        const id = `linearGradient${i}`
                        const baseColour = deterministicColour(i)
                        const highlightColour = deterministicColour(i, 100, 80)

                        return (
                            <linearGradient key={id} id={id} x2={0} y2={1}>
                                <stop offset={0} style={{ stopColor: baseColour }} />
                                <stop offset={0.75} style={{ stopColor: highlightColour }} />
                                <stop offset={1} style={{ stopColor: baseColour }} />
                            </linearGradient>
                        )
                    })
                }
            </defs>
            {timeline.title && <text y={-8} fontSize={20}>{timeline.title}</text>}
            <path d={`M -1 0 V ${blockEventsHeight} H ${width}`} fill="none" stroke="black" />
            {
                blockEvents.map((event, i) => {
                    if (event.end) {
                        const y = i * (EVENT_HEIGHT + EVENT_SPACING);
                        return (
                            <Fragment key={i}>
                                <rect
                                    x={event.start * TIME_SCALE}
                                    y={y}
                                    width={(event.end - event.start) * TIME_SCALE}
                                    height={EVENT_HEIGHT}
                                    rx={CORNER_RADIUS}
                                    fill={`url(#linearGradient${i})`}
                                    stroke={deterministicColour(i, 100, 45)}
                                />
                                <text x={event.end * TIME_SCALE + 4} y={y + EVENT_HEIGHT - 4}>{event.name}</text>
                            </Fragment>
                        )
                    }
                })
            }
            {
                [...singleEvents].reverse().map((event, i) => {
                    const x = event.start * TIME_SCALE
                    const h = 5
                    const y = blockEventsHeight + i * 20;
                    return (
                        <Fragment key={i}>
                            <path d={`M ${x} 0 V ${y} a ${h / 2} ${h / 2} 0 0 0 0 ${h} a ${h / 2} ${h / 2} 0 0 0 0 ${-h}`} fill="none" stroke="hsl(45deg 70% 50%)" />
                            <text x={x} y={y + 18}>{event.name}</text>
                        </Fragment>
                    )
                })
            }
        </svg>
    )
}

function deterministicColour(seed: number, saturation = 100, luminance = 50) {
    const PRIME = 127

    const angle = (seed * PRIME) % 360

    return `hsl(${angle}deg ${saturation}% ${luminance}%)`
}