import { Buffer } from 'buffer'
import { blob2Uint8Array } from '$lib/blob'
import type Connection from '$models/connection'
import { EventPayloadType, EventType } from '$models/event'
import detectPayloadFormat from '$services/DetectPayloadFormat'
import createOrmAction from '$services/orm/create-orm-action'
import { v4 as uuid } from 'uuid'

export const eventsCreate = createOrmAction(
  ({ builder }, connection: Connection, type: EventType, payload: string | Blob | ArrayBuffer) => {
    let msg: string
    let payloadType: EventPayloadType | undefined = undefined

    if (type === EventType.Sent || type === EventType.Received) {
      const isText = typeof payload === 'string'
      const isBinary = payload instanceof Blob || payload instanceof ArrayBuffer

      // Just a quick workaround to handle binary data
      if (!isBinary && !isText) {
        throw new Error('Unsupported payload type')
      }

      payloadType = isBinary ? EventPayloadType.Binary : EventPayloadType.Text

      // message type is "binary" and if binaryType is "arraybuffer"
      if (payload instanceof ArrayBuffer) {
        msg = Buffer.from(payload).toString('hex')
      }
      // message type is "binary" and if binaryType is "blob" (with no media type)
      else if (payload instanceof Blob) {
        const u8a = blob2Uint8Array(payload)
        msg = Buffer.from(u8a).toString('hex')
      }
      // message type is "text"
      else {
        msg = payload
      }
    } else {
      msg = payload as string
    }

    builder('events').create({
      id: uuid(),
      connectionId: connection.id,
      type,
      payload: msg,
      payloadType,
      format: detectPayloadFormat(msg),
      timestamp: new Date().toISOString(),
    })

    if (Math.random() <= 0.1) {
      builder('events').where('connectionId', connection.id).sortAsc('timestamp').skip(100).delete()
    }
  },
)

export const eventsRemoveForConnection = createOrmAction(({ builder }, connection: Connection) => {
  builder('events').where('connectionId', connection.id).delete()
})

export const eventsRemoveForConnections = createOrmAction(({ builder }, connections: Connection[]) => {
  builder('events')
    .whereIn(
      'connectionId',
      connections.map((connection) => connection.id),
    )
    .delete()
})
