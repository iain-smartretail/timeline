export type Timeline = {
    events: TimelineEvents[]
    start: number
    end: number
}

export type TimelineEvents = {
    start: number
    end?: number
    name: string
}

export function parseTimelines (spec: string): Timeline[] {
    const inputSections = spec.split("\n\n")

    return inputSections.filter(x => x).map(parseTimeline)
}

const timeSpecRegex = /\s*((\d+:)?\d{1,2}:)?\d{1,2}(\.\d+)?/gy

function parseTimeline (spec: string): Timeline {
    const lines = spec.split("\n")

    const events: TimelineEvents[] = []

    let firstStart = Number.POSITIVE_INFINITY
    let lastEnd = Number.NEGATIVE_INFINITY

    for (const line of lines) {
        timeSpecRegex.lastIndex = 0;
        const startMatch = timeSpecRegex.exec(line)

        if (!startMatch) {
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

        const name = line.substring(nameStart).trim()

        events.push({
            start,
            end,
            name
        })
    }

    return {
        events,
        start: firstStart,
        end: isFinite(lastEnd) ? lastEnd : firstStart
    }
}

/*
 * Parse a string like 1:01.234 into a milliseconds value such as 61234
 */
function parseTimeSpec (spec: string) {
    return spec.split(":").map(s => parseFloat(s)).reduce((sum, n, i, a) => sum + n * Math.pow(60, a.length - i - 1), 0) * 1000
}