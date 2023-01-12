import './ToolBar.css'
import 'react-toastify/dist/ReactToastify.css'
import 'react-tooltip/dist/react-tooltip.css'
import d3ToPng from 'd3-svg-to-png'
import { MdCenterFocusStrong, MdOutlinePhotoCamera } from 'react-icons/md'
import { ToastContainer, toast } from 'react-toastify'
import { Tooltip } from 'react-tooltip'

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

  const alignCenterId = 'align-center'
  const copyImageId = 'copy-image'

  return (
    <div className="toolbar">
      <div id={alignCenterId} className="toolbar-button" onClick={props.resetView}>
        <MdCenterFocusStrong size={30} />
      </div>
      <div id={copyImageId} className="toolbar-button" onClick={copyImage}>
        <MdOutlinePhotoCamera size={30} />
      </div>
      <Tooltip style={{ background: '#316BCD' }} anchorId={alignCenterId} place="bottom" content="align center" noArrow />
      <Tooltip style={{ background: '#316BCD' }} anchorId={copyImageId} place="bottom" content="copy image" noArrow />
      <ToastContainer />
    </div>
  )
}
