import { useEffect, useState } from 'react'
import { apiClient } from '../helpers/twitchAuthentication'
import { useTokenInfo } from './useTokenInfo'
import type { HelixChannelEmote } from '@twurple/api'
import type { EmotePartInfo, EmoteUrls } from '../types'
import { buildEmoteImageUrl } from '@twurple/chat'

const channelEmotes = new Map<string, EmotePartInfo>()
let loaded = false

export function useChannelEmotesLoader() {
  const [loading, setLoading] = useState(true)
  const { broadcaster } = useTokenInfo()

  useEffect(() => {
    async function loadChannelEmotes() {
      if (!loaded) {
        const emotesArray = await apiClient.chat.getChannelEmotes(broadcaster)
        emotesArray.forEach(emote => {
          channelEmotes.set(emote.name, {
            id: emote.id,
            name: emote.name,
            images: {
              default: getEmoteUrls(emote),
              static: getEmoteUrls(emote, true),
            },
            source: 'twitch',
          })
        })
      }

      setLoading(false)
      loaded = true
    }

    loadChannelEmotes()
  }, [broadcaster])

  return { loading }
}

export default function useChannelEmotes() {
  function getAllChannelEmotes() {
    return Array.from(channelEmotes.values())
  }

  return { getAllChannelEmotes }
}

function getEmoteUrls(
  emote: HelixChannelEmote,
  staticEmote: boolean = false,
): EmoteUrls {
  function getEmoteUrl(size: '1.0' | '2.0' | '3.0' = '3.0') {
    const animationSettings = staticEmote ? 'static' : 'default'
    const backgroundType = 'light'
    return buildEmoteImageUrl(emote.id, { animationSettings, backgroundType, size })
  }

  return {
    x1: getEmoteUrl('1.0'),
    x2: getEmoteUrl('2.0'),
    x4: getEmoteUrl('3.0'),
  }
}
