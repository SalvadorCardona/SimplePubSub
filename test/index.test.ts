import { describe, expect, it, vi } from 'vitest'
import { createChannelPubSub, createPubSub } from '../src'

describe('createPubSub', () => {
  it('should create a unique instance with an id', () => {
    const pubsub = createPubSub()
    expect(pubsub.id).toBeDefined()
    expect(typeof pubsub.id).toBe('string')
  })

  it('should subscribe and receive published data', () => {
    const pubsub = createPubSub<string>()
    const handler = vi.fn()

    pubsub.subscribe(handler)
    pubsub.publish('test message')

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith('test message')
  })

  it('should support multiple subscribers', () => {
    const pubsub = createPubSub<number>()
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    pubsub.subscribe(handler1)
    pubsub.subscribe(handler2)
    pubsub.publish(42)

    expect(handler1).toHaveBeenCalledWith(42)
    expect(handler2).toHaveBeenCalledWith(42)
  })

  it('should return unique subscription id', () => {
    const pubsub = createPubSub()
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    const sub1 = pubsub.subscribe(handler1)
    const sub2 = pubsub.subscribe(handler2)

    expect(sub1.id).toBeDefined()
    expect(sub2.id).toBeDefined()
    expect(sub1.id).not.toBe(sub2.id)
    expect(sub1.id).not.toBe(pubsub.id)
  })

  it('should unsubscribe via returned function', () => {
    const pubsub = createPubSub<string>()
    const handler = vi.fn()

    const { unsubscribe } = pubsub.subscribe(handler)
    unsubscribe()
    pubsub.publish('test')

    expect(handler).not.toHaveBeenCalled()
  })

  it('should unsubscribe via subscription id', () => {
    const pubsub = createPubSub<string>()
    const handler = vi.fn()

    const { id } = pubsub.subscribe(handler)
    pubsub.unsubscribe(id)
    pubsub.publish('test')

    expect(handler).not.toHaveBeenCalled()
  })

  it('should not throw when unsubscribing non-existent subscription', () => {
    const pubsub = createPubSub()
    expect(() => pubsub.unsubscribe('non-existent-id')).not.toThrow()
  })

  it('should handle complex data types', () => {
    interface TestData {
      name: string
      age: number
      tags: string[]
    }

    const pubsub = createPubSub<TestData>()
    const handler = vi.fn()

    pubsub.subscribe(handler)
    const testData = { name: 'John', age: 30, tags: ['dev', 'test'] }
    pubsub.publish(testData)

    expect(handler).toHaveBeenCalledWith(testData)
  })
})

