import React from 'react'
import ReactDOM from 'react-dom'
import { Context } from 'material-flux'
import Util from '../../common/Util.js'
import AudioPlayerStore from './store/AudioPlayerStore.js'
import AudioPlayerAction from './action/AudioPlayerAction.js'
import MusicListStore from './store/MusicListStore.js'
import MusicListAction from './action/MusicListAction.js'
import MainWindow from './view/MainWindow.js'

/**
 * Context of the main window.
 */
export default class MainWindowContext extends Context {
  /**
   * Initialize instance.
   *
   * @type {Element} elm Element of the rendering target.
   */
  constructor (elm) {
    super()

    if (DEBUG) {
      Util.log('Initialize AppContext')
    }

    /**
     * IPC module for renderer process.
     * @type {ipcRenderer}
     */
    this.ipc = window.require('electron').ipcRenderer

    /**
     * Audio player store.
     * @type {AudioPlayerStore}
     */
    this.audioPlayerStore = new AudioPlayerStore(this)

    /**
     * Audio player actions.
     * @type {AudioPlayerAction}
     */
    this.audioPlayerAction = new AudioPlayerAction(this)

    /**
     * Music list store.
     * @type {AudioPlayerStore}
     */
    this.musicListStore = new MusicListStore(this)

    /**
     * Music list actions.
     * @type {AudioPlayerAction}
     */
    this.musicListAction = new MusicListAction(this)

    // Setup main window
    ReactDOM.render(<MainWindow context={this} />, elm)
  }
}
