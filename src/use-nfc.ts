import { useState } from 'react'
import { readTextRecord } from '@/lib/utils'

const id = crypto.randomUUID()
let ndef: null | NDEFReader = null
if (`NDEFReader` in window) {
  ndef = new NDEFReader()
}

export function useNFC() {
  const [options, setOptions] = useState({
    message: ``,
    data: ``,
    reading: false,
    hardwareSupported: true,
  })
  type OptionsType = typeof options
  type OptionsField<T extends OptionsType> = {
    [K in keyof T]: {
      [P in K]: T[P]
    }
  }[keyof T]
  function updateStateOption(stateValue: OptionsField<OptionsType>) {
    setOptions(prev => ({ ...prev, ...stateValue }))
  }

  async function write() {
    ndef?.write(id).then(
      () => {
        updateStateOption({ message: `Message written.` })
      },
      (error: unknown) =>
        updateStateOption({ message: `Write failed :-( try again: ${error}.` })
    )
    await ndef?.makeReadOnly()
    updateStateOption({ message: `NFC tag is now permanently read-only.` })
  }

  function read() {
    updateStateOption({ reading: true })
    ndef?.scan().then(
      () => {
        updateStateOption({ message: `Scan started successfully.` })
        if (ndef !== null) {
          ndef.onreading = ev => {
            const ndefRecords = ev.message.records
            updateStateOption({ reading: false })
            const textRecord = ndefRecords.find(
              record => record.recordType === `text`
            )!
            let message = ``
            const data = readTextRecord(textRecord)
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            data
              ? updateStateOption({ data })
              : updateStateOption({
                  message: `Only the text record type is supported`,
                })
            message = data ? `NDEF message read.` : `Couldn't read data`
            updateStateOption({ message })
          }
          ndef.onreadingerror = () => {
            updateStateOption({
              message: `Cannot read data from the NFC tag. Try another one?`,
              reading: false,
            })
          }
        }
      },
      err => {
        updateStateOption({
          message: err,
          hardwareSupported: false,
        })
      }
    )
  }

  async function abort() {
    if (ndef === null) return false
    const abortController = new AbortController()
    abortController.signal.onabort = () => {
      updateStateOption({ message: `scan stopped!` })
    }
    await ndef.scan({ signal: abortController.signal })
    await ndef.write(id, { signal: abortController.signal })
    await ndef.makeReadOnly?.({ signal: abortController.signal })
    abortController.abort()
  }
  return {
    browserSupported: !!ndef,
    options,
    setOptions,
    write,
    read,
    abort,
  }
}
