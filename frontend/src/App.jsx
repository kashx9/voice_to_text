import './App.css'
import Query from './components/query'
import UploadFile from './components/upload'
// import VoiceToText from './components/voiceToText'

export default function App() {
  return(
    <>
    {/* <VoiceToText/> */}
    <UploadFile/>
    <Query/>
    </>
  )
}