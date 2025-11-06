function createUniqId(): string {
  const randomArray = new Uint32Array(1)
  crypto.getRandomValues(randomArray)
  return randomArray[0].toString(36)
}

type EventHandler<T = any> = (data: T) => void

interface EventHandlerReturn {
  id: string
  unsubscribe: () => void
}

export interface Index<T = any> {
  id: string
  subscribe: (handler: EventHandler<T>) => EventHandlerReturn
  unsubscribe: (subscriptionId: string) => void
  publish: (data: T) => void
}

export function createPubSub<T = any>(): Index<T> {
  const handlers: Record<string, EventHandler<T>> = {}
  const instanceId = createUniqId()

  const self: Index<T> = {
    id: instanceId,
    subscribe(handler) {
      // Chaque subscription a son propre ID, pas l’ID de l’instance
      const subscriptionId = createUniqId()
      handlers[subscriptionId] = handler
      return {
        id: subscriptionId,
        unsubscribe: () => self.unsubscribe(subscriptionId),
      }
    },

    unsubscribe(subscriptionId) {
      if (!handlers[subscriptionId])
        return
      delete handlers[subscriptionId]
    },

    publish(data) {
      Object.values(handlers).forEach(handler => handler(data))
    },
  }

  return self
}

interface ChannelEventHandlerReturn {
  unsubscribe: () => void
  channel: string
  id: string
}

export interface ChannelPubSubInterface<T = any> {
  subscribe: (
    channel: string | 'all',
    handler: EventHandler<T>
  ) => ChannelEventHandlerReturn
  unsubscribe: (channel: string, subscriptionId: string) => void
  publish: (channel: string, data: T) => void
}

export function createChannelPubSub<T = any>(): ChannelPubSubInterface<T> {
  const channels: Record<string, Index<T>> = {}

  const getOrCreateChannel = (channel: string): Index<T> => {
    if (!channels[channel]) {
      channels[channel] = createPubSub<T>()
    }
    return channels[channel]
  }

  return {
    subscribe(channel, handler) {
      const bus = getOrCreateChannel(channel)
      const { id, unsubscribe } = bus.subscribe(handler)
      // Retourne bien l’objet attendu (pas une fonction)
      return {
        id,
        channel,
        unsubscribe,
      }
    },

    unsubscribe(channel, subscriptionId) {
      const bus = channels[channel]
      if (!bus)
        return
      bus.unsubscribe(subscriptionId)
    },

    publish(channel, data) {
      if (channels.all)
        channels.all.publish(data)
      const bus = channels[channel]
      if (bus)
        bus.publish(data)
    },
  }
}
