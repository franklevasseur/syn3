import './ToolBar.css'
import { Tooltip2 } from '@blueprintjs/popover2'
import d3ToPng from 'd3-svg-to-png'
import { MdCenterFocusStrong, MdOutlinePhotoCamera } from 'react-icons/md'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

type ToolBarProps = {
  resetView: () => void
  capture: () => void
  treeSelector: string
}

export const ToolBar = (props: ToolBarProps) => {
  const copyImage = async () => {
    props.capture()
    const imgUrl = await d3ToPng(props.treeSelector, 'syn3', { scale: 2, download: false })
    const imgBlob = await fetch(imgUrl).then((r) => r.blob())
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': imgBlob })])
    toast('Image copied to clipboard! 📋', { autoClose: 1000, position: 'bottom-right', type: 'success', hideProgressBar: true })
  }

  return (
    <div className="toolbar">
      <Tooltip2 content="align center" position="bottom" intent="primary" minimal>
        <div className="toolbar-button" onClick={props.resetView}>
          <MdCenterFocusStrong size={30} />
        </div>
      </Tooltip2>
      <Tooltip2 content="copy image" position="bottom" intent="primary" minimal>
        <div className="toolbar-button" onClick={copyImage}>
          <MdOutlinePhotoCamera size={30} />
        </div>
      </Tooltip2>
      <ToastContainer />
    </div>
  )
}
