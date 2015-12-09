import Path          from 'path';
import BrowserWindow from 'browser-window';
import Util          from '../common/Util.js';
import { IPCKeys }   from '../common/Constants.js';

/**
 * Manage the window.
 */
export default class WindowManager {
  /**
   * Initialize instance.
   *
   * @param {Main} context Application context.
   */
  constructor( context ) {
    /**
     * Application context.
     * @type {Main}
     */
    this._context = context;

    /**
     * Collection of a managed window.
     * @type {Map.<String, BrowserWindow>}
     */
    this._windows = new Map();

    /**
     * About dialog.
     * @type {BrowserWindow}
     */
    this._aboutDialog = null;

    context.ipc.on( IPCKeys.RequestCreateNewWindow, this._onRequestCreateNewWindow.bind( this ) );
    context.ipc.on( IPCKeys.RequestSendMessage, this._onRequestSendMessage.bind( this ) );
    context.ipc.on( IPCKeys.RequestGetWindowIDs, this._onRequestGetWindowIDs.bind( this ) );
  }

  /**
   * Reload the focused window, For debug.
   */
  reload() {
    const w = BrowserWindow.getFocusedWindow();
    if( w ) {
      w.reload();
    }
  }

  /**
   * Switch the display of the developer tools window at focused window, For debug.
   */
  toggleDevTools() {
    const w = BrowserWindow.getFocusedWindow();
    if( w ) {
      w.toggleDevTools();
    }
  }

  /**
   * Create a new window.
   *
   * @return {BrowserWindow} Created window.
   */
  createNewWindow() {
    const w = new BrowserWindow( {
      width: 400,
      height: 400,
      minWidth: 400,
      minHeight: 400,
      resizable: true
    } );

    const id = w.id;

    w.on( 'closed', () => {
      if( DEBUG ) { Util.log( 'Window was closed, id = ' + id ); }

      // Unregister
      this._windows.delete( id );

      if( this._windows.size === 0 && this._aboutDialog ) {
        this._aboutDialog.close();
      }
    } );

    const filePath = Path.join( __dirname, 'window-main.html' );
    w.loadURL( 'file://' + filePath + '#' + w.id );
    this._windows.set( id, w );

    return w;
  }

  /**
   * Show the about application window.
   */
  createAboutWindow() {
    if( this._aboutDialog ) { return; }

    const w = new BrowserWindow( {
      width: 400,
      heigh: 256,
      resizable: false,
      alwaysOnTop: true
    } );

    w.setMenu( null );

    w.on( 'closed', () => {
      if( DEBUG ) { Util.log( 'The about application window was closed.' ); }

      this._aboutDialog = null;
    } );

    const filePath = Path.join( __dirname, 'window-about.html' );
    w.loadURL( 'file://' + filePath );

    this._aboutDialog = w;
  }

  /**
   * Occurs when a show new window requested.
   *
   * @param {IPCEvent} ev Event data.
   */
  _onRequestCreateNewWindow( ev ) {
    const createdWindow = this.createNewWindow();
    ev.sender.send( IPCKeys.FinishCreateNewWindow );

    const windowIDs = [];
    for( let key of this._windows.keys() ) {
      windowIDs.push( key );
    }

    this._windows.forEach( ( w ) => {
      // Because it may not receive the message, explicit request ( RequestGetWindowIDs ) later
      if( w.id === createdWindow.id ) { return; }

      w.webContents.send( IPCKeys.UpdateWindowIDs, windowIDs );
    } );
  }

  /**
   * Occurs when a send message requested.
   *
   * @param {IPCEvent} ev      Event data.
   * @param {Number}   id      Target window's identifier.
   * @param {String}   message Message.
   */
  _onRequestSendMessage( ev, id, message ) {
    const w = this._windows.get( id );
    if( w ) {
      w.webContents.send( IPCKeys.UpdateMessage, message );
    }

    ev.sender.send( IPCKeys.FinishSendMessage );
  }

  /**
   * Occurs when a get window identifiers requested.
   *
   * @param {IPCEvent} ev Event data.
   */
  _onRequestGetWindowIDs( ev ) {
    const windowIDs = Array.from( this._windows.keys() );
    ev.sender.send( IPCKeys.FinishGetWindowIDs, windowIDs );
  }
}