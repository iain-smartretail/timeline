import { CSSProperties } from "react";

export type Timeline = {
    title: string;
    events: TimelineEvents[]
    start: number
    end: number
}

export type TimelineEvents = {
    start: number
    end?: number
    name: string
    style?: CSSProperties
}

export function parseTimelines(spec: string): Timeline[] {
    const inputSections = spec.split("\n\n")

    return inputSections.filter(x => x).map(parseTimeline)
}

const timeSpecRegex = /\s*((\d+:)?\d{1,2}:)?\d{1,2}(\.\d+)?/gy
const styleRegex = /\[([^\]]+)\]/g

function parseTimeline(spec: string): Timeline {
    const lines = spec.split("\n")

    let title = ""
    const events: TimelineEvents[] = []

    let firstStart = Number.POSITIVE_INFINITY
    let lastEnd = Number.NEGATIVE_INFINITY

    for (const line of lines) {
        timeSpecRegex.lastIndex = 0;
        const startMatch = timeSpecRegex.exec(line)

        if (!startMatch) {
            // Consider the first line to be the title if it doesn't start with a time
            if (events.length === 0) {
                title = line
            }

            continue
        }

        const start = parseTimeSpec(startMatch[0])
        firstStart = Math.min(firstStart, start)

        const endMatch = timeSpecRegex.exec(line)

        let end = undefined

        let nameStart = startMatch[0].length

        if (endMatch) {
            end = parseTimeSpec(endMatch[0])
            lastEnd = Math.max(lastEnd, end)

            nameStart += endMatch[0].length
        }

        const name = line.substring(nameStart).replace(styleRegex, "").trim()

        let style: any = {}

        let styleMatch
        while (styleMatch = styleRegex.exec(line)) {
            style = { ...style, ...parseStyleValues(styleMatch[1]) }
        }

        events.push({
            start,
            end,
            name,
            style: style as CSSProperties
        })
    }

    return {
        title,
        events,
        start: firstStart,
        end: isFinite(lastEnd) ? lastEnd : firstStart
    }
}

/*
 * Parse a string like 1:01.234 into a milliseconds value such as 61234
 */
function parseTimeSpec(spec: string) {
    return spec.split(":").map(s => parseFloat(s)).reduce((sum, n, i, a) => sum + n * Math.pow(60, a.length - i - 1), 0) * 1000
}

function parseStyleValues(styleText: string): CSSProperties {
    const styleValueRegex = /([a-z]+)\s*=\s*(?:"([^"]*)"|([^\s]*))/gi

    let style: any = {}

    let match
    while (match = styleValueRegex.exec(styleText)) {
        style[match[1]] = match[2] || match[3]
    }

    return style
}