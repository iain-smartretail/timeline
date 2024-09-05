import './App.css'
import { Timeline } from './components/Timeline'
import { useSavedState } from './hooks/useSavedState'
import { parseTimelines } from './timeline'

function App() {
  const [inputText, setInputText] = useSavedState("timeline.inputText", "0:00 1:00 Event 1\n0:30 1:45 Event 2\n1:15 Single Event")

  const timelines = parseTimelines(inputText)

  return (
    <>
      <textarea value={inputText} onChange={e => setInputText(e.target.value)} />
      {
        timelines.map((timeline, i) => <Timeline key={i} timeline={timeline} maxValue={2 * 60 * 1000} style={{margin: "1em"}} />)
      }
    </>
  )
}

export default App
