let isSpeaking = false

export function isWebSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function speak(
  text: string,
  lang: string = 'en-US',
  rate: number = 0.9
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isWebSpeechSupported()) {
      reject(new Error('Web Speech API not supported'))
      return
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel()
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = rate

    utterance.onend = () => {
      isSpeaking = false
      resolve()
    }

    utterance.onerror = (event) => {
      isSpeaking = false
      reject(new Error(event.error))
    }

    isSpeaking = true
    window.speechSynthesis.speak(utterance)
  })
}

export function stopSpeaking(): void {
  if (isWebSpeechSupported()) {
    window.speechSynthesis.cancel()
    isSpeaking = false
  }
}