describe('createChannelPubSub', () => {
  it('should create channel on first subscription', () => {
    const channelPubSub = createChannelPubSub<string>()
    const handler = vi.fn()

    const subscription = channelPubSub.subscribe('test-channel', handler)
    expect(subscription.channel).toBe('test-channel')
    expect(subscription.id).toBeDefined()
  })

  it('should publish to specific channel only', () => {
    const channelPubSub = createChannelPubSub<string>()
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    channelPubSub.subscribe('channel1', handler1)
    channelPubSub.subscribe('channel2', handler2)

    channelPubSub.publish('channel1', 'message for channel1')

    expect(handler1).toHaveBeenCalledWith('message for channel1')
    expect(handler2).not.toHaveBeenCalled()
  })

  it('should support multiple subscribers on same channel', () => {
    const channelPubSub = createChannelPubSub<string>()
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    channelPubSub.subscribe('channel1', handler1)
    channelPubSub.subscribe('channel1', handler2)

    channelPubSub.publish('channel1', 'message')

    expect(handler1).toHaveBeenCalledWith('message')
    expect(handler2).toHaveBeenCalledWith('message')
  })

  it('should unsubscribe from channel', () => {
    const channelPubSub = createChannelPubSub<string>()
    const handler = vi.fn()

    const { unsubscribe } = channelPubSub.subscribe('test-channel', handler)
    unsubscribe()
    channelPubSub.publish('test-channel', 'message')

    expect(handler).not.toHaveBeenCalled()
  })

  it('should unsubscribe via channel and subscription id', () => {
    const channelPubSub = createChannelPubSub<string>()
    const handler = vi.fn()

    const { id, channel } = channelPubSub.subscribe('test-channel', handler)
    channelPubSub.unsubscribe(channel, id)
    channelPubSub.publish('test-channel', 'message')

    expect(handler).not.toHaveBeenCalled()
  })

  it('should not throw when unsubscribing from non-existent channel', () => {
    const channelPubSub = createChannelPubSub()
    expect(() => channelPubSub.unsubscribe('non-existent', 'id')).not.toThrow()
  })

  it('should support "all" channel that receives all messages', () => {
    const channelPubSub = createChannelPubSub<string>()
    const allHandler = vi.fn()
    const channel1Handler = vi.fn()

    channelPubSub.subscribe('all', allHandler)
    channelPubSub.subscribe('channel1', channel1Handler)

    channelPubSub.publish('channel1', 'message1')
    channelPubSub.publish('channel2', 'message2')

    expect(allHandler).toHaveBeenCalledTimes(2)
    expect(allHandler).toHaveBeenNthCalledWith(1, 'message1')
    expect(allHandler).toHaveBeenNthCalledWith(2, 'message2')
    expect(channel1Handler).toHaveBeenCalledTimes(1)
    expect(channel1Handler).toHaveBeenCalledWith('message1')
  })

  it('should not call handler of other channel even with "all" subscribed', () => {
    const channelPubSub = createChannelPubSub<string>()
    const channel1Handler = vi.fn()
    const channel2Handler = vi.fn()

    channelPubSub.subscribe('channel1', channel1Handler)
    channelPubSub.subscribe('channel2', channel2Handler)

    channelPubSub.publish('channel1', 'message')

    expect(channel1Handler).toHaveBeenCalledTimes(1)
    expect(channel2Handler).not.toHaveBeenCalled()
  })

  it('should handle complex data types in channels', () => {
    interface UserEvent {
      userId: string
      action: 'login' | 'logout'
      timestamp: number
    }

    const channelPubSub = createChannelPubSub<UserEvent>()
    const handler = vi.fn()

    channelPubSub.subscribe('user-events', handler)

    const event: UserEvent = {
      userId: 'user123',
      action: 'login',
      timestamp: Date.now(),
    }

    channelPubSub.publish('user-events', event)

    expect(handler).toHaveBeenCalledWith(event)
  })

  it('should maintain independent subscriptions across channels', () => {
    const channelPubSub = createChannelPubSub<number>()
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    const sub1 = channelPubSub.subscribe('channel1', handler1)
    const sub2 = channelPubSub.subscribe('channel2', handler2)

    expect(sub1.id).not.toBe(sub2.id)

    sub1.unsubscribe()
    channelPubSub.publish('channel1', 1)
    channelPubSub.publish('channel2', 2)

    expect(handler1).not.toHaveBeenCalled()
    expect(handler2).toHaveBeenCalledWith(2)
  })
})

describe('integration scenarios', () => {
  it('should handle rapid publish events', () => {
    const pubsub = createPubSub<number>()
    const handler = vi.fn()

    pubsub.subscribe(handler)

    for (let i = 0; i < 100; i++) {
      pubsub.publish(i)
    }

    expect(handler).toHaveBeenCalledTimes(100)
  })

  it('should handle subscribe/unsubscribe during publish', () => {
    const pubsub = createPubSub<string>()
    const handler1 = vi.fn()
    let sub2: any

    const handler2 = vi.fn(() => {
      if (sub2)
        sub2.unsubscribe()
    })

    pubsub.subscribe(handler1)
    sub2 = pubsub.subscribe(handler2)

    pubsub.publish('first')
    pubsub.publish('second')

    expect(handler1).toHaveBeenCalledTimes(2)
    expect(handler2).toHaveBeenCalledTimes(1)
  })

  it('should support real-world chat scenario', () => {
    interface Message {
      from: string
      text: string
      timestamp: number
    }

    const chat = createChannelPubSub<Message>()
    const generalMessages: Message[] = []
    const privateMessages: Message[] = []
    const allMessages: Message[] = []

    chat.subscribe('general', msg => generalMessages.push(msg))
    chat.subscribe('private', msg => privateMessages.push(msg))
    chat.subscribe('all', msg => allMessages.push(msg))

    chat.publish('general', { from: 'Alice', text: 'Hello everyone!', timestamp: 1 })
    chat.publish('private', { from: 'Bob', text: 'Secret message', timestamp: 2 })
    chat.publish('general', { from: 'Charlie', text: 'Hi Alice!', timestamp: 3 })

    expect(generalMessages).toHaveLength(2)
    expect(privateMessages).toHaveLength(1)
    expect(allMessages).toHaveLength(3)
  })
})
